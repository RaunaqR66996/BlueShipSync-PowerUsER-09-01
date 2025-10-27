'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Environment } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Info,
  Package
} from 'lucide-react';
import * as THREE from 'three';

interface InventoryBin {
  id: string;
  binLocation: string;
  quantity: number;
  status: string;
  product: {
    sku: string;
    name: string;
    category: string | null;
  };
}

interface Warehouse3DProps {
  warehouseId: string;
  warehouseName: string;
  inventory: InventoryBin[];
  className?: string;
}

// Color mapping for inventory status
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'AVAILABLE':
      return '#10b981'; // green
    case 'RESERVED':
      return '#f59e0b'; // yellow
    case 'DAMAGED':
      return '#ef4444'; // red
    case 'QUARANTINE':
      return '#8b5cf6'; // purple
    case 'EXPIRED':
      return '#6b7280'; // gray
    default:
      return '#3b82f6'; // blue
  }
};

// Parse bin location to get coordinates
const parseBinLocation = (binLocation: string): { x: number; y: number; z: number } => {
  const match = binLocation.match(/^([A-E])(\d)(\d)$/);
  if (match) {
    const [, zone, row, shelf] = match;
    return {
      x: (zone.charCodeAt(0) - 65) * 2, // A=0, B=2, C=4, etc.
      y: parseInt(shelf) * 0.5, // Shelf height
      z: parseInt(row) * 2, // Row position
    };
  }
  // Fallback for invalid bin locations
  return { x: 0, y: 0, z: 0 };
};

// Individual bin component
function InventoryBin({ bin, position }: { bin: InventoryBin; position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  const color = getStatusColor(bin.status);
  
  return (
    <group position={position}>
      <Box
        args={[1.5, 0.8, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={hovered ? new THREE.Color(color).multiplyScalar(1.2) : color}
          transparent
          opacity={hovered ? 0.9 : 0.7}
        />
      </Box>
      
      {/* Bin label */}
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.woff"
      >
        {bin.binLocation}
      </Text>
      
      {/* Quantity label */}
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.woff"
      >
        {bin.quantity}
      </Text>
      
      {/* Status label */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.woff"
      >
        {bin.status}
      </Text>
    </group>
  );
}

// Warehouse floor component
function WarehouseFloor({ size }: { size: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#f3f4f6" />
    </mesh>
  );
}

// Warehouse walls
function WarehouseWalls({ size }: { size: number }) {
  const wallHeight = 8;
  const wallThickness = 0.2;
  
  return (
    <group>
      {/* Back wall */}
      <Box args={[size, wallHeight, wallThickness]} position={[0, wallHeight/2, -size/2]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Left wall */}
      <Box args={[wallThickness, wallHeight, size]} position={[-size/2, wallHeight/2, 0]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Right wall */}
      <Box args={[wallThickness, wallHeight, size]} position={[size/2, wallHeight/2, 0]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
    </group>
  );
}

// Main warehouse scene
function WarehouseScene({ inventory }: { inventory: InventoryBin[] }) {
  const warehouseSize = 20;
  
  // Group bins by zone for better organization
  const binsByZone = useMemo(() => {
    const zones: { [key: string]: InventoryBin[] } = {};
    inventory.forEach(bin => {
      const zone = bin.binLocation.charAt(0);
      if (!zones[zone]) zones[zone] = [];
      zones[zone].push(bin);
    });
    return zones;
  }, [inventory]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      <pointLight position={[-10, 10, -10]} intensity={0.3} />
      
      {/* Environment */}
      <Environment preset="warehouse" />
      
      {/* Warehouse structure */}
      <WarehouseFloor size={warehouseSize} />
      <WarehouseWalls size={warehouseSize} />
      
      {/* Inventory bins */}
      {inventory.map((bin) => {
        const position = parseBinLocation(bin.binLocation);
        return (
          <InventoryBin
            key={bin.id}
            bin={bin}
            position={[position.x, position.y, position.z]}
          />
        );
      })}
      
      {/* Zone labels */}
      {Object.keys(binsByZone).map((zone, index) => (
        <Text
          key={zone}
          position={[index * 4 - 6, 2, -8]}
          fontSize={0.5}
          color="#374151"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.woff"
        >
          Zone {zone}
        </Text>
      ))}
    </>
  );
}

// Loading component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading 3D warehouse...</p>
      </div>
    </div>
  );
}

// Legend component
function WarehouseLegend({ inventory }: { inventory: InventoryBin[] }) {
  const statusCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    inventory.forEach(bin => {
      counts[bin.status] = (counts[bin.status] || 0) + 1;
    });
    return counts;
  }, [inventory]);

  const statuses = ['AVAILABLE', 'RESERVED', 'DAMAGED', 'QUARANTINE', 'EXPIRED'];

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Legend</h4>
      {statuses.map(status => (
        <div key={status} className="flex items-center space-x-2 text-xs">
          <div 
            className="w-3 h-3 rounded"
            style={{ backgroundColor: getStatusColor(status) }}
          />
          <span className="text-muted-foreground">{status}</span>
          <Badge variant="secondary" className="text-xs">
            {statusCounts[status] || 0}
          </Badge>
        </div>
      ))}
    </div>
  );
}

export function Warehouse3D({ warehouseId, warehouseName, inventory, className }: Warehouse3DProps) {
  const [showLegend, setShowLegend] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([15, 10, 15]);

  const resetCamera = () => {
    setCameraPosition([15, 10, 15]);
  };

  const zoomIn = () => {
    setCameraPosition(prev => [prev[0] * 0.8, prev[1] * 0.8, prev[2] * 0.8]);
  };

  const zoomOut = () => {
    setCameraPosition(prev => [prev[0] * 1.2, prev[1] * 1.2, prev[2] * 1.2]);
  };

  const toggleFullscreen = () => {
    // Toggle fullscreen functionality
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className={className}>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>3D Warehouse Visualization</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={resetCamera}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowLegend(!showLegend)}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-4rem)]">
          <div className="relative h-full">
            {/* 3D Canvas */}
            <div className="h-full">
              <Canvas
                camera={{ position: cameraPosition, fov: 50 }}
                style={{ background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)' }}
              >
                <Suspense fallback={null}>
                  <WarehouseScene inventory={inventory} />
                  <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={5}
                    maxDistance={50}
                    target={[0, 0, 0]}
                  />
                </Suspense>
              </Canvas>
            </div>
            
            {/* Legend overlay */}
            {showLegend && (
              <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border shadow-lg">
                <WarehouseLegend inventory={inventory} />
              </div>
            )}
            
            {/* Info overlay */}
            <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 border shadow-lg">
              <div className="text-sm">
                <div className="font-medium">{warehouseName}</div>
                <div className="text-muted-foreground">
                  {inventory.length} bins • {inventory.reduce((sum, bin) => sum + bin.quantity, 0)} total units
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}