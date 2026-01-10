# Orbit POS - Design System & UI/UX Specification

## 1. Design Philosophy
**"Clarity, Speed, and Reliability."**
Orbit POS is a high-frequency desktop tool. The interface must be:
- **High Contrast & Legible:** For varying lighting conditions in retail environments.
- **Touch-Friendly:** Large touch targets (min 44px) for touchscreen monitors.
- **Data-Dense but Clean:** Information should be scannable without looking cluttered.
- **Feedback-Rich:** Every interaction (tap, scan, click) provides immediate visual feedback.

## 2. Visual Foundation (Design Tokens)

### Color Palette (Tailwind CSS)
We will stick to a professional, neutral base with strong semantic colors.

*   **Primary (Brand):** `blue-600` (Actionable elements, active states)
*   **Backgrounds:**
    *   `bg-slate-50` (App background - reduces eye strain vs pure white)
    *   `bg-white` (Cards, Panels, Inputs)
    *   `bg-slate-100` (Hover states, secondary backgrounds)
*   **Text:**
    *   `text-slate-900` (Headings, primary data)
    *   `text-slate-500` (Labels, secondary info)
    *   `text-slate-400` (Placeholders, disabled text)
*   **Borders:** `border-slate-200`
*   **Semantic:**
    *   **Success:** `emerald-600` (Completed orders, in stock)
    *   **Warning:** `amber-500` (Low stock)
    *   **Error/Destructive:** `red-600` (Delete, cancel, out of stock)

### Typography
*   **Font Family:** System Sans-Serif (San Francisco, Inter, Segoe UI) for native feel and performance.
*   **Weights:** Regular (400), Medium (500), Semibold (600).
*   **Sizes:**
    *   `text-xs` (Metadata)
    *   `text-sm` (Table rows, standard labels)
    *   `text-base` (Body, input text)
    *   `text-lg` (Card titles, totals)
    *   `text-xl/2xl` (Page headers, Grand Total)

### Spacing & Shape
*   **Grid:** 4px baseline. Standard padding: `p-4` or `p-6`.
*   **Radius:**
    *   `rounded-lg` (8px) for inputs, buttons, standard cards.
    *   `rounded-xl` (12px) for modals and main containers.
*   **Shadows:** `shadow-sm` for cards, `shadow-lg` for modals/dropdowns.

---

## 3. Layout Structure

### Shell (MainLayout)
*   **Sidebar:**
    *   Fixed width (e.g., `w-64`).
    *   Dark or Light theme (Light preferred for consistency: `bg-white border-r`).
    *   Navigation items: Icon + Label. Active state: `bg-blue-50 text-blue-600`.
*   **Topbar:**
    *   Height: `h-16`.
    *   Context: Current Page Title, Global Search (optional), User Profile/Logout, Connectivity/Sync Status.
*   **Main Content:**
    *   Background: `bg-slate-50`.
    *   Padding: `p-6`.
    *   Scrollable area independent of Sidebar/Topbar.

---

## 4. Component Library Plan

### Atoms
1.  **Button:**
    *   Variants: `primary` (Solid Blue), `secondary` (Outline/Ghost), `destructive` (Solid Red).
    *   Sizes: `sm` (compact tables), `md` (default), `lg` (POS actions).
2.  **Input:**
    *   Standard text input with `focus:ring-2`.
    *   Search input with leading icon.
3.  **Badge:**
    *   Pill-shaped status indicators (Stock levels, Order status).
4.  **Card:**
    *   White background, standard border, subtle shadow.

### Molecules
1.  **ProductCard (POS):**
    *   Image/Icon placeholder.
    *   Name (truncated 2 lines).
    *   Price (bold).
    *   Stock indicator (dot).
2.  **CartItem:**
    *   Name & Price.
    *   Quantity Stepper (- 1 +).
    *   Remove button.
3.  **StatCard:**
    *   Label, Big Number, Trend indicator.

### Organisms
1.  **DataTable:**
    *   Sortable headers.
    *   Row hover effects.
    *   Pagination footer.
    *   Actions column.
2.  **CheckoutModal:**
    *   Payment method selection (large grid).
    *   Amount tender input.
    *   Change calculation display.

---

## 5. Page-Specific Designs

### 1. POS Interface (Priority: High)
*   **Layout:** Two-column split.
    *   **Left (66%):** Product Grid.
        *   Top: Category tabs/chips + Search bar.
        *   Body: Grid of `ProductCard`s.
    *   **Right (33%):** Cart Panel.
        *   Top: Customer selector.
        *   Body: List of `CartItem`s (scrollable).
        *   Bottom: Calculation Summary (Subtotal, Tax, Total) + Big "Pay" Button.

### 2. Dashboard
*   **Top:** Grid of `StatCard`s (Total Sales, Orders, Low Stock).
*   **Body:**
    *   Recent Sales Table (mini version).
    *   Simple Bar Chart (Sales last 7 days) - *Implementation: Recharts or simple CSS bars*.

### 3. Inventory Management
*   **Header:** Title + "Add Product" Button (Primary).
*   **Controls:** Search bar, Category Filter.
*   **Body:** Full-width `DataTable`.
    *   Columns: Image, Name, Category, Price, Cost, Stock, Status, Actions.

### 4. Order History
*   **Body:** `DataTable` of past orders.
*   **Detail View:** Clicking a row opens a drawer/modal with receipt details.

### 5. Login
*   **Center Card:**
    *   Logo.
    *   PIN Pad (Grid of numbers 0-9) for touch-friendly login.
    *   Status message.

---

## 6. Implementation Roadmap & Tasks

### Phase 1: Foundation & Layout
- [ ] **Setup Global Styles:** Configure `tailwind.config.js` with brand colors and fonts.
- [ ] **Base Components:** Create `Button`, `Input`, `Card`, `Badge` components in `src/components/ui`.
- [ ] **Shell:** Redesign `Sidebar` and `Topbar` to match new layout specs. Update `MainLayout`.

### Phase 2: POS Experience (The Core)
- [ ] **Product Grid:** Style `ProductList` with category tabs and search.
- [ ] **Cart Panel:** Redesign `CartSidebar` with clear summary and quantity controls.
- [ ] **Checkout:** Create a polished `CheckoutModal` with payment types and change calculator.

### Phase 3: Data Management Pages
- [ ] **Inventory:** Implement the full `DataTable` design for `Inventory.tsx`.
- [ ] **Customers:** Apply table styles to `Customers.tsx`.
- [ ] **History:** Style `History.tsx` and create an "Order Details" modal.

### Phase 4: Polish & Dashboard
- [ ] **Dashboard:** Build `StatCard` and layout the `Dashboard.tsx` grid.
- [ ] **Login:** Redesign `Login.tsx` with a numeric PIN pad UI.
- [ ] **Transitions:** Add subtle `framer-motion` layout animations for page transitions.

