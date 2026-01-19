# Design Plan: Per-Product Hybrid Tax

## 1. Overview
Replace the hardcoded global 10% tax with a flexible, per-product tax system. Each product can have its own tax rule: either a percentage-based rate, a fixed fee amount, or no tax at all.

## 2. Data Model (`src/db/index.ts`)
Update the `IProduct` interface and database schema.

```typescript
export type TaxType = 'percentage' | 'fixed' | 'none';

export interface IProduct {
  // ... existing fields
  taxType: TaxType;  // Replaces implied global logic
  taxValue: number;  // Replaces unused 'taxRate'
}
```
*Migration Strategy:* Increment Dexie version to 5. Old records lacking these fields will default to `taxType: 'none'` and `taxValue: 0` when read by the application logic.

## 3. Logic & State (`src/store/useCart.ts`)
Refactor the `tax()` calculation function.

**Algorithm:**
1. Iterate through all items in the cart.
2. For each item:
   - If `taxType` is `'percentage'`: `itemTax = (price * quantity) * (taxValue / 100)`
   - If `taxType` is `'fixed'`: `itemTax = taxValue * quantity`
   - If `taxType` is `'none'`: `itemTax = 0`
   - **Rounding:** `itemTax` is rounded to 2 decimal places immediately.
3. Sum all `itemTax` values to get the total Cart Tax.

## 4. UI Components

### Product Management (`src/components/inventory/ProductList.tsx`)
- **Add/Edit Modal:**
  - Add a `<select>` for **Tax Type** (None, Percentage, Fixed).
  - Add an `<Input>` for **Tax Value**.
    - Visible only if Tax Type is not None.
    - Dynamic label/icon based on type (% vs $).

### Cart Display (`src/components/pos/CartSidebar.tsx`)
- No major UI structure changes needed; the "Tax" summary line will simply reflect the new calculated value.

## 5. Implementation Steps
1.  **Database:** Update `src/db/index.ts` with new types and schema version.
2.  **State:** Update `src/store/useCart.ts` calculation logic.
3.  **UI:** Update `src/components/inventory/ProductList.tsx` to include form fields.
4.  **Verify:** Test adding products with different tax types and verify cart calculations.
