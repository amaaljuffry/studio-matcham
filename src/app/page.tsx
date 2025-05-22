
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { Cafe } from "@/types";
import { mockCafes } from "@/data/cafes";
import { CafeDetailsCard } from "@/components/cafe-details-card";
import { CafeMap } from "@/components/cafe-map";
import { CafeSubmissionForm } from "@/components/CafeSubmissionForm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Leaf, XCircle, MapIcon, Terminal, PlusCircle, Filter as FilterIcon } from "lucide-react";
import Image from "next/image";

function HomePage() {
  const [allCafes] = useState<Cafe[]>(mockCafes);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>(allCafes);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | undefined>(undefined);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);

  useEffect(() => {
    // Only run on client
    setGoogleMapsApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  }, []);

  useEffect(() => {
    setFilteredCafes(allCafes);
    if (selectedCafe && !allCafes.find(c => c.id === selectedCafe.id)) {
      setSelectedCafe(null); 
    }
  }, [allCafes, selectedCafe]);

  const handleCafeSelect = useCallback((cafe: Cafe | null) => {
    setSelectedCafe(cafe);
  }, []);
  
  const initialMapCenter = useMemo(() => ({ lat: 3.1390, lng: 101.6869 }), []); 
  const initialMapZoom = 10;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2">
           {selectedCafe ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCafeSelect(null)}
                className="hover:bg-accent/10 hover:text-accent-foreground border-accent text-accent flex items-center shadow-sm"
                aria-label="Clear selection and view cafe list"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Back to List
              </Button>
          ) : (
            <div className="flex items-center gap-2">
                <Leaf className="h-7 w-7 text-primary" />
                <span className="text-2xl font-semibold text-primary">MatchaMe</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="shadow-sm">
                <MapIcon className="w-4 h-4 mr-2" />
                View Map
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 sm:max-w-2xl md:max-w-4xl lg:max-w-5xl w-[90vw] h-[80vh] overflow-hidden">
              <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
                <DialogTitle>Matcha Cafe Map</DialogTitle>
              </DialogHeader>
              <div className="h-[calc(100%-57px)]">
              {googleMapsApiKey ? (
                <CafeMap
                  apiKey={googleMapsApiKey}
                  cafes={filteredCafes}
                  onMarkerClick={(cafe) => {
                    handleCafeSelect(cafe);
                    // Optionally close dialog on marker click
                    // setIsMapDialogOpen(false); 
                  }}
                  selectedCafe={selectedCafe}
                  initialCenter={initialMapCenter}
                  initialZoom={initialMapZoom}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted text-destructive-foreground p-4">
                    Map disabled due to missing or invalid API key. Check console for details.
                </div>
              )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSubmissionDialogOpen} onOpenChange={setIsSubmissionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="shadow-sm">
                <PlusCircle className="w-4 h-4 mr-2" />
                Submit Cafe
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
               <DialogHeader className="pb-3">
                <DialogTitle>Submit a New Matcha Cafe</DialogTitle>
              </DialogHeader>
              <CafeSubmissionForm onFormSubmit={() => setIsSubmissionDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </header>
      
      {!googleMapsApiKey && (
        <Alert variant="destructive" className="m-4 shrink-0">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Google Maps API Key is missing or invalid. Please set a valid <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in your <code>.env</code> file and ensure the Maps JavaScript API is enabled in your Google Cloud Console. The map feature may not be functional.
          </AlertDescription>
        </Alert>
      )}
      
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4">
          {selectedCafe ? (
            <CafeDetailsCard cafe={selectedCafe} />
          ) : (
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-1 text-primary">
                {filteredCafes.length} Matcha Cafes Found
              </h1>
              <p className="text-muted-foreground mb-4 text-sm">
                Explore matcha cafes across Malaysia. Click "View Map" to see locations, or "Submit Cafe" to add a new one.
              </p>
              
              {filteredCafes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCafes.map((cafe) => (
                    <Card
                      key={cafe.id}
                      onClick={() => handleCafeSelect(cafe)}
                      className={`cursor-pointer group overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 ease-in-out rounded-lg bg-card hover:bg-card/90 ${selectedCafe?.id === cafe.id ? "ring-2 ring-primary" : ""}`}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCafeSelect(cafe);}}
                      role="button"
                      aria-label={`View details for ${cafe.name}`}
                      aria-pressed={selectedCafe?.id === cafe.id}
                    >
                      <div className="relative w-full h-32 md:h-40 overflow-hidden">
                        {cafe.logoLink ? (
                           <Image
                            src={cafe.logoLink}
                            alt={`Logo of ${cafe.name}`}
                            fill={true}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            style={{objectFit: 'cover'}}
                            data-ai-hint={cafe.dataAiHint || "cafe matcha"}
                            className="group-hover:scale-105 transition-transform duration-300 ease-in-out"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Leaf className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
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
                  <FilterIcon className="w-12 h-12 text-muted-foreground mb-4" />
                  <h2 className="text-lg font-semibold text-foreground mb-2">No Cafes Found</h2>
                  <p className="text-sm text-muted-foreground">
                    Consider submitting a new cafe to our directory!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default HomePage;
