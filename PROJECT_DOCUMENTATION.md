# RestoHub - Comprehensive Project Topics & Technologies Documentation

## 1. Executive Summary
**RestoHub** is a modern, full-stack food ordering and delivery web application built using a decoupled Client-Server Architecture. The project seamlessly integrates a **React 19 Single Page Application (SPA)** frontend with a **Spring Boot 3.4 (Java 21)** backend, backed by a **MySQL** relational database and AI-driven conversational features.

---

## 2. Technical Architecture & Component Flow

```
+-------------------------------------------------------------------------+
|                         React 19 Frontend (Vite)                        |
|  - Pages: Home, Restaurants, RestaurantDetails, Cart, Checkout, Orders  |
|  - Contexts: CartContext, AuthContext, LocationContext, FavouritesContext|
+-------------------------------------------------------------------------+
                                    |
                            (REST / JSON API)
                                    v
+-------------------------------------------------------------------------+
|                       Spring Boot 3.4 Backend (Java 21)                 |
|  - Controllers: Auth, Customer, Food, Order, Restaurant, Chat           |
|  - Services: Pricing, Order, Auth, Chat (OpenAI), Razorpay               |
|  - JPA Entities: Customer, Restaurant, Food, Order, OrderItem           |
+-------------------------------------------------------------------------+
          |                                  |
          v                                  v
+------------------+                +----------------------+
|  MySQL Database  |                |  OpenAI Chatbot API  |
+------------------+                +----------------------+
```

---

## 3. Detailed Breakdown by Topic & Domain

### A. Backend Engineering (Java 21 & Spring Boot 3.4)

1. **Spring Boot Framework & Inversion of Control (IoC)**
   - **Dependency Injection (DI)** using constructor injection (`@Autowired`) for testability and clean component coupling.
   - Component Scanning (`@Component`, `@Service`, `@Repository`, `@RestController`, `@Configuration`).

2. **RESTful Web Services Architecture**
   - Standardized HTTP verb mapping (`@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`).
   - JSON payload deserialization and serialization with Jackson.
   - Resource-oriented URI routing patterns (`/api/v1/auth`, `/api/v1/foods`, `/api/v1/orders`, `/api/v1/restaurants`, `/api/v1/customers`, `/api/v1/chat`).

3. **Database Access & ORM (Spring Data JPA / Hibernate)**
   - **Entity Mapping**: Use of `@Entity`, `@Table`, `@Id`, `@GeneratedValue(strategy = GenerationType.IDENTITY)`.
   - **Relational Associations**: `@OneToMany`, `@ManyToOne`, `@JoinColumn`, cascading operations, and lazy/eager loading strategies.
   - **Repository Pattern**: Extending `JpaRepository` with custom JPQL queries for filtering foods, searching restaurants, and fetching order histories.

4. **Relational Database Design (MySQL)**
   - Normalized relational schema comprising `Customer`, `Restaurant`, `Food`, `Order`, `OrderItem`, `OrderStatus`, and `RestaurantStatus` tables.
   - Foreign key constraints, index optimization, and data integrity rules.

5. **Security, Hashing & Authentication**
   - **Spring Security Integration**: Security filter chain setup and CORS configuration (`WebConfig`, `SecurityConfig`).
   - **Password Security**: Cryptographic password hashing using `BCryptPasswordEncoder`.
   - **Role-Based Authorization**: Role definitions (`Role.java`) supporting Customer, Admin, and Restaurant Manager profiles.

6. **Input Validation & Exception Handling**
   - **Jakarta Bean Validation**: Server-side constraint enforcement using `@Valid`, `@NotBlank`, `@NotNull`, `@Email`, `@Positive`, and `@Size`.
   - **Global Exception Handling**: Centralized `@RestControllerAdvice` and `@ExceptionHandler` capturing custom domain exceptions and returning standardized HTTP response payloads (`400 Bad Request`, `404 Not Found`, `500 Internal Error`).

7. **Environment Configuration & Automated Seeding**
   - **Dotenv Environment Management**: `me.paulschwarz:spring-dotenv` for loading sensitive keys (`DB_URL`, `OPENAI_API_KEY`, `TWILIO_AUTH_TOKEN`) from `.env`.
   - **Programmatic Data Seeder**: `DataSeeder.java` for automatically populating restaurants, signature Pune dishes, delivery localities, and initial user accounts on startup.

---

### B. Frontend Engineering (React 19 + Vite)

