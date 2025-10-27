'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { DashboardClient } from './DashboardClient';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('warehouses');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      try {
        const user = localStorage.getItem('user');
        if (user) {
          setIsAuthenticated(true);
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="h-screen w-full bg-background">
      <div className="flex h-full">
        {/* Left Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Sidebar onNavChange={setActiveNav} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-hidden">
            <div className="h-full p-6 overflow-y-auto">
              <DashboardClient activeNav={activeNav} />
            </div>
          </div>
        </div>

        {/* Right Chat Panel */}
        <div className="w-80 flex-shrink-0 border-l border-border">
          <div className="h-full p-4">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
}