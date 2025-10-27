import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface WarehouseDetail {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  totalSpace: number;
  usedSpace: number;
  utilizationPct: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  quantity: number;
  binLocation: string;
  status: string;
  lastCountedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    category: string | null;
    weight: number | null;
    dimensions: any; // JSON field
    unitPrice: number;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface ProductDetail {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  weight: number | null;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
  } | null;
  unitPrice: number;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryFilters {
  search?: string;
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedInventory {
  items: InventoryItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Get warehouse details by ID
 */
export async function getWarehouseById(warehouseId: string): Promise<WarehouseDetail | null> {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        totalSpace: true,
        usedSpace: true,
        utilizationPct: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return warehouse;
  } catch (error) {
    console.error('Error fetching warehouse:', error);
    return null;
  }
}

/**
 * Get paginated inventory for a warehouse with filters
 */
export async function getWarehouseInventory(
  warehouseId: string,
  filters: InventoryFilters = {}
): Promise<PaginatedInventory> {
  try {
    const {
      search = '',
      status = '',
      category = '',
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      warehouseId,
    };

    // Add search filter
    if (search) {
      where.OR = [
        { product: { sku: { contains: search, mode: 'insensitive' } } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { binLocation: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Add category filter
    if (category && category !== 'all') {
      where.product = {
        ...where.product,
        category: category,
      };
    }

    // Get total count
    const totalCount = await prisma.inventory.count({ where });

    // Get paginated results
    const items = await prisma.inventory.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            description: true,
            category: true,
            weight: true,
            dimensions: true,
            unitPrice: true,
            imageUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: [
        { product: { name: 'asc' } },
        { binLocation: 'asc' },
      ],
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      items,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  } catch (error) {
    console.error('Error fetching warehouse inventory:', error);
    return {
      items: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }
}

/**
 * Get product details by SKU
 */
export async function getProductBySku(sku: string): Promise<ProductDetail | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { sku },
      select: {
        id: true,
        sku: true,
        name: true,
        description: true,
        category: true,
        weight: true,
        dimensions: true,
        unitPrice: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Get unique categories for filtering
 */
export async function getInventoryCategories(warehouseId: string): Promise<string[]> {
  try {
    const categories = await prisma.inventory.findMany({
      where: { warehouseId },
      select: {
        product: {
          select: {
            category: true,
          },
        },
      },
    });

    const uniqueCategories = Array.from(
      new Set(
        categories
          .map(item => item.product.category)
          .filter(Boolean)
      )
    ) as string[];

    return uniqueCategories.sort();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Get inventory statistics for a warehouse
 */
export async function getWarehouseInventoryStats(warehouseId: string) {
  try {
    const [
      totalItems,
      totalUnits,
      lowStockItems,
      statusCounts,
      totalValue,
    ] = await Promise.all([
      prisma.inventory.count({ where: { warehouseId } }),
      prisma.inventory.aggregate({
        where: { warehouseId },
        _sum: { quantity: true },
      }),
      prisma.inventory.count({
        where: {
          warehouseId,
          quantity: { lt: 50 },
        },
      }),
      prisma.inventory.groupBy({
        by: ['status'],
        where: { warehouseId },
        _count: { id: true },
      }),
      prisma.inventory.findMany({
        where: { warehouseId },
        select: {
          quantity: true,
          product: {
            select: {
              unitPrice: true,
            },
          },
        },
      }),
    ]);

    const calculatedTotalValue = totalValue.reduce(
      (sum, item) => sum + (item.quantity * item.product.unitPrice),
      0
    );

    return {
      totalItems,
      totalUnits: totalUnits._sum.quantity || 0,
      lowStockItems,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      totalValue: calculatedTotalValue,
    };
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    return {
      totalItems: 0,
      totalUnits: 0,
      lowStockItems: 0,
      statusCounts: {},
      totalValue: 0,
    };
  }
}


