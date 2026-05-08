# Wildcats Lounge App - Web Frontend

A React-based web application for ordering coffee and pastries at Cebu Institute of Technology University's student-run café.

**Project:** Wildcats Lounge App (IT342-G7)  
**SDD Version:** 0.4 (February 15, 2026)  
**Status:** In Development (~85% Complete)

---

## 📋 Project Overview

Wildcats Lounge is a minimalist café ordering platform that enables CIT-U students and faculty to:
- Browse and search a digital menu of coffee and pastries
- Customize drinks with add-ons (flavor shots, milk type, sugar level)
- Manage a persistent shopping cart
- Checkout with pickup or dine-in options
- Earn and redeem loyalty points for rewards
- View order history and real-time order status

**Target Users:** Students, Faculty, Café Managers, Staff

---

## 🏗️ Technology Stack

### Frontend (Web)
- **Framework:** React 18+
- **Build Tool:** Vite 5.x
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Font Stack:** Neue Montreal (body), Helvetica Neue (headers), with fallbacks to Manrope/Segoe UI
- **State Management:** React Context API
- **Routing:** React Router v7+

### Backend
- **Server:** Spring Boot 3.x (Java 17)
- **Security:** Spring Security + JWT
- **Database:** PostgreSQL 14+
- **ORM:** Spring Data JPA

### Deployment
- **Backend:** Railway/Heroku
- **Frontend:** Vercel/Netlify
- **Database:** PostgreSQL Cloud

---

## ✨ Features

### User Features (Implemented)
✅ User Registration & Authentication (JWT)  
✅ Menu Listing & Search  
✅ Add-ons Customization (milk, sugar, flavor shots)  
✅ Shopping Cart Management  
✅ Checkout (Pickup/Dine-in)  
✅ Loyalty Points System (Tier 1-4)  
✅ Order History  
✅ Responsive Web Interface  

### Admin Features (Implemented)
✅ Menu Management (Add/Edit/Delete Items)  
✅ Order Dashboard  
✅ Loyalty Points Management  

### Staff Features (Partial)
✅ Order Queue Viewing  
⚠️ Order Status Updates (in progress)  

### Not Yet Implemented
❌ Staff Order Status Updates (`PATCH /staff/orders/{id}`)  
❌ Vouchers/Coupons Flow (`GET /vouchers/my-vouchers`)  
❌ WebSocket Real-time Notifications  
❌ Refresh Token Persistence  
❌ TypeScript Migration  

---

## 🔗 API Integration

**Base URL:** `https://api.wildcats-lounge.com/api/v1`  
**Authentication:** Bearer Token (JWT) in Authorization header

### Core Endpoints
```
Authentication:
POST   /auth/register      - Create new account
POST   /auth/login         - Login with email/password
POST   /auth/refresh       - Refresh JWT token

Products:
GET    /products           - List all menu items
GET    /products/{id}      - Get product details
POST   /admin/products     - Create menu item (Admin)
PATCH  /admin/products/{id} - Update product (Admin)

Cart:
GET    /cart               - Get user's cart
POST   /cart/items         - Add item to cart
DELETE /cart/items/{id}    - Remove cart item

Orders:
POST   /orders             - Place new order
GET    /orders/active      - Get active orders
GET    /orders             - Get order history

Loyalty:
GET    /loyalty/status     - Get loyalty points & tier
POST   /loyalty/redeem     - Redeem points for voucher
GET    /vouchers/my-vouchers - Get available vouchers
```

Full API documentation: See [API_TESTING_GUIDE.md](../WildcatsLoungeBackend/API_TESTING_GUIDE.md)

---

## 🗄️ Database Schema

