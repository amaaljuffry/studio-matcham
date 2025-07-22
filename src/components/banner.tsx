"use client";

import { Sparkles, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button"; // Assuming you have this Button component path

interface Banner5Props {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  defaultVisible?: boolean;
}

const Banner5 = ({
  title = "🇲🇾 Your Ultimate Guide to Matcha in Malaysia",
  description = "Forget endless scrolling. We uncover truly exceptional matcha cafes, drinks, and experiences for you.",
  buttonText = "Start Your Matcha Journey",
  buttonUrl = "/guides", // Link to your main guides/listings page
  defaultVisible = true,
}: Banner5Props) => {
  const [isVisible, setIsVisible] = useState(defaultVisible);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <section className="absolute top-1 right-0 left-0 z-50 mx-auto max-w-2xl animate-fade-in">
      <div className="mx-4">
        <div className="w-full rounded-lg border bg-white dark:bg-gray-800 p-3 shadow-md">
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Button
              variant="outline"
              size="icon"
              className="absolute top-0 right-0 h-8 w-8 md:hidden"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex flex-col items-start gap-3 pt-2 md:flex-row md:items-center md:pt-0">
              <Sparkles className="h-5 w-5 shrink-0" />
              <div className="flex flex-col gap-1 md:flex-row md:items-center">
                <p className="text-sm font-medium dark:text-white">{title}</p>
                <p className="text-sm text-muted-foreground dark:text-gray-300">{description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full md:w-auto"
                asChild
              >
                <a href={buttonUrl} target="_blank" rel="noopener noreferrer">
                  {buttonText}
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden h-8 w-8 md:inline-flex"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Banner5 };