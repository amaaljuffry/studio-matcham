"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Cafe } from "@/types";
import { mockCafes } from "@/data/cafes";
import { CafeMap } from "@/components/cafe-map";
import { CafeFilterOptions } from "@/components/cafe-filter-options";
import { CafeDetailsCard } from "@/components/cafe-details-card";
import { AiConciergeForm } from "@/components/ai-concierge-form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Leaf, Filter, Bot as BotIcon, Info, XCircle } from "lucide-react"; // Renamed Bot to BotIcon to avoid conflict
import { useToast } from "@/hooks/use-toast";

const MALAYSIA_CENTER = { lat: 4.2105, lng: 101.9758 }; // General center of Malaysia
const KUALA_LUMPUR_CENTER = { lat: 3.1390, lng: 101.6869 }; // Kuala Lumpur

export default function HomePage() {
  const [allCafes] = useState<Cafe[]>(mockCafes);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>(allCafes);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [mapApiKey, setMapApiKey] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    // Client-side check for API key
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    setMapApiKey(key);
    if (!key) {
      console.warn("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set. Map functionality will be limited.");
      toast({
        title: "Map API Key Missing",
        description: "Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for full map functionality.",
        variant: "destructive",
        duration: 10000,
      });
    }
  }, [toast]);

  useEffect(() => {
    const result = allCafes.filter((cafe) => cafe.rating >= minRating);
    setFilteredCafes(result);
    setSelectedCafe(null); // Clear selection when filters change
  }, [minRating, allCafes]);

  const handleRatingChange = (newRating: number) => {
    setMinRating(newRating);
  };

  const handleMarkerClick = (cafe: Cafe) => {
    setSelectedCafe(cafe);
  };

  const currentMapCenter = useMemo(() => {
    if (selectedCafe) {
      return { lat: selectedCafe.latitude, lng: selectedCafe.longitude };
    }
    return KUALA_LUMPUR_CENTER;
  }, [selectedCafe]);
  
  const currentMapZoom = useMemo(() => {
    if (selectedCafe) return 15;
    if (filteredCafes.length > 0 && filteredCafes.length < allCafes.length) return 10; // Zoom in if filtered
    return 7; // Default zoom for Malaysia
  }, [selectedCafe, filteredCafes, allCafes]);

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar 
        variant="sidebar" 
        collapsible="icon"
        className="border-r border-sidebar-border shadow-md"
      >
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="text-2xl font-semibold text-primary group-data-[collapsible=icon]:hidden">MatchaMe</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </h2>
                <div className="group-data-[collapsible=icon]:hidden">
                  <CafeFilterOptions onFilterChange={handleRatingChange} currentMinRating={minRating} />
                </div>
                <div className="hidden group-data-[collapsible=icon]:flex justify-center">
                   <Filter className="w-6 h-6 text-sidebar-foreground" title="Filters" />
                </div>
              </div>

              <Separator className="my-4 group-data-[collapsible=icon]:hidden bg-sidebar-border" />

              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                  <BotIcon className="w-5 h-5 mr-2" />
                  Matcha Concierge
                </h2>
                 <div className="group-data-[collapsible=icon]:hidden">
                  <AiConciergeForm cafes={filteredCafes} />
                </div>
                 <div className="hidden group-data-[collapsible=icon]:flex justify-center">
                   <BotIcon className="w-6 h-6 text-sidebar-foreground" title="AI Concierge" />
                </div>
              </div>
              
              {selectedCafe && (
                <>
                  <Separator className="my-4 group-data-[collapsible=icon]:hidden bg-sidebar-border" />
                  <div>
                    <h2 className="text-lg font-semibold mb-3 flex items-center text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                      <Info className="w-5 h-5 mr-2" />
                      Cafe Details
                    </h2>
                    <div className="group-data-[collapsible=icon]:hidden">
                      <CafeDetailsCard cafe={selectedCafe} />
                      <Button
                        variant="outline"
                        onClick={() => setSelectedCafe(null)}
                        className="mt-3 w-full hover:bg-destructive/10 border-destructive text-destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Clear Selection
                      </Button>
                    </div>
                     <div className="hidden group-data-[collapsible=icon]:flex justify-center">
                       <Info className="w-6 h-6 text-sidebar-foreground" title="Cafe Details" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="relative">
        <div className="absolute top-2 left-2 z-10 md:hidden">
           <SidebarTrigger className="bg-background/80 backdrop-blur-sm hover:bg-muted"/>
        </div>
        <CafeMap
          apiKey={mapApiKey}
          cafes={filteredCafes}
          onMarkerClick={handleMarkerClick}
          selectedCafe={selectedCafe}
          initialCenter={currentMapCenter}
          initialZoom={currentMapZoom}
        />
        {!mapApiKey && (
          <div className="absolute bottom-0 left-0 w-full p-3 bg-destructive text-destructive-foreground text-center text-xs md:text-sm z-20">
            Warning: Google Maps API Key is not configured. Map functionality is limited. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
