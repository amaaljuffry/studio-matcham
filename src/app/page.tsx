
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { Cafe } from "@/types";
import { mockCafes } from "@/data/cafes";
import { CafeDetailsCard } from "@/components/cafe-details-card";
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
import { Leaf, XCircle, MapIcon, Terminal, PlusCircle, Filter as FilterIcon, ChevronLeft, ChevronRight, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


function HomePage() {
  const [allCafes] = useState<Cafe[]>(mockCafes);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | undefined>(undefined);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const cafesPerPage = 10;


  useEffect(() => {
    // Only run on client
    setGoogleMapsApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  }, []);

  // Reset to first page if allCafes changes or selectedCafe changes to null (back to list)
  useEffect(() => {
    if (selectedCafe && !allCafes.find(c => c.id === selectedCafe.id)) {
      setSelectedCafe(null); 
    }
    setCurrentPage(1); 
  }, [allCafes, selectedCafe === null]); // Added selectedCafe === null condition


  const handleCafeSelect = useCallback((cafe: Cafe | null) => {
    setSelectedCafe(cafe);
  }, []);
  
  const initialMapCenter = useMemo(() => ({ lat: 3.1390, lng: 101.6869 }), []); 
  const initialMapZoom = 10;

  // Pagination logic
  const indexOfLastCafe = currentPage * cafesPerPage;
  const indexOfFirstCafe = indexOfLastCafe - cafesPerPage;
  const currentCafesToDisplay = useMemo(() => {
    return allCafes.slice(indexOfFirstCafe, indexOfLastCafe);
  }, [allCafes, indexOfFirstCafe, indexOfLastCafe]);

  const totalPages = Math.ceil(allCafes.length / cafesPerPage);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };


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
                <p className="text-center p-4">Map component placeholder. CafeMap would go here.</p>
                // Actual map component is commented out as per previous requests, but API key logic retained
                // <CafeMap
                //   apiKey={googleMapsApiKey}
                //   cafes={allCafes} 
                //   onMarkerClick={(cafe) => {
                //     handleCafeSelect(cafe);
                //     setIsMapDialogOpen(false); 
                //   }}
                //   selectedCafe={selectedCafe}
                //   initialCenter={initialMapCenter}
                //   initialZoom={initialMapZoom}
                // />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted text-destructive-foreground p-4">
                    Map feature is currently under review or API key is missing. Check back soon!
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

          <Link href="/about" passHref>
            <Button variant="outline" size="sm" className="shadow-sm">
              <Info className="w-4 h-4 mr-2" />
              About
            </Button>
          </Link>
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
        <div className="p-4 mx-auto w-full md:w-3/4">
          {selectedCafe ? (
            <CafeDetailsCard cafe={selectedCafe} />
          ) : (
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-1 text-primary">
                {allCafes.length} Matcha Cafes Found
              </h1>
              <p className="text-muted-foreground mb-4 text-sm">
                Explore matcha cafes across Malaysia. Click "View Map" to see locations, "Submit Cafe" to add a new one, or "About" to learn more about Matcham.
              </p>
              
              {currentCafesToDisplay.length > 0 ? (
                <div className="space-y-4">
                  {currentCafesToDisplay.map((cafe) => (
                    <Card
                      key={cafe.id}
                      onClick={() => handleCafeSelect(cafe)}
                      className={`cursor-pointer group overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 ease-in-out rounded-lg bg-card hover:bg-card/90 w-full ${selectedCafe?.id === cafe.id ? "ring-2 ring-primary" : ""}`}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCafeSelect(cafe);}}
                      role="button"
                      aria-label={`View details for ${cafe.name}`}
                      aria-pressed={selectedCafe?.id === cafe.id}
                    >
                      <div className="flex flex-col sm:flex-row items-stretch">
                        <div className="relative sm:w-48 md:w-64 h-48 sm:h-auto flex-shrink-0">
                          {cafe.logoLink ? (
                            <Image
                              src={cafe.logoLink}
                              alt={`Logo of ${cafe.name}`}
                              fill={true}
                              sizes="(max-width: 639px) 100vw, (max-width: 767px) 12rem, 16rem"
                              style={{objectFit: 'cover'}}
                              data-ai-hint={cafe.dataAiHint || "cafe matcha"}
                              className="group-hover:scale-105 transition-transform duration-300 ease-in-out rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center rounded-t-lg sm:rounded-l-lg sm:rounded-t-none">
                              <Leaf className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow flex flex-col">
                          <CardContent className="p-4 flex flex-col h-full">
                            <div>
                              <h3 className="font-semibold text-lg mb-1 text-card-foreground group-hover:text-primary transition-colors">{cafe.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{cafe.address}</p>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-auto pt-2">
                              <Badge variant="outline" className="border-accent text-accent bg-accent/10 px-2 py-1">
                                {cafe.rating} ★
                              </Badge>
                              <span className="text-muted-foreground">{cafe.state}</span>
                            </div>
                          </CardContent>
                        </div>
                      </div>
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

              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-8 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="shadow-sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
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
