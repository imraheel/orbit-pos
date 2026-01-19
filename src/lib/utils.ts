import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IProduct } from '../db';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateGrossPrice(product: IProduct | { price: number; taxType?: 'percentage' | 'fixed' | 'none'; taxValue?: number }): number {
  const price = product.price;
  const taxType = product.taxType || 'none';
  const taxValue = product.taxValue || 0;

  let taxAmount = 0;
  if (taxType === 'percentage') {
    taxAmount = price * (taxValue / 100);
  } else if (taxType === 'fixed') {
    taxAmount = taxValue;
  }

  // Round tax to 2 decimals before adding to price
  return price + (Math.round(taxAmount * 100) / 100);
}
