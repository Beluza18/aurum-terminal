'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  TrendingUp, 
  BarChart3, 
  MousePointerClick, // New icon for Trader
  CandlestickChart, 
  Newspaper
} from 'lucide-react';

export default function BottomNavBar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: TrendingUp, label: 'Chart' },
    { href: '/macro', icon: BarChart3, label: 'Macro' },
    { href: '/trader', icon: MousePointerClick, label: 'Trader' }, // Replaced Impulses
    { href: '/patterns', icon: CandlestickChart, label: 'Patterns' },
    { href: '/news', icon: Newspaper, label: 'News' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      zIndex: 50,
      padding: '0 16px 8px 16px'
    }}>
      <div 
        style={{ 
          width: '100%',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
          minHeight: '72px',
          padding: '12px 8px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                backgroundColor: isActive ? '#f0f0f0' : 'transparent'
              }}
            >
              <Icon 
                size={22} 
                style={{
                  color: isActive ? '#000000' : '#6b7280',
                  strokeWidth: isActive ? 2.5 : 2,
                  transition: 'all 0.2s ease'
                }}
              />
              <span style={{ 
                fontSize: '11px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#000000' : '#6b7280',
                transition: 'all 0.2s ease'
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}