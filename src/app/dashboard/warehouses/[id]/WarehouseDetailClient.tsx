'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WarehouseHeader } from '@/components/warehouse/WarehouseHeader';
import { InventoryTable } from '@/components/warehouse/InventoryTable';
import { 
  WarehouseDetail, 
  InventoryItem, 
  InventoryFilters,
  PaginatedInventory 
} from '@/lib/warehouse-detail';

interface WarehouseDetailClientProps {
  warehouse: WarehouseDetail;
  initialInventory: PaginatedInventory;
  categories: string[];
  stats: {
    totalItems: number;
    totalUnits: number;
    lowStockItems: number;
    totalValue: number;
  };
}

export function WarehouseDetailClient({
  warehouse,
  initialInventory,
  categories,
  stats,
}: WarehouseDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [inventory, setInventory] = useState<PaginatedInventory>(initialInventory);

  const updateUrl = (filters: InventoryFilters) => {
    const params = new URLSearchParams(searchParams);
    
    if (filters.search) {
      params.set('search', filters.search);
    } else {
      params.delete('search');
    }
    
    if (filters.status && filters.status !== 'all') {
      params.set('status', filters.status);
    } else {
      params.delete('status');
    }
    
    if (filters.category && filters.category !== 'all') {
      params.set('category', filters.category);
    } else {
      params.delete('category');
    }
    
    if (filters.page && filters.page > 1) {
      params.set('page', filters.page.toString());
    } else {
      params.delete('page');
    }
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl);
  };

  const handleFiltersChange = async (filters: InventoryFilters) => {
    startTransition(async () => {
      try {
        // Update URL first
        updateUrl(filters);
        
        // Fetch new data
        const response = await fetch(
          `/api/warehouses/${warehouse.id}/inventory?${new URLSearchParams({
            search: filters.search || '',
            status: filters.status || 'all',
            category: filters.category || 'all',
            page: filters.page?.toString() || '1',
            limit: '20',
          }).toString()}`
        );
        
        if (response.ok) {
          const newInventory = await response.json();
          setInventory(newInventory);
        }
      } catch (error) {
        console.error('Failed to update inventory:', error);
      }
    });
  };

  const handlePageChange = (page: number) => {
    const currentFilters = {
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || 'all',
      category: searchParams.get('category') || 'all',
      page,
      limit: 20,
    };
    
    handleFiltersChange(currentFilters);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Warehouse Header */}
        <WarehouseHeader 
          warehouse={warehouse} 
          stats={stats}
          onBack={handleBack}
        />

        {/* Inventory Table */}
        <div className="mt-8">
          <InventoryTable
            inventory={inventory.items}
            totalCount={inventory.totalCount}
            totalPages={inventory.totalPages}
            currentPage={inventory.currentPage}
            hasNextPage={inventory.hasNextPage}
            hasPreviousPage={inventory.hasPreviousPage}
            categories={categories}
            onPageChange={handlePageChange}
            onFiltersChange={handleFiltersChange}
            loading={isPending}
          />
        </div>
      </div>
    </div>
  );
}


