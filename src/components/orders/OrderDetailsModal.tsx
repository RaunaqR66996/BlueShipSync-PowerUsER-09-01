'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Truck,
  Calendar,
  DollarSign,
  Weight,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { getOrderDetails, type OrderWithDetails } from '@/lib/orders-data';

interface OrderDetailsModalProps {
  orderId: string;
  children: React.ReactNode;
}

export function OrderDetailsModal({ orderId, children }: OrderDetailsModalProps) {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const loadOrderDetails = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const orderData = await getOrderDetails(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to load order details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadOrderDetails();
    }
  }, [open, orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'secondary';
      case 'PROCESSING':
        return 'default';
      case 'SHIPPED':
        return 'default';
      case 'DELIVERED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getShipmentStatusColor = (status: string) => {
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatWeight = (weight: number | null) => {
    if (!weight) return 'N/A';
    return `${weight} lbs`;
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Order Details - {order?.orderNumber || 'Loading...'}
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading order details...</p>
              </div>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Order Status</div>
                      <Badge variant={getStatusColor(order.status)} className="text-sm">
                        {order.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Created</div>
                      <div className="text-sm">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Customer Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{order.customer.name}</span>
                      </div>
                      {order.customer.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{order.customer.email}</span>
                        </div>
                      )}
                      {order.customer.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{order.customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Order Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="w-[100px] text-right">Quantity</TableHead>
                        <TableHead className="w-[100px] text-right">Unit Price</TableHead>
                        <TableHead className="w-[100px] text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(order.items) ? order.items.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                          <TableCell>{item.name || 'Unknown Product'}</TableCell>
                          <TableCell className="text-right">{item.qty}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No items found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Shipments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="h-5 w-5" />
                    <span>Shipments ({order.shipments.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order.shipments.length > 0 ? (
                    <div className="space-y-4">
                      {order.shipments.map((shipment) => (
                        <Card key={shipment.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Tracking Number</div>
                                <div className="font-mono text-sm font-medium">
                                  {shipment.trackingNumber}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Status</div>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(shipment.status)}
                                  <Badge variant={getShipmentStatusColor(shipment.status)}>
                                    {shipment.status}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Carrier</div>
                                <div className="text-sm">
                                  {shipment.carrier.name} ({shipment.carrier.serviceLevel})
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Warehouse</div>
                                <div className="text-sm">
                                  {shipment.warehouse.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {shipment.warehouse.city}, {shipment.warehouse.state}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Weight</div>
                                <div className="text-sm">{formatWeight(shipment.weight)}</div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Shipping Cost</div>
                                <div className="text-sm">
                                  {shipment.shippingCost ? formatCurrency(shipment.shippingCost) : 'N/A'}
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Estimated Delivery</div>
                                <div className="text-sm">
                                  {formatDate(shipment.estimatedDeliveryDate)}
                                </div>
                              </div>
                            </div>
                            
                            {shipment.actualDeliveryDate && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="flex items-center space-x-2 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    Delivered on {formatDate(shipment.actualDeliveryDate)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No shipments found for this order.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Failed to load order details.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}


