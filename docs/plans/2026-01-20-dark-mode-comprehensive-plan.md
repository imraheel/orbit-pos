# Comprehensive Dark Mode Implementation Plan

## Overview

Complete the dark mode implementation for the Orbit POS application. The foundation is in place with Tailwind's class-based dark mode, Zustand theme state management, and persistence to IndexedDB. However, the toggle in Settings is not functioning - investigate and fix the theme switching logic, state updates, and DOM class application. Then systematically update all UI elements across all pages and components to support dark variants.

## Architecture

- **Styling Strategy**: Use Tailwind CSS dark: prefixes for all light mode classes
- **Color Palette**: Light mode uses slate-50 to slate-900, dark mode maps to slate-900 for backgrounds, slate-100 for text, slate-700 for borders
- **Theme Persistence**: Already implemented via useSettings store and Dexie DB
- **Component Updates**: Update all hardcoded classes in TSX files with dark: variants
- **No Breaking Changes**: Ensure all existing functionality remains intact

## Toggle Functionality Fix

- **Issue**: Toggle switch in Settings not responding to clicks
- **Investigation**: Check ThemeProvider subscription to theme changes, verify updateSetting updates state, confirm document.documentElement.classList manipulation
- **Fix**: Ensure immediate state updates, verify DB persistence doesn't block UI, add console logging for debugging
- **Testing**: Verify toggle state updates UI immediately, persists across restarts

## Detailed Todo List by Page/Component

### Global/Layout Components
- **MainLayout.tsx**: Update bg-slate-50 to dark:bg-slate-900
- **Sidebar.tsx**: Already partially updated, verify all nav items, logout button
- **Topbar.tsx**: Already updated, verify all text and borders
- **ThemeProvider.tsx**: Already implemented

### UI Components (Reusable)
- **Button.tsx**: Already updated for all variants
- **Input.tsx**: Already updated
- **Badge.tsx**: Already updated for all variants
- **Card.tsx**: Already updated, including CardDescription
- **ConfirmDialog.tsx**: Already updated

### Pages

#### Settings.tsx
- UserManagement table: Update thead bg-slate-50, tbody hover, text colors
- SystemSettings: Already updated
- Tabs: Update active/inactive states with dark variants

#### Dashboard.tsx
- Stats cards: Update Card backgrounds, text
- Recent orders card: Update table borders, hover states, text
- Daily goal card: Update shadow (light box shadow to dark)
- Quick actions buttons: Already updated

#### Inventory.tsx
- Header text: Already updated
- Tab buttons: Already updated
- ProductList component: Update container, inputs, modal
- CategoryList component: Update cards, modal

#### POS.tsx
- ProductGrid: Update category headers, product cards, badges
- CartSidebar: Update sidebar bg, cart items, checkout button, modals
- CheckoutModal: Update modal bg, inputs, buttons

#### History.tsx
- Orders table: Update table bg, borders, text, hover states
- Order details modal: Update all elements

#### Customers.tsx
- Customers table: Similar to users table
- Add/Edit modal: Update forms

#### Login.tsx
- Background gradients: May need custom dark gradients
- Card bg: Update to dark
- Inputs and buttons: Update

### Component-Specific Updates

#### ProductGrid.tsx
- Category section: bg-white dark:bg-slate-900, border-slate-200 dark:border-slate-700
- Product cards: bg-white dark:bg-slate-900, hover:shadow, text colors
- Badge overlays: Already updated via Badge component

#### CartSidebar.tsx
- Sidebar: bg-white dark:bg-slate-900, border-l dark:border-slate-700
- Cart items: bg-white dark:bg-slate-900, text, borders
- Totals section: bg-white dark:bg-slate-900
- Checkout button and modals

#### CheckoutModal.tsx
- Modal bg: bg-white dark:bg-slate-900
- Payment options: borders, hovers
- Receipt modal

#### ProductList.tsx
- Container: Already updated
- Search and filters: Already updated
- Table: Update if present, or list items
- Modal: Already updated

#### CategoryList.tsx
- Category cards: bg-white dark:bg-slate-900, borders, hovers
- Modal

### Common Patterns to Update
- **Backgrounds**: bg-white → dark:bg-slate-900
- **Text**: text-slate-900 → dark:text-slate-100, text-slate-500 → dark:text-slate-400
- **Borders**: border-slate-200 → dark:border-slate-700, border-slate-100 → dark:border-slate-700
- **Hovers**: hover:bg-slate-50 → dark:hover:bg-slate-800, hover:text-slate-900 → dark:hover:text-slate-100
- **Shadows**: shadow-sm (keep), shadow-lg (keep), but adjust colored shadows like shadow-blue-200 → dark:shadow-blue-900
- **Focus rings**: focus:ring-blue-500/20 (keep)
- **Gradients**: May need dark equivalents

## Testing

- Visual regression testing for each page in light/dark modes
- Toggle functionality across app restarts
- All interactive elements (buttons, inputs, links) visible in both modes
- Color contrast meets accessibility standards

## Implementation Order

1. Complete UI components (already mostly done)
2. Update all pages in order: Dashboard, Settings, Inventory, POS, History, Customers, Login
3. Test each page after updates
4. Final integration test

---

*Plan documented on 2026-01-20. Ready for detailed implementation.*