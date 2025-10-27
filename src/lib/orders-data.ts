import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface OrderWithDetails {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  items: any; // JSON field
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  shipments: ShipmentWithDetails[];
}

export interface ShipmentWithDetails {
  id: string;
  trackingNumber: string;
  status: string;
  weight: number | null;
  shippingCost: number | null;
  estimatedDeliveryDate: Date | null;
  actualDeliveryDate: Date | null;
  createdAt: Date;
  carrier: {
    id: string;
    name: string;
    serviceLevel: string;
  };
  warehouse: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  customerName: string;
  customerEmail: string | null;
  shipmentCount: number;
  itemsCount: number;
}

/**
 * Get all orders with basic details for listing
 */
export async function getAllOrders(): Promise<OrderSummary[]> {
  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        items: true,
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        shipments: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      shipmentCount: order.shipments.length,
      itemsCount: Array.isArray(order.items) ? order.items.length : 0,
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Get detailed order information including shipments
 */
export async function getOrderDetails(orderId: string): Promise<OrderWithDetails | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        shipments: {
          include: {
            carrier: {
              select: {
                id: true,
                name: true,
                serviceLevel: true,
              },
            },
            warehouse: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return order;
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
}

/**
 * Get all shipments with details
 */
export async function getAllShipments(): Promise<ShipmentWithDetails[]> {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        carrier: {
          select: {
            id: true,
            name: true,
            serviceLevel: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            customer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return shipments.map(shipment => ({
      id: shipment.id,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      weight: shipment.weight,
      shippingCost: shipment.shippingCost,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      actualDeliveryDate: shipment.actualDeliveryDate,
      createdAt: shipment.createdAt,
      carrier: shipment.carrier,
      warehouse: shipment.warehouse,
      order: shipment.order,
    }));
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return [];
  }
}

/**
 * Get order statistics
 */
export async function getOrderStats() {
  try {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      totalRevenue: 0,
    };
  }
}

/**
 * Get shipment statistics
 */
export async function getShipmentStats() {
  try {
    const [
      totalShipments,
      createdShipments,
      inTransitShipments,
      deliveredShipments,
      totalShippingCost,
    ] = await Promise.all([
      prisma.shipment.count(),
      prisma.shipment.count({ where: { status: 'CREATED' } }),
      prisma.shipment.count({ where: { status: 'IN_TRANSIT' } }),
      prisma.shipment.count({ where: { status: 'DELIVERED' } }),
      prisma.shipment.aggregate({
        _sum: {
          shippingCost: true,
        },
      }),
    ]);

    return {
      totalShipments,
      createdShipments,
      inTransitShipments,
      deliveredShipments,
      totalShippingCost: totalShippingCost._sum.shippingCost || 0,
    };
  } catch (error) {
    console.error('Error fetching shipment stats:', error);
    return {
      totalShipments: 0,
      createdShipments: 0,
      inTransitShipments: 0,
      deliveredShipments: 0,
      totalShippingCost: 0,
    };
  }
}


