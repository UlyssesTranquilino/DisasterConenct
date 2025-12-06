// components/MapLayout.tsx
import { ReactNode } from 'react';

interface MapLayoutProps {
  children: ReactNode;
}

export default function MapLayout({ children }: MapLayoutProps) {
  return (
    <div className="relative" style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}>
      {children}
    </div>
  );
}