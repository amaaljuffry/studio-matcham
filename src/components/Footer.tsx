'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="text-center p-4 mt-8 border-t border-border">
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Matcham by PETAI. All rights reserved.
      </p>
      <nav className="mt-2 space-x-4">
        <Link href="/terms" className="text-xs text-primary hover:underline">
          Terms of Service
        </Link>
        <Link href="/privacy" className="text-xs text-primary hover:underline">
          Privacy Policy
        </Link>
        <Link href="/contact" className="text-xs text-primary hover:underline">
          Contact Us
        </Link>
        <Link href="/feedback" className="text-xs text-primary hover:underline">
          Feedback
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;