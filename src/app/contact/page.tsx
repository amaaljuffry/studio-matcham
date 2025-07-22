import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Contact Us</CardTitle>
          <CardDescription className="text-muted-foreground">We'd love to hear from you!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-foreground">
            Have questions, feedback, or a cafe submission request? Feel free to reach out to us.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Email</h3>
              <p className="text-muted-foreground">
                For general inquiries and support, please email us at:
                <br />
                <a href="mailto:support@matcham.com" className="text-primary hover:underline">support@matcham.com</a>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Cafe Submissions</h3>
              <p className="text-muted-foreground">
                If you'd like to submit a new cafe to our directory, you can use our dedicated submission form:
                <br />
                <Link href="/" passHref>
                  <Button variant="link" className="px-0 text-primary hover:underline">
                    Submit a Cafe
                  </Button>
                </Link>
              </p>
            </div>
          </div>
          <div className="text-center pt-4">
            <Link href="/" passHref>
              <Button variant="outline" className="flex items-center mx-auto">
                <ChevronLeft className="h-4 w-4 mr-2" /> Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 