**Key Tables:**
- `users` - User accounts with roles (Customer, Staff, Manager, Admin)
- `products` - Menu items (coffee, pastries) with pricing & stock
- `carts` - User shopping carts
- `cart_items` - Individual items in cart
- `orders` - Customer orders with status tracking
- `order_items` - Order line items with pricing snapshots
- `loyalty_points` - User loyalty balance & tier
- `loyalty_transactions` - Point earning/redemption history
- `coupons` - Generated discount vouchers
- `refresh_tokens` - JWT session tokens

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running locally or on cloud

### Install Dependencies
```bash
cd WildcatsLoungeFrontend
npm install
```

### Environment Variables
Create `.env.local`:
```
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_NAME=Wildcats Lounge
```

### Development Server
```bash
npm run dev
```
App will run on `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview  # Preview the production build
```

---

## 📱 Responsive Design

- **Mobile:** 360px+ (touch-optimized, 44x44px min buttons)
- **Tablet:** 768px+ (2-column layouts)
- **Desktop:** 1024px+ (3+ column layouts)

**Browsers:** Chrome, Firefox, Safari, Edge (latest 2 versions)

---

## 🔐 Security

- HTTPS enforced for all communications
- JWT token authentication for all protected endpoints
- Password hashing with bcrypt (12 salt rounds)
- SQL injection & XSS protection
- Rate limiting: 100 requests/minute per IP
- Role-based access control (RBAC) at backend

---

## 📊 UI/UX Design System

**Colors:**
- Primary: #2563EB (Blue)
- Secondary: #7C3AED (Purple)
- Success: #10B981 (Green)
- Error: #EF4444 (Red)

**Typography:** Inter font family (from Google Fonts) with responsive sizing  
**Spacing:** 8px grid system  
**Components:** Consistent buttons, forms, cards, modals

---

## 📈 Performance Requirements

- API response time: ≤ 2 seconds (95th percentile)
- Web page load: ≤ 3 seconds on broadband
- Support 100+ concurrent users
- Database queries: ≤ 500ms

---

## 🧪 Testing

Run ESLint:
```bash
npm run lint
```

---

## 📦 Project Structure

```
WildcatsLoungeFrontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/           # React Context (Auth, etc)
│   ├── pages/             # Full page components
│   │   ├── LoginPage/
│   │   ├── MenuPage/
│   │   ├── CartPage/
│   │   ├── OrdersPage/
│   │   ├── LoyaltyPage/
│   │   ├── AdminPage/
│   │   └── AboutPage/
│   ├── utils/             # Utility functions & API calls
│   ├── App.jsx            # Main app router
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json           # Dependencies
├── vite.config.js         # Vite config
└── README.md              # This file
```

---

## 🎯 Current Alignment with SDD

**Completion: ~85%**

### Completed ✅
- Authentication framework
- Product/Menu system
- Cart functionality
- Order management (core flows)
- Loyalty points system
- Admin dashboard
- Frontend routing & role-based access
- Responsive design

### In Progress ⚠️
- Staff order status updates
- Vouchers/coupon redemption flow
- Real-time WebSocket notifications

### Not Started ❌
- TypeScript migration (frontend)
- Refresh token persistence (backend)

---

## 📖 Next Steps

1. **TypeScript Migration** - Convert JSX to TSX for type safety
2. **Staff Dashboard** - Complete order status update endpoints
3. **Voucher System** - Implement coupon generation & redemption
4. **Real-time Updates** - Add WebSocket/STOMP for order status notifications
5. **Mobile App** - Android native application
6. **Testing & QA** - Integration testing across all platforms

---

## 👥 Contributing

**Team:** IT342-G7  
**Lead:** Archienni Al Ramas Abatayo

---

## 📄 Related Documentation

- [System Design Document (SDD v0.4)](../../SDD_ALIGNMENT_REVIEW.md)
- [Backend API Testing Guide](../WildcatsLoungeBackend/API_TESTING_GUIDE.md)
- [Implementation Summary](../../IMPLEMENTATION_SUMMARY.md)

---

## 📞 Support

For issues or questions, contact the development team or file an issue in the project repository.

**Last Updated:** May 8, 2026
