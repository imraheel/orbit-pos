# PRD: Orbit POS (Offline-First Desktop Point of Sale)

## 1. Project Overview
Orbit POS is a cross-platform desktop application designed for high-performance, offline-first retail operations. Built with Electron and React, it ensures that businesses can continue processing sales even without an internet connection, syncing data locally via IndexedDB.

---

## 2. User Stories

### General User
- **Access Control:** I want to log in using a PIN so the system knows who processed the order.
- **User Management:** I want to add new users to the system so my staff can use the POS.
- **Inventory Control:** I want to add/edit/delete products and categories to keep inventory accurate.
- **Stock Management:** I want to adjust stock levels when shipments arrive.
- **Speed of Sale:** I want to quickly scan items using a barcode scanner.
- **Order Flexibility:** I want to "Hold" an order and resume it later.
- **Reporting:** I want to view sales history to understand performance.

---

## 3. Functional Requirements

### Authentication
- Simple login system using PIN codes.
- **Single User Type:** All users have full access to all features (Inventory, Settings, POS).
- Persistent local sessions to track who is currently logged in.

### Inventory Engine
- CRUD operations for Products and Categories.
- Support for stock levels, pricing, and tax rates.
- Barcode string mapping for every product.

### POS Interface
- **Global Key Listening:** Seamless barcode scanner integration.
- **Cart Management:** Real-time calculation of totals.
- **Customer Selection:** Support for "Walk-in" and registered customers.

### Order Management
- **Persistence:** Instant local save to Dexie (IndexedDB).
- **Hold/Resume:** Ability to pause multiple carts.
- **Transaction History:** Searchable database of past orders.

---

## 4. Technical Architecture

### Tech Stack
- **Framework:** ElectronJS
- **Frontend:** ReactJS, TypeScript, Tailwind CSS
- **Database:** Dexie.js
- **State Management:** Zustand
- **Animations:** Framer Motion

---

## 5. Database Schema (Dexie.js)

```typescript
// users: '++id, username, pinCode, isActive'
// categories: '++id, name'
// products: '++id, name, categoryId, barcode'
// customers: '++id, name, phone'
// orders: '++id, customerId, status, createdAt, userId'
```

---

## 6. Development Roadmap

### Sprint 1: Setup & Foundation (Completed)
- Initialize Electron + React + Vite + Tailwind.
- Configure Dexie.js database.
- Build basic application shell.

### Sprint 2: Inventory & Auth
- Implement PIN-based Login screen.
- Create User Management (Add/Edit Users).
- Create Inventory management UI (Products & Categories).
- Build Customer management module.

### Sprint 3: POS Core
- Develop Checkout screen.
- Implement Barcode Scanner hook.
- Logic for Tax, Discounts, and Order finalization.

### Sprint 4: Polish & Reporting
- Order History and "Hold Order".
- Sales Dashboard.
- UI/UX polish.
