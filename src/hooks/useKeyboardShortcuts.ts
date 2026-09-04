import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsOptions {
  onCheckout?: () => void;
  onHoldOrder?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onCheckout,
  onHoldOrder,
  enabled = true,
}: UseKeyboardShortcutsOptions) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const isModifier = e.ctrlKey;

      // Ctrl + Enter to open checkout
      if (isModifier && e.key === 'Enter') {
        e.preventDefault();
        onCheckout?.();
        return;
      }

      // Ctrl + H to hold order
      if (isModifier && e.key === 'h') {
        e.preventDefault();
        onHoldOrder?.();
        return;
      }
    },
    [enabled, onCheckout, onHoldOrder]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
