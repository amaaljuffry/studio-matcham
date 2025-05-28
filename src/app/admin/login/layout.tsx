// src/app/admin/login/layout.tsx
// This layout is specifically for the login page and does NOT include the sidebar.

import React from 'react';

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This div will be the wrapper for your login page content.
    // It centers the content and provides a full-screen background.
    // Adjust the `bg-black text-white` classes to match your desired login page background/text color.
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      {children} {/* This will be your src/app/admin/login/page.tsx content (the login form) */}
    </div>
  );
}