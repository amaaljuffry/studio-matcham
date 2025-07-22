// src/app/admin/approved-cafes/page.tsx

'use client';
import { useEffect, useState } from 'react';
import { getApprovedCafes } from '@/services/cafeService';
import type { Cafe } from '@/types';
import { Loader2 } from 'lucide-react';

export default function ApprovedCafesPage() {
  const [approvedCafes, setApprovedCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCafes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getApprovedCafes();
        setApprovedCafes(data);
      } catch (err) {
        console.error("Error fetching approved cafes:", err);
        setError("Failed to load approved cafes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCafes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="ml-4 text-lg">Loading approved cafes...</p>
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

  if (approvedCafes.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No approved cafes found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Approved Cafes</h1>
      <ul className="space-y-2 flex-1">
        {approvedCafes.map(cafe => (
          <li key={cafe.id} className="p-4 border rounded shadow-sm">
            <p className="font-semibold">{cafe.name}</p>
            <p className="text-sm text-gray-600">{cafe.address}, {cafe.state}</p>
            {/* You can add more cafe details here as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
}
