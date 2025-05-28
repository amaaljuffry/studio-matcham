// src/app/admin/layout.tsx
// THIS IS THE PRIMARY ADMIN LAYOUT FOR THE APP ROUTER.
// It includes the sidebar and handles authentication checks.

// IMPORTANT: This layout is a Server Component by default.
// If you need client-side hooks like usePathname or useSession,
// you must add 'use client' at the TOP of the file.
// For this layout, we NEED 'use client' for usePathname and useSession.
"use client";

import React from 'react'; // Keep React import for JSX
import Link from "next/link";
import { usePathname } from "next/navigation"; // To determine active link
import { useSession, signOut } from "next-auth/react"; // For session data and logout
import { redirect } from 'next/navigation'; // For client-side redirection (must be in a client component context)
// If you wanted server-side redirect, you'd use `redirect` from 'next/navigation' in a server component.
// However, since we need client-side hooks, we make this a client component.

import { Button } from "@/components/ui/button"; // Assuming this is your Shadcn Button
import {
  LayoutDashboard,
  ListChecks,
  Archive,
  User,
  LogOut,
} from "lucide-react"; // Import all icons used in the sidebar

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Get current path for active link styling
  const { data: session, status } = useSession(); // Access session data and loading status

  const isLoadingAuth = status === 'loading'; // Check if session is still loading
  const isAuthenticated = status === 'authenticated';
  const isAdmin = isAuthenticated && session?.user?.role === 'admin';

  // Client-side redirect:
  // If authentication is not loading, and user is not an admin,
  // and they are not already on the login page, redirect them.
  // This ensures that the AdminLoginLayout will handle the styling for /admin/login
  // and this layout won't cause an infinite redirect.
  React.useEffect(() => {
    if (!isLoadingAuth && !isAdmin && pathname !== '/admin/login') {
      redirect('/admin/login');
    }
  }, [isLoadingAuth, isAdmin, pathname]);


  // If still loading auth or not an admin and not on login page, render nothing or a loader
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-neutral-100">
        <p>Loading admin panel...</p> {/* Or a spinner */}
      </div>
    );
  }

  // If not admin and on the login page, just render children.
  // The AdminLoginLayout will wrap this.
  if (!isAdmin && pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If authenticated and is admin, and not on login page, show the full admin layout.
  if (isAdmin && pathname !== '/admin/login') {
    // Helper function to determine if a link is active
    const isActive = (href: string) => pathname === href;

    return (
      <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans">
        {/* Sidebar */}
        <aside className="w-20 lg:w-60 bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-3 px-4 pt-6 pb-8">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-violet-900 to-indigo-700 flex items-center justify-center font-bold text-white text-lg">
                M
              </div>
              <span className="font-semibold text-xl hidden lg:inline-block tracking-tight text-neutral-100">
                Matcham
              </span>
            </div>
            <nav className="flex flex-col gap-2 mt-2 px-2">
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                  isActive("/admin")
                    ? "text-white bg-neutral-100/10 font-semibold border border-neutral-700 shadow-sm"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <LayoutDashboard className="w-5 h-5 opacity-80" />
                <span className="hidden lg:inline-block">Dashboard</span>
              </Link>

              <Link
                href="/admin/approved-cafes"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  isActive("/admin/approved-cafes")
                    ? "text-white bg-neutral-100/10 font-semibold border border-neutral-700 shadow-sm"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <ListChecks className="w-5 h-5 opacity-70" />
                <span className="hidden lg:inline-block">Approved Cafes</span>
              </Link>

              <Link
                href="/admin/rejected-cafes"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  isActive("/admin/rejected-cafes")
                    ? "text-white bg-neutral-100/10 font-semibold border border-neutral-700 shadow-sm"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <Archive className="w-5 h-5 opacity-70" />
                <span className="hidden lg:inline-block">Rejected Submissions</span>
              </Link>
            </nav>
          </div>
          {/* User/Logout Section */}
          <div className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-medium">
                <User className="w-4 h-4 text-neutral-300" />
              </div>
              <div className="hidden lg:block">
                <div className="text-sm font-medium text-neutral-100">
                  Admin User
                </div>
                {session?.user?.email && (
                  <div className="text-xs text-neutral-400">
                    {session.user.email}
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="w-full mt-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm rounded-lg py-3 px-4 flex items-center gap-2 font-medium shadow-sm border border-neutral-700 transition"
              variant="ghost"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline-block">Logout</span>
            </Button>
          </div>
        </aside>

        {/* Main Content Area - children will be rendered here */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {children} {/* This is where the page content will be rendered */}
        </main>
      </div>
    );
  }

  // Fallback for cases not explicitly handled (e.g., if isAdmin is false but path isn't /admin/login)
  // This should ideally be caught by the redirect in useEffect.
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      {/* If this renders, it means the redirect logic didn't fire for some reason */}
      <p>Redirecting...</p>
    </div>
  );
}