// src/app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/admin"; // Get callbackUrl or default

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Important for manual error handling
        // callbackUrl: callbackUrl // Not needed here if redirect is false and you handle push manually
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Invalid email or password." : "Login failed. Please try again.");
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl); // Redirect to the original target or default
      } else {
        // This case should ideally be covered by result.error, but as a fallback
        setError("Login failed. Please try again.");
      }

    } catch (err) { // Catch network or unexpected errors
      console.error("Login submission error:", err);
      setError("An unexpected error occurred during login.");
    }
  };

  // ... rest of your JSX remains the same
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="emailInput" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="emailInput"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="passwordInput" className="block text-sm font-medium mb-1">Password</label>
          <input
            id="passwordInput"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white p-2 rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        >
          Login
        </button>
      </form>
    </div>
  );
}