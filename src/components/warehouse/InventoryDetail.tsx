import { PrismaClient } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, MapPin, AlertTriangle } from 'lucide-react';

const prisma = new PrismaClient();

interface InventoryItem {
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

interface InventoryDetailProps {
  warehouseId: string;
  warehouseName: string;
  onBack: () => void;
}

async function getInventoryByWarehouse(warehouseId: string): Promise<InventoryItem[]> {
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

export async function InventoryDetail({ warehouseId, warehouseName, onBack }: InventoryDetailProps) {
  const inventory = await getInventoryByWarehouse(warehouseId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'default';
      case 'RESERVED':
        return 'secondary';
      case 'DAMAGED':
        return 'destructive';
      case 'QUARANTINE':
        return 'destructive';
      case 'EXPIRED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity < 50);
  };

  const lowStockItems = getLowStockItems();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{warehouseName}</h2>
          <p className="text-muted-foreground">
            Inventory management and stock levels
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {lowStockItems.length} items are running low on stock
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {inventory.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{item.product.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    SKU: {item.product.sku}
                  </div>
                </div>
                <Badge variant={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Image */}
              {item.product.imageUrl && (
                <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Stock Information */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className={`font-medium ${item.quantity < 50 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                    {item.quantity} units
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bin Location</span>
                  <span className="font-medium">{item.binLocation}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span className="font-medium">${item.product.unitPrice.toFixed(2)}</span>
                </div>
                {item.product.weight && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="font-medium">{item.product.weight} lbs</span>
                  </div>
                )}
              </div>

              {/* Category */}
              {item.product.category && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>{item.product.category}</span>
                </div>
              )}

              {/* Last Counted */}
              <div className="pt-2 border-t text-xs text-muted-foreground">
                Last counted: {item.lastCountedAt 
                  ? new Date(item.lastCountedAt).toLocaleDateString()
                  : 'Never'
                }
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {inventory.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No inventory found</h3>
            <p className="text-sm">
              This warehouse doesn't have any inventory items yet.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}


