import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface InventoryItem {
  id: string;
  quantity: number;
  binLocation: string;
  status: string;
  lastCountedAt: Date | null;
  product: {
    id: string;
    sku: string;
    name: string;
    category: string | null;
    weight: number | null;
    unitPrice: number;
    imageUrl: string | null;
  };
}

export interface Warehouse {
  id: string;
  name: string;
  city: string;
  state: string;
  totalSpace: number;
  usedSpace: number;
  utilizationPct: number;
  status: string;
}

export async function getWarehouses(): Promise<Warehouse[]> {
  try {
    const warehouses = await prisma.warehouse.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        totalSpace: true,
        usedSpace: true,
        utilizationPct: true,
        status: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return warehouses;
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return [];
  }
}

export async function getInventoryByWarehouse(warehouseId: string): Promise<InventoryItem[]> {
  try {
    const inventory = await prisma.inventory.findMany({
      where: { warehouseId },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            weight: true,
            unitPrice: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        product: {
          name: 'asc',
        },
      },
    });
    return inventory;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
}

export async function getWarehouseById(warehouseId: string): Promise<Warehouse | null> {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        totalSpace: true,
        usedSpace: true,
        utilizationPct: true,
        status: true,
      },
    });
    return warehouse;
  } catch (error) {
    console.error('Error fetching warehouse:', error);
    return null;
  }
}

export async function getInventoryStats(warehouseId: string) {
  try {
    const stats = await prisma.inventory.groupBy({
      by: ['status'],
      where: { warehouseId },
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
      },
    });

    const totalItems = await prisma.inventory.count({
      where: { warehouseId },
    });

    const totalValue = await prisma.inventory.aggregate({
      where: { warehouseId },
      _sum: {
        quantity: true,
      },
    });

    return {
      totalItems,
      statsByStatus: stats,
      totalValue,
    };
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    return {
      totalItems: 0,
      statsByStatus: [],
      totalValue: { _sum: { quantity: 0 } },
    };
  }
}


