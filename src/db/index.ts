import Dexie, { Table } from 'dexie';

// Enums & Types
export type OrderStatus = 'completed' | 'hold' | 'cancelled';

// Interfaces
export interface IUser {
  id?: number;
  username: string;
  pinCode: string; // Hashed/Simple for now
  isActive: boolean;
}

export interface ICategory {
  id?: number;
  name: string;
  color?: string; // For UI tiles
}

export interface IProduct {
  id?: number;
  name: string;
  barcode: string; // Indexed for scan
  price: number;
  costPrice?: number;
  stock: number;
  categoryId: number;
  imageUrl?: string;
  taxRate?: number; // Override default if needed
}

export interface ICustomer {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  totalSpent: number; // Aggregate metric
}

export interface IOrderItem {
  productId: number;
  productName: string;
  price: number; // Snapshot of price at sale
  quantity: number;
  discount: number;
}

export interface IOrder {
  id?: number;
  customerId?: number;
  userId: number; // Cashier who processed it
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  note?: string;
}

export interface ISettings {
  id?: number;
  key: string;
  value: any;
}

export class OrbitPOSDatabase extends Dexie {
  users!: Table<IUser, number>;
  categories!: Table<ICategory, number>;
  products!: Table<IProduct, number>;
  customers!: Table<ICustomer, number>;
  orders!: Table<IOrder, number>;
  settings!: Table<ISettings, number>;

  constructor() {
    super('OrbitPOSDB');
    
    this.version(4).stores({
      users: '++id, username, pinCode',
      categories: '++id, name',
      products: '++id, name, categoryId, barcode',
      customers: '++id, name, &phone', // Unique phone
      orders: '++id, customerId, status, createdAt, userId',
      settings: '++id, &key'
    });

    this.version(3).stores({
      users: '++id, username, pinCode',
      categories: '++id, name',
      products: '++id, name, categoryId, barcode',
      customers: '++id, name, phone',
      orders: '++id, customerId, status, createdAt, userId',
      settings: '++id, &key'
    });
    
    this.version(2).stores({
      users: '++id, username, pinCode',
      categories: '++id, name',
      products: '++id, name, categoryId, barcode',
      customers: '++id, name, phone',
      orders: '++id, customerId, status, createdAt, userId'
    });
  }
}

export const db = new OrbitPOSDatabase();
