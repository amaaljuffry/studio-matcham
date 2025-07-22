'use client';

import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header
      style={{
        width: '75%',
        margin: '0 auto',
        padding: '1rem 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <h1 className="text-2xl font-bold">My Cafe Directory</h1>
      <ThemeToggle />
    </header>
  );
}
