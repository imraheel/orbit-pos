import { useEffect, useCallback } from 'react';

interface UseEscapeKeyOptions {
  onClose: () => void;
  enabled?: boolean;
}

export const useEscapeKey = ({ onClose, enabled = true }: UseEscapeKeyOptions) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (enabled) {
          onClose();
        }
      }
    },
    [enabled, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