1. **Modern React Paradigm & Custom Hooks**
   - Functional React components with state hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
   - Modular Custom Hooks (`useCart`, `useAuth`, `useLocation`, `useFavourites`, `useCustomer`) encapsulating component logic.

2. **Global State Management & Context API**
   - `CartContext`: Basket state management, single-restaurant cart enforcement, quantity increment/decrement, line-item removal, clear basket.
   - `AuthContext`: Session tracking, login modal trigger, user state persistence.
   - `LocationContext`: Active delivery location tracking across Pune localities (Sus, Baner, Kothrud, Hinjewadi).
   - `FavouritesContext`: Bookmarked dishes and favorite restaurants persistence.

3. **HTTP Client & API Service Layer**
   - **Axios Instance Abstraction** (`api.js`): Base URL configuration, global error interceptors, request header injection.
   - **Decoupled API Services**: Dedicated service files (`authService.js`, `orderService.js`, `foodService.js`, `restaurantService.js`, `customerService.js`, `chatService.js`).

4. **Persistence & Client-side Storage**
   - `localStorage` synchronization for user sessions, active cart state, customer preferences, and appended order markers.

5. **UI/UX Design System & Styling**
   - **Vanilla CSS Tokens & Utility Classes**: Theme variable management, responsive grid and flexbox layouts.
   - **Micro-Animations & Visual Aesthetics**: Modern glassmorphic cards, hover transformations, animated stepper controls, skeleton loaders, and badge pills.
   - **Lucide React Icons**: Vector iconography across forms, buttons, navbars, and status badges.

---

### C. Artificial Intelligence & Third-Party Cloud Integrations

1. **AI Conversational Assistant (OpenAI Integration)**
   - Integrated chatbot service (`ChatService.java` / `ChatController.java`).
   - Dynamic prompt injection incorporating real-time database context (vegetarian/non-vegetarian dishes, dietary preferences, Pune food recommendations).
   - Fallback recommendation engine when API keys are unconfigured.

2. **Email Notification Engine (Spring Mail)**
   - Transactional email dispatch (`JavaMailSender`) for sending digital order receipts and account verification emails.

3. **Interactive API Documentation (OpenAPI 3.0 / Swagger UI)**
   - Interactive API testing suite powered by `springdoc-openapi-starter-webmvc-ui` accessible via `/swagger-ui.html`.

---

### D. Business Logic & Domain Topics

1. **Distance-Based Delivery Fee Engine**
   - Mathematical distance calculations (Haversine/Euclidean formula) between Pune locality coordinates and restaurant locations to calculate dynamic delivery charges.

2. **Interactive Coupon & Discount Engine**
   - Real-time promo code validation engine (`RESTO50`, `FREEDEL`, `GOURMET150`).
   - Support for percentage discounts, free delivery waivers, and fixed-amount savings.
   - One-click application and explicit **Remove Coupon** controls across the basket and bill summary.

3. **Order Lifecycle Management**
   - Multi-phase order status pipeline (`PLACED` -> `PREPARING` -> `OUT_FOR_DELIVERY` -> `DELIVERED`).
   - Live order tracking timers and simulated delivery progress indicators.

4. **Order Appending ("Add Items to Existing Order")**
   - Allows users to append additional dishes to an active order within an allowable time window without starting a fresh checkout process.

5. **Single-Restaurant Cart Rule Enforcement**
   - Business rule logic ensuring items in a single basket belong to one restaurant, prompting user confirmation before switching restaurants.

---

## 4. Software Architecture & Quality Summary

| Architecture Layer | Technology / Topic Used | Key Responsibilities |
| :--- | :--- | :--- |
| **Presentation (UI)** | React 19, Vanilla CSS, Lucide React | User interface, interactive cart, coupon management, modal dialogs |
| **State & Navigation** | Context API, Custom Hooks, localStorage | Global app state, session persistence, location selection |
| **API Client** | Axios Services (`api.js`) | HTTP requests, error handling, backend sync |
| **REST API Controller** | Spring MVC (`@RestController`) | Endpoint routing, request DTO validation, JSON formatting |
| **Service Layer** | Spring `@Service` Beans | Business logic, coupon calculation, distance fee calculation |
| **Persistence / Data** | Spring Data JPA, Hibernate, MySQL | Entity mapping, JPQL queries, relational data storage |
| **AI & External Services** | OpenAI SDK, Razorpay SDK, Spring Mail | AI food recommendations, Razorpay payment processing, Email receipts |
| **Documentation & Build** | Vite, Maven, OpenAPI 3.0 | Fast bundling, dependency management, interactive API docs |
