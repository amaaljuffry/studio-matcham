
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { Cafe } from "@/types";
import { mockCafes, malaysianStates } from "@/data/cafes";
import { CafeFilterOptions } from "@/components/cafe-filter-options";
import { CafeDetailsCard } from "@/components/cafe-details-card";
import { AiConciergeForm } from "@/components/ai-concierge-form";
import { CafeMap } from "@/components/cafe-map";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Leaf, Filter, Bot as BotIcon, XCircle, MapPin, StarIcon, MapIcon, ListIcon, Terminal } from "lucide-react";
import Image from "next/image";

function HomePage() {
  const [allCafes] = useState<Cafe[]>(mockCafes);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>(allCafes);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedState, setSelectedState] = useState<string>("All");
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | undefined>(undefined);

  const { toggleSidebar, isMobile, state: sidebarState, openMobile: mobileSidebarOpen } = useSidebar();

  useEffect(() => {
    // Only run on client
    setGoogleMapsApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  }, []);

  useEffect(() => {
    let result = allCafes;
    if (minRating > 0) {
      result = result.filter((cafe) => cafe.rating >= minRating);
    }
    if (selectedState !== "All") {
      result = result.filter((cafe) => cafe.state === selectedState);
    }
    setFilteredCafes(result);

    if (selectedCafe && !result.find(c => c.id === selectedCafe.id)) {
      setSelectedCafe(null); // Deselect if filters hide it
    }
  }, [minRating, selectedState, allCafes, selectedCafe]);

  const handleRatingChange = useCallback((newRating: number) => {
    setMinRating(newRating);
    setSelectedCafe(null); // Reset selection when filters change
  }, []);

  const handleStateChange = useCallback((newState: string) => {
    setSelectedState(newState);
    setSelectedCafe(null); // Reset selection when filters change
  }, []);

  const handleCafeSelect = useCallback((cafe: Cafe | null) => {
    setSelectedCafe(cafe);
  }, []);
  
  const initialMapCenter = useMemo(() => ({ lat: 3.1390, lng: 101.6869 }), []); // Kuala Lumpur
  const initialMapZoom = 10;

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          variant="sidebar" 
          collapsible="icon"
          className="border-r border-sidebar-border shadow-md flex-shrink-0"
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
                    <CafeFilterOptions 
                      onRatingFilterChange={handleRatingChange} 
                      currentMinRating={minRating}
                      onStateFilterChange={handleStateChange}
                      currentSelectedState={selectedState}
                      availableStates={malaysianStates}
                    />
                  </div>
                  <div className="hidden group-data-[collapsible=icon]:flex justify-center py-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-sidebar-foreground w-8 h-8">
                            <Filter className="w-6 h-6" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">Filters</TooltipContent>
                    </Tooltip>
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
                  <div className="hidden group-data-[collapsible=icon]:flex justify-center py-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-sidebar-foreground w-8 h-8">
                              <BotIcon className="w-6 h-6" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">AI Concierge</TooltipContent>
                      </Tooltip>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden bg-background text-foreground">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-2">
               <div className="md:hidden">
                 <SidebarTrigger className="bg-background/80 backdrop-blur-sm hover:bg-muted"/>
               </div>
               {selectedCafe && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCafeSelect(null)}
                    className="hover:bg-accent/10 hover:text-accent-foreground border-accent text-accent flex items-center shadow-sm"
                    aria-label="Clear selection and view cafe list"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Back to Map & List
                  </Button>
              )}
            </div>
            <Button variant="outline" onClick={toggleSidebar} className="shadow-sm hidden md:flex">
                <Filter className="w-4 h-4 mr-2" />
                {sidebarState === "expanded" ? "Hide Panel" : "Show Panel"}
            </Button>
          </div>
          
          {!googleMapsApiKey && (
            <Alert variant="destructive" className="m-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                Google Maps API Key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file. The map will not be functional.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
            <div className="relative h-full min-h-[300px] md:min-h-0">
              {googleMapsApiKey && (
                <CafeMap
                  apiKey={googleMapsApiKey}
                  cafes={filteredCafes}
                  onMarkerClick={handleCafeSelect}
                  selectedCafe={selectedCafe}
                  initialCenter={initialMapCenter}
                  initialZoom={initialMapZoom}
                />
              )}
              {!googleMapsApiKey && (
                <div className="flex items-center justify-center h-full bg-muted text-destructive-foreground p-4">
                    Map disabled due to missing API key.
                </div>
              )}
            </div>
            
            <ScrollArea className="h-full overflow-y-auto">
              <div className="p-4">
                {selectedCafe ? (
                  <CafeDetailsCard cafe={selectedCafe} />
                ) : (
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold mb-1 text-primary">
                      {filteredCafes.length} Matcha Cafes Found
                    </h1>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {selectedState === "All" ? "Across Malaysia" : `In ${selectedState}`}{minRating > 0 ? ` with ${minRating}+ stars rating.` : "."} Explore below or on the map.
                    </p>
                    
                    {filteredCafes.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredCafes.map((cafe) => (
                          <Card
                            key={cafe.id}
                            onClick={() => handleCafeSelect(cafe)}
                            className={`cursor-pointer group overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 ease-in-out rounded-lg bg-card hover:bg-card/90`}
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCafeSelect(cafe);}}
                            role="button"
                            aria-label={`View details for ${cafe.name}`}
                          >
                            <div className="relative w-full h-32 md:h-40 overflow-hidden">
                              <Image
                                src={cafe.image}
                                alt={`Image of ${cafe.name}`}
                                fill={true}
                                sizes="(max-width: 1024px) 50vw, 25vw"
                                style={{objectFit: 'cover'}}
                                data-ai-hint={cafe.dataAiHint || "cafe matcha"}
                                className="group-hover:scale-105 transition-transform duration-300 ease-in-out"
                              />
                            </div>
                            <CardContent className="p-3">
                              <h3 className="font-semibold text-md mb-1 text-card-foreground truncate">{cafe.name}</h3>
                              <p className="text-xs text-muted-foreground truncate mb-1">{cafe.address}</p>
                              <div className="flex items-center justify-between text-xs">
                                <Badge variant="outline" className="border-accent text-accent bg-accent/10 px-1.5 py-0.5">
                                  {cafe.rating} ★
                                </Badge>
                                <span className="text-muted-foreground">{cafe.state}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 bg-muted/50 rounded-lg p-8 text-center">
                        <Filter className="w-12 h-12 text-muted-foreground mb-4" />
                        <h2 className="text-lg font-semibold text-foreground mb-2">No Cafes Found</h2>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your filters or exploring different states.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

const HomePageWithSidebar: React.FC = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <HomePage />
    </SidebarProvider>
  );
};

export default HomePageWithSidebar;
