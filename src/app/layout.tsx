// src/app/layout.tsx

// NO "use client"; directive here. This file will remain a Server Component.

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// You will create a new client component to wrap NextAuthProvider
import ClientProviders from "@/components/ClientProviders"; // <-- NEW Client Component wrapper
import { Toaster } from "@/components/ui/toaster"; // Assuming this is also a client component

const inter = Inter({ subsets: ["latin"] });

// Metadata export is now valid because this is a Server Component
export const metadata: Metadata = {
  title: "Matcham",
  description: "Malaysia's Matcha Cafe Directory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/*
          Wrap client-side providers (like SessionProvider and Toaster)
          inside a dedicated Client Component.
          This allows RootLayout to remain a Server Component for metadata and initial render optimization.
        */}
        <ClientProviders>
          {children}
          {/* Toaster should ideally also be part of ClientProviders if it uses client hooks */}
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}