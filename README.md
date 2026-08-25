# RestoHub — Food Delivery Web Application

RestoHub is a full-stack, Swiggy-like food ordering and delivery web application. The platform features a responsive React 19 frontend, a robust Java Spring Boot 3.4 REST API backend, a MySQL relational database, enterprise-grade Razorpay payment integration, and an AI-powered food recommendation chatbot.

---

## 🚀 Key Features

- **Customer & User Management**: User registration, login, profile management, and session state persistence.
- **Restaurant Listings & Catalog**: Browse top Pune restaurants with active status indicators, cuisine filters, ratings, and preparation time metrics.
- **Interactive Food Menu & Search**: Categorized menus (Veg/Non-Veg), real-time search, and dietary filtering.
- **Cart & Order Management**: Single-restaurant cart rule enforcement, line-item quantity controls, and order summary calculations.
- **Delivery Address & Dynamic Charges**: Distance-based delivery fee calculations based on locality coordinates (Sus, Baner, Kothrud, Hinjewadi).
- **Payment Options**: Cash on Delivery (COD) and Online Payment via Razorpay.
- **Server-Side Signature Verification**: Secure server-side HMAC-SHA256 signature verification preventing client-side payment tampering.
- **Database-Backed Idempotency**: Strict payment idempotency preventing duplicate transaction processing using database unique constraints.
- **Database Transactions (ACID)**: Transactional isolation (`@Transactional`) ensuring atomic state transitions between order creation and payment records.
- **Razorpay Webhook Engine**: Event-driven webhook processing for `payment.captured` and `payment.failed` with raw body signature validation.
- **Real-Time Order Tracking**: Order status pipeline (`PLACED` -> `PREPARING` -> `OUT_FOR_DELIVERY` -> `DELIVERED`) with live tracking visualizers.
- **AI Chatbot**: Intelligent food recommendation assistant powered by OpenAI API.
- **Responsive UI/UX**: Modern glassmorphic aesthetics, micro-animations, mobile-responsive navigation, and toast notifications.

---

## 🛠️ Technology Stack

### Backend
- **Language**: Java 21
- **Framework**: Spring Boot 3.4
- **Persistence**: Spring Data JPA, Hibernate
- **Build Tool**: Maven

### Database
- **DBMS**: MySQL Relational Database

### Frontend
- **Framework**: React 19 (Vite)
- **Language**: JavaScript (ES6+)
- **Icons & Styling**: Lucide React, Vanilla CSS Tokens

### Payment Gateway
- **SDK & Integration**: Razorpay Custom & Standard Checkout SDK

### Development & Testing
- **API Testing**: Postman Suite
- **Version Control**: Git, GitHub

---

## 🏗️ System Architecture

### High-Level Component Flow

```
+-------------------------------------------------------------------------+
|                         React 19 Frontend (Vite)                        |
|  - Pages: Home, Restaurants, RestaurantDetails, Cart, Checkout, Orders  |
|  - Components: CustomRazorpayPayment, PaymentMethodSelector, Chatbot   |
+-------------------------------------------------------------------------+
                                    |
                            (REST / JSON API)
                                    v
+-------------------------------------------------------------------------+
|                       Spring Boot 3.4 Backend (Java 21)                 |
|  - Controllers: Auth, Customer, Food, Order, Restaurant, Payment, Chat  |
|  - Service Layer: RazorpayService, OrderService, PricingService, Chat   |
|  - JPA Entities: Order, PaymentRecord, Customer, Restaurant, Food       |
+-------------------------------------------------------------------------+
                                    |
                                    v
                         +--------------------+
                         |   MySQL Database   |
                         +--------------------+
```

### Razorpay Payment Architecture Flow

```
Customer Checkout (React Frontend)
        |
        v
POST /api/payments/create-order  --> (Backend converts Rupees -> Paise) --> Razorpay API Order ID
        |
        v
Razorpay Checkout SDK Modal (User completes payment)
        |
        v
POST /api/payments/verify        --> Server HMAC-SHA256 Signature Verification
        |
        v
@Transactional Database Execution --> PaymentRecord Saved + Order Status CONFIRMED
        |
        v
Order Confirmation Page
```

---

## 💳 Razorpay Payment Integration Architecture

The payment architecture in RestoHub implements a 5-step security pattern:

1. **Step 1 — Razorpay Order Creation (`POST /api/payments/create-order`)**
   - Receives order amount in **RUPEES** (e.g. `₹250.00`).
   - Internally converts to **paise** (`25000 paise`) at the Razorpay API boundary.
   - Generates and returns a signed Razorpay `order_id`.

