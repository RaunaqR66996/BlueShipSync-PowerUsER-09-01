'use client';

import React, { useState } from 'react';
import { WarehousesList } from '@/components/warehouse/WarehousesList';
import { InventoryTableServer } from '@/components/warehouse/InventoryTableServer';
import { OrdersList } from '@/components/orders/OrdersList';
import { ShipmentsList } from '@/components/orders/ShipmentsList';

type ViewState = 'warehouses' | 'inventory' | 'orders' | 'shipments' | 'analytics' | 'settings';
type InventoryState = {
  warehouseId: string;
  warehouseName: string;
} | null;

interface DashboardClientProps {
  activeNav?: string;
}

export function DashboardClient({ activeNav = 'warehouses' }: DashboardClientProps) {
  const [inventoryState, setInventoryState] = useState<InventoryState>(null);

  const handleWarehouseClick = (warehouseId: string, warehouseName: string) => {
    setInventoryState({ warehouseId, warehouseName });
  };

  const handleBackToWarehouses = () => {
    setInventoryState(null);
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'inventory':
        if (inventoryState) {
          return (
            <InventoryTableServer
              warehouseId={inventoryState.warehouseId}
              warehouseName={inventoryState.warehouseName}
              onBack={handleBackToWarehouses}
            />
          );
        }
        return <WarehousesList onWarehouseClick={handleWarehouseClick} />;
      
      case 'orders':
        return <OrdersList />;
      
      case 'shipments':
        return <ShipmentsList />;
      
      case 'analytics':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
              <p className="text-muted-foreground">Advanced analytics and reporting features will be available here.</p>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Settings Coming Soon</h3>
              <p className="text-muted-foreground">System settings and configuration options will be available here.</p>
            </div>
          </div>
        );
      
      default:
        return <WarehousesList onWarehouseClick={handleWarehouseClick} />;
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
}