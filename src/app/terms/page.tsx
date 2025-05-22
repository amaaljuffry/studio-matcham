
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText } from 'lucide-react';

export default function TermsPage() {
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
          <FileText className="w-6 h-6 mr-2" /> Terms of Service
        </h1>
        <div className="w-36 sm:w-48"></div> {/* Spacer */}
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto w-full md:max-w-3xl space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Welcome to Matcham!</h2>
            <p className="text-muted-foreground">
              These terms and conditions outline the rules and regulations for the use of Matcham's Website, located at [Your Website URL Here].
            </p>
            <p className="text-muted-foreground mt-2">
              By accessing this website we assume you accept these terms and conditions. Do not continue to use Matcham if you do not agree to take all of the terms and conditions stated on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">User Submissions</h2>
            <p className="text-muted-foreground">
              By submitting content (e.g., cafe information, reviews, images) to Matcham, you grant us a non-exclusive, worldwide, royalty-free, irrevocable, sub-licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.
            </p>
            <p className="text-muted-foreground mt-2">
              You warrant and represent that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 mt-1 space-y-1">
              <li>You are entitled to submit the content and have all necessary licenses and consents to do so;</li>
              <li>The content does not invade any intellectual property right, including without limitation copyright, patent or trademark of any third party;</li>
              <li>The content does not contain any defamatory, libelous, offensive, indecent or otherwise unlawful material which is an invasion of privacy.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Matcham reserves the right to monitor all submissions and to remove any content which can be considered inappropriate, offensive or causes breach of these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Accuracy of Information</h2>
            <p className="text-muted-foreground">
              While we strive to ensure that the information on this website is correct, we do not warrant its completeness or accuracy; nor do we promise to ensure that the website remains available or that the material on the website is kept up to date. Information is provided on a best-effort basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:
            </p>
             <ul className="list-disc list-inside text-muted-foreground ml-4 mt-1 space-y-1">
                <li>limit or exclude our or your liability for death or personal injury;</li>
                <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
                <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
                <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to revise these terms and conditions at any time. By using this website, you are expected to review these terms on a regular basis.
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
