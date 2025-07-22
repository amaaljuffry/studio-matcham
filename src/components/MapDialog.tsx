"use client";

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
}

export function MapDialog({
  open,
  onOpenChange,
  cafes,
  onMarkerClick,
  selectedCafe,
  initialCenter,
  initialZoom,
}: MapDialogProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;

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
          {!googleMapsApiKey && (
            <Alert variant="destructive" className="shrink-0">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Google Maps API Key Warning</AlertTitle>
              <AlertDescription>
                A `NEXT_PUBLIC_MAPS_API_KEY` is not set. The map feature may not be functional.
              </AlertDescription>
            </Alert>
          )}
          <div className="w-full h-full rounded-md">
            <CafeMap
              apiKey={googleMapsApiKey || ''}
              cafes={cafes}
              onMarkerClick={onMarkerClick}
              selectedCafe={selectedCafe}
              initialCenter={initialCenter}
              initialZoom={initialZoom}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 