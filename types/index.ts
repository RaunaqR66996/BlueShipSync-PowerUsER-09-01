// Blue Ship Sync - Production TypeScript Types
// Generated to match the Prisma schema

export interface User {
  id: string;
  email: string;
  name?: string;
  company?: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Warehouse {
  id: string;
  userId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  totalSpace: number; // sq ft
  usedSpace: number;
  utilizationPct: number;
  status: WarehouseStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  userId: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  unitPrice: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inventory {
  id: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  binLocation: string;
  status: InventoryStatus;
  lastCountedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  preferredCarrier?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Carrier {
  id: string;
  name: string; // e.g. UPS, FedEx, DHL
  serviceLevel: string; // e.g. Ground, Express, Overnight
  estimatedDays?: number;
  baseRate?: number;
  perPoundRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  customerId: string;
  orderNumber: string;
  status: OrderStatus;
  items: Array<{
    sku: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shipment {
  id: string;
  orderId: string;
  warehouseId: string;
  carrierId: string;
  trackingNumber: string;
  status: ShipmentStatus;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingCost?: number;
  labelUrl?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: ChatRole;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
}

export enum SubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  NORMAL = 'NORMAL',
  PRO = 'PRO',
}

export enum WarehouseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum InventoryStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  DAMAGED = 'DAMAGED',
  QUARANTINE = 'QUARANTINE',
  EXPIRED = 'EXPIRED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum ShipmentStatus {
  CREATED = 'CREATED',
  PICKED = 'PICKED',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

export enum ChatRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  totalShipments: number;
  activeWarehouses: number;
  totalInventory: number;
  pendingDeliveries: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

// Extended types for complex queries
export interface WarehouseWithStats extends Warehouse {
  productCount: number;
  shipmentCount: number;
  utilizationRate: number;
}

export interface OrderWithDetails extends Order {
  customer: Customer;
  shipments: Shipment[];
}

export interface ShipmentWithDetails extends Shipment {
  order: Order;
  warehouse: Warehouse;
  carrier: Carrier;
}
