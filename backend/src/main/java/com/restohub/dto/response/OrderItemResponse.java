package com.restohub.dto.response;

import java.math.BigDecimal;

public class OrderItemResponse {

    private Long id;
    private Long foodId;
    private String foodName;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subTotal;

    public OrderItemResponse() {}

    public OrderItemResponse(Long id, Long foodId, String foodName,
                             Integer quantity, BigDecimal price, BigDecimal subTotal) {
        this.id = id;
        this.foodId = foodId;
        this.foodName = foodName;
        this.quantity = quantity;
        this.price = price;
        this.subTotal = subTotal;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFoodId() { return foodId; }
    public void setFoodId(Long foodId) { this.foodId = foodId; }

    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getSubTotal() { return subTotal; }
    public void setSubTotal(BigDecimal subTotal) { this.subTotal = subTotal; }
}
