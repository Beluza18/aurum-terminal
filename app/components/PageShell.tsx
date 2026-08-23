'use client';

import BottomNavBar from './BottomNavBar';

interface PageShellProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export default function PageShell({ children, showNav = true }: PageShellProps) {
  return (
    <div className="page-shell">
      {children}
      {showNav && <BottomNavBar />}
    </div>
  );
}
