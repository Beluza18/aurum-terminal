'use client';

import { useState, useEffect } from 'react';
import BottomNavBar from '../components/BottomNavBar';
import { toast } from 'sonner';
import Link from 'next/link';

interface LevelData {
  high: number;
  low: number;
  date?: string;
  startDate?: string;
  endDate?: string;
}

interface Levels {
  yesterday: LevelData;
  currentWeekMonday: LevelData | null;
  lastWeekFriday: LevelData | null;
  lastTradingWeek: LevelData | null;
}

export default function KeyLevelsPage() {
  const [levels, setLevels] = useState<Levels | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [triggeredAlerts, setTriggeredAlerts] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      const response = await fetch('/api/key-levels');
      const data = await response.json();
      
      if (data.success) {
        setCurrentPrice(data.currentPrice);
        setLevels(data.levels);
        checkBreakouts(data.levels, data.currentPrice);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBreakouts = (lvl: Levels, price: number) => {
    const checks = [
      { id: 'yesterday-high', level: lvl.yesterday?.high, name: 'Yesterday High' },
      { id: 'yesterday-low', level: lvl.yesterday?.low, name: 'Yesterday Low' },
      { id: 'monday-high', level: lvl.currentWeekMonday?.high, name: 'This Week Monday High' },
      { id: 'monday-low', level: lvl.currentWeekMonday?.low, name: 'This Week Monday Low' },
      { id: 'friday-high', level: lvl.lastWeekFriday?.high, name: 'Last Friday High' },
      { id: 'friday-low', level: lvl.lastWeekFriday?.low, name: 'Last Friday Low' },
      { id: 'week-high', level: lvl.lastTradingWeek?.high, name: 'Last Week High' },
      { id: 'week-low', level: lvl.lastTradingWeek?.low, name: 'Last Week Low' },
    ];

    checks.forEach(check => {
      if (check.level && !triggeredAlerts.has(check.id)) {
        // Check if price is within 5 pips ($0.50)
        if (Math.abs(price - check.level) <= 0.50) {
          toast.warning(`⚠️ Price approaching ${check.name}!`, {
            description: `Price $${price.toFixed(2)} is near $${check.level.toFixed(2)}`,
            duration: 5000
          });
          setTriggeredAlerts(prev => new Set(prev).add(check.id));
        }
      }
    });
  };

  useEffect(() => {
    fetchData();
    // Update every 5 minutes (300000 ms)
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Calculate pips remaining (Gold: 1 pip = $0.10)
  const calculatePips = (price: number, level: number): number => {
    return Math.abs(price - level) / 0.10;
  };

  // Determine row color based on price position relative to level
  const getRowStyle = (currentPrice: number, level: number) => {
    const diffPips = (currentPrice - level) / 0.10; // Positive if price is above level
    
    // Within 5 pips -> Yellow Blinking
    if (Math.abs(diffPips) <= 5) {
      return { 
        backgroundColor: '#fef08a', // Yellow-200
        animation: 'blinkYellow 1s infinite',
        border: '2px solid #eab308'
      };
    }
    
    // Price is above level by more than 5 pips -> Light Green
    if (diffPips > 5) {
      return { 
        backgroundColor: '#bbf7d0', // Green-200
        border: '2px solid #10b981'
      };
    }
    
    // Price is below level by more than 5 pips -> Light Red
    if (diffPips < -5) {
      return { 
        backgroundColor: '#fecaca', // Red-200
        border: '2px solid #ef4444'
      };
    }

    // Default
    return { 
      backgroundColor: 'rgba(255,255,255,0.6)',
      border: '2px solid transparent'
    };
  };

  const LevelBox = ({ title, data, bgColor, borderColor, icon }: any) => {
    if (!data) return null;
    
    const pipsToHigh = calculatePips(currentPrice, data.high);
    const pipsToLow = calculatePips(currentPrice, data.low);
    
    const highRowStyle = getRowStyle(currentPrice, data.high);
    const lowRowStyle = getRowStyle(currentPrice, data.low);

    return (
      <div style={{ 
        backgroundColor: bgColor, 
        borderLeft: `5px solid ${borderColor}`,
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
            {icon} {title}
          </h3>
          <span style={{ fontSize: '12px', color: '#666' }}>{data.date || `${data.startDate} to ${data.endDate}`}</span>
        </div>
        
        {/* High Row */}
        <div style={{ ...highRowStyle, padding: '12px', borderRadius: '10px', marginBottom: '8px', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', fontWeight: '600' }}>High</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
                ${data.high.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', fontWeight: '600' }}>Distance</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>
                {pipsToHigh.toFixed(1)} pips
              </div>
            </div>
          </div>
        </div>
        
        {/* Low Row */}
        <div style={{ ...lowRowStyle, padding: '12px', borderRadius: '10px', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', fontWeight: '600' }}>Low</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
                ${data.low.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', fontWeight: '600' }}>Distance</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>
                {pipsToLow.toFixed(1)} pips
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px', textAlign: 'center' }}>
        <p>Loading key levels...</p>
        <BottomNavBar />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px 140px 16px', minHeight: '100vh' }}>
      {/* Blinking Animation Style */}
      <style>{`
        @keyframes blinkYellow {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px 0' }}>Key Levels</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Current Price</span>
          <span style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a' }}>${currentPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Economic Calendar Button */}
      <Link 
        href="/calendar"
        style={{
          width: '100%',
          padding: '14px',
          marginBottom: '24px',
          backgroundColor: '#e5e7eb',
          color: '#1a1a1a',
          fontSize: '15px',
          fontWeight: '600',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        📅 Economic Calendar
      </Link>

      {/* Level Boxes */}
      <LevelBox 
        title="Yesterday's Daily Range" 
        data={levels?.yesterday} 
        bgColor="#d1fae5" 
        borderColor="#10b981" 
        icon="🟢" 
      />
      
      <LevelBox 
        title="Current Week - Monday Levels" 
        data={levels?.currentWeekMonday} 
        bgColor="#dbeafe" 
        borderColor="#3b82f6" 
        icon="🔵" 
      />
      
      <LevelBox 
        title="Last Week - Friday Levels" 
        data={levels?.lastWeekFriday} 
        bgColor="#fee2e2" 
        borderColor="#ef4444" 
        icon="🔴" 
      />
      
      <LevelBox 
        title="Last Trading Week Range" 
        data={levels?.lastTradingWeek} 
        bgColor="#fef9c3" 
        borderColor="#eab308" 
        icon="" 
      />

      <BottomNavBar />
    </div>
  );
}