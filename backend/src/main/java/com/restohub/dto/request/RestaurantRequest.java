package com.restohub.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class RestaurantRequest {

    @NotBlank(message = "Restaurant name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @Min(value = 0, message = "Rating must be at least 0.0")
    @Max(value = 5, message = "Rating cannot exceed 5.0")
    private Double rating;

    public RestaurantRequest() {}

    public RestaurantRequest(String name, String address, String city, Double rating) {
        this.name = name;
        this.address = address;
        this.city = city;
        this.rating = rating;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
}
