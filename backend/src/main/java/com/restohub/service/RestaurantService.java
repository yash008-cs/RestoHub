package com.restohub.service;

import com.restohub.dto.request.RestaurantRequest;
import com.restohub.dto.response.RestaurantResponse;
import com.restohub.entity.Restaurant;
import com.restohub.entity.RestaurantStatus;
import com.restohub.exception.ResourceNotFoundException;
import com.restohub.repository.RestaurantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class RestaurantService {

    private static final Logger log = LoggerFactory.getLogger(RestaurantService.class);

    private final RestaurantRepository restaurantRepository;

    public RestaurantService(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    /**
     * Applies dynamic 20-minute busy rotation.
     * Selects 4 to 5 restaurants deterministically to be NOT ACCEPTING ORDERS for a 20-minute window,
     * while ALL OTHER restaurants remain ONLINE & ACCEPTING ORDERS.
     * The selection automatically rotates randomly every 20 minutes (1200 seconds).
     */
    private void apply20MinBusyRotation(List<Restaurant> restaurants) {
        if (restaurants == null || restaurants.isEmpty()) return;

        // 1. Calculate current 20-minute window index (20 mins = 1200 seconds)
        long epochSeconds = Instant.now().getEpochSecond();
        long windowIndex = epochSeconds / 1200;

        int total = restaurants.size();
        // Number of busy restaurants: 4 to 5 at a time (capped by total)
        int busyCount = Math.min(Math.max(4, Math.min(5, total / 2)), total);

        // 2. Deterministic pseudo-random seed based on current 20-minute window index
        Random random = new Random(windowIndex * 1000003L + 31L);

        // 3. Shuffle indices to pick 4-5 random busy restaurants for this 20-min window
        List<Integer> indices = IntStream.range(0, total)
                .boxed()
                .collect(Collectors.toList());
        Collections.shuffle(indices, random);

        Set<Integer> busyIndices = new HashSet<>(indices.subList(0, busyCount));

        // 4. Update acceptingOrders status for each restaurant in-memory for response
        for (int i = 0; i < total; i++) {
            Restaurant r = restaurants.get(i);
            boolean isBusy = busyIndices.contains(i);
            r.setAcceptingOrders(!isBusy);
        }
    }

    public RestaurantResponse addRestaurant(RestaurantRequest request) {
        log.info("Adding new restaurant: {}", request.getName());

        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setAddress(request.getAddress());
        restaurant.setCity(request.getCity());
        restaurant.setRating(request.getRating() != null ? request.getRating() : 4.5);
        restaurant.setStatus(RestaurantStatus.ACTIVE);
        restaurant.setAcceptingOrders(true);

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return mapToResponse(savedRestaurant);
    }

    public List<RestaurantResponse> getAllRestaurants() {
        log.info("Fetching all active restaurants catalog with 20-minute busy rotation");
        List<Restaurant> restaurants = restaurantRepository.findAll();
        apply20MinBusyRotation(restaurants);
        return restaurants.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public boolean isRestaurantAcceptingOrders(Long id) {
        List<Restaurant> allRestaurants = restaurantRepository.findAll();
        apply20MinBusyRotation(allRestaurants);
        return allRestaurants.stream()
                .filter(r -> r.getId().equals(id))
                .map(r -> r.getAcceptingOrders())
                .findFirst()
                .orElse(true);
    }

    public RestaurantResponse getRestaurantById(Long id) {
        log.info("Fetching restaurant with id: {}", id);
        List<Restaurant> allRestaurants = restaurantRepository.findAll();
        apply20MinBusyRotation(allRestaurants);

        Restaurant restaurant = allRestaurants.stream()
                .filter(r -> r.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));

        return mapToResponse(restaurant);
    }

    public RestaurantResponse updateRestaurant(Long id, RestaurantRequest request) {
        log.info("Updating restaurant with id: {}", id);
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));

        restaurant.setName(request.getName());
        restaurant.setAddress(request.getAddress());
        restaurant.setCity(request.getCity());

        if (request.getRating() != null) {
            restaurant.setRating(request.getRating());
        }

        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
        return mapToResponse(updatedRestaurant);
    }

    public RestaurantResponse updateAcceptingOrders(Long id, Boolean acceptingOrders) {
        log.info("Updating acceptingOrders for restaurant id {}: {}", id, acceptingOrders);
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));

        restaurant.setAcceptingOrders(acceptingOrders != null ? acceptingOrders : false);
        Restaurant saved = restaurantRepository.save(restaurant);
        return mapToResponse(saved);
    }

    public void deleteRestaurant(Long id) {
        log.info("Deleting restaurant with id: {}", id);
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));

        restaurantRepository.delete(restaurant);
    }

    public RestaurantResponse mapToResponse(Restaurant restaurant) {
        String statusStr = restaurant.getStatus() != null ? restaurant.getStatus().name() : "ACTIVE";

        return new RestaurantResponse(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getAddress(),
                restaurant.getCity(),
                restaurant.getRating(),
                statusStr,
                restaurant.getAcceptingOrders(),
                restaurant.getCuisineType(),
                restaurant.getDescription(),
                restaurant.getLocality(),
                null
        );
    }
}
