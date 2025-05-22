
"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Cafe } from "@/types";
import { mockCafes } from "@/data/cafes";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Leaf, Filter, Bot as BotIcon, XCircle } from "lucide-react";
import Image from "next/image";
// Removed useToast as it was only used for map API key warning
// import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [allCafes] = useState<Cafe[]>(mockCafes);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>(allCafes);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  // const { toast } = useToast(); // Removed as map API key warning is removed

  useEffect(() => {
    const result = allCafes.filter((cafe) => cafe.rating >= minRating);
    setFilteredCafes(result);
    if (selectedCafe && !result.find(c => c.id === selectedCafe.id)) {
      setSelectedCafe(null);
    }
  }, [minRating, allCafes, selectedCafe]);

  const handleRatingChange = (newRating: number) => {
    setMinRating(newRating);
  };

  const handleCafeSelect = (cafe: Cafe) => {
    setSelectedCafe(cafe);
  };

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
                <div className="hidden group-data-[collapsible=icon]:flex justify-center py-2">
                   <Tooltip>
                      <TooltipTrigger asChild>
                        <Filter className="w-6 h-6 text-sidebar-foreground" />
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
                        <BotIcon className="w-6 h-6 text-sidebar-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right" align="center">AI Concierge</TooltipContent>
                    </Tooltip>
                </div>
              </div>
            </div>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-background text-foreground relative">
        <div className="absolute top-4 left-4 z-20 md:hidden">
           <SidebarTrigger className="bg-background/80 backdrop-blur-sm hover:bg-muted"/>
        </div>

        {selectedCafe && (
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCafe(null)}
              className="hover:bg-accent/10 hover:text-accent-foreground border-accent text-accent flex items-center shadow-sm"
              aria-label="Clear selection and view cafe list"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Back to Cafe List
            </Button>
          </div>
        )}

        {selectedCafe ? (
          <CafeDetailsCard cafe={selectedCafe} />
        ) : (
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-primary">
              Discover Matcha Cafes
            </h1>
            <p className="text-muted-foreground mb-6">
              Explore {allCafes.length} listed cafes. Use filters to narrow down your search.
            </p>
            
            {filteredCafes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {filteredCafes.map((cafe) => (
                  <Card
                    key={cafe.id}
                    onClick={() => handleCafeSelect(cafe)}
                    className={`cursor-pointer group overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 ease-in-out rounded-lg ${
                      selectedCafe?.id === cafe.id ? "ring-2 ring-primary border-primary bg-primary/5" : "bg-card hover:bg-card/90"
                    }`}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCafeSelect(cafe);}}
                    role="button"
                    aria-pressed={selectedCafe?.id === cafe.id}
                    aria-label={`View details for ${cafe.name}`}
                  >
                    <div className="relative w-full h-40 md:h-48 overflow-hidden">
                      <Image
                        src={cafe.image}
                        alt={`Image of ${cafe.name}`}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={cafe.dataAiHint || "cafe matcha"}
                        className="group-hover:scale-105 transition-transform duration-300 ease-in-out"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className={`font-semibold text-lg mb-1 ${selectedCafe?.id === cafe.id ? 'text-primary': 'text-card-foreground'}`}>{cafe.name}</h3>
                      <p className="text-xs text-muted-foreground truncate mb-2">{cafe.address}</p>
                      <div className="flex items-center justify-start">
                        <Badge variant={selectedCafe?.id === cafe.id ? "default" : "outline"} className={`text-xs px-2 py-0.5 ${selectedCafe?.id === cafe.id ? 'bg-primary text-primary-foreground' : 'border-accent text-accent bg-accent/10'}`}>
                          {cafe.rating} ★
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-muted/50 rounded-lg p-8 text-center">
                <Filter className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No Cafes Found</h2>
                <p className="text-muted-foreground">
                  No cafes match your current filters. Try adjusting the rating or other criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </SidebarProvider>
  );
}
