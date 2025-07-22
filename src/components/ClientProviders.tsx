// src/components/ClientProviders.tsx

"use client"; // <-- This makes *this* component a Client Component

import React from 'react';
import NextAuthProvider from "@/components/NextAuthProvider";
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from "next-themes/dist/types";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      <NextAuthProvider>
        {children}
      </NextAuthProvider>
    </NextThemesProvider>
  );
}