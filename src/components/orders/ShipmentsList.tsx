import React from 'react';
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
import { 
  Truck, 
  Package, 
  Calendar,
  DollarSign,
  Weight,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { getAllShipments, getShipmentStats } from '@/lib/orders-data';

export async function ShipmentsList() {
  const [shipments, stats] = await Promise.all([
    getAllShipments(),
    getShipmentStats(),
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED':
        return 'secondary';
      case 'PICKED':
        return 'default';
      case 'PACKED':
        return 'default';
      case 'SHIPPED':
        return 'default';
      case 'IN_TRANSIT':
        return 'default';
      case 'DELIVERED':
        return 'default';
      case 'RETURNED':
        return 'destructive';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
      case 'RETURNED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatWeight = (weight: number | null) => {
    if (!weight) return 'N/A';
    return `${weight} lbs`;
  };

  const getTrackingUrl = (trackingNumber: string, carrierName: string) => {
    const baseUrls: { [key: string]: string } = {
      'UPS': 'https://www.ups.com/track?track=yes&trackNums=',
      'FedEx': 'https://www.fedex.com/fedextrack/?trknbr=',
      'DHL': 'https://www.dhl.com/us-en/home/tracking.html?submit=1&tracking-id=',
    };
    
    const baseUrl = baseUrls[carrierName] || '';
    return baseUrl + trackingNumber;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Shipments</h2>
          <p className="text-muted-foreground">
            Track and manage all shipments across warehouses
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Truck className="h-4 w-4" />
          <span>{shipments.length} shipments</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalShipments}</div>
                <div className="text-xs text-muted-foreground">Total Shipments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{stats.createdShipments}</div>
                <div className="text-xs text-muted-foreground">Created</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.inTransitShipments}</div>
                <div className="text-xs text-muted-foreground">In Transit</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.deliveredShipments}</div>
                <div className="text-xs text-muted-foreground">Delivered</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalShippingCost)}</div>
                <div className="text-xs text-muted-foreground">Total Shipping Cost</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Tracking #</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px] text-right">Weight</TableHead>
                <TableHead className="w-[100px] text-right">Cost</TableHead>
                <TableHead className="w-[120px]">Created</TableHead>
                <TableHead className="w-[120px]">Est. Delivery</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-mono text-sm">
                    {shipment.trackingNumber}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{shipment.order.orderNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {shipment.order.customer.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{shipment.order.customer.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{shipment.carrier.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {shipment.carrier.serviceLevel}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{shipment.warehouse.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {shipment.warehouse.city}, {shipment.warehouse.state}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(shipment.status)}
                      <Badge variant={getStatusColor(shipment.status)}>
                        {shipment.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Weight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{formatWeight(shipment.weight)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {shipment.shippingCost ? formatCurrency(shipment.shippingCost) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(shipment.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(shipment.estimatedDeliveryDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={getTrackingUrl(shipment.trackingNumber, shipment.carrier.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Empty State */}
      {shipments.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No shipments found</h3>
            <p className="text-sm">
              Shipments will appear here once orders are processed and shipped.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}


