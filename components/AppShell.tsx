'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';

export default function AppShell({ name, children }: { name: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar mobileOpen={open} onMobileClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader onMenuToggle={() => setOpen(o => !o)} name={name} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
