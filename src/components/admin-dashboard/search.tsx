import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { type DialogProps } from "@radix-ui/react-dialog";
import { SearchIcon } from "lucide-react";
import * as React from "react";

import { CommandDialog, CommandEmpty, CommandInput } from "@/components/ui/command";

interface SearchProps extends React.ComponentPropsWithoutRef<"div"> {
  // Add any specific props if needed
}

export function Search({ className, ...props }: SearchProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <> 
      <button
        className="inline-flex items-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
        {...props}
      >
        <SearchIcon className="h-4 w-4 mr-2" />
        <span className="hidden lg:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandEmpty>No results found.</CommandEmpty>
        {/* You can add CommandList, CommandGroup, CommandItem here if you want to implement search functionality */}
      </CommandDialog>
    </>
  );
} 