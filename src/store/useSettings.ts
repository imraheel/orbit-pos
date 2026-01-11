import { create } from 'zustand';
import { db } from '../db';

interface SettingsState {
  currency: string;
  currencySymbol: string;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSetting: (key: string, value: any) => Promise<void>;
}

export const useSettings = create<SettingsState>((set) => ({
  currency: 'USD',
  currencySymbol: '$',
  isLoading: true,

  fetchSettings: async () => {
    try {
      set({ isLoading: true });
      const currencySetting = await db.settings.where('key').equals('currency').first();
      const symbolSetting = await db.settings.where('key').equals('currencySymbol').first();

      set({
        currency: currencySetting?.value || 'USD',
        currencySymbol: symbolSetting?.value || '$',
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      set({ isLoading: false });
    }
  },

  updateSetting: async (key: string, value: any) => {
    try {
      const existing = await db.settings.where('key').equals(key).first();
      if (existing && existing.id) {
        await db.settings.update(existing.id, { value });
      } else {
        await db.settings.add({ key, value });
      }

      // Update local state
      if (key === 'currency') set({ currency: value });
      if (key === 'currencySymbol') set({ currencySymbol: value });
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error);
    }
  },
}));
