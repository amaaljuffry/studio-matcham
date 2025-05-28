
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Cafe } from '@/types';
import { getPendingCafes, approveCafe, rejectCafe } from '@/services/cafeService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import Link from 'next/link';

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || "supersecret"; // Replace with a strong secret in your .env.local

export default function AdminPage() {
  const [pendingCafes, setPendingCafes] = useState<Cafe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({}); // To track processing state for each cafe

  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const secret = searchParams.get('secret');
    if (secret === ADMIN_SECRET) {
      setIsAuthenticated(true);
    } else {
      // For a real app, redirect to login or show a proper unauthorized page
      // For this simple version, we'll just show a message.
      // router.push('/'); // Or a dedicated unauthorized page
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [searchParams, router]);

  const fetchPending = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    const cafes = await getPendingCafes();
    setPendingCafes(cafes);
    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPending();
    }
  }, [isAuthenticated, fetchPending]);

  const handleApprove = async (cafe: Cafe) => {
    if (!cafe.id) return;
    setIsProcessing(prev => ({ ...prev, [cafe.id!]: true }));
    const success = await approveCafe(cafe);
    if (success) {
      toast({ title: "Cafe Approved", description: `${cafe.name} has been approved and is now live.` });
      fetchPending(); // Refresh list
    } else {
      toast({ title: "Approval Failed", description: `Could not approve ${cafe.name}.`, variant: "destructive" });
    }
    setIsProcessing(prev => ({ ...prev, [cafe.id!]: false }));
  };

  const handleReject = async (cafeId: string, logoLink?: string) => {
    if (!cafeId) return;
    setIsProcessing(prev => ({ ...prev, [cafeId]: true }));
    const success = await rejectCafe(cafeId, logoLink);
    if (success) {
      toast({ title: "Cafe Rejected", description: `Submission has been rejected.` });
      fetchPending(); // Refresh list to ensure data consistency
    } else {
      toast({ title: "Rejection Failed", description: `Could not reject submission.`, variant: "destructive" });
    }
    setIsProcessing(prev => ({ ...prev, [cafeId]: false }));
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-center">You do not have permission to view this page. <br /> Please provide the correct secret key in the URL (e.g., /admin?secret=YOUR_SECRET).</p>
        <p className="text-xs text-muted-foreground mt-4">Note: This is a basic protection mechanism for demo purposes. A real application requires robust authentication.</p>
         <Button variant="outline" asChild className="mt-6">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard - Pending Cafes</h1>
        <p className="text-muted-foreground">Review and manage new matcha cafe submissions.</p>
         <p className="text-xs text-destructive-foreground bg-destructive/80 p-2 rounded-md mt-2">
          Reminder: The current admin access is via a URL secret. For production, implement proper Firebase Authentication.
        </p>
      </header>

      {pendingCafes.length === 0 ? (
        <p className="text-center text-muted-foreground text-lg py-10">No pending submissions. Great job! ✅</p>
      ) : (
        <div className="space-y-6">
          {pendingCafes.map((cafe) => (
            <Card key={cafe.id} className="shadow-md">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                  <div>
                    <CardTitle className="text-xl text-primary">{cafe.name}</CardTitle>
                    <CardDescription>{cafe.address}, {cafe.state}</CardDescription>
                  </div>
                  {cafe.submittedAt && (
                    <Badge variant="outline" className="text-xs whitespace-nowrap mt-1 sm:mt-0">
                      Submitted: {format(new Date(cafe.submittedAt as Date), "PPp")}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {cafe.logoLink && (
                  <div className="w-32 h-32 relative overflow-hidden rounded-md border bg-muted">
                    <Image src={cafe.logoLink} alt={`${cafe.name} logo`} fill style={{objectFit:"contain"}} data-ai-hint="cafe logo" />
                  </div>
                )}
                <p><strong className="text-card-foreground">Halal Status:</strong> {cafe.halalStatus || "Not Specified"}</p>
                <p><strong className="text-card-foreground">Opening Hours:</strong> {cafe.openingHours}</p>
                {cafe.tags && cafe.tags.length > 0 && (
                  <p><strong className="text-card-foreground">Tags:</strong> {cafe.tags.join(', ')}</p>
                )}
                {cafe.latitude && cafe.longitude && (
                     <p><strong className="text-card-foreground">Coordinates:</strong> Lat: {cafe.latitude}, Lng: {cafe.longitude}</p>
                )}
                {cafe.socialMediaLinks && Object.keys(cafe.socialMediaLinks).length > 0 && (
                  <div>
                    <strong className="text-card-foreground">Social Links:</strong>
                    <ul className="list-disc list-inside ml-4 text-sm">
                      {Object.entries(cafe.socialMediaLinks).map(([platform, link]) => link && (
                        <li key={platform}>
                          <span className="capitalize">{platform}:</span> <a href={link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline line-clamp-1 break-all">{link} <ExternalLink className="inline w-3 h-3" /></a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Button 
                  variant="destructive" 
                  onClick={() => handleReject(cafe.id, cafe.logoLink)}
                  disabled={isProcessing[cafe.id]}
                  size="sm"
                >
                  {isProcessing[cafe.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                  Reject
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => handleApprove(cafe)}
                  disabled={isProcessing[cafe.id]}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  {isProcessing[cafe.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Approve
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
