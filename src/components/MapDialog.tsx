"use client";

// Lazy load Leaflet map at the top to avoid initialization error
const CafeMapLeaflet = React.lazy(() => import('./cafe-map-leaflet'));

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { CafeMap } from '@/components/cafe-map';
import type { Cafe } from '@/types';

interface MapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cafes: Cafe[];
  onMarkerClick: (cafe: Cafe | null) => void;
  selectedCafe: Cafe | null;
  initialCenter: { lat: number; lng: number };
  initialZoom: number;
  useLeaflet?: boolean;
}

export function MapDialog({
  open,
  onOpenChange,
  cafes,
  onMarkerClick,
  selectedCafe,
  initialCenter,
  initialZoom,
  useLeaflet = false,
}: MapDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-3xl lg:max-w-5xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>View Cafes on Map</DialogTitle>
          <DialogDescription>
            Explore matcha cafes on the map.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 w-full p-4 space-y-4">
          <div className="w-full h-full rounded-md">
            {useLeaflet ? (
              <React.Suspense fallback={<div>Loading map...</div>}>
                {/** @ts-ignore */}
                <CafeMapLeaflet
                  cafes={cafes}
                  onMarkerClick={onMarkerClick}
                  selectedCafe={selectedCafe}
                  initialCenter={initialCenter}
                  initialZoom={initialZoom}
                />
              </React.Suspense>
            ) : (
              <CafeMap
                apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY || ''}
                cafes={cafes}
                onMarkerClick={onMarkerClick}
                selectedCafe={selectedCafe}
                initialCenter={initialCenter}
                initialZoom={initialZoom}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 