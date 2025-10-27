'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Package, 
  MapPin,
  AlertTriangle,
  Download,
  Loader2
} from 'lucide-react';
import { getInventoryByWarehouse, getWarehouseById, type InventoryItem } from '@/lib/data';
import { InventoryFilters } from './InventoryFilters';

interface InventoryTableProps {
  warehouseId: string;
  warehouseName: string;
  onBack: () => void;
}

export function InventoryTableServer({ warehouseId, warehouseName, onBack }: InventoryTableProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouse, setWarehouse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [inventoryData, warehouseData] = await Promise.all([
          getInventoryByWarehouse(warehouseId),
          getWarehouseById(warehouseId)
        ]);
        setInventory(inventoryData);
        setWarehouse(warehouseData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [warehouseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">Loading inventory...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Warehouses
          </Button>
        </div>
      </div>
    );
  }

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
    return new Date(date).toLocaleDateString();
  };

  // Get low stock items
  const lowStockItems = inventory.filter(item => item.quantity < 50);
  
  // Calculate totals
  const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = inventory.reduce((sum, item) => 
    sum + (item.product.unitPrice * item.quantity), 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {warehouse?.name || warehouseName}
            </h2>
            <p className="text-muted-foreground">
              Inventory Management - {inventory.length} items
              {warehouse && (
                <span className="ml-2">
                  • {warehouse.city}, {warehouse.state}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {lowStockItems.length} items are running low on stock (less than 50 units)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <InventoryFilters inventory={inventory} />

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead className="w-[100px] text-right">Quantity</TableHead>
                <TableHead className="w-[100px]">Bin Location</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[100px] text-right">Unit Price</TableHead>
                <TableHead className="w-[120px]">Last Counted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.product.sku}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {item.product.imageUrl && (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        {item.product.weight && (
                          <div className="text-xs text-muted-foreground">
                            {item.product.weight} lbs
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{item.product.category || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${getQuantityColor(item.quantity)}`}>
                      {item.quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{item.binLocation}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.product.unitPrice)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(item.lastCountedAt)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Empty State */}
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

      {/* Summary Stats */}
      {inventory.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {inventory.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalUnits.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Units</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {lowStockItems.length}
                </div>
                <div className="text-sm text-muted-foreground">Low Stock</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalValue)}
                </div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
