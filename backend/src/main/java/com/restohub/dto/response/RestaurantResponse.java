package com.restohub.dto.response;

public class RestaurantResponse {

    private Long id;
    private String name;
    private String address;
    private String city;
    private Double rating;
    private String status;
    private Boolean acceptingOrders;
    private String cuisineType;
    private String description;
    private String locality;
    private String submittedAt;

    public RestaurantResponse() {}

    public RestaurantResponse(Long id, String name, String address, String city, Double rating) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.city = city;
        this.rating = rating;
        this.status = "ACTIVE";
        this.acceptingOrders = true;
    }

    public RestaurantResponse(Long id, String name, String address, String city, Double rating,
                              String status, Boolean acceptingOrders, String cuisineType,
                              String description, String locality, String submittedAt) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.city = city;
        this.rating = rating;
        this.status = status;
        this.acceptingOrders = acceptingOrders;
        this.cuisineType = cuisineType;
        this.description = description;
        this.locality = locality;
        this.submittedAt = submittedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getAcceptingOrders() { return acceptingOrders; }
    public void setAcceptingOrders(Boolean acceptingOrders) { this.acceptingOrders = acceptingOrders; }

    public String getCuisineType() { return cuisineType; }
    public void setCuisineType(String cuisineType) { this.cuisineType = cuisineType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }

    public String getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }
}
