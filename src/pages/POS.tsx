import React, { useState, useRef, useEffect } from 'react';
import { ProductGrid, ProductGridRef } from '../components/pos/ProductGrid';
import { CartSidebar } from '../components/pos/CartSidebar';
import { CheckoutModal } from '../components/pos/CheckoutModal';
import { useCart } from '../store/useCart';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { db } from '../db';

export const POS: React.FC = () => {
  const { addItem, holdCart, items } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  const productGridRef = useRef<ProductGridRef>(null);

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

  // Handle Keyboard Shortcuts
  useKeyboardShortcuts({
    onCheckout: () => {
      if (items.length > 0) {
        setIsCheckoutOpen(true);
      }
    },
    onHoldOrder: () => {
      if (items.length > 0) {
        holdCart();
      }
    },
    enabled: true
  });

  // Global Escape handler: close checkout or focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCheckoutOpen) {
          e.preventDefault();
          setIsCheckoutOpen(false);
        } else if (!isAnyModalOpen) {
          e.preventDefault();
          productGridRef.current?.focusSearch();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCheckoutOpen, isAnyModalOpen]);

  return (
    <div className="flex h-full overflow-hidden bg-slate-50 dark:bg-transparent">
      <ProductGrid ref={productGridRef} onProductSelect={addItem} />
      <CartSidebar 
        onCheckout={() => setIsCheckoutOpen(true)} 
        onModalStateChange={setIsAnyModalOpen}
      />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
};
