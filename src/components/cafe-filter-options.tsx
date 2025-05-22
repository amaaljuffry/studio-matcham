"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CafeFilterOptionsProps {
  onFilterChange: (minRating: number) => void;
  currentMinRating: number;
}

export function CafeFilterOptions({ onFilterChange, currentMinRating }: CafeFilterOptionsProps) {
  const ratings = [
    { value: 0, label: "All Ratings" },
    { value: 5, label: "5 Stars" },
    { value: 4, label: "4+ Stars" },
    { value: 3, label: "3+ Stars" },
    { value: 2, label: "2+ Stars" },
    { value: 1, label: "1+ Star" },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="rating-filter" className="text-sm font-medium">Minimum Rating</Label>
      <Select
        onValueChange={(value) => onFilterChange(Number(value))}
        value={String(currentMinRating)}
      >
        <SelectTrigger id="rating-filter" className="w-full bg-background hover:bg-muted focus:ring-ring">
          <SelectValue placeholder="Select minimum rating" />
        </SelectTrigger>
        <SelectContent>
          {ratings.map((r) => (
            <SelectItem key={r.value} value={String(r.value)}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
