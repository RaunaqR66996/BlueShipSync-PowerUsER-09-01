'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Warehouse,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Clock,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

const navItems: NavItem[] = [
  { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'shipments', label: 'Shipments', icon: Truck },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
  onNavChange?: (itemId: string) => void;
}

export function Sidebar({ className, onNavChange }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('warehouses');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Get user info from localStorage
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const handleNavClick = (itemId: string) => {
    setActiveItem(itemId);
    onNavChange?.(itemId);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-card border-r border-border transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BS</span>
            </div>
            <div>
              <h1 className="font-semibold text-sm">Blue Ship Sync</h1>
              <p className="text-xs text-muted-foreground">Logistics Platform</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Trial Timer */}
      {!isCollapsed && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Trial ends in</span>
          </div>
          <div className="mt-1">
            <Badge variant="secondary" className="text-xs">
              23 days left
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start',
                isCollapsed ? 'px-2' : 'px-3',
                isActive && 'bg-primary text-primary-foreground'
              )}
              onClick={() => handleNavClick(item.id)}
            >
              <Icon className={cn('h-4 w-4', !isCollapsed && 'mr-3')} />
              {!isCollapsed && item.label}
            </Button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'space-x-3')}>
          <Avatar
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
            alt="User avatar"
            fallback={user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
            className="h-8 w-8"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role || 'User'}</p>
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
