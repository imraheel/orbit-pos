import { IOrder, IUser } from '@/db'

interface ReceiptData {
  order: IOrder
  cashier: IUser | null
  customerName?: string
}

export function getReceiptData({ order, cashier, customerName }: ReceiptData, currencySymbol: string) {
  return {
    order,
    cashier,
    customerName,
    currencySymbol,
  }
}
