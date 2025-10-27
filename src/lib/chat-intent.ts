import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ChatIntent {
  type: 'inventory_query' | 'warehouse_query' | 'general' | 'unknown';
  warehouseName?: string;
  warehouseId?: string;
  confidence: number;
  originalQuery: string;
}

export interface InventoryResponse {
  warehouseName: string;
  totalItems: number;
  totalUnits: number;
  lowStockItems: number;
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    binLocation: string;
    status: string;
    category?: string;
  }>;
}

/**
 * Parse user intent from chat message
 */
export function parseChatIntent(message: string): ChatIntent {
  const query = message.toLowerCase().trim();
  
  // Inventory query patterns
  const inventoryPatterns = [
    /show me inventory for (.+)/i,
    /inventory for (.+)/i,
    /what's in (.+)/i,
    /show (.+) inventory/i,
    /(.+) stock/i,
    /(.+) inventory/i,
  ];

  // Warehouse query patterns
  const warehousePatterns = [
    /show me warehouses/i,
    /list warehouses/i,
    /warehouse list/i,
    /all warehouses/i,
  ];

  // Check for inventory queries
  for (const pattern of inventoryPatterns) {
    const match = query.match(pattern);
    if (match) {
      const warehouseName = match[1].trim();
      return {
        type: 'inventory_query',
        warehouseName,
        confidence: 0.9,
        originalQuery: message,
      };
    }
  }

  // Check for warehouse queries
  for (const pattern of warehousePatterns) {
    if (pattern.test(query)) {
      return {
        type: 'warehouse_query',
        confidence: 0.8,
        originalQuery: message,
      };
    }
  }

  // General queries
  if (query.includes('help') || query.includes('what can you do')) {
    return {
      type: 'general',
      confidence: 0.7,
      originalQuery: message,
    };
  }

  return {
    type: 'unknown',
    confidence: 0.1,
    originalQuery: message,
  };
}

/**
 * Find warehouse by name (fuzzy matching)
 */
export async function findWarehouseByName(warehouseName: string): Promise<string | null> {
  try {
    const warehouses = await prisma.warehouse.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const normalizedQuery = warehouseName.toLowerCase().trim();
    
    // Exact match
    const exactMatch = warehouses.find(
      w => w.name.toLowerCase() === normalizedQuery
    );
    if (exactMatch) return exactMatch.id;

    // Partial match
    const partialMatch = warehouses.find(
      w => w.name.toLowerCase().includes(normalizedQuery) ||
           normalizedQuery.includes(w.name.toLowerCase())
    );
    if (partialMatch) return partialMatch.id;

    // Fuzzy match (first word)
    const firstWord = normalizedQuery.split(' ')[0];
    const fuzzyMatch = warehouses.find(
      w => w.name.toLowerCase().includes(firstWord)
    );
    if (fuzzyMatch) return fuzzyMatch.id;

    return null;
  } catch (error) {
    console.error('Error finding warehouse:', error);
    return null;
  }
}

/**
 * Get inventory data for a warehouse
 */
export async function getInventoryForWarehouse(warehouseId: string): Promise<InventoryResponse | null> {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
      select: { name: true },
    });

    if (!warehouse) return null;

    const inventory = await prisma.inventory.findMany({
      where: { warehouseId },
      include: {
        product: {
          select: {
            sku: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        product: {
          name: 'asc',
        },
      },
    });

    const items = inventory.map(item => ({
      sku: item.product.sku,
      name: item.product.name,
      quantity: item.quantity,
      binLocation: item.binLocation,
      status: item.status,
      category: item.product.category || undefined,
    }));

    const totalItems = inventory.length;
    const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = inventory.filter(item => item.quantity < 50).length;

    return {
      warehouseName: warehouse.name,
      totalItems,
      totalUnits,
      lowStockItems,
      items,
    };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return null;
  }
}

/**
 * Get all warehouses summary
 */
export async function getAllWarehousesSummary() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
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

/**
 * Format inventory response for chat
 */
export function formatInventoryResponse(data: InventoryResponse): string {
  let response = `📦 **${data.warehouseName} Inventory**\n\n`;
  
  response += `**Summary:**\n`;
  response += `• Total Items: ${data.totalItems}\n`;
  response += `• Total Units: ${data.totalUnits.toLocaleString()}\n`;
  response += `• Low Stock Items: ${data.lowStockItems}\n\n`;

  if (data.items.length === 0) {
    response += `This warehouse is currently empty.`;
    return response;
  }

  response += `**Inventory Details:**\n`;
  
  // Group by category if available
  const categories = [...new Set(data.items.map(item => item.category).filter(Boolean))];
  
  if (categories.length > 1) {
    categories.forEach(category => {
      const categoryItems = data.items.filter(item => item.category === category);
      response += `\n**${category}:**\n`;
      categoryItems.forEach(item => {
        response += `• ${item.name} (${item.sku}): ${item.quantity} units in bin ${item.binLocation} - ${item.status}\n`;
      });
    });
  } else {
    data.items.forEach(item => {
      response += `• ${item.name} (${item.sku}): ${item.quantity} units in bin ${item.binLocation} - ${item.status}\n`;
    });
  }

  if (data.lowStockItems > 0) {
    response += `\n⚠️ **Alert:** ${data.lowStockItems} items are running low on stock!`;
  }

  return response;
}

/**
 * Format warehouses summary for chat
 */
export function formatWarehousesResponse(warehouses: any[]): string {
  let response = `🏭 **Warehouse Overview**\n\n`;
  
  if (warehouses.length === 0) {
    response += `No warehouses found.`;
    return response;
  }

  warehouses.forEach(warehouse => {
    response += `**${warehouse.name}**\n`;
    response += `• Location: ${warehouse.city}, ${warehouse.state}\n`;
    response += `• Utilization: ${warehouse.utilizationPct.toFixed(1)}%\n`;
    response += `• Status: ${warehouse.status}\n\n`;
  });

  response += `💡 **Tip:** Ask "Show me inventory for [warehouse name]" to see detailed inventory.`;
  
  return response;
}


