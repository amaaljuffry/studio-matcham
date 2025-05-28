// src/app/admin/rejected-cafes/page.tsx

"use client";

import React from 'react';
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  Loader2,
  LayoutDashboard, // Keep if used for access denied or other specific error messages
  ListChecks,
  Archive, // This one was explicitly reported as missing
  User,
  LogOut,
  RefreshCcw,
  XCircle, // For delete button
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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

import type { Cafe } from "@/types";
import { getRejectedCafes, deleteCafe, rejectedCafesCollectionRef } from "@/services/cafeService";


export default function RejectedCafesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [rejectedCafes, setRejectedCafes] = React.useState<Cafe[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState<Set<string>>(new Set());

  const isAdmin = session?.user?.role === "admin";

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/admin/login");
    } else if (sessionStatus === "authenticated" && !isAdmin) {
      router.push("/admin/login");
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this page.",
        variant: "destructive",
      });
    }
  }, [sessionStatus, isAdmin, router, toast]);

  const fetchRejected = React.useCallback(async () => {
    if (!isAdmin) return;
    setIsFetching(true);
    try {
      const cafes = await getRejectedCafes();
      setRejectedCafes(cafes);
    } catch (error) {
      console.error("Error fetching rejected cafes:", error);
      toast({
        title: "Error",
        description: "Failed to load rejected cafes.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  }, [isAdmin, toast]);

  React.useEffect(() => {
    if (sessionStatus === "authenticated" && isAdmin) {
      fetchRejected();
    }
  }, [sessionStatus, isAdmin, fetchRejected]);

  const setCafeProcessing = React.useCallback((cafeId: string, processing: boolean) => {
    setIsProcessing(prev => {
      const newSet = new Set(prev);
      if (processing) {
        newSet.add(cafeId);
      } else {
        newSet.delete(cafeId);
      }
      return newSet;
    });
  }, []);

  const handleDelete = async (cafeId: string, cafeName: string, logoLink?: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${cafeName}" from rejected submissions? This action cannot be undone.`)) {
      return;
    }
    setCafeProcessing(cafeId, true);
    try {
      const success = await deleteCafe(cafeId, rejectedCafesCollectionRef, logoLink);
      if (success) {
        toast({ title: "Cafe Deleted", description: `${cafeName} has been permanently removed from rejected submissions.` });
        fetchRejected();
      } else {
        toast({ title: "Deletion Failed", description: `Could not delete ${cafeName}.`, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error deleting rejected cafe:", error);
      toast({ title: "Error", description: "An unexpected error occurred during deletion.", variant: "destructive" });
    } finally {
      setCafeProcessing(cafeId, false);
    }
  };


  // Render loading/access denied states (these should appear before the layout)
  if (sessionStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-neutral-950 text-neutral-100">
        <Loader2 className="h-12 w-12 animate-spin text-violet-500" />
        <p className="ml-4 text-lg text-neutral-400">Loading authentication...</p>
      </div>
    );
  }

  if (sessionStatus === "authenticated" && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-4 text-center text-neutral-100">
        <LayoutDashboard className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-semibold text-red-400 mb-2">Access Denied</h1>
        <p className="text-neutral-400">You do not have the required role to view this page.</p>
      </div>
    );
  }

  // Main content for Rejected Cafes (now rendered within the AdminLayout)
  return (
    <>
      <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-8 py-5 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Rejected Submissions
          </h1>
          <p className="text-neutral-400 mt-1 text-sm">
            Review and manage all rejected matcha cafe submissions.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={fetchRejected}
            disabled={isFetching}
            className="rounded-lg bg-neutral-800 px-3 py-2 text-neutral-300 hover:bg-neutral-700"
            variant="ghost"
          >
            {isFetching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCcw className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      <section className="px-8 pb-8 flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-4 mt-6">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Total Rejected Cafes ({rejectedCafes.length})
          </h2>
        </div>
        <ScrollArea className="h-full pr-4">
          {isFetching && rejectedCafes.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-violet-500" />
              <p className="ml-3 text-lg text-muted-foreground">
                Loading rejected cafes...
              </p>
            </div>
          ) : rejectedCafes.length === 0 ? (
            <p className="text-center text-neutral-400 text-lg py-10">
              No rejected cafes found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rejectedCafes.map((cafe) => (
                <Card
                  key={cafe.id}
                  className="flex flex-col justify-between bg-neutral-900 border border-neutral-800 text-neutral-100"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white">{cafe.name}</CardTitle>
                    <CardDescription className="text-neutral-400">
                      {cafe.address}, {cafe.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-neutral-300">
                    {cafe.logoLink && (
                      <div className="flex items-center gap-2 mb-2">
                        <strong>Logo:</strong>
                        <img
                          src={cafe.logoLink}
                          alt={`${cafe.name} logo`}
                          className="w-20 h-20 object-contain border border-neutral-700 rounded-md"
                        />
                      </div>
                    )}
                    <div>
                      <strong>Halal Status:</strong>{" "}
                      <Badge
                        variant="secondary"
                        className="bg-neutral-800 text-neutral-300 border-neutral-700"
                      >
                        {cafe.halalStatus}
                      </Badge>
                    </div>
                    <p>
                      <strong>Opening Hours:</strong> {cafe.openingHours}
                    </p>
                    {cafe.latitude !== undefined &&
                      cafe.longitude !== undefined && (
                        <p>
                          <strong>Coordinates:</strong> {cafe.latitude},{" "}
                          {cafe.longitude}
                        </p>
                      )}
                    {cafe.socialMediaLinks &&
                      Object.keys(cafe.socialMediaLinks).length > 0 && (
                        <div>
                          <strong>Socials:</strong>
                          <ul className="list-disc list-inside">
                            {Object.entries(cafe.socialMediaLinks).map(
                              ([platform, link]) => (
                                <li key={platform}>
                                  <Link
                                    href={link}
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
                        <strong>Tags:</strong>
                        <div className="flex flex-wrap gap-1">
                          {cafe.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="border-neutral-700 text-neutral-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center text-xs text-neutral-500 mt-2">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>
                        Rejected:{" "}
                        {cafe.rejectedAt instanceof Date
                          ? cafe.rejectedAt.toLocaleString()
                          : (cafe.rejectedAt ? new Date(cafe.rejectedAt as any).toLocaleString() : 'N/A')}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 justify-end pt-4">
                    {/* TODO: Add an "Re-approve" or "Edit" button here if desired */}
                    <Button
                      onClick={() => handleDelete(cafe.id!, cafe.name, cafe.logoLink)}
                      disabled={isProcessing.has(cafe.id!)}
                      variant="destructive"
                      size="sm"
                    >
                      {isProcessing.has(cafe.id!) ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Delete Permanently
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </section>
    </>
  );
}