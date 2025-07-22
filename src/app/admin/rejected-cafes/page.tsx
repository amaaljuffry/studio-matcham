// src/app/admin/rejected-cafes/page.tsx

'use client';
import { useEffect, useState } from 'react';
import { getRejectedCafes } from '@/services/cafeService';
import type { Cafe } from '@/types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RejectedCafesPage() {
  const [rejectedCafes, setRejectedCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCafes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRejectedCafes();
        setRejectedCafes(data);
      } catch (err) {
        console.error("Error fetching rejected cafes:", err);
        setError("Failed to load rejected cafes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCafes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
        <p className="ml-4 text-lg">Loading rejected cafes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (rejectedCafes.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No rejected cafes found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Rejected Cafes</h1>
      <ul className="space-y-2 flex-1">
        {rejectedCafes.map(cafe => (
          <li key={cafe.id} className="p-4 border rounded shadow-sm">
            <p className="font-semibold">{cafe.name}</p>
            <p className="text-sm text-gray-600">{cafe.address}, {cafe.state}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
