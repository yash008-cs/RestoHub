package com.restohub.service;

import com.restohub.dto.request.OrderItemRequest;
import com.restohub.dto.request.OrderRequest;
import com.restohub.dto.response.OrderItemResponse;
import com.restohub.dto.response.OrderResponse;
import com.restohub.entity.Customer;
import com.restohub.entity.Food;
import com.restohub.entity.Order;
import com.restohub.entity.OrderItem;
import com.restohub.entity.OrderStatus;
import com.restohub.entity.Restaurant;
import com.restohub.exception.ResourceNotFoundException;
import com.restohub.repository.CustomerRepository;
import com.restohub.repository.FoodRepository;
import com.restohub.repository.OrderRepository;
import com.restohub.repository.RestaurantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final RestaurantRepository restaurantRepository;
    private final FoodRepository foodRepository;
    private final PricingService pricingService;
    private final RestaurantService restaurantService;

    public OrderService(
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            RestaurantRepository restaurantRepository,
            FoodRepository foodRepository,
            PricingService pricingService,
            RestaurantService restaurantService
    ) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.restaurantRepository = restaurantRepository;
        this.foodRepository = foodRepository;
        this.pricingService = pricingService;
        this.restaurantService = restaurantService;
    }

    // @Transactional: if anything fails mid-way (e.g., food not found), the whole order is rolled back.
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        log.info("Creating order for customer id {} at restaurant id {}", request.getCustomerId(), request.getRestaurantId());

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + request.getRestaurantId()));

        // Validate restaurant status and dynamic 20-min acceptingOrders rotation
        if (!restaurantService.isRestaurantAcceptingOrders(restaurant.getId())) {
            throw new IllegalArgumentException("This restaurant is not accepting orders right now.");
        }

        // Create the order first so we can associate items with it
        Order order = new Order();
        order.setCustomer(customer);
        order.setRestaurant(restaurant);
        order.setStatus(OrderStatus.PLACED);

        // Build the list of order items and calculate subtotal
        BigDecimal calculatedSubtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            Food food = foodRepository.findById(itemReq.getFoodId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + itemReq.getFoodId()));

            // Ensure the food item belongs to the requested restaurant
            if (!food.getRestaurant().getId().equals(restaurant.getId())) {
                throw new IllegalArgumentException(
                        "Food item '" + food.getName() + "' does not belong to restaurant '" + restaurant.getName() + "'");
            }

            if (!food.isAvailable()) {
                throw new IllegalArgumentException("Food item '" + food.getName() + "' is currently unavailable");
            }

            BigDecimal itemTotal = food.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            calculatedSubtotal = calculatedSubtotal.add(itemTotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setFood(food);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPrice(food.getPrice()); // Snapshot the price at order time
            orderItems.add(orderItem);
        }

        String customerLocality = request.getDeliveryLocality() != null && !request.getDeliveryLocality().isBlank()
                ? request.getDeliveryLocality()
                : "Baner";

        String restaurantLocality = restaurant.getLocality() != null && !restaurant.getLocality().isBlank()
                ? restaurant.getLocality()
                : restaurant.getAddress();

        double distanceKm = pricingService.calculateDistanceKm(customerLocality, restaurantLocality);
        BigDecimal baseDeliveryCharge = pricingService.calculateBaseDeliveryCharge(calculatedSubtotal);
        BigDecimal distanceCharge = pricingService.calculateDistanceCharge(distanceKm);
        BigDecimal taxes = pricingService.calculateTaxes(calculatedSubtotal);
        BigDecimal totalAmount = calculatedSubtotal.add(baseDeliveryCharge).add(distanceCharge).add(taxes);

        order.setSubtotal(calculatedSubtotal);
        order.setDeliveryCharge(baseDeliveryCharge);
        order.setDistanceCharge(distanceCharge);
        order.setTaxes(taxes);
        order.setEstimatedDistance(distanceKm);
        order.setDeliveryLocality(customerLocality);
        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        log.info("Fetching order with id: {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrders(Long customerId) {
        log.info("Fetching orders for customer id: {}", customerId);

        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        return orderRepository.findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getRestaurantOrders(Long restaurantId) {
        log.info("Fetching orders for restaurant id: {}", restaurantId);

        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant not found with id: " + restaurantId);
        }

        return orderRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        log.info("Updating order id {} status to {}", orderId, newStatus);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        return mapToResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse addItemsToOrder(Long orderId, OrderRequest request) {
        log.info("Adding items to existing order id {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        List<OrderItem> currentItems = order.getOrderItems();

        for (OrderItemRequest itemReq : request.getItems()) {
            Food food = foodRepository.findById(itemReq.getFoodId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + itemReq.getFoodId()));

            if (!food.isAvailable()) {
                throw new IllegalArgumentException("Food item '" + food.getName() + "' is currently unavailable");
            }

            // Check if item already exists in order
            OrderItem existingItem = currentItems.stream()
                    .filter(i -> i.getFood().getId().equals(food.getId()))
                    .findFirst()
                    .orElse(null);

            if (existingItem != null) {
                existingItem.setQuantity(existingItem.getQuantity() + itemReq.getQuantity());
            } else {
                OrderItem newOrderItem = new OrderItem();
                newOrderItem.setOrder(order);
                newOrderItem.setFood(food);
                newOrderItem.setQuantity(itemReq.getQuantity());
                newOrderItem.setPrice(food.getPrice());
                currentItems.add(newOrderItem);
            }
        }

        // Recalculate full subtotal and breakdown after adding items
        BigDecimal newSubtotal = BigDecimal.ZERO;
        for (OrderItem item : currentItems) {
            newSubtotal = newSubtotal.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        String customerLocality = order.getDeliveryLocality() != null ? order.getDeliveryLocality() : "Baner";
        String restaurantLocality = order.getRestaurant().getLocality() != null ? order.getRestaurant().getLocality() : order.getRestaurant().getAddress();
        double distanceKm = order.getEstimatedDistance() != null ? order.getEstimatedDistance() : pricingService.calculateDistanceKm(customerLocality, restaurantLocality);

        BigDecimal baseDeliveryCharge = pricingService.calculateBaseDeliveryCharge(newSubtotal);
        BigDecimal distanceCharge = pricingService.calculateDistanceCharge(distanceKm);
        BigDecimal taxes = pricingService.calculateTaxes(newSubtotal);
        BigDecimal totalAmount = newSubtotal.add(baseDeliveryCharge).add(distanceCharge).add(taxes);

        order.setSubtotal(newSubtotal);
        order.setDeliveryCharge(baseDeliveryCharge);
        order.setDistanceCharge(distanceCharge);
        order.setTaxes(taxes);
        order.setEstimatedDistance(distanceKm);
        order.setTotalAmount(totalAmount);

        Order updatedOrder = orderRepository.save(order);
        return mapToResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id) {
        log.info("Cancelling order with id: {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalArgumentException("Delivered orders cannot be cancelled.");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Order is already cancelled.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order updated = orderRepository.save(order);
        return mapToResponse(updated);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getFood().getId(),
                        item.getFood().getName(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                ))
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getCustomer().getId(),
                order.getCustomer().getName(),
                order.getRestaurant().getId(),
                order.getRestaurant().getName(),
                order.getStatus(),
                order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO,
                order.getSubtotal() != null ? order.getSubtotal() : order.getTotalAmount(),
                order.getDeliveryCharge() != null ? order.getDeliveryCharge() : BigDecimal.ZERO,
                order.getDistanceCharge() != null ? order.getDistanceCharge() : BigDecimal.ZERO,
                order.getTaxes() != null ? order.getTaxes() : BigDecimal.ZERO,
                order.getEstimatedDistance() != null ? order.getEstimatedDistance() : 2.5,
                order.getDeliveryLocality() != null ? order.getDeliveryLocality() : "Baner",
                order.getCreatedAt(),
                itemResponses
        );
    }
}
