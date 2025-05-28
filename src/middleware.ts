// middleware.ts
import { NextResponse } from 'next/server';
import { withAuth } from "next-auth/middleware";
import type { NextRequest } from 'next/server';

export default withAuth(
  // `withAuth` augments your `Request` with the `req.nextauth` token.
  function middleware(req: NextRequest) {
    // If the user is trying to access any admin page (other than error pages perhaps)
    // and their role is not admin, you can redirect them or show an unauthorized page.
    // This check is after `withAuth` already determined they are logged in
    // but you might want more specific role checks for specific sub-paths.
    if (req.nextUrl.pathname.startsWith('/admin') && req.nextauth.token?.role !== 'admin') {
      // You could redirect to a general unauthorized page if you have one
      // For now, let's let the `authorized` callback handle the main logic.
      // If they are logged in but not admin, authorized callback below would return false.
    }
    return NextResponse.next(); // Proceed if authorized by the callback
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // `/admin/login` and `/admin/error` should be accessible without an admin token
        const { pathname } = req.nextUrl;
        if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/error')) {
          return true; // Allow access to login and error pages
        }
        // For any other /admin/* page, user must be an admin
        return token?.role === "admin";
      }
    },
    // It's important to still define your signIn page here so withAuth knows where to redirect
    // if the `authorized` callback returns false for a protected route.
    pages: {
      signIn: "/admin/login",
      error: "/admin/error", // Make sure this page also exists or remove if not used
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"], // Apply to all /admin routes
};