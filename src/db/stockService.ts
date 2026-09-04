import { db, IStockMovement, StockMovementType } from './index';

interface RecordMovementData {
  productId: number;
  type: StockMovementType;
  quantity: number;
  userId: number;
  referenceId?: number;
  note?: string;
}

export async function recordMovement(data: RecordMovementData): Promise<void> {
  const product = await db.products.get(data.productId);
  if (!product) throw new Error('Product not found');

  const stockBefore = product.stock;
  let stockAfter: number;

  if (data.type === 'sale' || data.type === 'removal') {
    if (product.stock < data.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${data.quantity}`);
    }
    stockAfter = product.stock - data.quantity;
  } else if (data.type === 'return') {
    stockAfter = product.stock + Math.abs(data.quantity);
  } else {
    stockAfter = product.stock + data.quantity;
  }

  if (stockAfter < 0) {
    throw new Error(`Stock cannot be negative for "${product.name}". Current: ${product.stock}, change: ${data.quantity}`);
  }

  await db.transaction('rw', [db.stockMovements, db.products], async () => {
    await db.stockMovements.add({
      productId: data.productId,
      type: data.type,
      quantity: data.quantity,
      stockBefore,
      stockAfter,
      userId: data.userId,
      referenceId: data.referenceId,
      note: data.note,
      createdAt: new Date(),
    });

    await db.products.update(data.productId, { stock: stockAfter });
  });
}

export async function recordBulkSaleMovements(
  items: Array<{ productId: number; quantity: number }>,
  userId: number,
  orderId: number
): Promise<void> {
  for (const item of items) {
    const product = await db.products.get(item.productId);
    if (!product) throw new Error('Product not found');

    const stockBefore = product.stock;
    if (stockBefore < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${stockBefore}, requested: ${item.quantity}`);
    }
    const stockAfter = stockBefore - item.quantity;

    await db.transaction('rw', [db.stockMovements, db.products], async () => {
      await db.stockMovements.add({
        productId: item.productId,
        type: 'sale',
        quantity: item.quantity,
        stockBefore,
        stockAfter,
        userId,
        referenceId: orderId,
        createdAt: new Date(),
      });

      await db.products.update(item.productId, { stock: stockAfter });
    });
  }
}

export async function getMovementsForProduct(productId: number, limit = 50): Promise<IStockMovement[]> {
  const movements = await db.stockMovements
    .where('productId')
    .equals(productId)
    .reverse()
    .sortBy('createdAt');
  return movements.slice(0, limit);
}

export async function getRecentMovements(limit = 50): Promise<IStockMovement[]> {
  const all = await db.stockMovements.toArray();
  return all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
}

export async function getStockByProduct(productId: number): Promise<number> {
  const product = await db.products.get(productId);
  return product?.stock ?? 0;
}
