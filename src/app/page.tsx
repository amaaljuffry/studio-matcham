"use client";

import { Header } from "@/components/Header";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  malaysianStates,
  halalStatusesList,
  additionalTagsList,
} from "@/data/cafes";
import type { Cafe } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import Image from "next/image";
import {
  XCircle,
  Info,
  MapIcon,
  Send,
  Menu,
  PlusCircle,
  Terminal,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CafeSubmissionForm } from "@/components/CafeSubmissionForm";
import { CafeMap } from "@/components/cafe-map";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { MapDialog } from "@/components/MapDialog";
import { CafeDetailsCard } from "@/components/cafe-details-card";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Leaf,
  FilterIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "@/components/ui/pagination";
import { Banner5 } from "@/components/banner";

const PAGE_SIZE = 10;

export default function Home() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [allCafesForMap, setAllCafesForMap] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingCafes, setIsLoadingCafes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [currentCafesToDisplay, setCurrentCafesToDisplay] = useState<Cafe[]>(
    []
  );

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStateFilter, setSelectedStateFilter] = useState("All");
  const [selectedHalalFilter, setSelectedHalalFilter] = useState("All");
  const [selectedTagsFilter, setSelectedTagsFilter] = useState<string[]>([]);

  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;
  const initialMapCenter = { lat: 3.139, lng: 101.6869 }; // Kuala Lumpur coordinates
  const initialZoom = 7;

  const handleCafeSelect = (cafe: Cafe | null) => {
    setSelectedCafe(cafe);
  };

  const statesOptions = ["All", ...malaysianStates];
  const halalOptions = [{ id: "All", label: "All" }, ...halalStatusesList];
  const tagOptions = additionalTagsList;

  const fetchAndFilterCafes = useCallback(async () => {
    setIsLoadingCafes(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("cafes")
        .select("*")
        .order("name", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setFilteredCafes([]);
        setCurrentCafesToDisplay([]);
        setTotalCount(0);
        return;
      }

      let currentCafes = data ?? [];

      if (searchTerm.trim() !== "") {
        currentCafes = currentCafes.filter((cafe) =>
          cafe.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
        );
      }

      if (selectedStateFilter !== "All") {
        currentCafes = currentCafes.filter(
          (cafe) => cafe.state === selectedStateFilter
        );
      }

      if (selectedHalalFilter !== "All") {
        currentCafes = currentCafes.filter(
          (cafe) => cafe.halalstatus === selectedHalalFilter
        );
      }

      if (selectedTagsFilter.length > 0) {
        currentCafes = currentCafes.filter(
          (cafe) =>
            cafe.tags &&
            cafe.tags.some((tag: string) => selectedTagsFilter.includes(tag))
        );
      }

      setFilteredCafes(currentCafes);
      setTotalCount(currentCafes.length);

      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE;
      setCurrentCafesToDisplay(currentCafes.slice(from, to));
    } catch (err: any) {
      setError(err.message);
      setFilteredCafes([]);
      setCurrentCafesToDisplay([]);
      setTotalCount(0);
    } finally {
      setIsLoadingCafes(false);
    }
  }, [
    searchTerm,
    selectedStateFilter,
    selectedHalalFilter,
    selectedTagsFilter,
    currentPage,
  ]);

  const handleStateFilterChange = (value: string) => {
    setSelectedStateFilter(value);
    setCurrentPage(1);
  };

  const handleHalalFilterChange = (value: string) => {
    setSelectedHalalFilter(value);
    setCurrentPage(1);
  };

  const handleTagFilterChange = (tagId: string) => {
    setSelectedTagsFilter((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const fetchAllCafesForMap = useCallback(async () => {
    const { data, error } = await supabase.from("cafes").select("*"); // Select all cafes without pagination

    if (error) {
      console.error("Error fetching all cafes for map:", error.message);
    } else {
      setAllCafesForMap(data ?? []);
    }
  }, []);

  useEffect(() => {
    fetchAndFilterCafes();
    fetchAllCafesForMap();
  }, [fetchAndFilterCafes, fetchAllCafesForMap]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <header className="w-full p-4 border-b border-border/40 bg-matcham-bg/40 backdrop-blur-sm sticky top-0 z-20 rounded-lg">
        <Banner5
          title="Hello! Your Malaysian Matcha Journey Begins."
          description=""
          buttonText="Discover Now"
          buttonUrl="/"
        />
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
              <Link
                href="/"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                aria-label="Go to homepage"
              >
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
            <ThemeToggle />
          </div>
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shadow-sm"
                  aria-label="Open menu"
                >
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

      {/* Hero Section */}
      <section className="bg-matcham-bg text-center py-10 md:py-16 px-4">
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex justify-center mb-4">
            <Link
              href="/"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Go to homepage"
            >
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
            Discover exceptional matcha in Malaysia. We're your dedicated guide
            to the best matcha experiences, not just another directory.
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

      <main className="w-full max-w-4xl mx-auto font-sans">
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
                        {halalStatusesList.map(
                          (status: { id: string; label: string }) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.label}
                            </SelectItem>
                          )
                        )}
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
                        {additionalTagsList.map(
                          (tag: { id: string; label: string }) => (
                            <DropdownMenuCheckboxItem
                              key={tag.id}
                              checked={selectedTagsFilter.includes(tag.id)}
                              onCheckedChange={() =>
                                handleTagFilterChange(tag.id)
                              }
                            >
                              {tag.label}
                            </DropdownMenuCheckboxItem>
                          )
                        )}
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
                  <p className="text-sm text-muted-foreground mb-4 text-sm">
                    Explore matcha cafes across Malaysia. Use the filters above.
                    Click a cafe for details.
                  </p>

                  {currentCafesToDisplay.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentCafesToDisplay.map((cafe: Cafe) => (
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
                          <div className="flex flex-col sm:flex-row  items-center p-2">
                            <div className="relative w-32 h-32 flex-shrink-0 mr-4">
                              {cafe.logoLink ? (
                                <Image
                                  src={cafe.logoLink}
                                  alt={`Logo of ${cafe.name}`}
                                  fill={true}
                                  sizes="(max-width: 639px) 100vw, 12rem"
                                  className="group-hover:scale-105 transition-transform duration-300 ease-in-out rounded-lg object-contain"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
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
                                  {/* <Badge
                                    variant="outline"
                                    className="border-accent text-accent bg-accent/10 px-2 py-1"
                                  >
                                    {cafe.rating} ★
                                  </Badge> */}
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
                    <div className="flex items-center justify-center space-x-4 mt-8 mb-4 mx-auto">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={handlePrevPage}
                              disabled={currentPage === 1}
                            />
                          </PaginationItem>
                          {(() => {
                            const pages = [];
                            const total = totalPages;
                            const curr = currentPage;

                            if (total <= 7) {
                              for (let i = 1; i <= total; i++) {
                                pages.push(i);
                              }
                            } else {
                              pages.push(1);
                              if (curr > 4) pages.push("...");
                              for (
                                let i = Math.max(2, curr - 1);
                                i <= Math.min(total - 1, curr + 1);
                                i++
                              ) {
                                if (i === 1 || i === total) continue;
                                pages.push(i);
                              }
                              if (curr < total - 3) pages.push("...");
                              pages.push(total);
                            }

                            return pages.map((page, idx) =>
                              page === "..." ? (
                                <PaginationEllipsis key={"ellipsis-" + idx} />
                              ) : (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    isActive={currentPage === page}
                                    onClick={() =>
                                      setCurrentPage(page as number)
                                    }
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            );
                          })()}
                          <PaginationItem>
                            <PaginationNext
                              onClick={handleNextPage}
                              disabled={currentPage === totalPages}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />

      {/* Submission Dialog */}
      <Dialog
        open={isSubmissionDialogOpen}
        onOpenChange={setIsSubmissionDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px] md:max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Submit New Cafe</DialogTitle>
            <DialogDescription>
              Fill in the details for a new matcha cafe submission.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <CafeSubmissionForm
              onFormSubmit={() => setIsSubmissionDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Map Dialog */}
      <MapDialog
        open={isMapDialogOpen}
        onOpenChange={setIsMapDialogOpen}
        cafes={allCafesForMap}
        onMarkerClick={setSelectedCafe}
        selectedCafe={selectedCafe}
        initialCenter={initialMapCenter}
        initialZoom={initialZoom}
      />
    </>
  );
}
