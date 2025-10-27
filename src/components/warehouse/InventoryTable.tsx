'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { 
  Search, 
  Filter, 
  Package, 
  MapPin,
  Calendar,
  Eye,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { InventoryItem, InventoryFilters } from '@/lib/warehouse-detail';
import { ProductDetailsDrawer } from './ProductDetailsDrawer';

interface InventoryTableProps {
  inventory: InventoryItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  categories: string[];
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: InventoryFilters) => void;
  loading?: boolean;
}

type SortField = 'sku' | 'name' | 'quantity' | 'binLocation' | 'status' | 'lastCounted';
type SortDirection = 'asc' | 'desc';

export function InventoryTable({
  inventory,
  totalCount,
  totalPages,
  currentPage,
  hasNextPage,
  hasPreviousPage,
  categories,
  onPageChange,
  onFiltersChange,
  loading = false,
}: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'default';
      case 'RESERVED':
        return 'secondary';
      case 'DAMAGED':
        return 'destructive';
      case 'QUARANTINE':
        return 'destructive';
      case 'EXPIRED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getQuantityColor = (quantity: number) => {
    if (quantity < 10) return 'text-red-600 dark:text-red-400';
    if (quantity < 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({
      search: value,
      status: statusFilter,
      category: categoryFilter,
      page: 1,
    });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    onFiltersChange({
      search: searchTerm,
      status: value,
      category: categoryFilter,
      page: 1,
    });
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    onFiltersChange({
      search: searchTerm,
      status: statusFilter,
      category: value,
      page: 1,
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    // Note: In a real implementation, you'd pass sort parameters to the server
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    onFiltersChange({
      search: '',
      status: 'all',
      category: 'all',
      page: 1,
    });
  };

  const handleProductClick = (item: InventoryItem) => {
    setSelectedProduct(item);
  };

  const statuses = ['AVAILABLE', 'RESERVED', 'DAMAGED', 'QUARANTINE', 'EXPIRED'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Search & Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search SKU, product name, or bin..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <option value="all">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
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
            Showing {inventory.length} of {totalCount} items
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="w-[120px] cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('sku')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>SKU</span>
                      {sortField === 'sku' && (
                        sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Product Name</span>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell w-[120px]">Category</TableHead>
                  <TableHead 
                    className="w-[100px] text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Quantity</span>
                      {sortField === 'quantity' && (
                        sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="w-[100px] cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('binLocation')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Bin Location</span>
                      {sortField === 'binLocation' && (
                        sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="w-[120px] cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="w-[120px] cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('lastCounted')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Last Counted</span>
                      {sortField === 'lastCounted' && (
                        sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                        Loading inventory...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : inventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No inventory found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">
                        <button
                          onClick={() => handleProductClick(item)}
                          className="text-primary hover:text-primary/80 hover:underline"
                        >
                          {item.product.sku}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{item.product.name}</div>
                          {item.product.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {item.product.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item.product.category || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${getQuantityColor(item.quantity)}`}>
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{item.binLocation}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(item.lastCountedAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleProductClick(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={!hasPreviousPage}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page > totalPages) return null;
                
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Product Details Drawer */}
      {selectedProduct && (
        <ProductDetailsDrawer
          product={selectedProduct.product}
          inventory={selectedProduct}
          open={!!selectedProduct}
          onOpenChange={(open) => !open && setSelectedProduct(null)}
        />
      )}
    </div>
  );
}