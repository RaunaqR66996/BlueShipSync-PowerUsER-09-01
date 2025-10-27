import React from 'react';
import { notFound } from 'next/navigation';
import { WarehouseDetailClient } from './WarehouseDetailClient';
import { 
  getWarehouseById, 
  getWarehouseInventory, 
  getInventoryCategories,
  getWarehouseInventoryStats,
  type InventoryFilters 
} from '@/lib/warehouse-detail';
import { WarehouseDetailClient } from './WarehouseDetailClient';

interface WarehouseDetailPageProps {
  params: {
    id: string;
  };
  searchParams: {
    search?: string;
    status?: string;
    category?: string;
    page?: string;
  };
}

export default async function WarehouseDetailPage({ 
  params, 
  searchParams 
}: WarehouseDetailPageProps) {
  const warehouseId = params.id;
  
  // Parse search params
  const filters: InventoryFilters = {
    search: searchParams.search || '',
    status: searchParams.status || 'all',
    category: searchParams.category || 'all',
    page: parseInt(searchParams.page || '1'),
    limit: 20,
  };

  // Fetch data in parallel
  const [
    warehouse,
    inventoryData,
    categories,
    stats,
  ] = await Promise.all([
    getWarehouseById(warehouseId),
    getWarehouseInventory(warehouseId, filters),
    getInventoryCategories(warehouseId),
    getWarehouseInventoryStats(warehouseId),
  ]);

  // Handle warehouse not found
  if (!warehouse) {
    notFound();
  }

  return (
    <WarehouseDetailClient
      warehouse={warehouse}
      initialInventory={inventoryData}
      categories={categories}
      stats={stats}
    />
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }) {
  const warehouse = await getWarehouseById(params.id);
  
  if (!warehouse) {
    return {
      title: 'Warehouse Not Found',
    };
  }

  return {
    title: `${warehouse.name} - Blue Ship Sync`,
    description: `Warehouse details and inventory management for ${warehouse.name}`,
  };
}
