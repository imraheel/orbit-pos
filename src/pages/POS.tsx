import React, { useState } from 'react';
import { ProductGrid } from '../components/pos/ProductGrid';
import { CartSidebar } from '../components/pos/CartSidebar';
import { CheckoutModal } from '../components/pos/CheckoutModal';
import { useCart } from '../store/useCart';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { db } from '../db';

export const POS: React.FC = () => {
  const { addItem } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Handle Barcode Scan
  useBarcodeScanner({
    onScan: async (barcode) => {
      const product = await db.products.where('barcode').equals(barcode).first();
      if (product) {
        addItem(product);
      } else {
        console.warn('Product not found for barcode:', barcode);
      }
    },
    enabled: !isCheckoutOpen
  });

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <ProductGrid onProductSelect={addItem} />
      <CartSidebar onCheckout={() => setIsCheckoutOpen(true)} />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
};
