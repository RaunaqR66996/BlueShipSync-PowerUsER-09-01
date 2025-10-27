import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  MapPin, 
  Activity, 
  Package,
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { WarehouseDetail } from '@/lib/warehouse-detail';

interface WarehouseHeaderProps {
  warehouse: WarehouseDetail;
  stats: {
    totalItems: number;
    totalUnits: number;
    lowStockItems: number;
    totalValue: number;
  };
  onBack: () => void;
}

export function WarehouseHeader({ warehouse, stats, onBack }: WarehouseHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'MAINTENANCE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'bg-red-500';
    if (utilization >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
          <p className="text-muted-foreground">Warehouse Details & Inventory Management</p>
        </div>
      </div>

      {/* Warehouse Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Warehouse Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Address */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Address</div>
              <div className="text-sm">
                <div>{warehouse.address}</div>
                <div>{warehouse.city}, {warehouse.state} {warehouse.zipCode}</div>
                <div>{warehouse.country}</div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusColor(warehouse.status)}>
                  {warehouse.status}
                </Badge>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Utilization */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Utilization</div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{warehouse.utilizationPct.toFixed(1)}%</span>
                  <span className="text-muted-foreground">
                    {warehouse.usedSpace.toLocaleString()} / {warehouse.totalSpace.toLocaleString()} sq ft
                  </span>
                </div>
                <Progress 
                  value={warehouse.utilizationPct} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Last Updated */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(warehouse.updatedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
                <div className="text-xs text-muted-foreground">Total Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalUnits.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Units</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{stats.lowStockItems}</div>
                <div className="text-xs text-muted-foreground">Low Stock</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-blue-500" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                <div className="text-xs text-muted-foreground">Total Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockItems > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {stats.lowStockItems} items are running low on stock (less than 50 units)
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


