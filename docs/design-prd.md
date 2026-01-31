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

### Dark Mode Color Palette

Dark mode uses a sophisticated deep navy base with vibrant accents for a premium, modern feel:

*   **Primary (Brand):** `blue-500` with glow effects (`shadow-blue-500/20`)
*   **Backgrounds:**
    *   `bg-slate-950` (App background - deep navy with optional gradient overlay)
    *   `bg-slate-900/80` (Cards, Panels, Modals with backdrop blur)
    *   `bg-slate-800` (Sidebar, elevated surfaces)
    *   `bg-slate-800/50` (Input fields, secondary backgrounds)
*   **Text:**
    *   `text-slate-100` (Headings, primary data)
    *   `text-slate-400` (Labels, secondary info)
    *   `text-slate-500` (Placeholders, disabled text)
*   **Borders:** `border-slate-700/50` (Subtle, semi-transparent)
*   **Semantic (Vibrant Dark Mode):**
    *   **Success:** `emerald-400` text on `emerald-500/20` background with `border-emerald-500/30`
    *   **Warning:** `amber-400` text on `amber-500/20` background with `border-amber-500/30`
    *   **Error/Destructive:** `red-400` text on `red-500/20` background with `border-red-500/30`
*   **Interactive Glow Effects:**
    *   Primary buttons: `shadow-lg shadow-blue-500/20`
    *   Focus rings: `ring-2 ring-blue-500/30`
    *   Success indicators: `shadow-lg shadow-emerald-500/50`

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
    *   Background: `bg-slate-50` (Light) / `bg-slate-950` (Dark with gradient).
    *   Padding: `p-6`.
    *   Scrollable area independent of Sidebar/Topbar.

### Dark Mode Layout Structure
*   **Sidebar (Dark):**
    *   Background: `bg-slate-900` with `border-r border-slate-800`.
    *   Active state: `bg-blue-500/20 text-blue-400 border-l-2 border-blue-500`.
    *   Hover: `hover:bg-slate-800/80`.
*   **Topbar (Dark):**
    *   Glassmorphism effect: `bg-slate-900/80 backdrop-blur`.
    *   Border: `border-b border-slate-800`.
*   **Main Content (Dark):**
    *   Background: `bg-slate-950` with subtle radial gradient.
    *   Cards: `bg-slate-900/80 backdrop-blur-sm` with elevated borders.

---

## 4. Component Library Plan

### Atoms

#### Light Mode
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

#### Dark Mode Enhancements
1.  **Button:**
    *   **Primary:** `bg-blue-600 hover:bg-blue-500` with `shadow-lg shadow-blue-500/20` glow effect.
    *   **Secondary:** `bg-slate-800 hover:bg-slate-700 text-slate-200`.
    *   **Destructive:** `bg-red-600 hover:bg-red-500` with `shadow-lg shadow-red-500/20`.
    *   **Ghost:** `hover:bg-slate-800 text-slate-300`.
    *   All buttons: Smooth transitions with `duration-200`.
2.  **Input:**
    *   Background: `bg-slate-800/50`.
    *   Border: `border-slate-700 focus:border-blue-500`.
    *   Text: `text-slate-100`.
    *   Placeholder: `text-slate-500`.
    *   Focus ring: `ring-2 ring-blue-500/20`.
3.  **Badge:**
    *   **Success:** `bg-emerald-500/20 text-emerald-400 border-emerald-500/30`.
    *   **Warning:** `bg-amber-500/20 text-amber-400 border-amber-500/30`.
    *   **Error:** `bg-red-500/20 text-red-400 border-red-500/30`.
    *   All badges: Semi-transparent backgrounds with colored borders.
4.  **Card:**
    *   Background: `bg-slate-900/80` with `backdrop-blur-sm`.
    *   Border: `border-slate-700/50`.
    *   Shadow: `shadow-lg shadow-black/20`.
    *   Hover: `hover:border-slate-600/50 hover:shadow-xl`.

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

### Phase 5: Dark Mode Enhancement
- [ ] **Global Styles:** Update CSS with dark mode variables and gradient backgrounds.
- [ ] **UI Components:** Enhance Button, Card, Input, Badge with glow effects and vibrant colors.
- [ ] **Layout Components:** Update MainLayout, Sidebar, Topbar with deep navy theme.
- [ ] **Page Components:** Apply dark mode styling to all pages (POS, Inventory, History, Settings, Login).
- [ ] **POS Enhancements:** Product grid hover effects, cart panel glassmorphism, checkout modal polish.
- [ ] **Final Review:** Ensure consistency, accessibility, and smooth theme transitions.

