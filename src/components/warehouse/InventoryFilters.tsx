'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';
import type { InventoryItem } from '@/lib/data';

interface InventoryFiltersProps {
  inventory: InventoryItem[];
  onFilterChange?: (filteredInventory: InventoryItem[]) => void;
}

export function InventoryFilters({ inventory, onFilterChange }: InventoryFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Get unique categories and statuses for filters
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(inventory.map(item => item.product.category).filter(Boolean))
    );
    return uniqueCategories;
  }, [inventory]);

  const statuses = useMemo(() => {
    const uniqueStatuses = Array.from(new Set(inventory.map(item => item.status)));
    return uniqueStatuses;
  }, [inventory]);

  // Filter logic
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch = 
        item.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.binLocation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.product.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [inventory, searchTerm, statusFilter, categoryFilter]);

  // Notify parent of filtered results
  React.useEffect(() => {
    onFilterChange?.(filteredInventory);
  }, [filteredInventory, onFilterChange]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filters & Search</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search SKU, product name, or bin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <option value="all">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredInventory.length} of {inventory.length} items
        </div>
      </CardContent>
    </Card>
  );
}


