import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Utility functions for generating realistic demo data
 */
const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const generateTrackingNumber = (): string => {
  const prefixes = ['1Z', 'FX', 'DH'];
  const prefix = randomChoice(prefixes);
  const numbers = Math.random().toString().slice(2, 12);
  return `${prefix}${numbers}`;
};

const generateOrderNumber = (): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString().slice(2, 8);
  return `ORD-${year}${month}-${random}`;
};

const generateBinLocation = (): string => {
  const zones = ['A', 'B', 'C', 'D', 'E'];
  const rows = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const shelves = ['1', '2', '3', '4'];
  return `${randomChoice(zones)}${randomChoice(rows)}${randomChoice(shelves)}`;
};

/**
 * Main seeding function
 * Populates the database with comprehensive demo data for Blue Ship Sync
 */
async function main() {
  console.log('Starting Blue Ship Sync database seeding...');

  // Clear existing data (in reverse order of dependencies)
  console.log('Clearing existing data...');
  await prisma.chatMessage.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.carrier.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users (2 users: ADMIN and OPERATOR)
  console.log('Creating users...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@blueshipsync.com',
      name: 'Sarah Johnson',
      company: 'Blue Ship Sync Corp',
      role: 'ADMIN',
      subscriptionTier: 'PRO',
      trialEndsAt: null,
    },
  });

  const operatorUser = await prisma.user.create({
    data: {
      email: 'operator@blueshipsync.com',
      name: 'Mike Chen',
      company: 'Blue Ship Sync Corp',
      role: 'OPERATOR',
      subscriptionTier: 'NORMAL',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  // 2. Create Carriers (3 common carriers)
  console.log('Creating carriers...');
  const carriers = await Promise.all([
    prisma.carrier.create({
      data: {
        name: 'FedEx',
        serviceLevel: 'Ground',
        estimatedDays: 3,
        baseRate: 8.50,
        perPoundRate: 0.75,
      },
    }),
    prisma.carrier.create({
      data: {
        name: 'UPS',
        serviceLevel: 'Standard',
        estimatedDays: 2,
        baseRate: 9.25,
        perPoundRate: 0.80,
      },
    }),
    prisma.carrier.create({
      data: {
        name: 'DHL',
        serviceLevel: 'Express',
        estimatedDays: 1,
        baseRate: 12.00,
        perPoundRate: 1.20,
      },
    }),
  ]);

  // 3. Create Warehouses (3 warehouses assigned to ADMIN user)
  console.log('Creating warehouses...');
  const warehouses = await Promise.all([
    prisma.warehouse.create({
      data: {
        userId: adminUser.id,
        name: 'Chicago DC',
        address: '1234 Industrial Blvd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60609',
        country: 'USA',
        totalSpace: 50000,
        usedSpace: 35000,
        utilizationPct: 70.0,
        status: 'ACTIVE',
      },
    }),
    prisma.warehouse.create({
      data: {
        userId: adminUser.id,
        name: 'Los Angeles Fulfillment',
        address: '5678 Commerce Way',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        totalSpace: 75000,
        usedSpace: 45000,
        utilizationPct: 60.0,
        status: 'ACTIVE',
      },
    }),
    prisma.warehouse.create({
      data: {
        userId: adminUser.id,
        name: 'Atlanta Crossdock',
        address: '9012 Logistics Lane',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30309',
        country: 'USA',
        totalSpace: 30000,
        usedSpace: 18000,
        utilizationPct: 60.0,
        status: 'ACTIVE',
      },
    }),
  ]);

  // 4. Create Products (10 products with realistic data)
  console.log('Creating products...');
  const productData = [
    {
      sku: 'ELC-IPHONE15-128',
      name: 'iPhone 15 128GB',
      description: 'Latest iPhone with A17 Pro chip and titanium design',
      category: 'Electronics',
      weight: 0.4,
      dimensions: { length: 14.8, width: 7.1, height: 0.8 },
      unitPrice: 799.99,
      imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
    },
    {
      sku: 'ELC-MACBOOK-AIR-M3',
      name: 'MacBook Air M3 13-inch',
      description: 'Ultra-thin laptop with M3 chip and Liquid Retina display',
      category: 'Electronics',
      weight: 2.7,
      dimensions: { length: 30.4, width: 21.5, height: 1.1 },
      unitPrice: 1099.99,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    },
    {
      sku: 'ELC-SAMSUNG-TV-55',
      name: 'Samsung 55" 4K Smart TV',
      description: 'Crystal UHD 4K Smart TV with Tizen OS',
      category: 'Electronics',
      weight: 18.5,
      dimensions: { length: 123.2, width: 70.8, height: 5.9 },
      unitPrice: 599.99,
      imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
    },
    {
      sku: 'APP-NIKE-AIR-MAX',
      name: 'Nike Air Max 270',
      description: 'Comfortable running shoes with Max Air cushioning',
      category: 'Apparel',
      weight: 0.8,
      dimensions: { length: 32, width: 22, height: 12 },
      unitPrice: 150.00,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    },
    {
      sku: 'APP-LEVI-JEANS-501',
      name: 'Levi\'s 501 Original Jeans',
      description: 'Classic straight-fit jeans in blue denim',
      category: 'Apparel',
      weight: 0.6,
      dimensions: { length: 40, width: 30, height: 2 },
      unitPrice: 89.99,
      imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400',
    },
    {
      sku: 'APP-PATAGONIA-JACKET',
      name: 'Patagonia Down Sweater Jacket',
      description: 'Lightweight insulated jacket for outdoor adventures',
      category: 'Apparel',
      weight: 0.5,
      dimensions: { length: 35, width: 25, height: 3 },
      unitPrice: 199.99,
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    },
    {
      sku: 'APP-NORTH-FACE-BACKPACK',
      name: 'The North Face Recon Backpack',
      description: 'Durable 30L backpack for hiking and travel',
      category: 'Apparel',
      weight: 1.2,
      dimensions: { length: 50, width: 30, height: 20 },
      unitPrice: 89.99,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    },
    {
      sku: 'APP-RAY-BAN-AVIATOR',
      name: 'Ray-Ban Aviator Classic Sunglasses',
      description: 'Classic aviator sunglasses with green lenses',
      category: 'Apparel',
      weight: 0.1,
      dimensions: { length: 15, width: 5, height: 2 },
      unitPrice: 154.99,
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
    },
    {
      sku: 'APP-KITCHENAID-MIXER',
      name: 'KitchenAid Stand Mixer',
      description: '5-quart stand mixer with dough hook and whisk',
      category: 'Appliances',
      weight: 12.0,
      dimensions: { length: 35.6, width: 25.4, height: 30.5 },
      unitPrice: 329.99,
      imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
    },
    {
      sku: 'APP-DYSON-VACUUM-V15',
      name: 'Dyson V15 Detect Cordless Vacuum',
      description: 'Powerful cordless vacuum with laser dust detection',
      category: 'Appliances',
      weight: 3.0,
      dimensions: { length: 25.4, width: 10.2, height: 108.0 },
      unitPrice: 749.99,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    },
  ];

  const products = await Promise.all(
    productData.map((product) =>
      prisma.product.create({
        data: {
          userId: adminUser.id,
          ...product,
        },
      })
    )
  );

  // 5. Create Inventory (fill warehouses with all products)
  console.log('Creating inventory...');
  const inventoryPromises = [];
  for (const warehouse of warehouses) {
    for (const product of products) {
      inventoryPromises.push(
        prisma.inventory.create({
          data: {
            warehouseId: warehouse.id,
            productId: product.id,
            quantity: randomBetween(20, 200),
            binLocation: generateBinLocation(),
            status: randomChoice(['AVAILABLE', 'RESERVED']),
            lastCountedAt: new Date(Date.now() - randomBetween(1, 30) * 24 * 60 * 60 * 1000),
          },
        })
      );
    }
  }
  await Promise.all(inventoryPromises);

  // 6. Create Customers (5 customers)
  console.log('Creating customers...');
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        userId: adminUser.id,
        name: 'TechCorp Solutions',
        email: 'orders@techcorp.com',
        phone: '+1-555-0123',
        shippingAddress: {
          street: '100 Innovation Drive',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA',
        },
        billingAddress: {
          street: '100 Innovation Drive',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA',
        },
        preferredCarrier: 'UPS',
      },
    }),
    prisma.customer.create({
      data: {
        userId: adminUser.id,
        name: 'Fashion Forward LLC',
        email: 'purchasing@fashionforward.com',
        phone: '+1-555-0456',
        shippingAddress: {
          street: '250 Fashion Avenue',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA',
        },
        billingAddress: {
          street: '250 Fashion Avenue',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA',
        },
        preferredCarrier: 'FedEx',
      },
    }),
    prisma.customer.create({
      data: {
        userId: adminUser.id,
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0789',
        shippingAddress: {
          street: '456 Oak Street',
          city: 'Austin',
          state: 'TX',
          zip: '73301',
          country: 'USA',
        },
        billingAddress: {
          street: '456 Oak Street',
          city: 'Austin',
          state: 'TX',
          zip: '73301',
          country: 'USA',
        },
        preferredCarrier: 'DHL',
      },
    }),
    prisma.customer.create({
      data: {
        userId: adminUser.id,
        name: 'Global Electronics Inc',
        email: 'procurement@globalelectronics.com',
        phone: '+1-555-0321',
        shippingAddress: {
          street: '789 Technology Blvd',
          city: 'Seattle',
          state: 'WA',
          zip: '98101',
          country: 'USA',
        },
        billingAddress: {
          street: '789 Technology Blvd',
          city: 'Seattle',
          state: 'WA',
          zip: '98101',
          country: 'USA',
        },
        preferredCarrier: 'FedEx',
      },
    }),
    prisma.customer.create({
      data: {
        userId: adminUser.id,
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@email.com',
        phone: '+1-555-0654',
        shippingAddress: {
          street: '321 Pine Street',
          city: 'Miami',
          state: 'FL',
          zip: '33101',
          country: 'USA',
        },
        billingAddress: {
          street: '321 Pine Street',
          city: 'Miami',
          state: 'FL',
          zip: '33101',
          country: 'USA',
        },
        preferredCarrier: 'UPS',
      },
    }),
  ]);

  // 7. Create Orders (5 orders)
  console.log('Creating orders...');
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: adminUser.id,
        customerId: customers[0].id,
        orderNumber: generateOrderNumber(),
        status: 'PROCESSING',
        items: [
          { sku: 'ELC-IPHONE15-128', qty: 2, unitPrice: 799.99, totalPrice: 1599.98 },
          { sku: 'ELC-MACBOOK-AIR-M3', qty: 1, unitPrice: 1099.99, totalPrice: 1099.99 },
        ],
        totalAmount: 2699.97,
      },
    }),
    prisma.order.create({
      data: {
        userId: adminUser.id,
        customerId: customers[1].id,
        orderNumber: generateOrderNumber(),
        status: 'SHIPPED',
        items: [
          { sku: 'APP-NIKE-AIR-MAX', qty: 5, unitPrice: 150.00, totalPrice: 750.00 },
          { sku: 'APP-LEVI-JEANS-501', qty: 3, unitPrice: 89.99, totalPrice: 269.97 },
        ],
        totalAmount: 1019.97,
      },
    }),
    prisma.order.create({
      data: {
        userId: adminUser.id,
        customerId: customers[2].id,
        orderNumber: generateOrderNumber(),
        status: 'PENDING',
        items: [
          { sku: 'ELC-SAMSUNG-TV-55', qty: 1, unitPrice: 599.99, totalPrice: 599.99 },
        ],
        totalAmount: 599.99,
      },
    }),
    prisma.order.create({
      data: {
        userId: adminUser.id,
        customerId: customers[3].id,
        orderNumber: generateOrderNumber(),
        status: 'DELIVERED',
        items: [
          { sku: 'APP-KITCHENAID-MIXER', qty: 2, unitPrice: 329.99, totalPrice: 659.98 },
          { sku: 'APP-DYSON-VACUUM-V15', qty: 1, unitPrice: 749.99, totalPrice: 749.99 },
        ],
        totalAmount: 1409.97,
      },
    }),
    prisma.order.create({
      data: {
        userId: adminUser.id,
        customerId: customers[4].id,
        orderNumber: generateOrderNumber(),
        status: 'PROCESSING',
        items: [
          { sku: 'APP-PATAGONIA-JACKET', qty: 1, unitPrice: 199.99, totalPrice: 199.99 },
          { sku: 'APP-NORTH-FACE-BACKPACK', qty: 2, unitPrice: 89.99, totalPrice: 179.98 },
          { sku: 'APP-RAY-BAN-AVIATOR', qty: 1, unitPrice: 154.99, totalPrice: 154.99 },
        ],
        totalAmount: 534.96,
      },
    }),
  ]);

  // 8. Create Shipments (at least 3 shipments)
  console.log('Creating shipments...');
  const shipments = await Promise.all([
    prisma.shipment.create({
      data: {
        orderId: orders[0].id,
        warehouseId: warehouses[0].id,
        carrierId: carriers[1].id, // UPS
        trackingNumber: generateTrackingNumber(),
        status: 'IN_TRANSIT',
        weight: 3.1,
        dimensions: { length: 35, width: 25, height: 15 },
        shippingCost: 15.50,
        labelUrl: 'https://example.com/labels/shipment-001.pdf',
        estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.shipment.create({
      data: {
        orderId: orders[1].id,
        warehouseId: warehouses[1].id,
        carrierId: carriers[0].id, // FedEx
        trackingNumber: generateTrackingNumber(),
        status: 'DELIVERED',
        weight: 2.4,
        dimensions: { length: 30, width: 20, height: 12 },
        shippingCost: 12.75,
        labelUrl: 'https://example.com/labels/shipment-002.pdf',
        estimatedDeliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        actualDeliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.shipment.create({
      data: {
        orderId: orders[3].id,
        warehouseId: warehouses[2].id,
        carrierId: carriers[2].id, // DHL
        trackingNumber: generateTrackingNumber(),
        status: 'SHIPPED',
        weight: 15.0,
        dimensions: { length: 40, width: 30, height: 25 },
        shippingCost: 25.00,
        labelUrl: 'https://example.com/labels/shipment-003.pdf',
        estimatedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.shipment.create({
      data: {
        orderId: orders[4].id,
        warehouseId: warehouses[0].id,
        carrierId: carriers[1].id, // UPS
        trackingNumber: generateTrackingNumber(),
        status: 'PACKED',
        weight: 1.8,
        dimensions: { length: 25, width: 20, height: 10 },
        shippingCost: 10.25,
        labelUrl: 'https://example.com/labels/shipment-004.pdf',
        estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  // 9. Create Chat Messages (5 messages: 2 for each user, 1 by assistant)
  console.log('Creating chat messages...');
  const chatMessages = await Promise.all([
    prisma.chatMessage.create({
      data: {
        userId: adminUser.id,
        role: 'USER',
        content: 'Can you help me track the status of order ORD-202412-123456?',
        metadata: { orderNumber: 'ORD-202412-123456' },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
    prisma.chatMessage.create({
      data: {
        userId: adminUser.id,
        role: 'ASSISTANT',
        content: 'I found order ORD-202412-123456. It\'s currently in PROCESSING status and is expected to ship within 24 hours. The order contains 2 iPhone 15s and 1 MacBook Air M3, totaling $2,699.97.',
        metadata: { 
          orderId: orders[0].id,
          responseType: 'order_status',
          confidence: 0.95
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30 * 1000), // 30 seconds later
      },
    }),
    prisma.chatMessage.create({
      data: {
        userId: operatorUser.id,
        role: 'USER',
        content: 'What\'s the inventory level for Nike Air Max 270 in the Chicago DC warehouse?',
        metadata: { productSku: 'APP-NIKE-AIR-MAX', warehouseName: 'Chicago DC' },
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
    }),
    prisma.chatMessage.create({
      data: {
        userId: operatorUser.id,
        role: 'USER',
        content: 'I need to create a new shipment for order ORD-202412-789012. Can you help me select the best carrier?',
        metadata: { orderNumber: 'ORD-202412-789012', action: 'create_shipment' },
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
    }),
    prisma.chatMessage.create({
      data: {
        userId: operatorUser.id,
        role: 'ASSISTANT',
        content: 'For order ORD-202412-789012, I recommend using FedEx Ground for this shipment. The package weighs 15.0 lbs and will cost approximately $25.00. Estimated delivery is 3 business days. Would you like me to create the shipment label?',
        metadata: { 
          orderId: orders[3].id,
          recommendedCarrier: 'FedEx',
          estimatedCost: 25.00,
          responseType: 'carrier_recommendation'
        },
        createdAt: new Date(Date.now() - 30 * 60 * 1000 + 15 * 1000), // 15 seconds later
      },
    }),
  ]);

  console.log('Database seeding completed successfully.');
  console.log('\nSummary:');
  console.log(`Users: 2 (1 ADMIN, 1 OPERATOR)`);
  console.log(`Warehouses: ${warehouses.length}`);
  console.log(`Products: ${products.length}`);
  console.log(`Inventory records: ${warehouses.length * products.length}`);
  console.log(`Customers: ${customers.length}`);
  console.log(`Carriers: ${carriers.length}`);
  console.log(`Orders: ${orders.length}`);
  console.log(`Shipments: ${shipments.length}`);
  console.log(`Chat messages: ${chatMessages.length}`);
  console.log('\nBlue Ship Sync database is ready for demo.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
