# Currency Implementation Plan

## 1. Database & Store Setup
- [x] **Update Database Schema (`src/db/index.ts`)**
    - [x] Create `ISettings` interface.
    - [x] Add `settings` table to `OrbitPOSDatabase` class.
    - [x] Increment database version.
- [x] **Create Settings Store (`src/store/useSettings.ts`)**
    - [x] Create Zustand store `useSettings`.
    - [x] Implement `currency` and `currencySymbol` state.
    - [x] Implement `fetchSettings` and `updateSetting` actions.

## 2. Settings Page Refactor (`src/pages/Settings.tsx`)
- [x] **Split UI into Tabs**
    - [x] Implement tab navigation (User Management / System Settings).
- [x] **User Management Section**
    - [x] Move existing user management logic to this section.
- [x] **System Settings Section**
    - [x] Create form for system settings.
    - [x] Add "Currency Symbol" input field.
    - [x] Connect to `useSettings` store.

## 3. Implement Global Currency
- [x] **Update Components to use `useSettings` currency symbol**
    - [x] `src/components/pos/CartSidebar.tsx` (Cart items, Totals)
    - [x] `src/components/pos/ProductGrid.tsx` (Product prices)
    - [x] `src/components/pos/CheckoutModal.tsx` (Totals, Payment amounts)
    - [x] `src/components/inventory/ProductList.tsx` (Product list prices)
    - [x] `src/pages/Customers.tsx` (Total spent)
    - [x] `src/pages/Dashboard.tsx` (Revenue, Goals)
    - [x] `src/pages/History.tsx` (Order totals)

## 4. Verification
- [x] **Verify Settings Persistence**
    - [x] Ensure settings are saved to Dexie and reloaded on refresh.
- [x] **Verify Currency Display**
    - [x] Check all screens for correct symbol usage.