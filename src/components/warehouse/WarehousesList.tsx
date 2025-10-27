import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, TrendingUp } from 'lucide-react';

const prisma = new PrismaClient();

interface Warehouse {
  id: string;
  name: string;
  city: string;
  state: string;
  totalSpace: number;
  usedSpace: number;
  utilizationPct: number;
  status: string;
}

async function getWarehouses(): Promise<Warehouse[]> {
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
    });
    return warehouses;
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return [];
  }
}

interface WarehousesListProps {
  onWarehouseClick?: (warehouseId: string, warehouseName: string) => void;
}

export async function WarehousesList({ onWarehouseClick }: WarehousesListProps) {
  const warehouses = await getWarehouses();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Warehouses</h2>
          <p className="text-muted-foreground">
            Manage your warehouse locations and monitor utilization
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          <span>{warehouses.length} warehouses</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {warehouses.map((warehouse) => (
          <Link key={warehouse.id} href={`/dashboard/warehouses/${warehouse.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                <Badge variant={getStatusColor(warehouse.status)}>
                  {warehouse.status}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {warehouse.city}, {warehouse.state}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Utilization</span>
                  <span className="font-medium">{warehouse.utilizationPct.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={warehouse.utilizationPct} 
                  className="h-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Space</div>
                  <div className="font-medium">
                    {warehouse.totalSpace.toLocaleString()} sq ft
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Used Space</div>
                  <div className="font-medium">
                    {warehouse.usedSpace.toLocaleString()} sq ft
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>Active</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: 2 hours ago
                </div>
              </div>
            </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {warehouses.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No warehouses found</h3>
            <p className="text-sm">
              Get started by adding your first warehouse location.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
