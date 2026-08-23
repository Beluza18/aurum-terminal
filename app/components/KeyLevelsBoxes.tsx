'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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

type SymbolType = 'XAUUSD' | 'BTCUSD';

export default function KeyLevelsBoxes() {
  const [activeSymbol, setActiveSymbol] = useState<SymbolType>('XAUUSD');
  const [levels, setLevels] = useState<Levels | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastAlert, setLastAlert] = useState<Set<string>>(new Set());

  const fetchData = async (symbol: SymbolType) => {
    setLoading(true);
    try {
      // Fetch real-time data for the specific symbol
      const response = await fetch(`/api/key-levels?symbol=${symbol}`);
      const data = await response.json();
      
      if (data.success) {
        const newPrice = data.currentPrice;
        
        if (levels) {
          checkLevelAlerts(newPrice, levels, symbol);
        }
        
        setCurrentPrice(newPrice);
        setLevels(data.levels);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLevelAlerts = (price: number, lvl: Levels, symbol: SymbolType) => {
    const alertChecks = [
      { id: 'yesterday-high', level: lvl.yesterday?.high, name: 'Yesterday High' },
      { id: 'yesterday-low', level: lvl.yesterday?.low, name: 'Yesterday Low' },
      { id: 'monday-high', level: lvl.currentWeekMonday?.high, name: 'Monday High' },
      { id: 'monday-low', level: lvl.currentWeekMonday?.low, name: 'Monday Low' },
      { id: 'friday-high', level: lvl.lastWeekFriday?.high, name: 'Friday High' },
      { id: 'friday-low', level: lvl.lastWeekFriday?.low, name: 'Friday Low' },
    ];

    alertChecks.forEach(check => {
      if (!check.level) return;
      
      const distance = Math.abs(price - check.level);
      // Adjust pip calculation: 1.0 for BTC, 0.10 for Gold
      const pipSize = symbol === 'BTCUSD' ? 1.0 : 0.10;
      const distancePips = distance / pipSize;
      
      if (distancePips <= 10 && !lastAlert.has(`${check.id}-near`)) {
        toast.warning(`⚠️ Price NEAR ${check.name} (${symbol})`, {
          description: `Price $${price.toFixed(2)} is ${distancePips.toFixed(1)} pips from $${check.level.toFixed(2)}`,
          duration: 8000
        });
        setLastAlert(prev => new Set(prev).add(`${check.id}-near`));
      }
      
      if (price > check.level && distancePips <= 5 && !lastAlert.has(`${check.id}-above`)) {
        toast.success(`🟢 BREAKOUT! Price above ${check.name} (${symbol})`, {
          description: `Price $${price.toFixed(2)} crossed ABOVE $${check.level.toFixed(2)}`,
          duration: 10000
        });
        setLastAlert(prev => {
          const next = new Set(prev);
          next.add(`${check.id}-above`);
          next.delete(`${check.id}-near`);
          return next;
        });
      }
      
      if (price < check.level && distancePips <= 5 && !lastAlert.has(`${check.id}-below`)) {
        toast.error(`🔴 BREAKDOWN! Price below ${check.name} (${symbol})`, {
          description: `Price $${price.toFixed(2)} crossed BELOW $${check.level.toFixed(2)}`,
          duration: 10000
        });
        setLastAlert(prev => {
          const next = new Set(prev);
          next.add(`${check.id}-below`);
          next.delete(`${check.id}-near`);
          return next;
        });
      }
      
      if (distancePips > 20) {
        setLastAlert(prev => {
          const next = new Set(prev);
          next.delete(`${check.id}-near`);
          next.delete(`${check.id}-above`);
          next.delete(`${check.id}-below`);
          return next;
        });
      }
    });
  };

  useEffect(() => {
    fetchData(activeSymbol);
    const interval = setInterval(() => fetchData(activeSymbol), 5000);
    return () => clearInterval(interval);
  }, [activeSymbol]);

  // Reset alerts when switching symbols
  useEffect(() => {
    setLastAlert(new Set());
  }, [activeSymbol]);

  const calculatePips = (price: number, level: number, symbol: SymbolType): number => {
    const pipSize = symbol === 'BTCUSD' ? 1.0 : 0.10;
    return Math.abs(price - level) / pipSize;
  };

  const getRowStyle = (currentPrice: number, level: number) => {
    const pipSize = activeSymbol === 'BTCUSD' ? 1.0 : 0.10;
    const distancePips = Math.abs(currentPrice - level) / pipSize;
    
    // Visual Hierarchy: Pure black text on pastel/gray backgrounds
    if (distancePips <= 10) {
      return { 
        backgroundColor: '#fef3c7', // Amber-100
        border: '2px solid #f59e0b', 
        color: '#000000' 
      };
    }
    
    if (currentPrice > level) {
      return { 
        backgroundColor: '#d1fae5', // Green-100
        border: '2px solid #10b981', 
        color: '#000000' 
      };
    }
    
    if (currentPrice < level) {
      return { 
        backgroundColor: '#fee2e2', // Red-100
        border: '2px solid #ef4444', 
        color: '#000000' 
      };
    }

    return { 
      backgroundColor: '#f3f4f6', // Gray-100 for default state
      border: '2px solid #e5e7eb', 
      color: '#000000' 
    };
  };

  const LevelBox = ({ title, data, icon }: { title: string, data: LevelData | null | undefined, icon: string }) => {
    if (!data) return null;
    
    const pipsToHigh = calculatePips(currentPrice, data.high, activeSymbol);
    const pipsToLow = calculatePips(currentPrice, data.low, activeSymbol);
    
    const highRowStyle = getRowStyle(currentPrice, data.high);
    const lowRowStyle = getRowStyle(currentPrice, data.low);

    return (
      <div style={{ 
        backgroundColor: '#ffffff', 
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#000000', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {icon} {title}
          </h3>
          <span style={{ fontSize: '12px', color: '#000000', fontWeight: '600', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '8px' }}>
            {data.date || `${data.startDate} to ${data.endDate}`}
          </span>
        </div>
        
        {/* High Row */}
        <div style={{ 
          ...highRowStyle, 
          padding: '12px', 
          borderRadius: '10px', 
          marginBottom: '8px',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', color: '#000000' }}>
                HIGH
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#000000' }}>
                ${data.high.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', color: '#000000' }}>
                Distance
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#000000' }}>
                {pipsToHigh.toFixed(1)} pips
              </div>
              {pipsToHigh <= 10 && (
                <div style={{ fontSize: '11px', fontWeight: '800', marginTop: '4px', color: '#000000' }}>
                  ⚠️ NEAR
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Low Row */}
        <div style={{ 
          ...lowRowStyle, 
          padding: '12px', 
          borderRadius: '10px',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', color: '#000000' }}>
                LOW
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#000000' }}>
                ${data.low.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', color: '#000000' }}>
                Distance
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#000000' }}>
                {pipsToLow.toFixed(1)} pips
              </div>
              {pipsToLow <= 10 && (
                <div style={{ fontSize: '11px', fontWeight: '800', marginTop: '4px', color: '#000000' }}>
                  ⚠️ NEAR
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: '14px', color: '#000000', fontWeight: '600' }}>Loading LIVE levels...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Symbol Tabs (Dropdown Alternative for better mobile UX) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveSymbol('XAUUSD')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            backgroundColor: activeSymbol === 'XAUUSD' ? '#000000' : '#ffffff',
            color: activeSymbol === 'XAUUSD' ? '#ffffff' : '#000000',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeSymbol === 'XAUUSD' ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : 'none'
          }}
        >
          🥇 Gold (XAU/USD)
        </button>
        <button
          onClick={() => setActiveSymbol('BTCUSD')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            backgroundColor: activeSymbol === 'BTCUSD' ? '#000000' : '#ffffff',
            color: activeSymbol === 'BTCUSD' ? '#ffffff' : '#000000',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeSymbol === 'BTCUSD' ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : 'none'
          }}
        >
          ₿ Bitcoin (BTC/USD)
        </button>
      </div>

      {/* Current Price Display */}
      <div style={{ 
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <span style={{ fontSize: '14px', color: '#000000', fontWeight: '600' }}>Current Price (LIVE)</span>
        <span style={{ 
          fontSize: '22px', 
          fontWeight: '800', 
          color: '#000000',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ 
            display: 'inline-block',
            width: '8px',
            height: '8px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></span>
          ${currentPrice.toFixed(2)}
        </span>
      </div>

      <LevelBox title="Yesterday's Daily Range" data={levels?.yesterday} icon="📅" />
      <LevelBox title="Current Week - Monday Levels" data={levels?.currentWeekMonday} icon="" />
      <LevelBox title="Last Week - Friday Levels" data={levels?.lastWeekFriday} icon="📆" />
      <LevelBox title="Last Trading Week Range" data={levels?.lastTradingWeek} icon="📊" />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}