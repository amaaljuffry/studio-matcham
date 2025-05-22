"use client";

import type { Cafe } from "@/types";
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Send, Loader2 } from "lucide-react";
import { getMatchaCafeRecommendation } from "@/ai/flows/matcha-concierge";
import { useToast } from "@/hooks/use-toast";

interface AiConciergeFormProps {
  cafes: Cafe[];
}

export function AiConciergeForm({ cafes }: AiConciergeFormProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) {
      toast({ title: "Empty Query", description: "Please enter your question for the concierge.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setRecommendation(null);

    const cafeDetailsString = cafes
      .slice(0, 5) // Limit context to a few cafes to avoid overly long prompts
      .map(
        (cafe) =>
          `${cafe.name}: Located at ${cafe.address}. Rating: ${cafe.rating}/5. ${
            cafe.menuLink ? `Menu: ${cafe.menuLink}` : "No menu link available."
          }`
      )
      .join("\n");

    try {
      const result = await getMatchaCafeRecommendation({
        query,
        cafeDetails: cafeDetailsString || "No specific cafe details available for the current view. Please provide general advice or ask for a location.",
      });
      setRecommendation(result.recommendation);
    } catch (error) {
      console.error("AI Concierge Error:", error);
      toast({ title: "AI Error", description: "Could not get a recommendation. Please try again.", variant: "destructive" });
      setRecommendation("Sorry, I couldn't fetch a recommendation at this time.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="ai-query" className="text-sm font-medium">Your Question</Label>
          <div className="flex items-center space-x-2 mt-1">
            <Input
              id="ai-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Any hidden gems nearby?"
              className="flex-grow bg-background focus:ring-ring"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading} aria-label="Send query">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </form>

      {recommendation && (
        <Card className="bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-semibold text-primary">Matcha Concierge says:</p>
                <Textarea
                  value={recommendation}
                  readOnly
                  className="mt-1 w-full text-sm min-h-[80px] bg-muted border-transparent focus:ring-0"
                  aria-label="AI Recommendation"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
