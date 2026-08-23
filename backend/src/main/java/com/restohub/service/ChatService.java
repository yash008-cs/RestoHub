package com.restohub.service;

import com.restohub.dto.request.ChatRequest;
import com.restohub.dto.response.ChatResponse;
import com.restohub.entity.Food;
import com.restohub.entity.Restaurant;
import com.restohub.repository.FoodRepository;
import com.restohub.repository.RestaurantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private static final String SYSTEM_INSTRUCTION =
            "You are RestoHub AI Assistant, an intelligent and helpful assistant for the RestoHub food delivery application.\n\n" +
            "Your most important rule is:\n" +
            "ALWAYS understand and answer the user's CURRENT message using ONLY the provided real RestoHub menu items.\n" +
            "For vegetarian requests, suggest ONLY 100% vegetarian food items. Never recommend non-vegetarian food items like chicken or mutton for vegetarian queries.\n" +
            "Keep your responses friendly, concise, line-by-line formatted with bullet points and appropriate food emojis.";

    @Value("${openai.api.key:}")
    private String apiKey;

    private final FoodRepository foodRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    public ChatService(FoodRepository foodRepository, RestaurantRepository restaurantRepository) {
        this.foodRepository = foodRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public ChatResponse processChat(ChatRequest request) {
        String userPrompt = request != null && request.getMessage() != null ? request.getMessage().trim() : "";
        log.info("Processing RestoHub AI Chat request with prompt: {}", userPrompt);

        // Analyze RestoHub Database Menu Items dynamically based on prompt criteria
        List<Food> allDbFoods = foodRepository.findAll();
        String databaseContextResponse = analyzeAndBuildDatabaseResponse(userPrompt, allDbFoods);

        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.info("OpenAI API key missing. Returning RestoHub Database-driven recommendation response.");
            return new ChatResponse(databaseContextResponse);
        }

        try {
            log.info("Sending prompt and DB context to OpenAI API...");
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey.trim());

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-4o-mini");

            List<Map<String, String>> messages = new ArrayList<>();

            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", SYSTEM_INSTRUCTION);
            messages.add(systemMessage);

            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", "User Question: " + userPrompt + "\n\nReal Database Menu Context:\n" + databaseContextResponse);
            messages.add(userMessage);

            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions",
                    entity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map responseBody = response.getBody();
                List choices = (List) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map firstChoice = (Map) choices.get(0);
                    Map messageObj = (Map) firstChoice.get("message");
                    if (messageObj != null && messageObj.get("content") != null) {
                        String aiContent = (String) messageObj.get("content");
                        log.info("AI generated response successfully.");
                        return new ChatResponse(aiContent.trim());
                    }
                }
            }

            log.warn("OpenAI API notice. Returning RestoHub Database-driven recommendation response.");
            return new ChatResponse(databaseContextResponse);

        } catch (Exception e) {
            log.warn("OpenAI API communication notice ({}). Serving RestoHub Database-driven recommendation response.", e.getMessage());
            return new ChatResponse(databaseContextResponse);
        }
    }

    private String analyzeAndBuildDatabaseResponse(String prompt, List<Food> allFoods) {
        String lower = prompt.toLowerCase();

        // 1. Specific Order Status / Tracking Check
        if (lower.contains("where is my order") || lower.contains("track my order") || lower.contains("order status") || lower.contains("track order") || lower.contains("my active order") || lower.contains("delivery status")) {
            return "📦 I don't currently have direct access to your live order details in this chat. Please check the 'Orders' section in RestoHub for the latest status of your active order.";
        }

        // 2. Specific Cancellation / Refund Check
        if (lower.contains("cancel my order") || lower.contains("cancel order") || lower.contains("refund status") || lower.contains("how to refund")) {
            return "ℹ️ For order cancellations or refund requests, please visit the 'Orders' section or reach out to RestoHub Support directly. I cannot modify active orders directly.";
        }

        // Parse optional Budget limit from user prompt (e.g. "under 300", "under 200", "under 500")
        BigDecimal budgetLimit = extractBudgetLimit(lower);

        // 3. MAHARASHTRIAN SPECIALTIES CATEGORY
        if (lower.contains("maharashtrian") || lower.contains("marathi") || lower.contains("misal") || lower.contains("poha") || lower.contains("bhakri") || lower.contains("puran poli") || lower.contains("thalipeeth")) {
            List<Food> maharashtrianFoods = allFoods.stream()
                    .filter(this::isMaharashtrian)
                    .filter(f -> budgetLimit == null || f.getPrice().compareTo(budgetLimit) <= 0)
                    .collect(Collectors.toList());

            return formatCategoryItemsResponse("🚩 **Authentic Maharashtrian Specialties on RestoHub:**", maharashtrianFoods);
        }

        // 4. BIRYANI & RICE CATEGORY
        if (lower.contains("biryani") || lower.contains("pulao")) {
            List<Food> biryaniFoods = allFoods.stream()
                    .filter(f -> {
                        String cat = (f.getCategory() != null ? f.getCategory() : "").toLowerCase();
                        String name = f.getName().toLowerCase();
                        return cat.contains("biryani") || cat.contains("rice") || name.contains("biryani") || name.contains("pulao");
                    })
                    .filter(f -> budgetLimit == null || f.getPrice().compareTo(budgetLimit) <= 0)
                    .collect(Collectors.toList());

            if (lower.contains("best") || lower.contains("which") || lower.contains("where") || lower.contains("restaurant")) {
                return formatRestaurantSearchResponse("Biryani", biryaniFoods);
            }

            return formatCategoryItemsResponse("🍛 **Biryani & Rice Delights on RestoHub:**", biryaniFoods);
        }

        // 5. STARTERS & TANDOORI KEBABS CATEGORY
        if (lower.contains("starter") || lower.contains("starters") || lower.contains("kebab") || lower.contains("kebabs") || lower.contains("tikka") || lower.contains("tandoori")) {
            List<Food> starterFoods = allFoods.stream()
                    .filter(f -> {
                        String cat = (f.getCategory() != null ? f.getCategory() : "").toLowerCase();
                        String name = f.getName().toLowerCase();
                        return cat.contains("starter") || cat.contains("kebab") || name.contains("tikka") || name.contains("kebab") || name.contains("tandoori") || name.contains("65");
                    })
                    .filter(f -> budgetLimit == null || f.getPrice().compareTo(budgetLimit) <= 0)
                    .collect(Collectors.toList());

            return formatCategoryItemsResponse("🍢 **Starters & Tandoori Kebabs on RestoHub:**", starterFoods);
        }

        // 6. CHINESE & ASIAN CATEGORY
        if (lower.contains("chinese") || lower.contains("asian") || lower.contains("noodle") || lower.contains("noodles") || lower.contains("momo") || lower.contains("momos") || lower.contains("manchurian") || lower.contains("schezwan") || lower.contains("ramen")) {
            List<Food> chineseFoods = allFoods.stream()
                    .filter(this::isChinese)
                    .filter(f -> budgetLimit == null || f.getPrice().compareTo(budgetLimit) <= 0)
                    .collect(Collectors.toList());

            return formatCategoryItemsResponse("🥢 **Chinese & Asian Specialties on RestoHub:**", chineseFoods);
        }

        // 7. PIZZA, PASTA & ITALIAN CATEGORY
        if (lower.contains("pizza") || lower.contains("pasta") || lower.contains("italian") || lower.contains("garlic bread") || lower.contains("lasagna")) {
            List<Food> italianFoods = allFoods.stream()
                    .filter(this::isItalian)
                    .filter(f -> budgetLimit == null || f.getPrice().compareTo(budgetLimit) <= 0)
                    .collect(Collectors.toList());

            return formatCategoryItemsResponse("🍕 **Pizza, Pasta & Italian Specialties on RestoHub:**", italianFoods);
        }

        // 8. BURGERS, WRAPS & ROLLS CATEGORY
        if (lower.contains("burger") || lower.contains("burgers") || lower.contains("wrap") || lower.contains("wraps") || lower.contains("roll") || lower.contains("rolls") || lower.contains("frankie") || lower.contains("shawarma")) {
            List<Food> burgerFoods = allFoods.stream()
                    .filter(f -> {
                        String cat = (f.getCategory() != null ? f.getCategory() : "").toLowerCase();
                        String name = f.getName().toLowerCase();
                        return cat.contains("burger") || cat.contains("wrap") || cat.contains("roll") || name.contains("burger") || name.contains("wrap") || name.contains("roll") || name.contains("frankie") || name.contains("shawarma");
                    })
                    .filter(f -> budgetLimit == null || f.getPrice().compareTo(budgetLimit) <= 0)
                    .collect(Collectors.toList());

            return formatCategoryItemsResponse("🍔 **Burgers, Wraps & Rolls on RestoHub:**", burgerFoods);
        }

        // 9. SOUTH INDIAN CATEGORY
        if (lower.contains("south indian") || lower.contains("dosa") || lower.contains("idli") || lower.contains("vada") || lower.contains("uttapam") || lower.contains("pongal") || lower.contains("parotta")) {
            List<Food> southIndianFoods = allFoods.stream()
                    .filter(this::isSouthIndian)
                    .filter(f -> budgetLimit == null || f.getPrice().compareTo(budgetLimit) <= 0)
                    .collect(Collectors.toList());

            return formatCategoryItemsResponse("🥙 **South Indian Specialties on RestoHub:**", southIndianFoods);
        }

        // 10. DESSERTS & BEVERAGES CATEGORY
        if (lower.contains("dessert") || lower.contains("desserts") || lower.contains("sweet") || lower.contains("sweets") || lower.contains("beverage") || lower.contains("beverages") || lower.contains("drink") || lower.contains("shake") || lower.contains("lassi") || lower.contains("ice cream") || lower.contains("coffee") || lower.contains("tea") || lower.contains("chai")) {
            List<Food> dessertFoods = allFoods.stream()
                    .filter(f -> {
                        String cat = (f.getCategory() != null ? f.getCategory() : "").toLowerCase();
                        String name = f.getName().toLowerCase();
                        return cat.contains("dessert") || cat.contains("beverage") || cat.contains("sweet") || this.isDessert(f) || name.contains("shake") || name.contains("lassi") || name.contains("coffee") || name.contains("chai") || name.contains("tea");
                    })
                    .filter(f -> budgetLimit == null || f.getPrice().compareTo(budgetLimit) <= 0)
                    .collect(Collectors.toList());

            return formatCategoryItemsResponse("🍰 **Desserts & Beverages on RestoHub:**", dessertFoods);
        }

        // 11. Strict NON-VEGETARIAN Food Request
        if (isNonVegQuery(lower)) {
            List<Food> nonVegFoods = allFoods.stream()
                    .filter(this::isNonVeg)
                    .filter(f -> budgetLimit == null || f.getPrice().compareTo(budgetLimit) <= 0)
                    .collect(Collectors.toList());

            return formatCategoryItemsResponse("🍗 **Top Non-Vegetarian Recommendations on RestoHub:**", nonVegFoods);
        }

        // 12. Strict VEGETARIAN Food Request
        if (isVegetarianQuery(lower)) {
            List<Food> vegFoods = allFoods.stream()
                    .filter(this::isVegetarian)
                    .filter(f -> budgetLimit == null || f.getPrice().compareTo(budgetLimit) <= 0)
                    .collect(Collectors.toList());

            return formatCategoryItemsResponse("🥬 **Top 100% Vegetarian Recommendations on RestoHub:**", vegFoods);
        }

        // 13. SPICY Food Request
        if (lower.contains("spicy")) {
            List<Food> spicyFoods = allFoods.stream()
                    .filter(f -> {
                        String name = (f.getName() + " " + f.getCategory() + " " + f.getDescription()).toLowerCase();
                        return name.contains("spicy") || name.contains("schezwan") || name.contains("kolhapuri")
                               || name.contains("chilli") || name.contains("65") || name.contains("masala");
                    })
                    .filter(f -> budgetLimit == null || f.getPrice().compareTo(budgetLimit) <= 0)
                    .collect(Collectors.toList());

            return formatCategoryItemsResponse("🌶️ **Top Spicy Food Options on RestoHub:**", spicyFoods);
        }

        // 14. HEALTHY / PROTEIN Food Request
        if (lower.contains("healthy") || lower.contains("protein") || lower.contains("diet") || lower.contains("light")) {
            List<Food> healthyFoods = allFoods.stream()
                    .filter(this::isHealthy)
                    .filter(f -> budgetLimit == null || f.getPrice().compareTo(budgetLimit) <= 0)
                    .collect(Collectors.toList());

            return formatCategoryItemsResponse("🥗 **Healthy & Nutritious Options on RestoHub:**", healthyFoods);
        }

        // 15. SPECIFIC DISH / RESTAURANT SEARCH (e.g., "Which biryani is best?", "Where can I get butter chicken?")
        String searchKey = cleanSearchKeywords(lower);
        List<Food> matchedFoods = allFoods.stream()
                .filter(f -> {
                    String text = (f.getName() + " " + f.getCategory() + " " + f.getDescription()).toLowerCase();
                    return text.contains(searchKey) || lower.contains(f.getName().toLowerCase());
                })
                .filter(f -> budgetLimit == null || f.getPrice().compareTo(budgetLimit) <= 0)
                .collect(Collectors.toList());

        if (!matchedFoods.isEmpty()) {
            return formatRestaurantSearchResponse(searchKey, matchedFoods);
        }

        // 16. BUDGET-SPECIFIC Request (e.g. "under 300")
        if (budgetLimit != null) {
            List<Food> budgetFoods = allFoods.stream()
                    .filter(f -> f.getPrice().compareTo(budgetLimit) <= 0)
                    .collect(Collectors.toList());

            return formatCategoryItemsResponse("💰 **Great Food Options Under ₹" + budgetLimit.intValue() + " on RestoHub:**", budgetFoods);
        }

        // 17. General Fallback Recommendation
        return formatCategoryItemsResponse("🍔 **Top Recommended Options on RestoHub:**", allFoods.stream().limit(8).collect(Collectors.toList()));
    }

    private String formatCategoryItemsResponse(String title, List<Food> items) {
        if (items.isEmpty()) {
            return title + "\n\nNo items found in this category right now. Please explore our homepage menu!";
        }

        StringBuilder sb = new StringBuilder(title).append("\n\n");
        int limit = Math.min(items.size(), 12);
        for (int i = 0; i < limit; i++) {
            Food f = items.get(i);
            String restName = f.getRestaurant() != null ? f.getRestaurant().getName() : "RestoHub Partner";
            String locality = (f.getRestaurant() != null && f.getRestaurant().getLocality() != null) ? " (" + f.getRestaurant().getLocality() + ")" : "";
            sb.append(i + 1).append(". 🍽️ **").append(f.getName()).append("** (₹").append(f.getPrice().intValue())
              .append(") from *").append(restName).append(locality).append("*\n");
        }

        if (items.size() > limit) {
            sb.append("\n*...and ").append(items.size() - limit).append(" more options available on RestoHub!*");
        }
        sb.append("\n\nWhich item would you like to add to your order?");
        return sb.toString();
    }

    private String formatRestaurantSearchResponse(String queryKeyword, List<Food> foods) {
        StringBuilder sb = new StringBuilder("🔍 **Top Restaurants on RestoHub featuring '").append(queryKeyword).append("':**\n\n");

        java.util.Map<String, List<Food>> restMap = foods.stream()
                .collect(Collectors.groupingBy(f -> f.getRestaurant() != null ? f.getRestaurant().getName() : "RestoHub Partner", java.util.LinkedHashMap::new, Collectors.toList()));

        int count = 1;
        int restLimit = 6;
        int totalRestaurants = restMap.size();

        for (java.util.Map.Entry<String, List<Food>> entry : restMap.entrySet()) {
            if (count > restLimit) break;
            String restName = entry.getKey();
            List<Food> restFoods = entry.getValue();
            Restaurant rest = restFoods.get(0).getRestaurant();
            String ratingStr = (rest != null && rest.getRating() != null) ? " ⭐ " + rest.getRating() : "";
            String localityStr = (rest != null && rest.getLocality() != null && !rest.getLocality().isEmpty()) ? " • 📍 " + rest.getLocality() : "";

            sb.append(count++).append(". 🏬 **").append(restName).append("**").append(ratingStr).append(localityStr).append("\n");
            int itemLimit = Math.min(restFoods.size(), 4);
            for (int i = 0; i < itemLimit; i++) {
                Food f = restFoods.get(i);
                sb.append("   • **").append(f.getName()).append("** - ₹").append(f.getPrice().intValue());
                if (f.getDescription() != null && !f.getDescription().trim().isEmpty()) {
                    sb.append(" (*").append(f.getDescription()).append("*)");
                }
                sb.append("\n");
            }
            if (restFoods.size() > itemLimit) {
                sb.append("   *...and ").append(restFoods.size() - itemLimit).append(" more item(s)*\n");
            }
            sb.append("\n");
        }

        if (totalRestaurants > restLimit) {
            sb.append("*...and ").append(totalRestaurants - restLimit).append(" more restaurants on RestoHub serve ").append(queryKeyword).append("!*\n\n");
        }

        sb.append("Which restaurant would you like to order from?");
        return sb.toString();
    }

    private String cleanSearchKeywords(String prompt) {
        String cleaned = prompt.toLowerCase()
                .replaceAll("[?!.,]", "")
                .replace("which restaurant has", "")
                .replace("which restaurant serves", "")
                .replace("which restaurant", "")
                .replace("where can i get", "")
                .replace("where can i find", "")
                .replace("do you have", "")
                .replace("which", "")
                .replace("restaurant", "")
                .replace("restaurants", "")
                .replace("has", "")
                .replace("serves", "")
                .replace("serve", "")
                .replace("is", "")
                .replace("best", "")
                .replace("good", "")
                .replace("suggest", "")
                .replace("recommend", "")
                .replace("options", "")
                .replace("option", "")
                .replace("where", "")
                .replace("can", "")
                .replace("get", "")
                .replace("find", "")
                .replace("show", "")
                .replace("give", "")
                .replace("what", "")
                .replace("are", "")
                .replace("the", "")
                .replace("for", "")
                .replace("me", "")
                .replace("food", "")
                .replace("items", "")
                .replace("item", "")
                .replaceAll("\\s+", " ")
                .trim();
        return cleaned.isEmpty() ? prompt.replaceAll("[?!.,]", "").trim() : cleaned;
    }

    // Helper Classification Functions

    private boolean isNonVegQuery(String lower) {
        return lower.contains("non-veg") || lower.contains("non veg") || lower.contains("nonveg")
               || lower.contains("non vegetarian") || lower.contains("non-vegetarian") || lower.contains("mamsahari");
    }

    private boolean isVegetarianQuery(String lower) {
        if (lower.contains("non-veg") || lower.contains("non veg") || lower.contains("nonveg") || lower.contains("non vegetarian") || lower.contains("non-vegetarian")) {
            return false;
        }
        return lower.contains("veg") || lower.contains("vegetarian") || lower.contains("shakahari") || lower.contains("pure veg");
    }

    private boolean isNonVeg(Food food) {
        String name = (food.getName() + " " + food.getCategory() + " " + food.getDescription()).toLowerCase();
        return name.contains("chicken") || name.contains("mutton") || name.contains("fish") || name.contains("prawn")
               || name.contains("egg") || name.contains("keema") || name.contains("non-veg") || name.contains("meat");
    }

    private boolean isVegetarian(Food food) {
        return !isNonVeg(food);
    }

    private boolean isMaharashtrian(Food food) {
        String combined = (food.getName() + " " + food.getCategory() + " " + food.getDescription() + " "
                          + (food.getRestaurant() != null ? food.getRestaurant().getName() + " " + food.getRestaurant().getCuisineType() : "")).toLowerCase();
        return combined.contains("maharashtrian") || combined.contains("misal") || combined.contains("pav bhaji") || combined.contains("puran poli")
               || combined.contains("kolhapuri") || combined.contains("bhakri") || combined.contains("pithla") || combined.contains("vada pav")
               || combined.contains("sabudana") || combined.contains("poha") || combined.contains("thalipeeth") || combined.contains("solkadhi");
    }

    private boolean isHealthy(Food food) {
        String combined = (food.getName() + " " + food.getCategory() + " " + food.getDescription()).toLowerCase();
        return combined.contains("salad") || combined.contains("healthy") || combined.contains("grilled") || combined.contains("sprouts")
               || combined.contains("oats") || combined.contains("fruit") || combined.contains("protein") || combined.contains("dal");
    }

    private boolean isChinese(Food food) {
        String combined = (food.getName() + " " + food.getCategory() + " " + food.getDescription()).toLowerCase();
        return combined.contains("chinese") || combined.contains("noodle") || combined.contains("schezwan") || combined.contains("momo")
               || combined.contains("manchurian") || combined.contains("wok") || combined.contains("spring roll");
    }

    private boolean isItalian(Food food) {
        String combined = (food.getName() + " " + food.getCategory() + " " + food.getDescription()).toLowerCase();
        return combined.contains("italian") || combined.contains("pizza") || combined.contains("pasta") || combined.contains("garlic bread") || combined.contains("risotto");
    }

    private boolean isSouthIndian(Food food) {
        String combined = (food.getName() + " " + food.getCategory() + " " + food.getDescription()).toLowerCase();
        return combined.contains("south indian") || combined.contains("dosa") || combined.contains("idli") || combined.contains("vada") || combined.contains("uttapam");
    }

    private boolean isDessert(Food food) {
        String combined = (food.getName() + " " + food.getCategory() + " " + food.getDescription()).toLowerCase();
        return combined.contains("dessert") || combined.contains("gulab jamun") || combined.contains("brownie") || combined.contains("ice cream")
               || combined.contains("lava cake") || combined.contains("rasmalai") || combined.contains("sweet") || combined.contains("kulfi");
    }

    private BigDecimal extractBudgetLimit(String lowerPrompt) {
        try {
            if (lowerPrompt.contains("300")) return new BigDecimal("300");
            if (lowerPrompt.contains("200")) return new BigDecimal("200");
            if (lowerPrompt.contains("500")) return new BigDecimal("500");
            if (lowerPrompt.contains("100")) return new BigDecimal("100");
            if (lowerPrompt.contains("400")) return new BigDecimal("400");
        } catch (Exception ignored) {}
        return null;
    }
}



