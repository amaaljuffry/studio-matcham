"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText } from 'lucide-react';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-20">
        <Link href="/" passHref>
          <Button variant="default" size="sm" className="hover:bg-accent/10 hover:text-accent-foreground border-accent  flex items-center shadow-sm">
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
              These terms and conditions outline the rules and regulations for using Matcham’s website, located at https://matcha.my.
            </p>
            <p className="text-muted-foreground mt-2">
              By accessing or using this website, you agree to comply with and be bound by these terms. If you do not agree, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">User Submissions</h2>
            <p className="text-muted-foreground">
              By submitting content (e.g., cafe information, reviews, images) to Matcham, you grant us a non-exclusive, worldwide, royalty-free, irrevocable, sublicensable license to use, reproduce, adapt, publish, translate, and distribute it in any and all media.
            </p>
            <p className="text-muted-foreground mt-2">
              You warrant and represent that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 mt-1 space-y-1">
              <li>You are entitled to submit the content and have all necessary licenses and consents to do so;</li>
              <li>The content does not infringe any intellectual property rights, including copyright, patent, or trademark of any third party;</li>
              <li>The content does not contain defamatory, libelous, offensive, indecent, or otherwise unlawful material or invade anyone’s privacy.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              We reserve the right to monitor, verify, and remove submissions that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Publicly Available Information & Data Sources</h2>
            <p className="text-muted-foreground">
              Matcham may display publicly available business information (such as names, locations, operating hours) sourced from third-party platforms including but not limited to Google Maps, social media, and official business websites.
            </p>
            <p className="text-muted-foreground mt-2">
              We comply with the terms and conditions of these third-party services and do not engage in unauthorized data scraping. Our data sourcing follows legal and ethical standards.
            </p>
            <p className="text-muted-foreground mt-2">
              If you are a business owner and would like to update or remove your listing, please contact us at <a href="mailto:contact@matcha.my" className="text-primary underline">contact@matcha.my</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Accuracy of Information</h2>
            <p className="text-muted-foreground">
              While we strive to ensure the information is accurate and up-to-date, we do not guarantee its completeness or reliability. Users are encouraged to verify details directly with the businesses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the fullest extent permitted by law, we disclaim all liability arising from your use of this website. Nothing in this section excludes liability that cannot legally be excluded.
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 mt-1 space-y-1">
              <li>We do not exclude liability for death or personal injury caused by our negligence;</li>
              <li>Or for fraud or fraudulent misrepresentation;</li>
              <li>Or for any matter which it would be illegal to limit or exclude our liability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may revise these terms at any time. Continued use of Matcham after updates constitutes your acceptance. Please review these terms periodically.
            </p>
          </section>

          <p className="text-muted-foreground mt-6 text-sm">
            Last updated: 22 May 2025
          </p>
        </div>

        <Footer />
      </main>
    </div>
  );
}