2. **Step 2 — Server-Side Payment Signature Verification (`POST /api/payments/verify`)**
   - Recalculates expected HMAC-SHA256 signature: `HMAC-SHA256(razorpayOrderId + "|" + razorpayPaymentId, secret)`.
   - Uses constant-time string comparison (`MessageDigest.isEqual`) to defend against timing attacks.

3. **Step 3 — Database-Backed Idempotency**
   - `PaymentRecord` table contains a `UNIQUE` index constraint on `razorpay_payment_id`.
   - Replay attacks or duplicate payment verifications return `alreadyProcessed: true` safely without duplicate state updates.

4. **Step 4 — Database Transactions / ACID (`@Transactional`)**
   - Wraps signature verification, `PaymentRecord` insertion, and `Order` status update in an atomic transaction.
   - Triggers automatic rollback if payment verification fails or database constraints are violated.

5. **Step 5 — Razorpay Webhooks (`POST /api/payments/webhook`)**
   - Processes asynchronous `payment.captured` and `payment.failed` event notifications from Razorpay servers.
   - Validates webhook payloads using the raw HTTP request body against `RAZORPAY_WEBHOOK_SECRET`.

---

## 🔒 Security Practices

- **Backend-Only Secrets**: `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and `DB_PASSWORD` are strictly maintained on the backend and never exposed to the client.
- **Environment Isolation**: Sensitive configuration values are loaded via environment variables using `.env` files.
- **Git Protection**: `.env` and sensitive files are explicitly excluded via `.gitignore`.
- **Tampering Defense**: All payment confirmations require server-side HMAC-SHA256 cryptographic verification.
- **Timing Attack Prevention**: Constant-time signature comparison defends against side-channel analysis.
- **Idempotent Storage**: Unique database constraints protect against double-spending and request replay.

---

## 📁 Project Structure

```
RestoHub/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/restohub/
│   │   │   │   ├── config/          # SecurityConfig, RazorpayConfig, OpenAIConfig
│   │   │   │   ├── controller/      # Auth, Food, Order, Payment, Restaurant, Chat
│   │   │   │   ├── dto/             # Request & Response DTOs
│   │   │   │   ├── entity/          # JPA Entities (Order, PaymentRecord, etc.)
│   │   │   │   ├── repository/      # Spring Data JPA Repositories
│   │   │   │   └── service/         # RazorpayService, OrderService, etc.
│   │   │   └── resources/
│   │   │       └── application.properties
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/              # Payment, Cart, Auth, Order UI components
│   │   ├── context/                 # Cart, Auth, Location, Favourites Contexts
│   │   ├── pages/                   # Home, Restaurants, Checkout, Orders
│   │   ├── services/                # API Client & Service modules
│   │   └── styles/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── PROJECT_DOCUMENTATION.md
└── README.md
```

---

## 💻 Local Setup Instructions

### Prerequisites
- **Java**: JDK 21+
- **Node.js**: Node 18+ & npm
- **Database**: MySQL 8.0+
- **Build Tools**: Maven 3.8+

### 1. Database Setup
Create MySQL database:
```sql
CREATE DATABASE restohub;
```

### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Configure environment variables in `backend/.env`:
   ```env
   DB_URL=jdbc:mysql://localhost:3306/restohub
   DB_USERNAME=root
   DB_PASSWORD=<your-database-password>

   OPENAI_API_KEY=<your-openai-key>

   RAZORPAY_KEY_ID=<your-razorpay-key-id>
   RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>
   RAZORPAY_WEBHOOK_SECRET=<your-razorpay-webhook-secret>
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend server runs at `http://localhost:8080`.

### 3. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Vite development server:
   ```bash
   npm run dev
   ```
   The frontend runs at `http://localhost:5173`.

---

## 🧪 API & Payment Testing

- **API Testing**: All REST endpoints are validated using **Postman** collection suites.
- **Payment Testing**: Payment integration is tested using **Razorpay Test Mode** keys (`rzp_test_*`). Test cards and test net banking credentials simulate live checkout.

---

## ☁️ Deployment Architecture (Planned)

- **Version Control**: GitHub (`https://github.com/yash008-cs/RestoHub.git`)
- **Backend Hosting**: AWS EC2 instance running Spring Boot JAR
- **Database Hosting**: Managed MySQL / AWS RDS
- **Frontend Hosting**: Vercel / Netlify / AWS S3 + CloudFront
- **Domain & SSL**: Custom domain with HTTPS SSL termination

---

## 🔮 Future Improvements

- Multi-restaurant cart support with split order routing.
- Real-time WebSockets / Server-Sent Events (SSE) for live order status pushes.
- Advanced AI personalized dish recommendations based on ordering history.

---

## 👤 Author

**Yashraj Kenjale**  
GitHub: [@yash008-cs](https://github.com/yash008-cs)
