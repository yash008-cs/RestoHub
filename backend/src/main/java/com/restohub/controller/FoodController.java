package com.restohub.controller;

import com.restohub.dto.request.FoodRequest;
import com.restohub.dto.response.FoodResponse;
import com.restohub.service.FoodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping
public class FoodController {

    private final FoodService foodService;

    public FoodController(FoodService foodService) {
        this.foodService = foodService;
    }

    @PostMapping("/api/foods")
    public ResponseEntity<FoodResponse> addFoodItem(@Valid @RequestBody FoodRequest request) {
        FoodResponse response = foodService.addFoodItem(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/api/foods")
    public ResponseEntity<List<FoodResponse>> getAllFoodItems() {
        List<FoodResponse> foods = foodService.getAllFoodItems();
        return ResponseEntity.ok(foods);
    }

    @GetMapping("/api/foods/search")
    public ResponseEntity<List<FoodResponse>> searchFoodItems(@org.springframework.web.bind.annotation.RequestParam("query") String query) {
        List<FoodResponse> foods = foodService.searchFoodItems(query);
        return ResponseEntity.ok(foods);
    }

    @GetMapping("/api/foods/{id}")
    public ResponseEntity<FoodResponse> getFoodById(@PathVariable Long id) {
        FoodResponse response = foodService.getFoodById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/restaurants/{restaurantId}/foods")
    public ResponseEntity<List<FoodResponse>> getFoodsByRestaurantId(@PathVariable Long restaurantId) {
        List<FoodResponse> foods = foodService.getFoodsByRestaurantId(restaurantId);
        return ResponseEntity.ok(foods);
    }

    @PutMapping("/api/foods/{id}")
    public ResponseEntity<FoodResponse> updateFood(
            @PathVariable Long id,
            @Valid @RequestBody FoodRequest request
    ) {
        FoodResponse response = foodService.updateFood(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/foods/{id}")
    public ResponseEntity<Void> deleteFood(@PathVariable Long id) {
        foodService.deleteFood(id);
        return ResponseEntity.noContent().build();
    }
}
