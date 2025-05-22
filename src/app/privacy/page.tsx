
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <ShieldCheck className="w-6 h-6 mr-2" /> Privacy Policy
        </h1>
        <div className="w-36 sm:w-48"></div> {/* Spacer */}
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto w-full md:max-w-3xl space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to Matcham. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at [Your Contact Email or Link to Contact Page].
            </p>
            <p className="text-muted-foreground mt-2">
              This Privacy Policy applies to all information collected through our website ([Your Website URL Here]), and/or any related services, sales, marketing or events (we refer to them collectively in this privacy policy as the "Services").
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and services, when you participate in activities on the Services (such as submitting cafe information) or otherwise contacting us.
            </p>
            <p className="text-muted-foreground mt-2">
              The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make and the products and features you use. The personal information we collect may include the following:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 mt-1 space-y-1">
              <li>Names</li>
              <li>Email addresses</li>
              <li>Contact preferences</li>
              <li>Usernames (if user accounts are implemented)</li>
              <li>Cafe details submitted by users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
            </p>
             <ul className="list-disc list-inside text-muted-foreground ml-4 mt-1 space-y-1">
                <li>To facilitate account creation and logon process (if applicable).</li>
                <li>To send administrative information to you.</li>
                <li>To manage user submissions and operate the directory.</li>
                <li>To respond to user inquiries/offer support to users.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Will Your Information Be Shared With Anyone?</h2>
            <p className="text-muted-foreground">
              We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. Cafe information submitted by users is intended for public display on our directory.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Data Security</h2>
            <p className="text-muted-foreground">
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible.
            </p>
          </section>

          <p className="text-muted-foreground mt-6 text-sm">
            Last updated: [Date of Last Update]
          </p>
        </div>
         <footer className="text-center p-4 mt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Matcham. All rights reserved.</p>
          <nav className="mt-2 space-x-4">
            <Link href="/terms" className="text-xs text-primary hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="text-xs text-primary hover:underline">Privacy Policy</Link>
          </nav>
        </footer>
      </main>
    </div>
  );
}
