'use client';

import { useState, useEffect, useRef } from 'react';
import BottomNavBar from '../components/BottomNavBar';
import { toast } from 'sonner';

interface ImpulsePattern {
  id: string;
  type: 'bullish' | 'bearish';
  startPoint: number; // Point 1 Open
  endPoint: number;   // Point 2 Close
  startTime: string;
  endTime: string;
  distancePips: number;
  middleCandleCount: number;
  durationMinutes: number;
  notified: boolean;
}

export default function ImpulsesPage() {
  const [impulses, setImpulses] = useState<ImpulsePattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isLive, setIsLive] = useState(false);
  const notifiedIds = useRef<Set<string>>(new Set());

  const calculateDurationMinutes = (startTime: string, endTime: string): number => {
    try {
      const start = new Date(startTime.replace(' ', 'T'));
      const end = new Date(endTime.replace(' ', 'T'));
      return Math.round((end.getTime() - start.getTime()) / 60000);
    } catch {
      return 0;
    }
  };

  const fetchImpulses = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;
      
      if (!apiKey) {
        console.log('[Impulses] No API key');
        setIsLive(false);
        setLoading(false);
        return;
      }

      // Fetch last 200 M1 candles
      const response = await fetch(
        `https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=1min&outputsize=200&apikey=${apiKey}`
      );
      
      if (!response.ok) {
        console.log('[Impulses] API error');
        setIsLive(false);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (!data.values || data.values.length === 0) {
        console.log('[Impulses] No data');
        setIsLive(false);
        setLoading(false);
        return;
      }

      const candles = data.values.map((item: any) => ({
        time: item.datetime,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        isBullish: parseFloat(item.close) > parseFloat(item.open)
      })).reverse();

      const detectedImpulses: ImpulsePattern[] = [];

      // 1 + 4 + 1 Pattern Logic
      for (let i = 0; i < candles.length - 5; i++) {
        const p1 = candles[i];
        
        // BUY IMPULSE: Bearish → 4+ Bullish → Bearish (No overlap)
        if (!p1.isBullish) {
          let bullCount = 0;
          let j = i + 1;
          while (j < candles.length && candles[j].isBullish) {
            bullCount++;
            j++;
          }
          
          if (bullCount >= 4 && j < candles.length) {
            const p2 = candles[j];
            if (!p2.isBullish) {
              if (p1.low > p2.high) {
                const distancePips = Math.abs(p2.close - p1.open) / 0.10;
                const durationMinutes = calculateDurationMinutes(p1.time, p2.time);
                const id = `buy-${p1.time}`;
                
                detectedImpulses.push({
                  id,
                  type: 'bullish',
                  startPoint: p1.open,
                  endPoint: p2.close,
                  startTime: p1.time,
                  endTime: p2.time,
                  distancePips,
                  middleCandleCount: bullCount,
                  durationMinutes,
                  notified: notifiedIds.current.has(id)
                });
              }
            }
          }
        }
        
        // SELL IMPULSE: Bullish → 4+ Bearish → Bullish (No overlap)
        if (p1.isBullish) {
          let bearCount = 0;
          let j = i + 1;
          while (j < candles.length && !candles[j].isBullish) {
            bearCount++;
            j++;
          }
          
          if (bearCount >= 4 && j < candles.length) {
            const p2 = candles[j];
            if (p2.isBullish) {
              if (p1.high < p2.low) {
                const distancePips = Math.abs(p1.open - p2.close) / 0.10;
                const durationMinutes = calculateDurationMinutes(p1.time, p2.time);
                const id = `sell-${p1.time}`;
                
                detectedImpulses.push({
                  id,
                  type: 'bearish',
                  startPoint: p1.open,
                  endPoint: p2.close,
                  startTime: p1.time,
                  endTime: p2.time,
                  distancePips,
                  middleCandleCount: bearCount,
                  durationMinutes,
                  notified: notifiedIds.current.has(id)
                });
              }
            }
          }
        }
      }

      console.log(`[Impulses] Detected ${detectedImpulses.length} patterns`);
      
      if (detectedImpulses.length > 0) {
        detectedImpulses.forEach(impulse => {
          if (!notifiedIds.current.has(impulse.id)) {
            const isBuy = impulse.type === 'bullish';
            toast(isBuy ? '📈 BUY Impulse Detected!' : '📉 SELL Impulse Detected!', {
              description: isBuy 
                ? `Look for retracement for Buy opportunity (${impulse.distancePips.toFixed(1)} pips)`
                : `Look for retracement for Sell opportunity (${impulse.distancePips.toFixed(1)} pips)`,
              duration: 8000,
            });
            notifiedIds.current.add(impulse.id);
          }
        });

        const recentImpulses = detectedImpulses.slice(-5).reverse();
        setImpulses(recentImpulses);
        setIsLive(true);
        setLastUpdate(new Date().toLocaleTimeString());
      } else {
        setIsLive(true);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('[Impulses] Error:', error);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpulses();
    const interval = setInterval(fetchImpulses, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timeStr: string): string => {
    try {
      const date = new Date(timeStr.replace(' ', 'T'));
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return timeStr;
    }
  };

  const ImpulseCard = ({ impulse }: { impulse: ImpulsePattern }) => {
    const isBullish = impulse.type === 'bullish';
    const pastelBg = isBullish ? '#a7f3d0' : '#f0b0b0'; // Light green or light red
    
    return (
      <div style={{ 
        backgroundColor: '#ffffff', // White card
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #e5e7eb', // Grey border
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '800', 
            color: '#000000',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {isBullish ? '📈' : '📉'} {isBullish ? 'BUY Impulse' : 'SELL Impulse'}
          </h3>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: '700',
            color: '#000000',
            backgroundColor: pastelBg,
            padding: '6px 12px',
            borderRadius: '12px',
            textTransform: 'uppercase'
          }}>
            {impulse.middleCandleCount} middle candles
          </span>
        </div>
        
        {/* Price Range Box */}
        <div style={{ 
          backgroundColor: pastelBg, // Pastel background for info box
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#000000', textTransform: 'uppercase', fontWeight: '700' }}>Start (Point 1)</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#000000' }}>${impulse.startPoint.toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#000000', textTransform: 'uppercase', fontWeight: '700' }}>End (Point 2)</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#000000' }}>${impulse.endPoint.toFixed(2)}</div>
            </div>
          </div>
          
          <div style={{ 
            textAlign: 'center',
            paddingTop: '12px',
            borderTop: '1px solid rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '11px', color: '#000000', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
              Total Distance
            </div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '900', 
              color: '#000000',
              lineHeight: 1
            }}>
              {impulse.distancePips.toFixed(1)} <span style={{ fontSize: '18px' }}>pips</span>
            </div>
          </div>
        </div>
        
        {/* Action Box */}
        <div style={{ 
          backgroundColor: isBullish ? '#10b981' : '#ef4444',
          color: '#ffffff',
          padding: '14px',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '12px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
            Look for Retracement
          </div>
          <div style={{ fontSize: '13px', opacity: 0.95 }}>
            {isBullish ? 'for Buy Opportunity' : 'for Sell Opportunity'}
          </div>
        </div>
        
        {/* Time Info */}
        <div style={{ 
          backgroundColor: '#f9fafb', // Very light grey for footer
          padding: '10px 14px',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#000000',
          fontWeight: '600',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '10px', color: '#4b5563', textTransform: 'uppercase', fontWeight: '700' }}>Started</div>
            <div>{formatTime(impulse.startTime)}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div style={{ fontSize: '10px', color: '#4b5563', textTransform: 'uppercase', fontWeight: '700' }}>Duration</div>
            <div style={{ fontSize: '16px', fontWeight: '800' }}>
              {impulse.durationMinutes} min
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <div style={{ fontSize: '10px', color: '#4b5563', textTransform: 'uppercase', fontWeight: '700' }}>Finished</div>
            <div>{formatTime(impulse.endTime)}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      maxWidth: '480px', 
      margin: '0 auto', 
      padding: '24px 16px 140px 16px', 
      minHeight: '100vh',
      backgroundColor: '#f0f0f0' // Light gray main background
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: '800', color: '#000000', margin: '0 0 8px 0' }}>
          Impulses
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '14px', color: '#000000', margin: 0 }}>
            M1 Timeframe Pattern Detection
          </p>
          {isLive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}></div>
              <span style={{ fontSize: '12px', color: '#000000', fontWeight: '700' }}>LIVE</span>
            </div>
          )}
        </div>
        {lastUpdate && (
          <p style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>
            Last update: {lastUpdate}
          </p>
        )}
      </div>

      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ 
            width: '48px', height: '48px', 
            border: '4px solid #e5e7eb', borderTop: '4px solid #000000',
            borderRadius: '50%', animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#000000', fontSize: '14px', fontWeight: '600' }}>Scanning for impulse patterns...</p>
        </div>
      ) : impulses.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p style={{ color: '#000000', fontSize: '15px', marginBottom: '8px', fontWeight: '600' }}>
            No impulses detected in last 200 candles
          </p>
          <p style={{ color: '#4b5563', fontSize: '13px' }}>
            Next scan in 30 seconds...
          </p>
        </div>
      ) : (
        <div>
          {/* Logic Info Box */}
          <div style={{ 
            marginBottom: '16px',
            padding: '16px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <p style={{ fontSize: '13px', color: '#000000', margin: 0, fontWeight: '700' }}>
              🔍 Pattern Logic: 1 + 4 + 1 Impulse
            </p>
            <p style={{ fontSize: '12px', color: '#000000', margin: '6px 0 0 0', lineHeight: '1.5' }}>
              • BUY: Bearish → 4+ Bullish → Bearish (no shadow overlap)
              <br />
              • SELL: Bullish → 4+ Bearish → Bullish (no shadow overlap)
              <br />
              • Distance measured from Point 1 Open → Point 2 Close
            </p>
            <p style={{ fontSize: '11px', color: '#4b5563', margin: '6px 0 0 0' }}>
              Showing last 5 impulses • Auto-refresh every 30s
            </p>
          </div>
          
          {impulses.map((impulse) => (
            <ImpulseCard key={impulse.id} impulse={impulse} />
          ))}
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}