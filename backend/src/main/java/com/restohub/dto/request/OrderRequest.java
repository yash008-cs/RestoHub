package com.restohub.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class OrderRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Restaurant ID is required")
    private Long restaurantId;

    // @Valid on a collection applies the validation rules to each element inside the list.
    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequest> items;

    private String deliveryLocality;

    public OrderRequest() {}

    public OrderRequest(Long customerId, Long restaurantId, List<OrderItemRequest> items) {
        this.customerId = customerId;
        this.restaurantId = restaurantId;
        this.items = items;
    }

    public OrderRequest(Long customerId, Long restaurantId, List<OrderItemRequest> items, String deliveryLocality) {
        this.customerId = customerId;
        this.restaurantId = restaurantId;
        this.items = items;
        this.deliveryLocality = deliveryLocality;
    }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }

    public String getDeliveryLocality() { return deliveryLocality; }
    public void setDeliveryLocality(String deliveryLocality) { this.deliveryLocality = deliveryLocality; }
}
