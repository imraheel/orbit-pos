import { db } from './index';

export const seedDatabase = async () => {
  const userCount = await db.users.count();
  console.log('Current user count in DB:', userCount);
  let adminUserId = 1;
  if (userCount === 0) {
    // Default Admin
    await db.users.add({
      username: 'admin',
      pinCode: '1234',
      role: 'admin',
      isActive: true,
    });
    console.log('Seeded default admin user');
  } else {
    const admin = await db.users.where('username').equals('admin').first();
    if (admin) adminUserId = admin.id!;
  }

  const customerCount = await db.customers.count();
  if (customerCount === 0) {
    // Default Walk-in Customer
    await db.customers.add({
      name: 'Walk-in Customer',
      phone: '',
      totalSpent: 0,
    });
    console.log('Seeded Walk-in Customer');
  }

  const categoryCount = await db.categories.count();
  if (categoryCount === 0) {
    await db.categories.bulkAdd([
      { name: 'Beverages', color: '#3b82f6' },
      { name: 'Snacks', color: '#f59e0b' },
      { name: 'Electronics', color: '#10b981' },
    ]);
    console.log('Seeded categories');
  }

  const productCount = await db.products.count();
  if (productCount === 0) {
    // We need category IDs first
    const bevCat = await db.categories.where('name').equals('Beverages').first();
    const snackCat = await db.categories.where('name').equals('Snacks').first();

    if (bevCat && snackCat) {
        const colaId = await db.products.add({
            name: 'Cola 350ml',
            barcode: '1111',
            price: 1.50,
            stock: 100,
            categoryId: bevCat.id!,
            taxType: 'none',
            taxValue: 0,
        });

        const chipsId = await db.products.add({
            name: 'Chips BBQ',
            barcode: '2222',
            price: 2.00,
            stock: 50,
            categoryId: snackCat.id!,
            taxType: 'none',
            taxValue: 0,
        });

        // Seed initial stock movements
        await db.stockMovements.bulkAdd([
          {
            productId: colaId as number,
            type: 'addition',
            quantity: 100,
            stockBefore: 0,
            stockAfter: 100,
            userId: adminUserId,
            note: 'Initial stock',
            createdAt: new Date(),
          },
          {
            productId: chipsId as number,
            type: 'addition',
            quantity: 50,
            stockBefore: 0,
            stockAfter: 50,
            userId: adminUserId,
            note: 'Initial stock',
            createdAt: new Date(),
          },
        ]);

        console.log('Seeded products and stock movements');
    }
  }
};
