"use client";

import type { Cafe } from "@/types";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import React, { useState, useEffect, useCallback } from "react";
import { mapStyles } from "@/styles/mapStyles";

interface CafeMapProps {
  apiKey: string | undefined;
  cafes: Cafe[];
  onMarkerClick: (cafe: Cafe | null) => void;
  selectedCafe: Cafe | null;
  initialCenter: { lat: number; lng: number }; // Fallback center
  initialZoom: number;
}

const matchaGreenPrimary = "#55a44e";
const matchaGreenSelected = "#ff894c";
const matchaBorderColor = "#4A7C59";
const matchaGlyphColor = "#ede9a3";

export function CafeMap({
  apiKey,
  cafes,
  onMarkerClick,
  selectedCafe,
  initialCenter,
  initialZoom,
}: CafeMapProps) {
  console.log("CafeMap component rendering with API Key:", apiKey);
  // State for the map's viewport center and zoom
  const [currentMapCenter, setCurrentMapCenter] = useState(initialCenter);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);

  // NEW: State specifically for the user's actual geographic location
  const [userGeoLocation, setUserGeoLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = { // Renamed to avoid confusion with currentMapCenter
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserGeoLocation(userLoc);      // Store the true user location
          setCurrentMapCenter(userLoc);     // Initially center map on user's location
          // Optionally adjust zoom when user location is found
          // setCurrentZoom(14);
          setGeolocationError(null);
          console.log("User's actual location stored:", userLoc);
        },
        (error) => {
          console.error("Error getting user location:", error.message);
          setGeolocationError(
            `Error: ${error.message}. Displaying default location.`
          );
          // userGeoLocation remains null, currentMapCenter remains initialCenter
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setGeolocationError(
        "Geolocation is not supported by your browser. Displaying default location."
      );
    }
  }, []); // Runs once on mount

  const handleCameraChange = useCallback((ev: MapCameraChangedEvent) => {
    setCurrentMapCenter(ev.detail.center); // This updates the viewport center
    setCurrentZoom(ev.detail.zoom);         // This updates the viewport zoom
  }, []);

  // Check if API key is provided and not an empty string
  if (!apiKey || apiKey === '') {
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
      {geolocationError && (
        <div style={{ padding: '10px', color: 'red', textAlign: 'center', background: 'lightyellow' }}>
          {geolocationError}
        </div>
      )}
      <Map
        center={currentMapCenter} // Controls the map's viewport center
        zoom={currentZoom}         // Controls the map's viewport zoom
        onCameraChanged={handleCameraChange}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapId="matchame-map"
        className="w-full h-full"
      >
        {cafes.map((cafe) => {
          // Only render marker if latitude and longitude are not null
          if (cafe.latitude === null || cafe.longitude === null) {
            return null;
          }
          return (
          <AdvancedMarker
            key={cafe.id}
            position={{ lat: cafe.latitude, lng: cafe.longitude }}
            onClick={() => onMarkerClick(cafe)}
            title={cafe.name}
          >
            <Pin
              scale={selectedCafe?.id === cafe.id ? 1.5 : 1}
              background={
                selectedCafe?.id === cafe.id
                  ? matchaGreenSelected
                  : matchaGreenPrimary
              }
              borderColor={matchaBorderColor}
              glyphColor={matchaGlyphColor}
            />
          </AdvancedMarker>
          );
        })}

        {/* "Your Location" pin - uses the fixed userGeoLocation */}
        {userGeoLocation && !geolocationError && ( // Render if userGeoLocation is successfully set
            <AdvancedMarker
                position={userGeoLocation} // Position is now fixed to the actual user location
                title="Your Location"
                // Optional: Prevent this specific marker from being clickable if it interferes
                // onClick={(e) => e.stopPropagation()} // Example if needed
            >
                <Pin background="blue" glyphColor="white" borderColor="white" />
            </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
}