// src/app/unpage.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { Cafe } from "@/services/cafeService"; // Or import from '@/types';
import {
  malaysianStates,
  halalStatusesList,
  additionalTagsList,
} from "@/data/cafes";
// Data fetching (getCafes) is removed from this component
import { CafeDetailsCard } from "@/components/cafe-details-card";
// CafeSubmissionForm will handle its own submission logic or via props
import { CafeSubmissionForm } from "@/components/CafeSubmissionForm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Leaf,
  XCircle,
  MapIcon,
  Terminal,
  PlusCircle,
  Filter as FilterIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  ChevronDown,
  Menu,
  Loader2,
  Coffee,
  Send,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CafeMap } from "@/components/cafe-map";
import { useToast } from "@/hooks/use-toast";

// --- Constants ---
const CAFES_PER_PAGE = 10;
const INITIAL_MAP_CENTER = { lat: 3.139, lng: 101.6869 }; // Kuala Lumpur coordinates
const INITIAL_ZOOM = 7;

// Define props for the HomePage component
interface HomePageProps {
  initialCafes?: Cafe[]; // Data will be passed in as a prop
  isLoading?: boolean;   // Loading state will be passed in as a prop
}

export default function HomePage({ initialCafes = [], isLoading = true }: HomePageProps) {
  // --- Utility Functions ---
  const getParsedDate = useCallback((dateInput: Date | string | undefined | null): Date | null => {
    if (!dateInput) return null;
    if (dateInput instanceof Date) {
        return isNaN(dateInput.getTime()) ? null : dateInput;
    }
    if (typeof dateInput === 'string') {
        const parsed = new Date(dateInput);
        return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }, []);
  // --- State Management ---
  const [allCafes, setAllCafes] = useState<Cafe[]>(initialCafes);
  const [isLoadingCafes, setIsLoadingCafes] = useState<boolean>(isLoading);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | undefined>(
    undefined
  );
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { toast } = useToast();

  // Filter states
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>("All");
  const [selectedHalalFilter, setSelectedHalalFilter] = useState<string>("All");
  const [selectedTagsFilter, setSelectedTagsFilter] = useState<string[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  // CAFES_PER_PAGE is now a constant defined above

  // Effect to update state if props change
  useEffect(() => {
    // When initialCafes (from props) changes, sort them and update the local allCafes state.
    if (initialCafes.length > 0) {
      const sorted = [...initialCafes].sort((a, b) => {
        const approvedatA = getParsedDate(a.approvedat);
        const approvedatB = getParsedDate(b.approvedat);

        if (approvedatA && !approvedatB) return -1; // A has date, B doesn't, A comes first
        if (!approvedatA && approvedatB) return 1;  // B has date, A doesn't, B comes first
        if (approvedatA && approvedatB) {
            // Both have dates, sort by newest approved first
            return approvedatB.getTime() - approvedatA.getTime();
        }
        
        // Fallback to sorting by name if approvedat dates are missing or equal (though unlikely for getTime)
        const nameA = a.name || "";
        const nameB = b.name || "";
        return nameA.localeCompare(nameB);
      });
      setAllCafes(sorted);
    } else {
      setAllCafes([]); // Handle empty or cleared initialCafes
    }
  }, [initialCafes, getParsedDate]); // getParsedDate is stable due to useCallback

  useEffect(() => {
    setIsLoadingCafes(isLoading);
  }, [isLoading]);

  // --- API Key Loading (Google Maps - Unchanged, as it's client-side env var) ---
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_Maps_API_KEY;
    if (key) {
      setGoogleMapsApiKey(key);
    } else {
      toast({
        title: "Map API Key Missing",
        description: "Google Maps functionality may be limited. Please ensure NEXT_PUBLIC_Maps_API_KEY is set.",
        variant: "destructive",
        duration: 8000,
      });
      console.warn(
        "Google Maps API Key (NEXT_PUBLIC_Maps_API_KEY) is missing."
      );
    }
  }, [toast]);

  // --- Memoized Filters and Pagination (Logic Unchanged) ---
  const filteredCafes = useMemo(() => {
    let cafes = [...allCafes]; // Use the state variable 'allCafes' which is now prop-driven
    if (selectedStateFilter !== "All") {
      cafes = cafes.filter((cafe) => cafe.state === selectedStateFilter);
    }
    if (selectedHalalFilter !== "All") {
      cafes = cafes.filter((cafe) => cafe.halalStatus === selectedHalalFilter);
    }
    if (selectedTagsFilter.length > 0) {
      cafes = cafes.filter((cafe) =>
        selectedTagsFilter.every((tag) => cafe.tags?.includes(tag))
      );
    }
    return cafes;
  }, [allCafes, selectedStateFilter, selectedHalalFilter, selectedTagsFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStateFilter, selectedHalalFilter, selectedTagsFilter]);

  const totalPages = Math.ceil(filteredCafes.length / CAFES_PER_PAGE);

  const currentCafesToDisplay = useMemo(() => {
    const indexOfLastCafe = currentPage * CAFES_PER_PAGE;
    const indexOfFirstCafe = indexOfLastCafe - CAFES_PER_PAGE;
    return filteredCafes.slice(indexOfFirstCafe, indexOfLastCafe);
  }, [filteredCafes, currentPage]); // CAFES_PER_PAGE is a constant, not needed in deps


  // --- Handlers ---
  const handleCafeSelect = useCallback(
    (cafe: Cafe | null) => {
      setSelectedCafe(cafe);
      if (cafe) {
        const cafeIndex = filteredCafes.findIndex((c) => c.id === cafe.id);
        if (cafeIndex !== -1) {
          const pageNumberOfSelectedCafe =
            Math.floor(cafeIndex / CAFES_PER_PAGE) + 1;
          if (currentPage !== pageNumberOfSelectedCafe) {
            setCurrentPage(pageNumberOfSelectedCafe);
          }
        }
      }
    },
    [filteredCafes, currentPage] // CAFES_PER_PAGE is a constant
  );

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleStateFilterChange = useCallback((value: string) => {
    setSelectedStateFilter(value);
  }, []);

  const handleHalalFilterChange = useCallback((value: string) => {
    setSelectedHalalFilter(value);
  }, []);

  const handleTagFilterChange = useCallback((tagLabel: string) => {
    setSelectedTagsFilter((prevTags) =>
      prevTags.includes(tagLabel)
        ? prevTags.filter((t) => t !== tagLabel)
        : [...prevTags, tagLabel]
    );
  }, []);

  // Called after CafeSubmissionForm successfully submits.
  // It no longer re-fetches data directly. A parent component would handle data refresh.
  const handleCafeSubmission = useCallback(() => {
    setIsSubmissionDialogOpen(false);
    // Data refresh would be handled by the parent component that provides `initialCafes`
    toast({
        title: "Submission Received",
        description: "Your cafe submission has been received and is pending review!",
        variant: "default",
    });
  }, [toast]); // Removed fetchCafesData dependency

  const handleScrollToExplore = useCallback(() => {
    document
      .getElementById("cafe-listings-section")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // --- JSX Structure (Style and Design Remains) ---
  return ( // Replaced non-standard 'max-w-3/4' with a responsive 'lg:w-3/4' for the main container.
    <div className="flex flex-col min-h-screen bg-matcham-bg text-foreground w-full lg:w-3/4 mx-auto">
      {/* Map Dialog */}
      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="w-[90vw] md:w-[70vw] lg:w-[50vw] min-w-[300px] h-[70vh] md:h-[60vh] lg:h-[50vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b flex-shrink-0">
            <DialogTitle>Matcha Cafe Map</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-hidden">
            {googleMapsApiKey ? (
              <CafeMap
                apiKey={googleMapsApiKey}
                cafes={filteredCafes} // Uses filtered cafes derived from props
                onMarkerClick={(cafe) => {
                  handleCafeSelect(cafe);
                  setIsMapDialogOpen(false);
                }}
                selectedCafe={selectedCafe}
                initialCenter={INITIAL_MAP_CENTER}
                initialZoom={INITIAL_ZOOM}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted text-destructive-foreground p-4 text-center">
                <Alert className="max-w-md mx-auto" variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Map Not Available</AlertTitle>
                  <AlertDescription>
                    Map feature is currently unavailable. This might be due to a missing or invalid Google Maps API key.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Submission Dialog */}
      <Dialog
        open={isSubmissionDialogOpen}
        onOpenChange={setIsSubmissionDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
          <DialogHeader className="pb-3">
            <DialogTitle>Submit a New Matcha Cafe</DialogTitle>
          </DialogHeader>
          {/* CafeSubmissionForm should now handle its own submission logic internally
              or call a prop function for submission that is passed from a higher-order component.
              The onFormSubmit prop here is mainly for UI feedback on this page. */}
          <CafeSubmissionForm onFormSubmit={handleCafeSubmission} />
        </DialogContent>
      </Dialog>

      {/* Header Section (UI remains the same) */}
      <header className="w-full p-4 border-b border-border/40 bg-matcham-bg/40 backdrop-blur-sm sticky top-0 z-20 rounded-lg">
        <div className="w-full flex items-center justify-between">
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
              <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity" aria-label="Go to homepage">
                <Image
                  src="/logo_navbar.svg"
                  alt="Matcham Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </Link>
            )}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="shadow-sm">
              <Link href="/about" className="flex items-center">
                <Info className="w-4 h-4 mr-2" /> About
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMapDialogOpen(true)}
              className="shadow-sm flex items-center"
            >
              <MapIcon className="w-4 h-4 mr-2" /> View Map
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsSubmissionDialogOpen(true)}
              className="shadow-sm flex items-center"
            >
              <Send className="mr-2 h-5 w-5" /> Submit Cafe
            </Button>
          </div>
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shadow-sm" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-3 mt-6">
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-transparent focus-visible:bg-transparent"
                    onClick={() => setIsMenuOpen(false)}
                    asChild
                  >
                    <Link href="/about">
                      <Info className="w-4 h-4 mr-2" />
                      About
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-transparent focus-visible:bg-transparent"
                    onClick={() => {
                      setIsMapDialogOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <MapIcon className="w-4 h-4 mr-2" />
                    View Map
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-transparent focus-visible:bg-transparent"
                    onClick={() => {
                      setIsSubmissionDialogOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Submit Cafe
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Scrollable content area */}
      <ScrollArea className="flex-1 overflow-y-auto">
        {!googleMapsApiKey && (
          <Alert variant="destructive" className="m-4 shrink-0">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Google Maps API Key Warning</AlertTitle>
            <AlertDescription>
              A `NEXT_PUBLIC_Maps_API_KEY` is not set. The map feature may not be functional.
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section (UI remains the same) */}
        <section className="bg-matcham-bg text-center py-10 md:py-16 px-4">
          <div className="mx-auto w-full max-w-2xl">
            <div className="flex justify-center mb-4">
              <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity" aria-label="Go to homepage">
                <Image
                  src="/logo.svg"
                  alt="Matcham Logo"
                  width={300}
                  height={300}
                  className="object-contain"
                />
              </Link>
            </div>
            <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
              Discover exceptional matcha in Malaysia. We're your dedicated guide to the best matcha experiences, not just another directory.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsSubmissionDialogOpen(true)}
                className="shadow-sm flex items-center"
              >
                <Send className="mr-2 h-5 w-5" /> Submit Cafe
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content Area: Cafe Details or List/Filters (UI remains the same) */}
        <div id="cafe-listings-section" className="p-4 w-full">
          {selectedCafe ? (
            <div className="max-w-xl mx-auto">
              <CafeDetailsCard cafe={selectedCafe} />
            </div>
          ) : (
            <>
              {/* Filters Section */}
              <div className="mb-6 p-4 border border-border rounded-lg shadow-sm bg-card max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label
                      htmlFor="state-filter"
                      className="text-sm font-medium text-card-foreground"
                    >
                      State
                    </Label>
                    <Select
                      value={selectedStateFilter}
                      onValueChange={handleStateFilterChange}
                    >
                      <SelectTrigger
                        id="state-filter"
                        className="mt-1 w-full bg-input hover:bg-muted/80 focus:ring-ring"
                      >
                        <SelectValue placeholder="Filter by State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All States</SelectItem>
                        {malaysianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="halal-filter"
                      className="text-sm font-medium text-card-foreground"
                    >
                      Halal Status
                    </Label>
                    <Select
                      value={selectedHalalFilter}
                      onValueChange={handleHalalFilterChange}
                    >
                      <SelectTrigger
                        id="halal-filter"
                        className="mt-1 w-full bg-input hover:bg-muted/80 focus:ring-ring"
                      >
                        <SelectValue placeholder="Filter by Halal Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Halal Statuses</SelectItem>
                        {halalStatusesList.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-card-foreground block mb-1">
                      Additional Tags
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-input hover:bg-muted/80 focus:ring-ring"
                        >
                          {selectedTagsFilter.length > 0
                            ? `${selectedTagsFilter.length} tag(s) selected`
                            : "Filter by Tags"}
                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64">
                        <DropdownMenuLabel>Select Tags</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {additionalTagsList.map((tag) => (
                          <DropdownMenuCheckboxItem
                            key={tag.id}
                            checked={selectedTagsFilter.includes(tag.label)}
                            onCheckedChange={() =>
                              handleTagFilterChange(tag.label)
                            }
                          >
                            {tag.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Cafe List Section */}
              {isLoadingCafes ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <h2 className="text-xl md:text-2xl font-bold mb-1 text-primary">
                    {filteredCafes.length} Matcha Cafe
                    {filteredCafes.length === 1 ? "" : "s"} Found
                  </h2>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Explore matcha cafes across Malaysia. Use the filters above.
                    Click a cafe for details.
                  </p>

                  {currentCafesToDisplay.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                      {currentCafesToDisplay.map((cafe) => (
                        <Card
                          key={cafe.id}
                          onClick={() => handleCafeSelect(cafe)}
                          className={`cursor-pointer group overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 ease-in-out rounded-lg bg-card hover:bg-card/90 w-full ${selectedCafe?.id === cafe.id ? "ring-2 ring-primary" : "ring-1 ring-border"}`}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              handleCafeSelect(cafe);
                          }}
                          role="button"
                          aria-label={`View details for ${cafe.name}`}
                          aria-pressed={selectedCafe?.id === cafe.id}
                        >
                          <div className="flex flex-col sm:flex-row items-stretch">
                            <div className="relative w-full h-48 sm:w-48 sm:h-auto flex-shrink-0">
                              {cafe.logoLink ? (
                                <Image
                                  src={cafe.logoLink}
                                  alt={`Logo of ${cafe.name}`}
                                  fill={true}
                                  sizes="(max-width: 639px) 100vw, 12rem"
                                  className="group-hover:scale-105 transition-transform duration-300 ease-in-out rounded-t-lg sm:rounded-t-none sm:rounded-l-lg object-cover"
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
                                  <h3 className="font-semibold text-lg mb-1 text-card-foreground group-hover:text-primary transition-colors">
                                    {cafe.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {cafe.address}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-auto pt-2">
                                  <Badge
                                    variant="outline"
                                    className="border-accent text-accent bg-accent/10 px-2 py-1"
                                  >
                                    {cafe.rating} ★
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    {cafe.state}
                                  </span>
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
                      <h2 className="text-lg font-semibold text-foreground mb-2">
                        No Cafes Found
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your filters or submit a new cafe to our
                        directory!
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
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer (UI remains the same) */}
      {!selectedCafe && (
        <footer className="text-center p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Matcham by PETAI. All rights
            reserved.
          </p>
          <nav className="mt-2 space-x-4">
            <Link
              href="/terms"
              className="text-xs text-primary hover:underline"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-primary hover:underline"
            >
              Privacy Policy
            </Link>
          </nav>
        </footer>
      )}
    </div>
  );
}