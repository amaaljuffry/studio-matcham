
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Cafe } from "@/types";

// Fix for missing marker icons in Leaflet (Next.js/React)
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

interface CafeMapProps {
  cafes: Cafe[];
  onMarkerClick: (cafe: Cafe | null) => void;
  selectedCafe: Cafe | null;
  initialCenter: { lat: number; lng: number };
  initialZoom: number;
}

const CafeMapLeaflet = ({
  cafes,
  onMarkerClick,
  selectedCafe,
  initialCenter,
  initialZoom,
}: CafeMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(
      [initialCenter.lat, initialCenter.lng],
      initialZoom
    );
    leafletMapRef.current = map;

    // Add OSM tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add markers
    cafes.forEach((cafe) => {
      if (cafe.latitude == null || cafe.longitude == null) return;
      const marker = L.marker([cafe.latitude, cafe.longitude]).addTo(map);
      marker.bindPopup(`<b>${cafe.name}</b><br>${cafe.address ?? ""}`);
      marker.on("click", () => onMarkerClick(cafe));
      if (selectedCafe && selectedCafe.id === cafe.id) {
        marker.openPopup();
      }
    });

    // Clean up
    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafes, initialCenter, initialZoom]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default CafeMapLeaflet;
