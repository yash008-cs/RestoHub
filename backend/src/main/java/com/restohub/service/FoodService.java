package com.restohub.service;

import com.restohub.dto.request.FoodRequest;
import com.restohub.dto.response.FoodResponse;
import com.restohub.entity.Food;
import com.restohub.entity.Restaurant;
import com.restohub.exception.ResourceNotFoundException;
import com.restohub.repository.FoodRepository;
import com.restohub.repository.RestaurantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FoodService {

    private static final Logger log = LoggerFactory.getLogger(FoodService.class);

    private final FoodRepository foodRepository;
    private final RestaurantRepository restaurantRepository;

    public FoodService(FoodRepository foodRepository, RestaurantRepository restaurantRepository) {
        this.foodRepository = foodRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public FoodResponse addFoodItem(FoodRequest request) {
        log.info("Adding food item '{}' for restaurant id: {}", request.getName(), request.getRestaurantId());

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Restaurant not found with id: " + request.getRestaurantId()));

        Food food = new Food();
        food.setRestaurant(restaurant);
        food.setName(request.getName());
        food.setDescription(request.getDescription());
        food.setPrice(request.getPrice());
        food.setCategory(request.getCategory());
        food.setAvailable(request.getAvailable() != null ? request.getAvailable() : true);

        Food savedFood = foodRepository.save(food);
        return mapToResponse(savedFood);
    }

    public List<FoodResponse> getAllFoodItems() {
        log.info("Fetching all food items");
        return foodRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FoodResponse> searchFoodItems(String query) {
        if (query == null || query.isBlank()) {
            return getAllFoodItems();
        }
        log.info("Searching food items with query: {}", query);
        return foodRepository.searchFoodItems(query.trim())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FoodResponse getFoodById(Long id) {
        log.info("Fetching food item with id: {}", id);
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + id));

        return mapToResponse(food);
    }

    public List<FoodResponse> getFoodsByRestaurantId(Long restaurantId) {
        log.info("Fetching food items for restaurant id: {}", restaurantId);

        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant not found with id: " + restaurantId);
        }

        return foodRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FoodResponse updateFood(Long id, FoodRequest request) {
        log.info("Updating food item with id: {}", id);
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + id));

        // If the restaurant is being changed, validate the new restaurant exists
        if (request.getRestaurantId() != null
                && !request.getRestaurantId().equals(food.getRestaurant().getId())) {
            Restaurant newRestaurant = restaurantRepository.findById(request.getRestaurantId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Restaurant not found with id: " + request.getRestaurantId()));
            food.setRestaurant(newRestaurant);
        }

        food.setName(request.getName());
        food.setDescription(request.getDescription());
        food.setPrice(request.getPrice());
        food.setCategory(request.getCategory());

        if (request.getAvailable() != null) {
            food.setAvailable(request.getAvailable());
        }

        Food updatedFood = foodRepository.save(food);
        return mapToResponse(updatedFood);
    }

    public void deleteFood(Long id) {
        log.info("Deleting food item with id: {}", id);
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + id));

        foodRepository.delete(food);
    }

    public FoodResponse mapToResponse(Food food) {
        return new FoodResponse(
                food.getId(),
                food.getRestaurant().getId(),
                food.getRestaurant().getName(),
                food.getName(),
                food.getDescription(),
                food.getPrice(),
                food.getCategory(),
                food.isAvailable()
        );
    }
}
