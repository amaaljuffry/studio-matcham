export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/admin"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Overview
      </Link>
      <Link
        href="/admin/approved-cafes"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Approved Cafes
      </Link>
      <Link
        href="/admin/rejected-cafes"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Rejected Cafes
      </Link>
    </nav>
  )
}

import { cn } from "@/lib/utils";
import Link from "next/link"; 