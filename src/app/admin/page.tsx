// src/app/admin/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // signOut is no longer needed directly here
import type { Cafe } from "@/types";
import {
  getPendingCafes,
  approveCafe,
  rejectCafe,
  getTotalCafesCount,
  getTotalApprovedCafesCount,
  getTotalRejectedCafesCount,
  getApprovedCafes,
} from "@/services/cafeService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ShieldAlert, // Still needed for access denied page
  CheckCircle,
  XCircle,
  Clock,
  RefreshCcw, // Needed for refresh button
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Link from "next/link"; // Link might be needed for social media or other links within cards
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "@/components/ui/pagination";

// New imports for dashboard-01 layout
import { MainNav } from "@/components/admin-dashboard/main-nav";
import { UserNav } from "@/components/admin-dashboard/user-nav";
import { TeamSwitcher } from "@/components/admin-dashboard/team-switcher"; // Will create this
import { Search } from "@/components/admin-dashboard/search"; // Will create this

export default function AdminPage() {
  const [pendingCafes, setPendingCafes] = useState<Cafe[]>([]);
  const [isFetchingCafes, setIsFetchingCafes] = useState(false);
  const [processingCafeIds, setProcessingCafeIds] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10; // Number of cafes to display per page

  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);
  const [allCafesForMap, setAllCafesForMap] = useState<Cafe[]>([]); // New state for map data

  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const isAdmin = session?.user?.role === "admin";

  // Redirect if unauthenticated (after mount and session status is known)
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/admin/login");
    }
    // Access denied check will now happen in AdminLayout if it's placed there,
    // or you can keep this specific check for the dashboard content.
    // For now, keeping the check here to show consistent behavior with previous code.
    else if (sessionStatus === "authenticated" && !isAdmin) {
      router.push("/admin/login"); // Or to a public page like '/'
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this page.",
        variant: "destructive",
      });
    }
  }, [sessionStatus, isAdmin, router, toast]);

  const fetchAllCounts = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const [allCafesCount, approvedCafesCount, rejectedCafesCount] = await Promise.all([
        getTotalCafesCount(),
        getTotalApprovedCafesCount(),
        getTotalRejectedCafesCount(),
      ]);
      setTotalSubmissions(allCafesCount);
      setTotalApproved(approvedCafesCount);
      setTotalRejected(rejectedCafesCount);
    } catch (error) {
      console.error("Error fetching total counts:", error);
      toast({
        title: "Error Fetching Totals",
        description: "Could not load dashboard statistics.",
        variant: "destructive",
      });
    }
  }, [isAdmin, toast]);

  const fetchPending = useCallback(async () => {
    if (!isAdmin) return;
    setIsFetchingCafes(true);
    try {
      const { cafes, totalCount } = await getPendingCafes(currentPage, itemsPerPage);
      const cafesWithId = cafes.filter((cafe) => cafe.id);
      cafesWithId.sort((a, b) => {
        const dateA = a.submittedat ? new Date(a.submittedat) : null;
        const dateB = b.submittedat ? new Date(b.submittedat) : null;
        if (dateB && dateA) return dateB.getTime() - dateA.getTime();
        if (dateB) return -1;
        if (dateA) return 1;
        return 0;
      });
      setPendingCafes(cafesWithId);
      setTotalPages(Math.ceil(totalCount / itemsPerPage));
    } catch (error) {
      console.error("Error fetching pending cafes:", error);
      toast({
        title: "Error Fetching Cafes",
        description: "Could not load pending submissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingCafes(false);
    }
  }, [isAdmin, currentPage, itemsPerPage, toast]);

  const fetchAllCafesForMap = useCallback(async () => { // New function to fetch all cafes
    if (!isAdmin) return;
    try {
      const allCafes = await getApprovedCafes(); // Assuming getApprovedCafes fetches all relevant cafes for the map
      setAllCafesForMap(allCafes);
    } catch (error) {
      console.error("Error fetching all cafes for map:", error);
      toast({
        title: "Error Fetching Map Data",
        description: "Could not load all cafe data for the map.",
        variant: "destructive",
      });
    }
  }, [isAdmin, toast]);

  useEffect(() => {
    if (sessionStatus === "authenticated" && isAdmin) {
      fetchPending();
      fetchAllCounts();
      fetchAllCafesForMap(); // Call the new function to fetch all cafes for the map
    }
  }, [sessionStatus, isAdmin, fetchPending, currentPage, fetchAllCounts, fetchAllCafesForMap]);

  const setCafeProcessing = useCallback((cafeId: string, isProcessing: boolean) => {
    setProcessingCafeIds((prev) => {
      const newSet = new Set(prev);
      if (isProcessing) {
        newSet.add(cafeId);
      } else {
        newSet.delete(cafeId);
      }
      return newSet;
    });
  }, []);

  const handleApprove = async (cafe: Cafe) => {
    if (!cafe.id || !isAdmin) {
      toast({
        title: "Permission Denied",
        description: "You are not authorized or cafe ID is missing.",
        variant: "destructive",
      });
      return;
    }
    setCafeProcessing(cafe.id, true);
    try {
      const approvalSuccess = await approveCafe(cafe.id!);
      if (approvalSuccess) {
        toast({
          title: "Cafe Approved",
          description: `${cafe.name} has been approved and moved to the main directory.`,
        });
        router.push("/admin/approved-cafes");
      } else {
        toast({
          title: "Approval Failed",
          description: `Could not approve ${cafe.name}. Please check server logs.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during approval:", error);
      toast({
        title: "Approval Error",
        description: `An unexpected error occurred during approval for ${cafe.name}.`,
        variant: "destructive",
      });
    } finally {
      setCafeProcessing((cafe.id!), false); // Use non-null assertion as we checked for cafe.id
    }
  };

  const handleReject = async (
    cafeId: string,
    cafeName: string,
  ) => {
    if (!cafeId || !isAdmin) {
      toast({
        title: "Permission Denied",
        description: "You are not authorized or cafe ID is missing.",
        variant: "destructive",
      });
      return;
    }
    setCafeProcessing(cafeId, true);
    try {
      const rejectionSuccess = await rejectCafe(cafeId);
      if (rejectionSuccess) {
        toast({
          title: "Cafe Rejected",
          description: `${cafeName} submission has been rejected and removed.`,
        });
        await fetchPending();
      } else {
        toast({
          title: "Rejection Failed",
          description: `Could not reject ${cafeName}. Please check server logs.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during rejection:", error);
      toast({
        title: "Rejection Error",
        description: `An unexpected error occurred during rejection for ${cafeName}.`,
        variant: "destructive",
      });
    } finally {
      setCafeProcessing(cafeId, false);
    }
  };

  // Render authentication/access denied states (these should appear before the layout)
  if (sessionStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-background dark:bg-neutral-950 text-foreground dark:text-neutral-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-violet-500" />
        <p className="ml-4 text-lg text-muted-foreground">
          Loading authentication...
        </p>
      </div>
    );
  }

  if (sessionStatus === "authenticated" && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-neutral-950 p-4 text-center text-foreground dark:text-neutral-100">
        <ShieldAlert className="w-16 h-16 text-destructive dark:text-red-500 mb-4" />
        <h1 className="text-2xl font-semibold text-destructive dark:text-red-400 mb-2">
          Access Denied
        </h1>
        <p className="text-muted-foreground dark:text-neutral-400">
          You do not have the required role to view this page.
        </p>
        {/* Note: signOut button is in AdminLayout, but can be here too for immediate effect */}
        {/* For a more elegant solution, you might have a dedicated /admin/unauthorized page */}
      </div>
    );
  }

  // Main content for the dashboard (now rendered within the AdminLayout)
  return (
    <>
      <div className="md:hidden">
        {/* Placeholder for mobile image, can be removed if not needed */}
      </div>
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            
            <MainNav className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              <Search />
              <UserNav />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
            <div className="flex items-center space-x-2">
              {/* DateRangePicker or other action buttons can go here */}
          <Button
            onClick={fetchPending}
            disabled={isFetchingCafes}
                variant="default"
          >
            {isFetchingCafes ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                  <RefreshCcw className="w-4 h-4" />
            )}
                <span className="ml-2">Refresh Data</span>
          </Button>
        </div>
          </div>
          {/* Dashboard Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <RefreshCcw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSubmissions}</div>
                <p className="text-xs text-muted-foreground">All submitted cafes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Cafes</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalApproved}</div>
                <p className="text-xs text-muted-foreground">Cafes in the main directory</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected Submissions</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRejected}</div>
                <p className="text-xs text-muted-foreground">Submissions that were rejected</p>
              </CardContent>
            </Card>
          </div>

      {/* Pending Cafes List */}
          <Card className="px-0 pb-0 flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold tracking-tight">
            Pending Cafes ({pendingCafes.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
            </CardHeader>
            <CardContent className="px-0 pb-0">
        <ScrollArea className="h-full pr-4">
          {isFetchingCafes && pendingCafes.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-violet-500" />
              <p className="ml-3 text-lg text-muted-foreground">
                Loading pending cafes...
              </p>
            </div>
          ) : pendingCafes.length === 0 ? (
            <p className="text-center text-neutral-400 text-lg py-10">
              No pending submissions. Great job! ✅
            </p>
          ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pendingCafes.map((cafe) => (
                <Card
                  key={cafe.id}
                        className="flex flex-col justify-between bg-neutral-900 border border-neutral-800 text-neutral-100 p-4"
                >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-white text-lg line-clamp-1">{cafe.name}</CardTitle>
                          <CardDescription className="text-neutral-400 text-sm line-clamp-2">
                      {cafe.address}, {cafe.state}
                    </CardDescription>
                  </CardHeader>
                        <CardContent className="space-y-1 text-xs text-neutral-300 flex-grow overflow-hidden">
                    {cafe.logoLink && (
                      <div className="flex items-center gap-2 mb-2">
                              <Label className="font-bold">Logo:</Label>
                        <img
                          src={cafe.logoLink}
                                alt={`${cafe.name} logo`} id="cafe-logo-img"
                                className="w-16 h-16 object-contain border border-neutral-700 rounded-md"
                        />
                      </div>
                    )}
                    <div>
                            <Label className="font-bold">Halal Status:</Label>{" "}
                      <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 border-neutral-700">
                              {cafe.halalstatus}
                      </Badge>
                    </div>
                          <p className="text-sm text-muted-foreground">
                            Opening Hours: {cafe.openinghours}
                    </p>
                          {/* Coordinates removed for brevity/mobile, can be in full details page */}
                          {cafe.socialmedialinks &&
                            Object.keys(cafe.socialmedialinks).length > 0 && (
                              <div className="text-xs">
                          <strong>Socials:</strong>
                                <ul className="list-disc list-inside mt-0.5">
                                  {Object.entries(cafe.socialmedialinks).map(
                              ([platform, link]) => (
                                      <li key={platform} className="truncate">
                                  <Link
                                          href={link as string}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-violet-400 hover:text-violet-300"
                                  >
                                    {platform.charAt(0).toUpperCase() +
                                      platform.slice(1)}
                                  </Link>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    {cafe.tags && cafe.tags.length > 0 && (
                      <div>
                              <Label className="font-bold">Tags:</Label>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                          {cafe.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="border-neutral-700 text-neutral-300 text-xs py-0.5 px-1.5">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center text-xs text-neutral-500 mt-2">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>
                              <Label className="font-bold">Submitted:</Label>{" "}
                              {cafe.submittedat instanceof Date
                                ? cafe.submittedat.toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                          <Label className="text-sm font-bold">Social Media Links:</Label>
                          <div className="flex flex-wrap gap-2">
                            {cafe.socialmedialinks?.website && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={cafe.socialmedialinks.website as string} target="_blank" rel="noopener noreferrer">
                                  Website
                                </Link>
                              </Button>
                            )}
                            {cafe.socialmedialinks?.instagram && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={cafe.socialmedialinks.instagram as string} target="_blank" rel="noopener noreferrer">
                                  Instagram
                                </Link>
                              </Button>
                            )}
                            {cafe.socialmedialinks?.facebook && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={cafe.socialmedialinks.facebook as string} target="_blank" rel="noopener noreferrer">
                                  Facebook
                                </Link>
                              </Button>
                            )}
                            {cafe.socialmedialinks?.twitter && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={cafe.socialmedialinks.twitter as string} target="_blank" rel="noopener noreferrer">
                                  Twitter
                                </Link>
                              </Button>
                            )}
                            {cafe.socialmedialinks?.tiktok && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={cafe.socialmedialinks.tiktok as string} target="_blank" rel="noopener noreferrer">
                                  TikTok
                                </Link>
                              </Button>
                            )}
                            {cafe.socialmedialinks?.whatsapp && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={cafe.socialmedialinks.whatsapp as string} target="_blank" rel="noopener noreferrer">
                                  WhatsApp
                                </Link>
                              </Button>
                            )}
                          </div>
                  </CardContent>
                        <CardFooter className="flex gap-2 justify-end pt-3">
                          {/* <Link href={`/admin/edit-cafe/${cafe.id}`} passHref>
                            <Button variant="outline" size="sm" className="bg-neutral-700 text-neutral-200 hover:bg-neutral-600 border-neutral-600">
                              Edit
                            </Button>
                          </Link> */}
                    <Button
                      onClick={() =>
                              handleReject(cafe.id!, cafe.name)
                      }
                            disabled={processingCafeIds.has(cafe.id!)}
                      variant="destructive"
                      size="sm"
                    >
                            {processingCafeIds.has(cafe.id!) ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(cafe)}
                            disabled={processingCafeIds.has(cafe.id!)}
                      size="sm"
                    >
                            {processingCafeIds.has(cafe.id!) ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Approve
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
                {pendingCafes.length === 0 && !isFetchingCafes && (
                  <p className="text-center text-sm text-neutral-400 mt-4"></p>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-4 mt-8 mb-12 mx-auto">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1 || isFetchingCafes} />
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
                            if (curr > 4) pages.push('...');
                            for (let i = Math.max(2, curr - 1); i <= Math.min(total - 1, curr + 1); i++) {
                              if (i === 1 || i === total) continue;
                              pages.push(i);
                            }
                            if (curr < total - 3) pages.push('...');
                            pages.push(total);
                          }
                          return pages.map((page, idx) =>
                            page === '...'
                              ? <PaginationEllipsis key={"ellipsis-" + idx} />
                              : <PaginationItem key={page}>
                                  <PaginationLink
                                    isActive={currentPage === page}
                                    onClick={() => setCurrentPage(page as number)}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                          );
                        })()}
                        <PaginationItem>
                          <PaginationNext onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || isFetchingCafes} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
        </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}