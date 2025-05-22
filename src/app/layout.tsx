import type {Metadata} from 'next';
// Removed Inter font import
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Removed Inter font setup

export const metadata: Metadata = {
  title: 'MatchaMe',
  description: 'Find the best matcha cafes in Malaysia.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      {/* Removed font variable from body className */}
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
