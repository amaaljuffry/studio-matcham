
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface CafeFilterOptionsProps {
  onRatingFilterChange: (minRating: number) => void;
  currentMinRating: number;
  onStateFilterChange: (selectedState: string) => void;
  currentSelectedState: string;
  availableStates: string[];
}

export function CafeFilterOptions({
  onRatingFilterChange,
  currentMinRating,
  onStateFilterChange,
  currentSelectedState,
  availableStates,
}: CafeFilterOptionsProps) {
  const ratings = [
    { value: 0, label: "All Ratings" },
    { value: 5, label: "5 Stars" },
    { value: 4, label: "4+ Stars" },
    { value: 3, label: "3+ Stars" },
    { value: 2, label: "2+ Stars" },
    { value: 1, label: "1+ Star" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="rating-filter" className="text-sm font-medium">Minimum Rating</Label>
        <Select
          onValueChange={(value) => onRatingFilterChange(Number(value))}
          value={String(currentMinRating)}
        >
          <SelectTrigger id="rating-filter" className="w-full bg-background hover:bg-muted focus:ring-ring mt-1">
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

      <Separator />

      <div>
        <Label htmlFor="state-filter" className="text-sm font-medium">State</Label>
        <Select
          onValueChange={(value) => onStateFilterChange(value)}
          value={currentSelectedState}
        >
          <SelectTrigger id="state-filter" className="w-full bg-background hover:bg-muted focus:ring-ring mt-1">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All States</SelectItem>
            {availableStates.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
