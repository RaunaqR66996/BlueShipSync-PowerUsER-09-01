'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SplitScreenProps {
  children: React.ReactNode;
  className?: string;
}

export function SplitScreen({ children, className }: SplitScreenProps): JSX.Element {
  return (
    <div className={cn('flex h-screen w-full', className)}>
      {children}
    </div>
  );
}

interface LeftPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function LeftPanel({ children, className }: LeftPanelProps): JSX.Element {
  return (
    <div className={cn('w-1/2 border-r border-border bg-muted/50', className)}>
      {children}
    </div>
  );
}

interface RightPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function RightPanel({ children, className }: RightPanelProps): JSX.Element {
  return (
    <div className={cn('w-1/2 bg-background', className)}>
      {children}
    </div>
  );
}



