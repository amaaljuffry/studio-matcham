"use client";

import type { Cafe } from "@/types";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import React from "react";

interface CafeMapProps {
  apiKey: string | undefined;
  cafes: Cafe[];
  onMarkerClick: (cafe: Cafe) => void;
  selectedCafe: Cafe | null;
  initialCenter: { lat: number; lng: number };
  initialZoom: number;
}

export function CafeMap({
  apiKey,
  cafes,
  onMarkerClick,
  selectedCafe,
  initialCenter,
  initialZoom,
}: CafeMapProps) {
  if (!apiKey) {
    // This case is handled by a banner in page.tsx, but good to have a fallback.
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-destructive-foreground p-4 bg-destructive rounded-md">
          Google Maps API Key is missing. Map cannot be displayed.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={initialCenter}
        defaultZoom={initialZoom}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapId="matchame-map"
        className="w-full h-full"
      >
        {cafes.map((cafe) => (
          <AdvancedMarker
            key={cafe.id}
            position={{ lat: cafe.latitude, lng: cafe.longitude }}
            onClick={() => onMarkerClick(cafe)}
            title={cafe.name}
          >
            <Pin
              background={selectedCafe?.id === cafe.id ? "var(--color-accent)" : "var(--color-primary)"}
              borderColor={selectedCafe?.id === cafe.id ? "var(--color-accent-foreground)" : "var(--color-primary-foreground)"}
              glyphColor={selectedCafe?.id === cafe.id ? "var(--color-accent-foreground)" : "var(--color-primary-foreground)"}
            />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
