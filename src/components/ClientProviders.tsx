// src/components/ClientProviders.tsx

"use client"; // <-- This makes *this* component a Client Component

import React from 'react';
import NextAuthProvider from "@/components/NextAuthProvider";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <NextAuthProvider>
      {children}
    </NextAuthProvider>
  );
}