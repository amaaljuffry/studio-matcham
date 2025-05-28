
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info as InfoIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-20">
        <Link href="/" passHref>
          <Button variant="outline" size="sm" className="hover:bg-accent/10 hover:text-accent-foreground border-accent text-accent flex items-center shadow-sm">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Cafes
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-primary flex items-center">
          <InfoIcon className="w-6 h-6 mr-2" /> About 
        </h1>
        {/* Spacer to balance the back button, adjust width as needed */}
        <div className="w-36 sm:w-48"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto w-full md:max-w-3xl space-y-10">

          <section aria-labelledby="welcome-heading">
            <h2 id="welcome-heading" className="text-2xl font-semibold text-primary mb-3">Welcome to Matcham</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                The dedicated hub for matcha lovers across Malaysia! If you're on the hunt for your next perfect cup, you've come to the right place. We're not aiming to be another generic directory; instead, we're building a focused resource for finding truly exceptional matcha experiences.
              </p>
              <p>
                This platform thrives on community spirit. We're constantly evolving, and new features will be introduced thoughtfully, much like the slow, deliberate whisking of a bowl of perfect matcha with a chasen.
              </p>
              <p>
                Want to contribute? You can start by sharing your favorite local matcha cafes with the community. If you're a developer, we welcome your contributions!
              </p>
            </div>
          </section>

          <section aria-labelledby="get-in-touch-heading">
            <h2 id="get-in-touch-heading" className="text-2xl font-semibold text-primary mb-3">Get in Touch</h2>
            <p className="text-muted-foreground">
              Have questions, feedback, or just want to chat about matcha? Reach out to us directly at <a href="https://instagram.com/matcham.my" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">@matcham.my</a> on Instagram. We'd love to hear from you!
            </p>
          </section>

          <section aria-labelledby="halal-info-heading">
            <Card className="shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Halal Information at Matcham</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>
                  We understand the importance of Halal dietary requirements for many of our users. While we strive to provide accurate information, please note that we can only randomly verify data by contacting owners directly due to limited resources. We encourage you to exercise caution and cross-verify information, especially regarding the status of cafes submitted by others.
                </p>
                <p>
                  The "Muslim Owner" tag is often questioned, so here's a clarification: In Islam, food and drinks must adhere to specific requirements, ensuring no alcohol, proper animal slaughter methods, and avoidance of prohibited products like pork. These criteria define what is considered Halal.
                </p>
                <p>
                  While matcha itself is generally fine, it's typically the food served alongside it in cafes that has more stringent Halal requirements. A "Muslim Owner" often implies the use of Halal ingredients and the absence of pork or alcohol, providing guidance for Muslim consumers.
                </p>
                <p>
                  We also recognize that many non-Muslim owned matcha cafes offer entirely Halal menus, free from alcohol and pork. Our goal is to provide as much relevant information as possible so you can make informed decisions about where to enjoy your matcha. Ultimately, how you use this information is up to your personal discretion.
                </p>
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="disclaimer-heading">
            <h2 id="disclaimer-heading" className="text-2xl font-semibold text-primary mb-3">Disclaimer</h2>
            <p className="text-muted-foreground">
              All information on Matcham is verified on a best-effort basis. Please double-check details if you believe they are inaccurate. We are not responsible for how you utilize the information provided on this website.
            </p>
          </section>
        </div>
         <footer className="text-center p-4 mt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Matcham by PETAI. All rights reserved.</p>
          <nav className="mt-2 space-x-4">
            <Link href="/terms" className="text-xs text-primary hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="text-xs text-primary hover:underline">Privacy Policy</Link>
          </nav>
        </footer>
      </main>
    </div>
  );
}
