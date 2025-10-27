'use client';

import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Package, 
  MapPin, 
  Calendar,
  DollarSign,
  Weight,
  Ruler,
  Tag,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { ProductDetail, InventoryItem } from '@/lib/warehouse-detail';

interface ProductDetailsDrawerProps {
  product: ProductDetail;
  inventory: InventoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsDrawer({ 
  product, 
  inventory, 
  open, 
  onOpenChange 
}: ProductDetailsDrawerProps) {
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

  const getQuantityColor = (quantity: number) => {
    if (quantity < 10) return 'text-red-600 dark:text-red-400';
    if (quantity < 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDimensions = (dimensions: any) => {
    if (!dimensions) return 'N/A';
    const { length, width, height } = dimensions;
    if (length && width && height) {
      return `${length}" × ${width}" × ${height}"`;
    }
    return 'N/A';
  };

  const formatWeight = (weight: number | null) => {
    if (!weight) return 'N/A';
    return `${weight} lbs`;
  };

  const isLowStock = inventory.quantity < 50;
  const isCriticalStock = inventory.quantity < 10;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} side="right">
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Product Details</span>
            </DrawerTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="space-y-6">
          {/* Product Image */}
          {product.imageUrl && (
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">SKU</span>
                </div>
                <div className="font-mono text-sm">{product.sku}</div>
              </div>

              {product.description && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Description</div>
                  <div className="text-sm text-muted-foreground">{product.description}</div>
                </div>
              )}

              {product.category && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Category</div>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Unit Price</span>
                  </div>
                  <div className="text-lg font-semibold">{formatCurrency(product.unitPrice)}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Weight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Weight</span>
                  </div>
                  <div className="text-sm">{formatWeight(product.weight)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Dimensions</span>
                </div>
                <div className="text-sm">{formatDimensions(product.dimensions)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Inventory Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Quantity</div>
                  <div className={`text-2xl font-bold ${getQuantityColor(inventory.quantity)}`}>
                    {inventory.quantity}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Status</div>
                  <Badge variant={getStatusColor(inventory.status)}>
                    {inventory.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Bin Location</span>
                </div>
                <div className="font-mono text-lg">{inventory.binLocation}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Last Counted</span>
                </div>
                <div className="text-sm">{formatDate(inventory.lastCountedAt)}</div>
              </div>

              {/* Stock Alerts */}
              {isCriticalStock && (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Critical Stock Level - Reorder Immediately
                  </span>
                </div>
              )}

              {isLowStock && !isCriticalStock && (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Low Stock Level - Consider Reordering
                  </span>
                </div>
              )}

              {!isLowStock && (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Stock Level is Adequate
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Created</div>
                <div className="text-sm text-muted-foreground">{formatDate(product.createdAt)}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Last Updated</div>
                <div className="text-sm text-muted-foreground">{formatDate(product.updatedAt)}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Inventory Last Counted</div>
                <div className="text-sm text-muted-foreground">{formatDate(inventory.lastCountedAt)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
}


