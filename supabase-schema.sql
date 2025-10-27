-- Blue Ship Sync Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (enums)
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'OPERATOR');
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'NORMAL', 'PRO');
CREATE TYPE "WarehouseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');
CREATE TYPE "InventoryStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'DAMAGED', 'QUARANTINE', 'EXPIRED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "ShipmentStatus" AS ENUM ('CREATED', 'PICKED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED', 'CANCELLED');
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- Create tables
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  name text,
  company text,
  role "UserRole" DEFAULT 'OPERATOR'::"UserRole",
  subscriptionTier "SubscriptionTier" DEFAULT 'FREE'::"SubscriptionTier",
  trialEndsAt timestamp with time zone,
  createdAt timestamp with time zone DEFAULT now(),
  updatedAt timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE public.warehouses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  userId uuid NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zipCode text NOT NULL,
  country text NOT NULL,
  totalSpace integer NOT NULL,
  usedSpace integer DEFAULT 0,
  utilizationPct double precision DEFAULT 0.0,
  status "WarehouseStatus" DEFAULT 'ACTIVE'::"WarehouseStatus",
  createdAt timestamp with time zone DEFAULT now(),
  updatedAt timestamp with time zone DEFAULT now(),
  CONSTRAINT warehouses_pkey PRIMARY KEY (id),
  CONSTRAINT warehouses_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  userId uuid NOT NULL,
  sku text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text,
  weight double precision,
  dimensions jsonb,
  unitPrice double precision NOT NULL,
  imageUrl text,
  createdAt timestamp with time zone DEFAULT now(),
  updatedAt timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.inventory (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  warehouseId uuid NOT NULL,
  productId uuid NOT NULL,
  quantity integer NOT NULL,
  binLocation text NOT NULL,
  status "InventoryStatus" DEFAULT 'AVAILABLE'::"InventoryStatus",
  lastCountedAt timestamp with time zone,
  createdAt timestamp with time zone DEFAULT now(),
  updatedAt timestamp with time zone DEFAULT now(),
  CONSTRAINT inventory_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_warehouseId_fkey FOREIGN KEY (warehouseId) REFERENCES public.warehouses(id) ON DELETE CASCADE,
  CONSTRAINT inventory_productId_fkey FOREIGN KEY (productId) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT inventory_warehouse_product_unique UNIQUE (warehouseId, productId)
);

CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  userId uuid NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  shippingAddress jsonb,
  billingAddress jsonb,
  preferredCarrier text,
  createdAt timestamp with time zone DEFAULT now(),
  updatedAt timestamp with time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id),
  CONSTRAINT customers_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.carriers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  serviceLevel text NOT NULL,
  estimatedDays integer,
  baseRate double precision,
  perPoundRate double precision,
  createdAt timestamp with time zone DEFAULT now(),
  updatedAt timestamp with time zone DEFAULT now(),
  CONSTRAINT carriers_pkey PRIMARY KEY (id)
);

CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  userId uuid NOT NULL,
  customerId uuid NOT NULL,
  orderNumber text NOT NULL UNIQUE,
  status "OrderStatus" DEFAULT 'PENDING'::"OrderStatus",
  items jsonb NOT NULL,
  totalAmount double precision NOT NULL,
  createdAt timestamp with time zone DEFAULT now(),
  updatedAt timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT orders_customerId_fkey FOREIGN KEY (customerId) REFERENCES public.customers(id) ON DELETE CASCADE
);

CREATE TABLE public.shipments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  orderId uuid NOT NULL,
  warehouseId uuid NOT NULL,
  carrierId uuid NOT NULL,
  trackingNumber text NOT NULL UNIQUE,
  status "ShipmentStatus" DEFAULT 'CREATED'::"ShipmentStatus",
  weight double precision,
  dimensions jsonb,
  shippingCost double precision,
  labelUrl text,
  estimatedDeliveryDate timestamp with time zone,
  actualDeliveryDate timestamp with time zone,
  createdAt timestamp with time zone DEFAULT now(),
  updatedAt timestamp with time zone DEFAULT now(),
  CONSTRAINT shipments_pkey PRIMARY KEY (id),
  CONSTRAINT shipments_orderId_fkey FOREIGN KEY (orderId) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT shipments_warehouseId_fkey FOREIGN KEY (warehouseId) REFERENCES public.warehouses(id) ON DELETE CASCADE,
  CONSTRAINT shipments_carrierId_fkey FOREIGN KEY (carrierId) REFERENCES public.carriers(id)
);

CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  userId uuid NOT NULL,
  role "ChatRole" DEFAULT 'USER'::"ChatRole",
  content text NOT NULL,
  metadata jsonb,
  createdAt timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX user_email_idx ON public.users(email);
CREATE INDEX warehouse_user_idx ON public.warehouses(userId);
CREATE INDEX product_sku_idx ON public.products(sku);
CREATE INDEX product_user_idx ON public.products(userId);
CREATE INDEX inventory_warehouse_idx ON public.inventory(warehouseId);
CREATE INDEX inventory_product_idx ON public.inventory(productId);
CREATE INDEX inventory_status_idx ON public.inventory(status);
CREATE INDEX customer_user_idx ON public.customers(userId);
CREATE INDEX customer_email_idx ON public.customers(email);
CREATE INDEX carrier_name_idx ON public.carriers(name);
CREATE INDEX order_number_idx ON public.orders(orderNumber);
CREATE INDEX order_user_idx ON public.orders(userId);
CREATE INDEX order_customer_idx ON public.orders(customerId);
CREATE INDEX order_status_idx ON public.orders(status);
CREATE INDEX shipment_tracking_idx ON public.shipments(trackingNumber);
CREATE INDEX shipment_order_idx ON public.shipments(orderId);
CREATE INDEX shipment_warehouse_idx ON public.shipments(warehouseId);
CREATE INDEX shipment_carrier_idx ON public.shipments(carrierId);
CREATE INDEX shipment_status_idx ON public.shipments(status);
CREATE INDEX chat_user_idx ON public.chat_messages(userId);
CREATE INDEX chat_created_at_idx ON public.chat_messages(createdAt);
