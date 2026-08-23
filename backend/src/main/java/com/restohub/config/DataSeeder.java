package com.restohub.config;

import com.restohub.entity.Customer;
import com.restohub.entity.Food;
import com.restohub.entity.Order;
import com.restohub.entity.OrderItem;
import com.restohub.entity.OrderStatus;
import com.restohub.entity.Restaurant;
import com.restohub.entity.RestaurantStatus;
import com.restohub.repository.CustomerRepository;
import com.restohub.repository.FoodRepository;
import com.restohub.repository.OrderRepository;
import com.restohub.repository.RestaurantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CustomerRepository customerRepository;
    private final RestaurantRepository restaurantRepository;
    private final FoodRepository foodRepository;
    private final OrderRepository orderRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataSeeder(
            CustomerRepository customerRepository,
            RestaurantRepository restaurantRepository,
            FoodRepository foodRepository,
            OrderRepository orderRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.customerRepository = customerRepository;
        this.restaurantRepository = restaurantRepository;
        this.foodRepository = foodRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking RestoHub database sample data...");

        // Ensure primary user phone account 8830709703 exists
        if (customerRepository.findByPhone("8830709703").isEmpty()) {
            customerRepository.save(new Customer(null, "Yashraj Kenjale", "8830709703@restohub.app", "8830709703", passwordEncoder.encode("Iloveswiggy")));
            log.info("Pre-seeded primary user phone account: 8830709703 / Iloveswiggy");
        }

        // Ensure secondary user phone account 8830709700 exists
        if (customerRepository.findByPhone("8830709700").isEmpty()) {
            customerRepository.save(new Customer(null, "Yashraj Kenjale (Account 2)", "8830709700@restohub.app", "8830709700", passwordEncoder.encode("1111111111")));
            log.info("Pre-seeded secondary user phone account: 8830709700 / 1111111111");
        }

        // Ensure primary sample Restaurant Owner account 8888765432 exists
        Customer ownerAccount;
        if (customerRepository.findByPhone("8888765432").isEmpty()) {
            ownerAccount = customerRepository.save(new Customer(null, "Rajesh Sharma (Owner)", "partner.royalmasala@restohub.app", "8888765432", passwordEncoder.encode("password123"), com.restohub.entity.Role.RESTAURANT_OWNER));
            log.info("Pre-seeded primary restaurant owner account: 8888765432 / password123");
        } else {
            ownerAccount = customerRepository.findByPhone("8888765432").get();
            ownerAccount.setPassword(passwordEncoder.encode("password123"));
            ownerAccount.setRole(com.restohub.entity.Role.RESTAURANT_OWNER);
            customerRepository.save(ownerAccount);
            log.info("Updated pre-seeded primary restaurant owner password: 8888765432 / password123");
        }

        // 1. Rename any legacy city-based restaurant names in DB
        cleanupCityBasedRestaurantNames();

        // 2. Seed Initial Customers if empty
        if (customerRepository.count() <= 1) {
            seedCustomers();
        }

        // 3. Seed Restaurants & Food Items if database needs expansion
        List<Customer> customers = customerRepository.findAll();
        List<Restaurant> restaurants = seedRestaurants();
        List<Food> foods = seedFoodItems(restaurants);
        
        if (orderRepository.count() == 0) {
            seedOrders(customers, restaurants, foods);
        }
        log.info("Successfully populated database with 30+ Restaurants and 150+ Food Items!");
    }

    private List<Customer> seedCustomers() {
        List<Customer> customers = new ArrayList<>();

        if (customerRepository.findByPhone("9822011223").isEmpty()) {
            customers.add(new Customer(null, "Aarav Patil", "aarav.patil@example.com", "9822011223", passwordEncoder.encode("password123")));
        }
        if (customerRepository.findByPhone("9822022334").isEmpty()) {
            customers.add(new Customer(null, "Rohan Kulkarni", "rohan.kulkarni@example.com", "9822022334", passwordEncoder.encode("password123")));
        }
        if (customerRepository.findByPhone("9822033445").isEmpty()) {
            customers.add(new Customer(null, "Sneha Joshi", "sneha.joshi@example.com", "9822033445", passwordEncoder.encode("password123")));
        }
        if (customerRepository.findByPhone("9822044556").isEmpty()) {
            customers.add(new Customer(null, "Priya Deshmukh", "priya.deshmukh@example.com", "9822044556", passwordEncoder.encode("password123")));
        }

        return customerRepository.saveAll(customers);
    }

    private List<Restaurant> seedRestaurants() {
        List<Restaurant> restaurants = new ArrayList<>();

        // 30+ Premium & Indian Restaurant Brands
        addRestaurantIfAbsent(restaurants, "The Spice Symphony Kitchen", "DP Road, Kothrud", "Pune", 4.5, "Indian, Maharashtrian");
        addRestaurantIfAbsent(restaurants, "Tandoor & Curry House", "FC Road, Deccan", "Pune", 4.4, "Street Food, Maharashtrian");
        addRestaurantIfAbsent(restaurants, "Royal Masala Tales", "Baner Road, Baner", "Pune", 4.6, "North Indian, Biryani");
        addRestaurantIfAbsent(restaurants, "Desi Flavour Express", "Karve Road, Kothrud", "Pune", 4.3, "Maharashtrian, Breakfast");
        addRestaurantIfAbsent(restaurants, "The Grand Maharaja", "North Main Road, Koregaon Park", "Pune", 4.8, "North Indian, Mughlai");
        addRestaurantIfAbsent(restaurants, "The Velvet Bean Cafe", "Symbiosis Road, Viman Nagar", "Pune", 4.2, "Cafe, Beverages, Sandwiches");
        addRestaurantIfAbsent(restaurants, "Saffron & Charcoal Grill", "Dange Chowk, Wakad", "Pune", 4.5, "North Indian, Kebabs");
        addRestaurantIfAbsent(restaurants, "Wok & Roll Bistro", "Phase 1, Hinjawadi", "Pune", 4.1, "Fast Food, Chinese");
        addRestaurantIfAbsent(restaurants, "Olive & Oregano Bistro", "Lane 7, Koregaon Park", "Pune", 4.7, "Italian, Pasta, Pizza");
        addRestaurantIfAbsent(restaurants, "Swad Maharashtrian Thali", "IT Park Road, Aundh", "Pune", 4.4, "Maharashtrian, Thalis");
        addRestaurantIfAbsent(restaurants, "South Spice Express", "Kunal Icon Road, Pimple Saudagar", "Pune", 4.3, "South Indian, Dosa");
        addRestaurantIfAbsent(restaurants, "Royal Biryani Mahal", "Cybercity, Magarpatta", "Pune", 4.5, "Biryani, North Indian");

        // Realistic Original Restaurant Brands
        addRestaurantIfAbsent(restaurants, "The Hungry Fork", "Bhandarkar Road, Shivajinagar", "Pune", 4.7, "North Indian, Main Course");
        addRestaurantIfAbsent(restaurants, "Spice Symphony", "Law College Road, Erandwane", "Pune", 4.6, "North Indian, Mughlai");
        addRestaurantIfAbsent(restaurants, "The Curry House", "JM Road, Shivajinagar", "Pune", 4.5, "North Indian, Thalis");
        addRestaurantIfAbsent(restaurants, "The Royal Tandoor", "Salunke Vihar Road, Wanowrie", "Pune", 4.8, "Kebabs, Biryani");
        addRestaurantIfAbsent(restaurants, "Copper Chimney Kitchen", "Senapati Bapat Road", "Pune", 4.6, "North Indian, Curries");
        addRestaurantIfAbsent(restaurants, "Urban Tadka", "Pimple Nilakh Main Road", "Pune", 4.4, "North Indian, Main Course");
        addRestaurantIfAbsent(restaurants, "The Pizza Project", "High Street, Baner", "Pune", 4.7, "Pizza, Italian");
        addRestaurantIfAbsent(restaurants, "Crust & Cheese", "Viman Nagar Main Road", "Pune", 4.5, "Pizza, Pasta");
        addRestaurantIfAbsent(restaurants, "Firestone Pizza", "Koregaon Park Main Road", "Pune", 4.8, "Woodfired Pizza, Italian");
        addRestaurantIfAbsent(restaurants, "Burger Barn", "FC Road, Deccan", "Pune", 4.6, "Burgers, Shakes");
        addRestaurantIfAbsent(restaurants, "Stacked & Loaded", "Balewadi High Street", "Pune", 4.7, "Gourmet Burgers, Fries");
        addRestaurantIfAbsent(restaurants, "The Burger Lab", "Kothrud Depot Road", "Pune", 4.4, "Burgers, Fast Food");
        addRestaurantIfAbsent(restaurants, "Wrap Republic", "FC Road, Goodluck Chowk", "Pune", 4.7, "Wraps, Rolls, Shawarma");
        addRestaurantIfAbsent(restaurants, "Roll & Bowl", "SB Road, Shivajinagar", "Pune", 4.5, "Wraps, Frankie, Asian");
        addRestaurantIfAbsent(restaurants, "The Noodle House", "Aundh Road", "Pune", 4.6, "Chinese, Asian");
        addRestaurantIfAbsent(restaurants, "Wok This Way", "Magarpatta City", "Pune", 4.5, "Pan-Asian, Chinese");
        addRestaurantIfAbsent(restaurants, "Dragon Bowl", "Koregaon Park Lane 5", "Pune", 4.7, "Dim Sum, Asian, Ramen");
        addRestaurantIfAbsent(restaurants, "Momo Junction", "Viman Nagar", "Pune", 4.6, "Momos, Chinese, Street Food");
        addRestaurantIfAbsent(restaurants, "Dosa District", "Karve Nagar", "Pune", 4.7, "South Indian, Dosa, Idli");
        addRestaurantIfAbsent(restaurants, "Southern Spice House", "DP Road, Aundh", "Pune", 4.6, "South Indian, Chettinad");
        addRestaurantIfAbsent(restaurants, "Filter Coffee House", "FC Road, Deccan", "Pune", 4.8, "South Indian, Coffee, Breakfast");
        addRestaurantIfAbsent(restaurants, "Misal Express", "Tilak Road, Sadashiv Peth", "Pune", 4.9, "Maharashtrian, Misal");
        addRestaurantIfAbsent(restaurants, "The Vada Company", "Kothrud Stand", "Pune", 4.7, "Vada Pav, Maharashtrian");
        addRestaurantIfAbsent(restaurants, "Bombay Chaat Co.", "JM Road", "Pune", 4.6, "Street Food, Chaat");
        addRestaurantIfAbsent(restaurants, "The Breakfast Club", "Koregaon Park", "Pune", 4.7, "Breakfast, Waffles, Pancakes");
        addRestaurantIfAbsent(restaurants, "Brew & Bites", "Baner Pashan Link Road", "Pune", 4.8, "Cafe, Coffee, Desserts");
        addRestaurantIfAbsent(restaurants, "Sugar Rush", "Viman Nagar", "Pune", 4.7, "Desserts, Cakes, Shakes");
        addRestaurantIfAbsent(restaurants, "Biryani Blues Kitchen", "Hinjawadi Phase 1", "Pune", 4.8, "Biryani, Kebabs");
        addRestaurantIfAbsent(restaurants, "Dum & Spice", "Wakad Main Road", "Pune", 4.6, "Biryani, Rice");

        return restaurantRepository.findAll();
    }

    private void addRestaurantIfAbsent(List<Restaurant> list, String name, String address, String city, double rating, String cuisineType) {
        Customer defaultOwner = customerRepository.findByPhone("8888765432").orElse(null);
        Restaurant restaurant = restaurantRepository.findByName(name).orElseGet(() -> {
            Restaurant r = new Restaurant(null, name, address, city, rating);
            r.setCuisineType(cuisineType);
            r.setStatus(RestaurantStatus.ACTIVE);
            r.setAcceptingOrders(true);
            if (defaultOwner != null) {
                r.setOwner(defaultOwner);
                r.setOwnerName(defaultOwner.getName());
                r.setPhoneNumber(defaultOwner.getPhone());
            }
            return restaurantRepository.save(r);
        });
        if (restaurant.getStatus() == RestaurantStatus.APPROVED) {
            restaurant.setStatus(RestaurantStatus.ACTIVE);
        }
        if (restaurant.getAcceptingOrders() == null) {
            restaurant.setAcceptingOrders(true);
        }
        if (restaurant.getOwner() == null && defaultOwner != null) {
            restaurant.setOwner(defaultOwner);
            restaurant.setOwnerName(defaultOwner.getName());
            restaurant.setPhoneNumber(defaultOwner.getPhone());
        }
        restaurantRepository.save(restaurant);
        list.add(restaurant);
    }

    private void cleanupCityBasedRestaurantNames() {
        List<Restaurant> all = restaurantRepository.findAll();
        for (Restaurant r : all) {
            String name = r.getName();
            String originalName = name;

            if (name.contains("Pune Spice Kitchen")) name = "The Spice Symphony Kitchen";
            else if (name.contains("Deccan Bites")) name = "Tandoor & Curry House";
            else if (name.contains("Baner Food House")) name = "Royal Masala Tales";
            else if (name.contains("Kothrud Kitchen")) name = "Desi Flavour Express";
            else if (name.contains("Maharaja's Feast")) name = "The Grand Maharaja";
            else if (name.contains("Viman Nagar Cafe")) name = "The Velvet Bean Cafe";
            else if (name.contains("Wakad Tandoor")) name = "Saffron & Charcoal Grill";
            else if (name.contains("Hinjawadi Food Corner")) name = "Wok & Roll Bistro";
            else if (name.contains("Koregaon Kitchen")) name = "Olive & Oregano Bistro";
            else if (name.contains("Sahyadri Meals")) name = "Swad Maharashtrian Thali";
            else if (name.contains("Pimple Saudagar Treat")) name = "South Spice Express";
            else if (name.contains("Magarpatta Spice")) name = "Royal Biryani Mahal";
            else if (name.startsWith("Pune ")) name = name.replace("Pune ", "The Spiced ");
            else if (name.contains("Deccan")) name = name.replace("Deccan", "Royal Desi");
            else if (name.contains("Baner")) name = name.replace("Baner", "Masala");
            else if (name.contains("Kothrud")) name = name.replace("Kothrud", "Heritage");
            else if (name.contains("Viman Nagar")) name = name.replace("Viman Nagar", "Urban");
            else if (name.contains("Wakad")) name = name.replace("Wakad", "Tandoori");
            else if (name.contains("Hinjawadi")) name = name.replace("Hinjawadi", "Express");
            else if (name.contains("Koregaon")) name = name.replace("Koregaon", "Grand");
            else if (name.contains("Sahyadri")) name = name.replace("Sahyadri", "Desi");
            else if (name.contains("Pimple Saudagar")) name = name.replace("Pimple Saudagar", "Southern");
            else if (name.contains("Magarpatta")) name = name.replace("Magarpatta", "Royal");

            if (!name.equals(originalName)) {
                r.setName(name);
                restaurantRepository.save(r);
                log.info("Renamed restaurant in database from '{}' to '{}'", originalName, name);
            }
        }
    }

    private List<Food> seedFoodItems(List<Restaurant> restaurants) {
        List<Food> newFoods = new ArrayList<>();
        if (restaurants.isEmpty()) return newFoods;

        for (Restaurant r : restaurants) {
            List<Food> existingFoods = foodRepository.findByRestaurantId(r.getId());
            Set<String> existingNames = existingFoods.stream()
                    .map(f -> f.getName().toLowerCase())
                    .collect(Collectors.toSet());

            // 1. INDIAN MAIN COURSE
            addFoodIfMissing(newFoods, existingNames, r, "Butter Chicken", "Tender chicken cooked in rich creamy tomato butter gravy.", new BigDecimal("340.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Curry", "Homestyle chicken curry cooked with aromatic Indian spices.", new BigDecimal("290.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Masala", "Spicy gravy dish with roasted chicken pieces.", new BigDecimal("310.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Kadai", "Chicken tossed with bell peppers and freshly ground kadai spices.", new BigDecimal("320.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Handi", "Slow-cooked chicken in traditional earthen handi gravy.", new BigDecimal("330.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Kolhapuri", "Fiery spicy Kolhapuri style chicken curry.", new BigDecimal("320.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Chettinad", "Authentic South Indian spicy pepper chicken dish.", new BigDecimal("330.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Hyderabadi", "Rich green gravy chicken simmered with mint and spices.", new BigDecimal("340.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Tikka Masala", "Charcoal grilled chicken tikka in spicy masala sauce.", new BigDecimal("350.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Mutton Rogan Josh", "Kashmiri delicacy slow cooked tender mutton curry.", new BigDecimal("420.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Mutton Curry", "Spiced mutton gravy cooked with onions and whole garlic.", new BigDecimal("390.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Fish Curry", "Fresh fish cooked in coconut tamarind curry.", new BigDecimal("380.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Prawn Curry", "Succulent prawns simmered in spicy coastal coconut gravy.", new BigDecimal("440.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Paneer Butter Masala", "Fresh paneer cubes in velvety tomato cashew butter sauce.", new BigDecimal("280.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Paneer Tikka Masala", "Tandoori paneer tikka tossed in spicy onion gravy.", new BigDecimal("290.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Kadai Paneer", "Cottage cheese cooked with bell peppers and whole coriander.", new BigDecimal("270.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Palak Paneer", "Paneer cooked in smooth spinach purée tempered with garlic.", new BigDecimal("260.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Shahi Paneer", "Rich royal paneer in white cashew nut cream gravy.", new BigDecimal("290.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Malai Kofta", "Soft paneer dumplings in sweet creamy cashew gravy.", new BigDecimal("280.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Dal Tadka", "Yellow arhar dal tempered with ghee, cumin seeds, and chilli.", new BigDecimal("180.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Dal Makhani", "Black lentils slow cooked overnight with butter and cream.", new BigDecimal("220.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Chole", "North Indian style chickpeas curry cooked with tea leaves.", new BigDecimal("170.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Rajma", "Red kidney beans cooked in thick onion tomato gravy.", new BigDecimal("160.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Aloo Gobi", "Potatoes and cauliflower sautéed with turmeric and cumin.", new BigDecimal("150.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Mix Veg", "Assorted vegetables tossed in light curry sauce.", new BigDecimal("180.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Kolhapuri", "Spicy mixed vegetable curry topped with sesame seeds.", new BigDecimal("220.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Handi", "Assorted vegetables cooked in spinach and cream gravy.", new BigDecimal("210.00"), "Indian Main Course");
            addFoodIfMissing(newFoods, existingNames, r, "Bhindi Masala", "Crispy ladyfinger cooked with onion and dry masala spices.", new BigDecimal("160.00"), "Indian Main Course");

            // 2. BIRYANI & RICE
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Dum Biryani", "Layered basmati rice and marinated chicken cooked on dum.", new BigDecimal("280.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Hyderabadi Chicken Biryani", "Authentic spicy Hyderabadi dum biryani with raita.", new BigDecimal("290.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Mutton Biryani", "Tender mutton pieces baked with saffron basmati rice.", new BigDecimal("380.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Egg Biryani", "Fragrant rice biryani with boiled eggs and caramelized onions.", new BigDecimal("210.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Biryani", "Basmati rice layered with fresh vegetables and biryani spices.", new BigDecimal("220.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Paneer Biryani", "Marinated paneer cubes layered with aromatic basmati rice.", new BigDecimal("240.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Tikka Biryani", "Tandoori chicken tikka layered with spicy biryani rice.", new BigDecimal("310.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Lucknowi Biryani", "Mild aromatic Awadhi style dum biryani.", new BigDecimal("320.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Kolkata Biryani", "Fragrant rice with potato and soft chicken piece.", new BigDecimal("300.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Prawn Biryani", "Juicy prawns layered with saffron fragrant rice.", new BigDecimal("420.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Fish Biryani", "Spiced fish fillets baked with biryani rice.", new BigDecimal("390.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Jeera Rice", "Basmati rice tempered with ghee and cumin seeds.", new BigDecimal("130.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Pulao", "Mildly spiced rice cooked with green peas, carrots, and beans.", new BigDecimal("170.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Paneer Pulao", "Aromatic basmati rice cooked with fried paneer cubes.", new BigDecimal("190.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Fried Rice", "Wok-tossed rice with shredded chicken and soy sauce.", new BigDecimal("210.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Fried Rice", "Wok-tossed rice with finely chopped fresh vegetables.", new BigDecimal("160.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Egg Fried Rice", "Wok-tossed fried rice with scrambled eggs.", new BigDecimal("180.00"), "Biryani & Rice");
            addFoodIfMissing(newFoods, existingNames, r, "Schezwan Fried Rice", "Spicy wok-tossed fried rice in red chilli Schezwan sauce.", new BigDecimal("180.00"), "Biryani & Rice");

            // 3. WRAPS & ROLLS
            addFoodIfMissing(newFoods, existingNames, r, "Veg Wrap", "Crispy veg patty wrap with lettuce and mayonnaise.", new BigDecimal("120.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Paneer Wrap", "Grilled paneer wrap with crunchy onions and mint chutney.", new BigDecimal("160.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Paneer Tikka Wrap", "Smoky paneer tikka wrapped in wheat paratha with dip.", new BigDecimal("170.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Wrap", "Juicy grilled chicken wrapped in soft tortilla bread.", new BigDecimal("180.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Tikka Wrap", "Tandoori chicken tikka loaded wrap with chipotle sauce.", new BigDecimal("190.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Shawarma Wrap", "Slow-roasted chicken shawarma with garlic toum sauce.", new BigDecimal("160.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Shawarma", "Crispy falafel and veggies wrapped with garlic hummus.", new BigDecimal("130.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Shawarma", "Middle-eastern spiced chicken wrapped in pita bread.", new BigDecimal("150.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Falafel Wrap", "Deep-fried chickpea patties wrapped with tahini sauce.", new BigDecimal("140.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Egg Roll", "Egg kathi roll wrapped in crispy paratha.", new BigDecimal("110.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Roll", "Spiced chicken filling stuffed inside soft egg paratha.", new BigDecimal("160.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Paneer Roll", "Paneer bhurji stuffed kathi roll with pickled onions.", new BigDecimal("150.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Frankie", "Classic Mumbai street frankie with spiced potato roll.", new BigDecimal("90.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Frankie", "Spiced chicken frankie roll topped with cheese.", new BigDecimal("130.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Cheese Wrap", "Loaded cheese and corn vegetable wrap.", new BigDecimal("150.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Spicy Chicken Wrap", "Crispy fried spicy chicken strip wrap.", new BigDecimal("190.00"), "Wraps & Rolls");
            addFoodIfMissing(newFoods, existingNames, r, "Mexican Veg Wrap", "Beans, corn, jalapenos and salsa wrap.", new BigDecimal("160.00"), "Wraps & Rolls");

            // 4. PIZZA
            addFoodIfMissing(newFoods, existingNames, r, "Margherita Pizza", "Classic cheese pizza with rich tomato sauce and fresh basil.", new BigDecimal("220.00"), "Pizza");
            addFoodIfMissing(newFoods, existingNames, r, "Farmhouse Pizza", "Capsicum, onion, tomato, and fresh mushroom pizza.", new BigDecimal("290.00"), "Pizza");
            addFoodIfMissing(newFoods, existingNames, r, "Veggie Supreme Pizza", "Loaded pizza with black olives, jalapenos, corn, and bell peppers.", new BigDecimal("320.00"), "Pizza");
            addFoodIfMissing(newFoods, existingNames, r, "Paneer Tikka Pizza", "Tandoori paneer tikka topping with mozzarella cheese.", new BigDecimal("340.00"), "Pizza");
            addFoodIfMissing(newFoods, existingNames, r, "Cheese Burst Pizza", "Extra cheese stuffed crust Margherita pizza.", new BigDecimal("380.00"), "Pizza");
            addFoodIfMissing(newFoods, existingNames, r, "Mexican Green Wave Pizza", "Spicy jalapenos, crunchy onions, and Mexican herbs.", new BigDecimal("310.00"), "Pizza");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Extravaganza Pizza", "Corn, olives, onion, capsicum, mushroom, and extra cheese.", new BigDecimal("350.00"), "Pizza");
            addFoodIfMissing(newFoods, existingNames, r, "Pepperoni Pizza", "Classic pepperoni slices over melted mozzarella.", new BigDecimal("420.00"), "Pizza");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Dominator Pizza", "BBQ chicken, peri-peri chicken, and chicken sausage pizza.", new BigDecimal("440.00"), "Pizza");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Tikka Pizza", "Juicy chicken tikka pieces with spicy red paprika.", new BigDecimal("380.00"), "Pizza");
            addFoodIfMissing(newFoods, existingNames, r, "BBQ Chicken Pizza", "Smoky BBQ chicken topping with red onions.", new BigDecimal("390.00"), "Pizza");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Sausage Pizza", "Chicken sausage and mozzarella cheese pizza.", new BigDecimal("360.00"), "Pizza");
            addFoodIfMissing(newFoods, existingNames, r, "Four Cheese Pizza", "Mozzarella, cheddar, gouda, and parmesan cheese pizza.", new BigDecimal("390.00"), "Pizza");
            addFoodIfMissing(newFoods, existingNames, r, "Mushroom Pizza", "Fresh button mushrooms and oregano pizza.", new BigDecimal("290.00"), "Pizza");

            // 5. BURGERS
            addFoodIfMissing(newFoods, existingNames, r, "Veg Burger", "Classic potato patty burger with mayo and lettuce.", new BigDecimal("110.00"), "Burgers");
            addFoodIfMissing(newFoods, existingNames, r, "Classic Veg Burger", "Crispy vegetable patty with fresh tomatoes and onions.", new BigDecimal("120.00"), "Burgers");
            addFoodIfMissing(newFoods, existingNames, r, "Cheese Veg Burger", "Crispy veg patty topped with a cheddar cheese slice.", new BigDecimal("140.00"), "Burgers");
            addFoodIfMissing(newFoods, existingNames, r, "Aloo Tikki Burger", "Traditional spiced potato patty burger with mint mayo.", new BigDecimal("90.00"), "Burgers");
            addFoodIfMissing(newFoods, existingNames, r, "Paneer Burger", "Thick cottage cheese slab patty with thousand island sauce.", new BigDecimal("160.00"), "Burgers");
            addFoodIfMissing(newFoods, existingNames, r, "Paneer Cheese Burger", "Grilled paneer patty loaded with extra molten cheese.", new BigDecimal("180.00"), "Burgers");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Burger", "Juicy chicken patty burger with garlic mayo.", new BigDecimal("170.00"), "Burgers");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Cheese Burger", "Chicken patty with a slice of melted cheese.", new BigDecimal("190.00"), "Burgers");
            addFoodIfMissing(newFoods, existingNames, r, "Crispy Chicken Burger", "Deep-fried crunchy chicken breast burger.", new BigDecimal("210.00"), "Burgers");
            addFoodIfMissing(newFoods, existingNames, r, "Grilled Chicken Burger", "Charcoal-grilled spiced chicken patty burger.", new BigDecimal("220.00"), "Burgers");
            addFoodIfMissing(newFoods, existingNames, r, "Double Chicken Burger", "Twin chicken patties loaded with double cheese.", new BigDecimal("260.00"), "Burgers");
            addFoodIfMissing(newFoods, existingNames, r, "Spicy Chicken Burger", "Zesty fiery spicy fried chicken burger.", new BigDecimal("200.00"), "Burgers");

            // 6. PASTA & ITALIAN
            addFoodIfMissing(newFoods, existingNames, r, "White Sauce Pasta", "Penne pasta in rich creamy parmesan bechamel sauce.", new BigDecimal("220.00"), "Pasta & Italian");
            addFoodIfMissing(newFoods, existingNames, r, "Red Sauce Pasta", "Penne pasta tossed in tangy tomato basil sauce.", new BigDecimal("210.00"), "Pasta & Italian");
            addFoodIfMissing(newFoods, existingNames, r, "Pink Sauce Pasta", "Perfect mix of white cream and red tomato sauce pasta.", new BigDecimal("230.00"), "Pasta & Italian");
            addFoodIfMissing(newFoods, existingNames, r, "Alfredo Pasta", "Classic Italian pasta in creamy butter garlic cheese sauce.", new BigDecimal("240.00"), "Pasta & Italian");
            addFoodIfMissing(newFoods, existingNames, r, "Arrabbiata Pasta", "Spicy tomato sauce pasta with chilli flakes and garlic.", new BigDecimal("230.00"), "Pasta & Italian");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Alfredo Pasta", "Creamy Alfredo pasta tossed with grilled chicken strips.", new BigDecimal("280.00"), "Pasta & Italian");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Red Sauce Pasta", "Tangy tomato arrabbiata pasta with grilled chicken.", new BigDecimal("270.00"), "Pasta & Italian");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Lasagna", "Baked layered pasta sheet dish with veggies and cheese.", new BigDecimal("290.00"), "Pasta & Italian");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Lasagna", "Layered pasta with minced chicken, marinara and mozzarella.", new BigDecimal("340.00"), "Pasta & Italian");
            addFoodIfMissing(newFoods, existingNames, r, "Garlic Bread", "Toasted French baguette slices with butter and herbs.", new BigDecimal("110.00"), "Pasta & Italian");
            addFoodIfMissing(newFoods, existingNames, r, "Cheese Garlic Bread", "Garlic bread baked with melted mozzarella cheese.", new BigDecimal("150.00"), "Pasta & Italian");
            addFoodIfMissing(newFoods, existingNames, r, "Bruschetta", "Toasted bread topped with diced tomatoes, garlic, and olive oil.", new BigDecimal("160.00"), "Pasta & Italian");

            // 7. SOUTH INDIAN
            addFoodIfMissing(newFoods, existingNames, r, "Plain Dosa", "Crispy golden fermented rice crepe served with coconut chutney.", new BigDecimal("80.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Masala Dosa", "Crispy dosa filled with spiced potato onion masala.", new BigDecimal("110.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Mysore Masala Dosa", "Spicy red garlic chutney spread masala dosa.", new BigDecimal("130.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Cheese Dosa", "Crispy dosa topped with grated butter and cheese.", new BigDecimal("140.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Paneer Dosa", "Dosa filled with spiced paneer bhurji.", new BigDecimal("150.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Rava Dosa", "Crispy semolina crepe with cumin and green chillies.", new BigDecimal("120.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Onion Dosa", "Golden dosa topped with finely chopped roasted onions.", new BigDecimal("110.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Set Dosa", "Soft fluffy mini dosas served in a set of 3.", new BigDecimal("100.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Idli", "Steamed rice cakes served with sambar and coconut chutney.", new BigDecimal("60.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Mini Idli", "Bite-sized button idlis tossed in ghee and gun powder.", new BigDecimal("80.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Medu Vada", "Deep fried crispy lentil donuts served with sambar.", new BigDecimal("70.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Sambar Vada", "Crispy vadas soaked in hot lentil sambar.", new BigDecimal("80.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Uttapam", "Thick rice pancake topped with fresh vegetables.", new BigDecimal("100.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Onion Uttapam", "Thick uttapam topped with crunchy onions.", new BigDecimal("120.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Tomato Uttapam", "Thick uttapam topped with ripe tomatoes and herbs.", new BigDecimal("120.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Pongal", "Savory rice and moong dal dish tempered with ghee, pepper and cashews.", new BigDecimal("110.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Upma", "Roasted semolina cooked with vegetables and mustard seeds.", new BigDecimal("70.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Appam", "Bowl-shaped soft fermented rice pancake.", new BigDecimal("90.00"), "South Indian");
            addFoodIfMissing(newFoods, existingNames, r, "Kerala Parotta", "Flaky layered flatbread served hot.", new BigDecimal("50.00"), "South Indian");

            // 8. MAHARASHTRIAN
            addFoodIfMissing(newFoods, existingNames, r, "Misal Pav", "Spicy moth bean sprouts curry topped with farsan, served with pav.", new BigDecimal("90.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Vada Pav", "Iconic Mumbai potato dumpling inside bread bun.", new BigDecimal("40.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Batata Vada", "Deep fried spiced potato balls served with green chutney.", new BigDecimal("50.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Sabudana Khichdi", "Tapioca pearls roasted with peanuts and green chillies.", new BigDecimal("95.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Sabudana Vada", "Crispy sago vada served with sweet curd.", new BigDecimal("85.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Pav Bhaji", "Mashed vegetable curry served with butter toasted pav.", new BigDecimal("130.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Mumbai Pav Bhaji", "Extra butter Mumbai style spiced pav bhaji.", new BigDecimal("140.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Kanda Poha", "Flattened rice cooked with fried onions, mustard seeds, and turmeric.", new BigDecimal("50.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Thalipeeth", "Multigrain savory flatbread served with homemade white butter.", new BigDecimal("110.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Puran Poli", "Traditional sweet jaggery lentil flatbread.", new BigDecimal("120.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Bharli Vangi", "Stuffed baby eggplants cooked in roasted peanut masala.", new BigDecimal("180.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Zunka Bhakar", "Gram flour curry served with jowar bhakri.", new BigDecimal("140.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Pithla Bhakri", "Traditional Maharashtrian chickpea curry served with warm bhakri.", new BigDecimal("140.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Kolhapuri Chicken", "Spicy Kolhapuri chicken gravy seasoned with lavangi chillies.", new BigDecimal("320.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Kolhapuri Mutton", "Rich Kolhapuri mutton curry served with tambda rassa.", new BigDecimal("410.00"), "Maharashtrian");
            addFoodIfMissing(newFoods, existingNames, r, "Sol Kadhi", "Digestive kokum drink infused with coconut milk and garlic.", new BigDecimal("60.00"), "Maharashtrian");

            // 9. CHINESE & ASIAN
            addFoodIfMissing(newFoods, existingNames, r, "Veg Hakka Noodles", "Stir-fried noodles with crunchy vegetables.", new BigDecimal("160.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Hakka Noodles", "Wok-tossed noodles with chicken strips and veggies.", new BigDecimal("210.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Schezwan Noodles", "Spicy noodles tossed in hot Schezwan chilli sauce.", new BigDecimal("170.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Schezwan Noodles", "Spicy Schezwan chicken noodles.", new BigDecimal("220.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Manchurian", "Deep fried vegetable balls tossed in tangy soya gravy.", new BigDecimal("180.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Manchurian", "Crispy chicken bites in garlic soy sauce.", new BigDecimal("240.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Chilli Chicken", "Indo-Chinese spicy stir-fried chicken with green chillies.", new BigDecimal("260.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Chilli Paneer", "Crispy paneer cubes tossed in garlic chilli sauce.", new BigDecimal("220.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Spring Roll", "Crispy fried rolls stuffed with seasoned vegetables.", new BigDecimal("140.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Spring Roll", "Deep-fried glass noodle and veg spring rolls.", new BigDecimal("140.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Spring Roll", "Crispy rolls stuffed with chicken and veggies.", new BigDecimal("180.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Momos", "Steamed vegetable dumplings served with spicy chilli dip.", new BigDecimal("110.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Momos", "Steamed chicken dumplings served with spicy tomato chutney.", new BigDecimal("150.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Fried Momos", "Crispy golden fried momos with garlic dip.", new BigDecimal("130.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Tandoori Momos", "Charcoal grilled marinated momos.", new BigDecimal("170.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Thai Curry", "Coconut milk Thai green curry served with jasmine rice.", new BigDecimal("290.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Thai Curry", "Rich Thai red curry with chicken.", new BigDecimal("340.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Thai Curry", "Fragrant coconut green curry with exotic vegetables.", new BigDecimal("280.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Ramen", "Japanese noodle soup with broth, veggies, and egg.", new BigDecimal("320.00"), "Chinese & Asian");
            addFoodIfMissing(newFoods, existingNames, r, "Korean Fried Chicken", "Crispy double-fried chicken coated in sweet & spicy Korean glaze.", new BigDecimal("360.00"), "Chinese & Asian");

            // 10. STREET FOOD
            addFoodIfMissing(newFoods, existingNames, r, "Pani Puri", "Crispy puris filled with potato, sprouts, and tangy spicy mint water.", new BigDecimal("40.00"), "Street Food");
            addFoodIfMissing(newFoods, existingNames, r, "Sev Puri", "Crispy flat puris topped with potato, chutneys, and nylon sev.", new BigDecimal("60.00"), "Street Food");
            addFoodIfMissing(newFoods, existingNames, r, "Bhel Puri", "Puffed rice mixture with tamarind and mint chutney.", new BigDecimal("50.00"), "Street Food");
            addFoodIfMissing(newFoods, existingNames, r, "Dahi Puri", "Puris filled with potato, sweet curd, and pomegranate seeds.", new BigDecimal("70.00"), "Street Food");
            addFoodIfMissing(newFoods, existingNames, r, "Ragda Pattice", "Pan-fried potato patties topped with warm white peas curry.", new BigDecimal("80.00"), "Street Food");
            addFoodIfMissing(newFoods, existingNames, r, "Samosa", "Crispy fried pastry stuffed with spiced potato and peas.", new BigDecimal("30.00"), "Street Food");
            addFoodIfMissing(newFoods, existingNames, r, "Samosa Chaat", "Crushed samosas topped with chole curry, curd, and chutneys.", new BigDecimal("70.00"), "Street Food");
            addFoodIfMissing(newFoods, existingNames, r, "Aloo Tikki Chaat", "Crispy potato patties served with sweet yoghurt and chutneys.", new BigDecimal("80.00"), "Street Food");
            addFoodIfMissing(newFoods, existingNames, r, "Chole Bhature", "Fluffy fried bhaturas served with spicy chickpea curry.", new BigDecimal("150.00"), "Street Food");
            addFoodIfMissing(newFoods, existingNames, r, "Kachori", "Crispy dal stuffed kachori served with tamarind chutney.", new BigDecimal("40.00"), "Street Food");
            addFoodIfMissing(newFoods, existingNames, r, "Dabeli", "Spiced potato mixture in bun topped with pomegranate and peanuts.", new BigDecimal("45.00"), "Street Food");
            addFoodIfMissing(newFoods, existingNames, r, "Kathi Roll", "Spiced veg kathi roll with mint chutney.", new BigDecimal("140.00"), "Street Food");

            // 11. SANDWICHES
            addFoodIfMissing(newFoods, existingNames, r, "Veg Sandwich", "Fresh bread sandwich with cucumber, tomato, and green chutney.", new BigDecimal("80.00"), "Sandwiches");
            addFoodIfMissing(newFoods, existingNames, r, "Grilled Veg Sandwich", "Butter grilled sandwich filled with fresh vegetables.", new BigDecimal("110.00"), "Sandwiches");
            addFoodIfMissing(newFoods, existingNames, r, "Cheese Sandwich", "Double cheese slice sandwich.", new BigDecimal("100.00"), "Sandwiches");
            addFoodIfMissing(newFoods, existingNames, r, "Veg Cheese Sandwich", "Grilled vegetable sandwich loaded with cheese.", new BigDecimal("120.00"), "Sandwiches");
            addFoodIfMissing(newFoods, existingNames, r, "Paneer Sandwich", "Spiced paneer bhurji stuffed grilled sandwich.", new BigDecimal("140.00"), "Sandwiches");
            addFoodIfMissing(newFoods, existingNames, r, "Chicken Sandwich", "Shredded chicken and mayo sandwich.", new BigDecimal("160.00"), "Sandwiches");
            addFoodIfMissing(newFoods, existingNames, r, "Grilled Chicken Sandwich", "Butter grilled chicken and cheese sandwich.", new BigDecimal("180.00"), "Sandwiches");
            addFoodIfMissing(newFoods, existingNames, r, "Club Sandwich", "Triple-decker sandwich with chicken, egg, lettuce, and cheese.", new BigDecimal("190.00"), "Sandwiches");
            addFoodIfMissing(newFoods, existingNames, r, "Bombay Sandwich", "Classic Mumbai street sandwich with beetroot and potatoes.", new BigDecimal("110.00"), "Sandwiches");
            addFoodIfMissing(newFoods, existingNames, r, "Corn Cheese Sandwich", "Sweet corn and melted cheese grilled sandwich.", new BigDecimal("130.00"), "Sandwiches");

            // 12. BREAKFAST
            addFoodIfMissing(newFoods, existingNames, r, "Poha", "Warm poha garnished with fresh coriander and sev.", new BigDecimal("50.00"), "Breakfast");
            addFoodIfMissing(newFoods, existingNames, r, "Upma", "Soft semolina upma with roasted cashews.", new BigDecimal("60.00"), "Breakfast");
            addFoodIfMissing(newFoods, existingNames, r, "Masala Omelette", "2-egg Indian masala omelette served with toast.", new BigDecimal("90.00"), "Breakfast");
            addFoodIfMissing(newFoods, existingNames, r, "Cheese Omelette", "Fluffy omelette loaded with melted cheddar cheese.", new BigDecimal("110.00"), "Breakfast");
            addFoodIfMissing(newFoods, existingNames, r, "Boiled Eggs", "2 boiled eggs with salt and pepper.", new BigDecimal("40.00"), "Breakfast");
            addFoodIfMissing(newFoods, existingNames, r, "Egg Bhurji", "Spiced scrambled eggs served with buttered pav.", new BigDecimal("100.00"), "Breakfast");
            addFoodIfMissing(newFoods, existingNames, r, "Paratha", "Plain wheat paratha served with butter and pickle.", new BigDecimal("80.00"), "Breakfast");
            addFoodIfMissing(newFoods, existingNames, r, "Aloo Paratha", "Spiced mashed potato stuffed paratha served with curd.", new BigDecimal("100.00"), "Breakfast");
            addFoodIfMissing(newFoods, existingNames, r, "Paneer Paratha", "Grater paneer stuffed paratha with white butter.", new BigDecimal("130.00"), "Breakfast");
            addFoodIfMissing(newFoods, existingNames, r, "Gobi Paratha", "Grated cauliflower paratha with butter.", new BigDecimal("110.00"), "Breakfast");
            addFoodIfMissing(newFoods, existingNames, r, "Chole Kulche", "Soft kulchas served with spicy Amritsari chole.", new BigDecimal("140.00"), "Breakfast");

            // 13. DESSERTS
            addFoodIfMissing(newFoods, existingNames, r, "Gulab Jamun", "Soft fried milk solid balls soaked in cardamom sugar syrup.", new BigDecimal("60.00"), "Desserts");
            addFoodIfMissing(newFoods, existingNames, r, "Rasmalai", "Soft cottage cheese discs soaked in saffron milk.", new BigDecimal("90.00"), "Desserts");
            addFoodIfMissing(newFoods, existingNames, r, "Rasgulla", "Spongy chhana balls soaked in sugar syrup.", new BigDecimal("70.00"), "Desserts");
            addFoodIfMissing(newFoods, existingNames, r, "Kheer", "Traditional rice pudding infused with cardamom and nuts.", new BigDecimal("80.00"), "Desserts");
            addFoodIfMissing(newFoods, existingNames, r, "Gajar Ka Halwa", "Warm carrot halwa made with ghee and khoya.", new BigDecimal("100.00"), "Desserts");
            addFoodIfMissing(newFoods, existingNames, r, "Kulfi", "Traditional creamy matka kulfi topped with pistachios.", new BigDecimal("60.00"), "Desserts");
            addFoodIfMissing(newFoods, existingNames, r, "Ice Cream", "2 scoops of rich vanilla/chocolate ice cream.", new BigDecimal("80.00"), "Desserts");
            addFoodIfMissing(newFoods, existingNames, r, "Chocolate Brownie", "Warm fudgy chocolate brownie.", new BigDecimal("140.00"), "Desserts");
            addFoodIfMissing(newFoods, existingNames, r, "Chocolate Lava Cake", "Warm chocolate cake with molten chocolate core.", new BigDecimal("150.00"), "Desserts");
            addFoodIfMissing(newFoods, existingNames, r, "Cheesecake", "New York style baked cheesecake slice.", new BigDecimal("210.00"), "Desserts");
            addFoodIfMissing(newFoods, existingNames, r, "Tiramisu", "Classic Italian coffee flavored dessert.", new BigDecimal("240.00"), "Desserts");
            addFoodIfMissing(newFoods, existingNames, r, "Donut", "Glazed chocolate donut.", new BigDecimal("90.00"), "Desserts");
            addFoodIfMissing(newFoods, existingNames, r, "Waffles", "Belgian waffle topped with maple syrup and chocolate.", new BigDecimal("180.00"), "Desserts");
            addFoodIfMissing(newFoods, existingNames, r, "Pancakes", "Fluffy pancake stack served with honey and butter.", new BigDecimal("160.00"), "Desserts");
            addFoodIfMissing(newFoods, existingNames, r, "Chocolate Mousse", "Light airy dark chocolate mousse bowl.", new BigDecimal("130.00"), "Desserts");

            // 14. BEVERAGES
            addFoodIfMissing(newFoods, existingNames, r, "Cold Coffee", "Chilled whipped coffee with dark chocolate syrup.", new BigDecimal("120.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Hot Coffee", "Freshly brewed hot coffee with steam milk.", new BigDecimal("80.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Cappuccino", "Italian coffee with thick milk foam.", new BigDecimal("140.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Latte", "Smooth steamed milk espresso coffee.", new BigDecimal("150.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Espresso", "Strong concentrated shot of black coffee.", new BigDecimal("110.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Masala Chai", "Indian milk tea brewed with ginger and cardamom.", new BigDecimal("40.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Green Tea", "Healthy organic green tea.", new BigDecimal("50.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Lemon Tea", "Refreshing hot tea with fresh lemon.", new BigDecimal("50.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Iced Tea", "Chilled lemon iced tea with mint leaves.", new BigDecimal("90.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Fresh Lime Soda", "Fizzy soda with fresh lime juice.", new BigDecimal("70.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Lemon Juice", "Freshly squeezed lemon juice.", new BigDecimal("50.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Orange Juice", "Fresh squeezed orange juice.", new BigDecimal("90.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Mango Shake", "Thick Alphonso mango milk shake.", new BigDecimal("120.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Chocolate Shake", "Creamy chocolate milkshake.", new BigDecimal("130.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Oreo Shake", "Thick milkshake blended with Oreo cookies.", new BigDecimal("140.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Strawberry Shake", "Refreshing strawberry milkshake.", new BigDecimal("120.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Vanilla Shake", "Classic vanilla bean milkshake.", new BigDecimal("110.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Cold Drink", "Chilled 300ml carbonated beverage.", new BigDecimal("40.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Virgin Mojito", "Refreshing mint, lime, and soda cocktail.", new BigDecimal("120.00"), "Beverages");
            addFoodIfMissing(newFoods, existingNames, r, "Watermelon Juice", "Freshly pressed watermelon juice.", new BigDecimal("90.00"), "Beverages");
        }

        return foodRepository.saveAll(newFoods);
    }

    private void addFoodIfMissing(List<Food> list, Set<String> existingNames, Restaurant r, String name, String desc, BigDecimal price, String category) {
        if (!existingNames.contains(name.toLowerCase())) {
            list.add(new Food(null, name, desc, price, category, true, r));
            existingNames.add(name.toLowerCase());
        }
    }

    private void seedOrders(List<Customer> customers, List<Restaurant> restaurants, List<Food> foods) {
        if (customers.isEmpty() || restaurants.isEmpty() || foods.isEmpty()) return;

        Restaurant r0 = restaurants.get(0);
        createOrderHelper(
                customers.get(0),
                r0,
                OrderStatus.DELIVERED,
                List.of(
                        new OrderItemConfig(findFoodByName(foods, r0.getId(), "Misal Pav"), 2),
                        new OrderItemConfig(findFoodByName(foods, r0.getId(), "Cold Coffee"), 2)
                )
        );
    }

    private Food findFoodByName(List<Food> foods, Long restaurantId, String foodName) {
        return foods.stream()
                .filter(f -> f.getRestaurant().getId().equals(restaurantId) && f.getName().equalsIgnoreCase(foodName))
                .findFirst()
                .orElse(foods.get(0));
    }

    private void createOrderHelper(Customer customer, Restaurant restaurant, OrderStatus status, List<OrderItemConfig> items) {
        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        Order order = new Order();
        order.setCustomer(customer);
        order.setRestaurant(restaurant);
        order.setStatus(status);

        for (OrderItemConfig cfg : items) {
            Food food = cfg.food;
            BigDecimal price = food.getPrice();
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(cfg.quantity));
            total = total.add(subtotal);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setFood(food);
            item.setQuantity(cfg.quantity);
            item.setPrice(price);
            orderItems.add(item);
        }

        order.setTotalAmount(total);
        order.setOrderItems(orderItems);
        orderRepository.save(order);
    }

    private static class OrderItemConfig {
        Food food;
        int quantity;
        OrderItemConfig(Food food, int quantity) {
            this.food = food;
            this.quantity = quantity;
        }
    }
}
