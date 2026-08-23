'use client';

import { useState, useEffect } from 'react';
import BottomNavBar from '../components/BottomNavBar';
import { toast } from 'sonner';
import Link from 'next/link';

interface Pattern {
  id?: number;
  pattern_name: string;
  bias: 'bullish' | 'bearish' | 'neutral';
  timeframe: string;
  price_at_detection: number;
  gap_size?: number;
  detected_at: string;
}

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string>('');

  const scanForPatterns = async () => {
    if (scanning) return;
    
    setScanning(true);
    setLoading(true);
    
    try {
      console.log('[Frontend] Fetching patterns from Supabase...');
      
      const response = await fetch(`/api/patterns?t=${Date.now()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[Frontend] API response:', data);
      
      if (data.success) {
        setPatterns(data.patterns);
        setLastScan(new Date().toLocaleTimeString());
        
        // Auto-cleanup: Keep only 5 most recent patterns
        if (data.patterns.length > 5) {
          await autoCleanupPatterns(data.patterns);
        }
        
        const gaps = data.patterns.filter((p: Pattern) => p.pattern_name && p.pattern_name.includes('Gap'));
        if (gaps.length > 0) {
          gaps.forEach((pattern: Pattern) => {
            toast.success(`${pattern.pattern_name} (${pattern.timeframe})`, {
              description: `Detected at $${Number(pattern.price_at_detection).toFixed(2)}`,
              duration: 5000
            });
            
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`${pattern.pattern_name} - ${pattern.timeframe}`, {
                body: `Price: $${Number(pattern.price_at_detection).toFixed(2)}`
              });
            }
          });
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
        console.warn('[Frontend] Network request aborted. Retrying soon...');
      } else {
        console.error('[Frontend] Critical Error:', error);
        toast.error('Failed to fetch patterns');
      }
    } finally {
      setScanning(false);
      setLoading(false);
    }
  };

  // Auto-cleanup: Delete old patterns, keep only 5 most recent
  const autoCleanupPatterns = async (allPatterns: Pattern[]) => {
    const patternsToDelete = allPatterns.slice(5); // Get all patterns after the 5 most recent
    
    for (const pattern of patternsToDelete) {
      try {
        await fetch(`/api/patterns?id=${pattern.id}`, {
          method: 'DELETE'
        });
        console.log(`️ Auto-deleted old pattern ${pattern.id}`);
      } catch (error) {
        console.error('Failed to auto-delete pattern:', error);
      }
    }
  };

  // Manual delete function
  const handleDeletePattern = async (patternId: number | undefined, patternName: string) => {
    if (!patternId) {
      toast.error('Cannot delete: Pattern ID not found');
      return;
    }

    if (!window.confirm(`Delete this ${patternName}?`)) return;

    try {
      const response = await fetch(`/api/patterns?id=${patternId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove from local state immediately
        setPatterns(patterns.filter(p => p.id !== patternId));
        toast.success('Pattern deleted successfully');
      } else {
        toast.error(`Failed to delete: ${data.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete pattern');
    }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    scanForPatterns();
    const interval = setInterval(scanForPatterns, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStyle = (bias: string) => {
    if (bias === 'bullish') return { bg: '#d1fae5', text: '#065f46', icon: '⬆️', actionBg: '#10b981', actionText: '#fff' };
    if (bias === 'bearish') return { bg: '#fee2e2', text: '#991b1b', icon: '⬇️', actionBg: '#ef4444', actionText: '#fff' };
    return { bg: '#fef3c7', text: '#92400e', icon: '➡️', actionBg: '#eab308', actionText: '#000' };
  };

  const gapsM1 = patterns.filter(p => p.pattern_name.includes('Gap') && p.timeframe === 'M1');
  const gapsM5 = patterns.filter(p => p.pattern_name.includes('Gap') && p.timeframe === 'M5');
  const gapsM15 = patterns.filter(p => p.pattern_name.includes('Gap') && p.timeframe === 'M15');
  const otherPatterns = patterns.filter(p => !p.pattern_name.includes('Gap'));

  const renderGapCard = (pattern: Pattern) => {
    const isGapUp = pattern.pattern_name.includes('gap_up') || pattern.bias === 'bullish';
    const s = getStyle(pattern.bias);
    const tf = pattern.timeframe || 'M1';
    
    return (
      <div key={`${tf}-${pattern.id || pattern.detected_at}`} style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
        {/* Delete Button */}
        <button 
          onClick={() => handleDeletePattern(pattern.id, pattern.pattern_name)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            border: 'none',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: '700',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          title="Delete this pattern"
        >
          ✕
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingRight: '40px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#000000', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isGapUp ? '⬆️' : '⬇️'} {isGapUp ? 'Gap Up' : 'Gap Down'} 
            <span style={{ fontSize: '12px', fontWeight: '700', backgroundColor: s.bg, color: s.text, padding: '4px 10px', borderRadius: '8px' }}>
              {tf}
            </span>
          </h3>
        </div>
        
        <div style={{ backgroundColor: s.bg, padding: '14px', borderRadius: '12px', marginBottom: '14px' }}>
          <p style={{ fontSize: '14px', color: '#000000', margin: '0 0 10px 0', lineHeight: '1.5', fontWeight: '600' }}>
            {pattern.gap_size ? `Gap size: ${pattern.gap_size.toFixed(2)} points` : 'Gap detected'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#000000', fontWeight: '600' }}>
            <span>💰 ${Number(pattern.price_at_detection).toFixed(2)}</span>
            <span> {new Date(pattern.detected_at).toLocaleTimeString()}</span>
          </div>
        </div>
        
        <div style={{ backgroundColor: s.actionBg, color: s.actionText, padding: '14px', borderRadius: '12px', textAlign: 'center', fontWeight: '700', fontSize: '15px' }}>
          {isGapUp ? '🎯 Look for Buy Opportunity' : '🎯 Look for Sell Opportunity'}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px 140px 16px', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: '800', color: '#000000', margin: 0 }}>Pattern Scanner</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
          {lastScan ? `Last sync: ${lastScan}` : 'Scanning markets...'}
          {patterns.length > 0 && ` • ${patterns.length} patterns stored`}
        </p>
      </div>

      <Link href="/calendar" style={{ width: '100%', padding: '14px 24px', marginBottom: '16px', backgroundColor: '#ffffff', color: '#000000', fontSize: '15px', fontWeight: '600', borderRadius: '12px', border: '1px solid #e5e7eb', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        📅 Economic Calendar
      </Link>

      <button onClick={scanForPatterns} disabled={scanning} style={{ width: '100%', padding: '16px 24px', marginBottom: '24px', backgroundColor: scanning ? '#cccccc' : '#1a1a1a', color: '#ffffff', fontSize: '16px', fontWeight: '700', borderRadius: '12px', border: 'none', cursor: scanning ? 'not-allowed' : 'pointer', opacity: scanning ? 0.7 : 1, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        {scanning ? '🔄 Syncing...' : '🔄 Sync Now'}
      </button>

      {gapsM1.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#000000', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>⚡ M1 Gaps Detected ({gapsM1.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{gapsM1.map(renderGapCard)}</div>
        </div>
      )}

      {gapsM5.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#000000', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>⚡ M5 Gaps Detected ({gapsM5.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{gapsM5.map(renderGapCard)}</div>
        </div>
      )}

      {gapsM15.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#000000', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>⚡ M15 Gaps Detected ({gapsM15.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{gapsM15.map(renderGapCard)}</div>
        </div>
      )}

      {otherPatterns.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#000000', marginBottom: '16px' }}>📊 Other Patterns ({otherPatterns.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {otherPatterns.map((p, i) => {
              const s = getStyle(p.bias);
              return (
                <div key={`other-${i}`} style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
                  <button 
                    onClick={() => handleDeletePattern(p.id, p.pattern_name)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '18px',
                      fontWeight: '700'
                    }}
                    title="Delete this pattern"
                  >
                    ✕
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '40px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', color: '#000000', fontWeight: '700', marginBottom: '6px' }}>
                        {p.pattern_name} <span style={{ fontSize: '12px', fontWeight: '600', opacity: 0.7 }}>({p.timeframe})</span>
                      </h3>
                      <p style={{ fontSize: '13px', color: '#000000', marginBottom: '10px', lineHeight: '1.4' }}>
                        Detected at ${Number(p.price_at_detection).toFixed(2)}
                      </p>
                      <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                         {new Date(p.detected_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <span style={{ fontSize: '24px' }}>{s.icon}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && patterns.length === 0 && (
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ fontSize: '15px', color: '#000000', fontWeight: '500' }}>Scanning for patterns...</p>
        </div>
      )}

      {!loading && patterns.length === 0 && (
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
          <p style={{ fontSize: '15px', color: '#000000', fontWeight: '500', marginBottom: '8px' }}>No gaps detected yet</p>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Ensure MT4 EA is running and file bridge is active</p>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}