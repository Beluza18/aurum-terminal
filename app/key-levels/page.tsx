'use client';

import { useState, useEffect } from 'react';
import BottomNavBar from '../components/BottomNavBar';

interface KeyLevel {
  high: number;
  low: number;
  date: string;
}

interface KeyLevelsData {
  symbol: string;
  current_price: number;
  timestamp: string;
  levels: {
    yesterday: KeyLevel;
    monday: KeyLevel;
    friday: KeyLevel;
  };
}

type SymbolType = 'XAUUSD' | 'BTCUSD';

export default function KeyLevelsPage() {
  const [activeSymbol, setActiveSymbol] = useState<SymbolType>('BTCUSD');
  const [data, setData] = useState<KeyLevelsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');

  // Fetch key levels data
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/key-levels?symbol=${activeSymbol}&t=${Date.now()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [activeSymbol]);

  // Calculate distance and status
  const getLevelStatus = (levelPrice: number, currentPrice: number, isHigh: boolean) => {
    const distance = Math.abs(levelPrice - currentPrice);
    const distancePercent = (distance / currentPrice) * 100;
    
    // Check if level was HIT (price crossed the level)
    const wasHit = isHigh ? currentPrice >= levelPrice : currentPrice <= levelPrice;
    
    // Determine proximity
    let proximity = 'Far';
    let proximityColor = '#6b7280'; // Gray
    
    if (distancePercent < 0.1) {
      proximity = 'Very Near';
      proximityColor = '#ef4444'; // Red
    } else if (distancePercent < 0.5) {
      proximity = 'Near';
      proximityColor = '#f59e0b'; // Orange
    } else if (distancePercent < 1.0) {
      proximity = 'Moderate';
      proximityColor = '#10b981'; // Green
    }
    
    return {
      distance: distance.toFixed(2),
      proximity,
      proximityColor,
      wasHit,
      isAbove: currentPrice > levelPrice
    };
  };

  const renderLevelCard = (title: string, level: KeyLevel, date: string, colorScheme: 'red' | 'green' | 'blue') => {
    if (!data) return null;
    
    const currentPrice = data.current_price;
    const highStatus = getLevelStatus(level.high, currentPrice, true);
    const lowStatus = getLevelStatus(level.low, currentPrice, false);
    
    const bgColors = {
      red: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
      green: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
      blue: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' }
    };
    
    const colors = bgColors[colorScheme];
    
    return (
      <div key={title} style={{ 
        backgroundColor: colors.bg, 
        border: `2px solid ${colors.border}`,
        borderRadius: '16px', 
        padding: '20px', 
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text, margin: 0 }}>
            {title}
          </h3>
          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{date}</span>
        </div>
        
        {/* HIGH Level */}
        <div style={{ 
          backgroundColor: '#fff', 
          borderRadius: '12px', 
          padding: '14px', 
          marginBottom: '10px',
          border: `2px solid ${highStatus.wasHit ? '#ef4444' : colors.border}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>HIGH</span>
            {highStatus.wasHit && (
              <span style={{ 
                backgroundColor: '#ef4444', 
                color: '#fff', 
                fontSize: '11px', 
                fontWeight: '800', 
                padding: '4px 10px', 
                borderRadius: '8px'
              }}>
                🎯 HIT
              </span>
            )}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#000', marginBottom: '8px' }}>
            ${level.high.toFixed(2)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: highStatus.proximityColor, fontWeight: '700' }}>
              {highStatus.proximity} ({highStatus.distance} pips)
            </span>
            <span style={{ color: '#6b7280', fontWeight: '600' }}>
              {highStatus.isAbove ? '⬆️ Above' : '⬇️ Below'}
            </span>
          </div>
          {highStatus.wasHit && (
            <div style={{ 
              marginTop: '8px', 
              fontSize: '12px', 
              color: '#ef4444', 
              fontWeight: '700',
              textAlign: 'center',
              backgroundColor: '#fee2e2',
              padding: '6px',
              borderRadius: '8px'
            }}>
              ⚠️ Potential Reversal Zone
            </div>
          )}
        </div>
        
        {/* LOW Level */}
        <div style={{ 
          backgroundColor: '#fff', 
          borderRadius: '12px', 
          padding: '14px',
          border: `2px solid ${lowStatus.wasHit ? '#ef4444' : colors.border}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>LOW</span>
            {lowStatus.wasHit && (
              <span style={{ 
                backgroundColor: '#ef4444', 
                color: '#fff', 
                fontSize: '11px', 
                fontWeight: '800', 
                padding: '4px 10px', 
                borderRadius: '8px'
              }}>
                🎯 HIT
              </span>
            )}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#000', marginBottom: '8px' }}>
            ${level.low.toFixed(2)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: lowStatus.proximityColor, fontWeight: '700' }}>
              {lowStatus.proximity} ({lowStatus.distance} pips)
            </span>
            <span style={{ color: '#6b7280', fontWeight: '600' }}>
              {lowStatus.isAbove ? '⬆️ Above' : '⬇️ Below'}
            </span>
          </div>
          {lowStatus.wasHit && (
            <div style={{ 
              marginTop: '8px', 
              fontSize: '12px', 
              color: '#ef4444', 
              fontWeight: '700',
              textAlign: 'center',
              backgroundColor: '#fee2e2',
              padding: '6px',
              borderRadius: '8px'
            }}>
              ⚠️ Potential Reversal Zone
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px 140px 16px', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 4px 0' }}>Key Levels</h1>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Updated: {lastUpdate || '...'}</span>
      </div>

      {/* Symbol Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveSymbol('XAUUSD')} 
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: '12px', 
            border: 'none', 
            backgroundColor: activeSymbol === 'XAUUSD' ? '#000' : '#fff',
            color: activeSymbol === 'XAUUSD' ? '#fff' : '#000',
            fontWeight: '700', 
            cursor: 'pointer'
          }}
        >
          🥇 Gold
        </button>
        <button 
          onClick={() => setActiveSymbol('BTCUSD')} 
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: '12px', 
            border: 'none', 
            backgroundColor: activeSymbol === 'BTCUSD' ? '#000' : '#fff',
            color: activeSymbol === 'BTCUSD' ? '#fff' : '#000',
            fontWeight: '700', 
            cursor: 'pointer'
          }}
        >
          ₿ Bitcoin
        </button>
      </div>

      {/* Current Price */}
      {data && (
        <div style={{ 
          backgroundColor: '#fff', 
          borderRadius: '16px', 
          padding: '20px', 
          marginBottom: '20px',
          border: '2px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>
            Current Price
          </div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#000' }}>
            ${data.current_price.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            {data.symbol} • LIVE
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ 
          padding: '60px 20px', 
          textAlign: 'center',
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ fontSize: '15px', color: '#000000', fontWeight: '500' }}>Loading key levels...</p>
        </div>
      )}

      {/* Key Levels Cards */}
      {!loading && data && (
        <>
          {renderLevelCard('Yesterday\'s Daily Range', data.levels.yesterday, data.levels.yesterday.date, 'red')}
          {renderLevelCard('Current Week - Monday', data.levels.monday, data.levels.monday.date, 'blue')}
          {renderLevelCard('Last Week - Friday', data.levels.friday, data.levels.friday.date, 'green')}
        </>
      )}

      {/* Legend */}
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '12px', 
        padding: '16px', 
        marginTop: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#000', marginBottom: '12px' }}>Legend</h3>
        <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.8' }}>
          <div>🎯 <strong>HIT</strong> = Price touched/crossed level (reversal zone)</div>
          <div>🔴 <strong>Very Near</strong> = &lt;0.1% distance</div>
          <div>🟠 <strong>Near</strong> = 0.1-0.5% distance</div>
          <div>🟢 <strong>Moderate</strong> = 0.5-1.0% distance</div>
          <div>⚪ <strong>Far</strong> = &gt;1.0% distance</div>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}