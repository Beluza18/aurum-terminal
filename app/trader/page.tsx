'use client';

import { useState, useEffect, useCallback } from 'react';
import BottomNavBar from '../components/BottomNavBar';
import { toast } from 'sonner';

type SymbolType = 'XAUUSD' | 'BTCUSD';

interface Position {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  entry: number;
  sl: number;
  tp: number;
  current: number;
  pnl: number;
}

export default function TraderPage() {
  const [activeSymbol, setActiveSymbol] = useState<SymbolType>('XAUUSD');
  const [selectedLot, setSelectedLot] = useState(0.05);
  const [isExecuting, setIsExecuting] = useState(false);
  const [accountStats, setAccountStats] = useState({ balance: 0, equity: 0, margin: 0, freeMargin: 0 });
  const [positions, setPositions] = useState<Position[]>([]);
  const [allPositions, setAllPositions] = useState<Position[]>([]);
  const [lastUpdate, setLastUpdate] = useState('');
  const [modifyingTrade, setModifyingTrade] = useState<Position | null>(null);
  const [modSl, setModSl] = useState('');
  const [modTp, setModTp] = useState('');
  const [applyToAll, setApplyToAll] = useState(false);
  const [showSymbolWarning, setShowSymbolWarning] = useState(false);
  const [pendingSymbol, setPendingSymbol] = useState<SymbolType | null>(null);

  const lotSizes = [0.01, 0.05, 0.10, 0.25, 0.50, 1.00];

  const isGoldMarketOpen = (): boolean => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/account-state?t=${Date.now()}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        setAccountStats({
          balance: json.data.balance || 0,
          equity: json.data.equity || 0,
          margin: json.data.margin || 0,
          freeMargin: json.data.free_margin || 0
        });
        const allPos = json.data.positions || [];
        setAllPositions(allPos);
        setPositions(allPos.filter((p: Position) => p.symbol === activeSymbol));
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (e) { console.warn('Fetch error:', e); }
  }, [activeSymbol]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const totalPnL = allPositions.reduce((sum, pos) => sum + (pos.pnl || 0), 0);

  const handleSymbolSwitch = (newSymbol: SymbolType) => {
    if (newSymbol === 'XAUUSD' && !isGoldMarketOpen()) {
      toast.error('📅 Gold market is closed on weekends');
      return;
    }
    if (newSymbol !== activeSymbol && positions.length > 0) {
      setPendingSymbol(newSymbol);
      setShowSymbolWarning(true);
      return;
    }
    setActiveSymbol(newSymbol);
  };

  // ⚡ CLOUD-BASED TRADE EXECUTION (Strictly uses /api/trade-command)
  const sendCommand = async (action: string, ticket: number = 0, sl: number = 0, tp: number = 0, lots?: number, tradeType?: string) => {
    setIsExecuting(true);
    try {
      let lotsToSend: string | number = lots !== undefined ? lots : selectedLot;
      let ticketToSend = ticket || 0;

      // MT4 EA expects the trade type (BUY/SELL) in the 'lots' position for MODIFY_ALL
      if (action === 'MODIFY_ALL') {
        lotsToSend = tradeType || 'BUY'; 
        ticketToSend = 0;
      }

      const commandData = { 
        action, 
        symbol: activeSymbol, 
        lots: lotsToSend, 
        sl: sl || 0, 
        tp: tp || 0, 
        ticket: ticketToSend 
      };

      console.log('🚀 SENDING TO SUPABASE:', commandData);
      console.log('🎯 Endpoint: /api/trade-command');

      const res = await fetch('/api/trade-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commandData)
      });
      
      const data = await res.json();
      console.log('📥 RESPONSE FROM API:', data);
      
      if (data.success) {
        toast.success(`${action} command sent to MT4!`);
        setTimeout(() => fetchData(), 1500);
      } else {
        toast.error(`Failed: ${data.error}`);
      }
    } catch (e: any) { 
      console.error('❌ Network error:', e);
      toast.error('Network error: ' + e.message); 
    } finally { 
      setIsExecuting(false); 
    }
  };

  // ⚡ PROFESSIONAL BATCH MODIFY LOGIC
  const handleBatchModifySL = async () => {
    if (!modifyingTrade) return;
    const newSL = parseFloat(modSl);
    const newTP = parseFloat(modTp);
    
    if (isNaN(newSL)) {
      toast.error('Invalid Stop Loss value');
      return;
    }

    const tradesToModify = allPositions.filter(p => p.symbol === activeSymbol && p.type === modifyingTrade.type);
    if (tradesToModify.length === 0) {
      toast.error('No trades found to modify');
      return;
    }

    const confirmMessage = applyToAll 
      ? `Apply SL ${newSL} to ALL ${tradesToModify.length} ${modifyingTrade.type} orders?`
      : `Modify SL for Ticket #${modifyingTrade.ticket} only?`;

    if (!window.confirm(confirmMessage)) return;

    if (applyToAll) {
      await sendCommand('MODIFY_ALL', 0, newSL, newTP || modifyingTrade.tp, 0, modifyingTrade.type);
    } else {
      await sendCommand('MODIFY', modifyingTrade.ticket, newSL, newTP || modifyingTrade.tp);
    }
    
    setModifyingTrade(null);
    setApplyToAll(false);
  };

  const handleBuy = () => { if (window.confirm(`Execute BUY ${selectedLot} lots on ${activeSymbol}?`)) sendCommand('BUY'); };
  const handleSell = () => { if (window.confirm(`Execute SELL ${selectedLot} lots on ${activeSymbol}?`)) sendCommand('SELL'); };
  const handleClosePosition = (ticket: number) => { if (window.confirm(`Close Ticket #${ticket}?`)) sendCommand('CLOSE', ticket, 0, 0, 0); };
  const handleCloseAll = () => { if (window.confirm(`Close ALL ${positions.length} ${activeSymbol} positions?`)) sendCommand('CLOSE_ALL', 0, 0, 0, 0); };

  const goldMarketOpen = isGoldMarketOpen();

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px 140px 16px', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 4px 0' }}>Remote Trader</h1>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Updated: {lastUpdate || '...'}</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', position: 'relative' }}>
        <button onClick={() => handleSymbolSwitch('XAUUSD')} disabled={!goldMarketOpen} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeSymbol === 'XAUUSD' ? '#000' : goldMarketOpen ? '#fff' : '#d1d5db', color: activeSymbol === 'XAUUSD' ? '#fff' : goldMarketOpen ? '#000' : '#9ca3af', fontWeight: '700', cursor: goldMarketOpen ? 'pointer' : 'not-allowed', opacity: goldMarketOpen ? 1 : 0.6, position: 'relative' }}>
          🥇 Gold
          {!goldMarketOpen && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '8px', fontWeight: '700' }}>CLOSED</span>}
        </button>
        <button onClick={() => handleSymbolSwitch('BTCUSD')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeSymbol === 'BTCUSD' ? '#000' : '#fff', color: activeSymbol === 'BTCUSD' ? '#fff' : '#000', fontWeight: '700', cursor: 'pointer', position: 'relative' }}>
          ₿ Bitcoin
          <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#10b981', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '8px', fontWeight: '700' }}>24/7</span>
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '20px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div><div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '700' }}>BALANCE</div><div style={{ fontSize: '20px', fontWeight: '800' }}>${accountStats.balance.toFixed(2)}</div></div>
          <div><div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '700' }}>EQUITY</div><div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981' }}>${accountStats.equity.toFixed(2)}</div></div>
          <div><div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '700' }}>MARGIN</div><div style={{ fontSize: '20px', fontWeight: '800' }}>${accountStats.margin.toFixed(2)}</div></div>
          <div><div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '700' }}>TOTAL P/L</div><div style={{ fontSize: '24px', fontWeight: '900', color: totalPnL >= 0 ? '#10b981' : '#ef4444' }}>{totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}</div></div>
        </div>
      </div>

      <button onClick={handleBuy} disabled={isExecuting} style={{ width: '100%', padding: '22px', marginBottom: '12px', background: isExecuting ? '#9ca3af' : '#10b981', color: '#fff', fontSize: '22px', fontWeight: '900', borderRadius: '20px', border: 'none', cursor: isExecuting ? 'not-allowed' : 'pointer' }}>
        {isExecuting ? 'EXECUTING...' : `BUY ${selectedLot} LOTS`}
      </button>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '14px', marginBottom: '12px', display: 'flex', justifyContent: 'space-around', border: '1px solid #e5e7eb' }}>
        {lotSizes.map(lot => (<button key={lot} onClick={() => setSelectedLot(lot)} style={{ padding: '10px 14px', backgroundColor: selectedLot === lot ? '#000' : '#f3f4f6', color: selectedLot === lot ? '#fff' : '#000', fontSize: '14px', fontWeight: '800', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>{lot}</button>))}
      </div>

      <button onClick={handleSell} disabled={isExecuting} style={{ width: '100%', padding: '22px', marginBottom: '24px', background: isExecuting ? '#9ca3af' : '#ef4444', color: '#fff', fontSize: '22px', fontWeight: '900', borderRadius: '20px', border: 'none', cursor: isExecuting ? 'not-allowed' : 'pointer' }}>
        {isExecuting ? 'EXECUTING...' : `SELL ${selectedLot} LOTS`}
      </button>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Open Positions ({activeSymbol})</h3>
          <span style={{ backgroundColor: '#000', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>{positions.length} Active</span>
        </div>
        
        {positions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>No open positions for {activeSymbol}</div>
        ) : positions.map(pos => (
          <div key={pos.ticket} onClick={() => { setModifyingTrade(pos); setModSl(pos.sl.toString()); setModTp(pos.tp.toString()); setApplyToAll(false); }} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', marginBottom: '10px', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '900' }}>{pos.symbol}</span>
                <span style={{ fontSize: '11px', fontWeight: '800', color: pos.type === 'BUY' ? '#059669' : '#dc2626', backgroundColor: pos.type === 'BUY' ? '#d1fae5' : '#fee2e2', padding: '4px 10px', borderRadius: '8px' }}>{pos.type}</span>
              </div>
              <span style={{ fontSize: '15px', fontWeight: '800' }}>{pos.lots} lots</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
              <span>Entry: <strong style={{ color: '#000' }}>${pos.entry.toFixed(2)}</strong></span>
              <span>Current: <strong style={{ color: '#000' }}>${pos.current.toFixed(2)}</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: pos.pnl >= 0 ? '#10b981' : '#ef4444' }}>{pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}</div>
              <button onClick={(e) => { e.stopPropagation(); handleClosePosition(pos.ticket); }} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleCloseAll} disabled={positions.length === 0 || isExecuting} style={{ width: '100%', padding: '18px', backgroundColor: positions.length === 0 || isExecuting ? '#9ca3af' : '#ef4444', color: '#fff', fontSize: '16px', fontWeight: '800', borderRadius: '16px', border: 'none', cursor: positions.length === 0 || isExecuting ? 'not-allowed' : 'pointer' }}>
        {isExecuting ? 'CLOSING...' : `CLOSE ALL ${activeSymbol} POSITIONS`}
      </button>

      {showSymbolWarning && (
        <div onClick={() => setShowSymbolWarning(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '16px' }}>⚠️ Switch Symbol?</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px', lineHeight: '1.5' }}>You have <strong>{positions.length} open {activeSymbol} position{positions.length > 1 ? 's' : ''}</strong>. Are you sure you want to switch to {pendingSymbol}?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowSymbolWarning(false)} style={{ flex: 1, padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '14px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setActiveSymbol(pendingSymbol!); setShowSymbolWarning(false); setPendingSymbol(null); }} style={{ flex: 2, padding: '16px', background: '#000', color: '#fff', borderRadius: '14px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Switch to {pendingSymbol}</button>
            </div>
          </div>
        </div>
      )}

      {modifyingTrade && (
        <div onClick={() => setModifyingTrade(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '8px' }}>Modify Ticket #{modifyingTrade.ticket}</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>{modifyingTrade.type} {modifyingTrade.lots} lots @ ${modifyingTrade.entry.toFixed(2)}</p>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>🛡️ Stop Loss</label>
              <input type="number" value={modSl} onChange={e => setModSl(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '16px', fontWeight: '700', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>🎯 Take Profit</label>
              <input type="number" value={modTp} onChange={e => setModTp(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '16px', fontWeight: '700', boxSizing: 'border-box' }} />
            </div>

            <div style={{ backgroundColor: '#f0f9ff', padding: '14px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #bae6fd' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={applyToAll} onChange={(e) => setApplyToAll(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0369a1' }}>Apply to all {modifyingTrade.type} orders</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{allPositions.filter(p => p.symbol === activeSymbol && p.type === modifyingTrade.type).length} trades will be updated</div>
                </div>
              </label>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setModifyingTrade(null)} style={{ flex: 1, padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '14px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleBatchModifySL} disabled={isExecuting} style={{ flex: 2, padding: '16px', background: '#000', color: '#fff', borderRadius: '14px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                {isExecuting ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      <BottomNavBar />
    </div>
  );
}