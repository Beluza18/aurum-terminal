'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import BottomNavBar from '../components/BottomNavBar';

export default function MacroPage() {
  const [macroData, setMacroData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMacro = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('macro_indicators')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setMacroData(data[0]);
      }
    } catch (error) {
      console.error('Error fetching macro data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchMacro(); 
    const interval = setInterval(fetchMacro, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const generateInsight = () => {
    if (!macroData) return { text: "Waiting for live data feed...", scenario: "Analyzing...", scenarioBg: '#f0e4a0' };
    
    const { gold_price: gold, dxy, us_10y_yield: yield10y, vix } = macroData;
    let insight = "";
    let scenario = "Neutral / Volatile";
    let scenarioBg = '#f0e4a0'; // Light Yellow

    if (gold > 4000 && dxy > 110) {
      insight += "Structural Divergence Detected: Gold trading at historic highs despite strong dollar.\n\n";
      scenario = "Bullish / Defensive";
      scenarioBg = '#a7f3d0'; // Light Green
    }
    
    if (yield10y > 4.5) {
      insight += `Yield Headwinds: 10Y Yield elevated at ${yield10y}%. Gold resilience indicates inflation hedging.`;
    } else {
      insight += `Yield Tailwinds: 10Y Yield at ${yield10y}% supportive for gold.`;
    }
    
    if (vix > 20) {
      insight += `\n\nElevated Fear: VIX at ${vix} suggests market uncertainty, providing a floor for gold prices.`;
    }

    return { text: insight, scenario, scenarioBg };
  };

  const analysis = generateInsight();

  // Premium MacroCard Component
  const MacroCard = ({ title, value, icon, unit, desc }: any) => (
    <div style={{ 
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '150px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
            {title}
          </p>
        </div>
        <p style={{ fontSize: '24px', fontWeight: '800', color: '#000000', lineHeight: '1.2', marginBottom: '8px', margin: 0 }}>
          {loading ? (
            <span style={{ display: 'inline-block', width: '60px', height: '24px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></span>
          ) : (
            <>
              {value}
              {unit && <span style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', marginLeft: '4px' }}>{unit}</span>}
            </>
          )}
        </p>
      </div>
      <p style={{ fontSize: '12px', color: '#000000', lineHeight: '1.4', margin: 0 }}>
        {desc}
      </p>
    </div>
  );

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px 140px 16px', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: '800', color: '#000000', margin: '0 0 8px 0' }}>
          Macro Intelligence
        </h1>
        <p style={{ fontSize: '14px', color: '#000000', margin: 0 }}>
          Real-time institutional macroeconomic indicators
        </p>
      </div>

      {/* Daily Outlook Box */}
      <div style={{ 
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#000000', margin: 0 }}>
            🧠 Daily Macro Outlook
          </h3>
          <span style={{ 
            padding: '6px 12px', 
            fontSize: '12px', 
            fontWeight: '700',
            color: '#000000',
            backgroundColor: analysis.scenarioBg,
            borderRadius: '12px',
            textTransform: 'uppercase'
          }}>
            {analysis.scenario}
          </span>
        </div>
        <p style={{ 
          fontSize: '14px', 
          fontWeight: '500',
          color: '#000000',
          lineHeight: '1.6',
          margin: 0,
          whiteSpace: 'pre-line'
        }}>
          {loading ? 'Fetching live macro data...' : analysis.text}
        </p>
      </div>

      {/* 2x2 Grid for Indicators */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px', 
        marginBottom: '24px' 
      }}>
        <MacroCard 
          title="US 10Y Yield" 
          value={macroData?.us_10y_yield || '...'} 
          icon="📊" 
          unit="%" 
          desc="Cost of borrowing. High yields traditionally hurt gold." 
        />
        <MacroCard 
          title="Broad DXY" 
          value={macroData?.dxy || '...'} 
          icon="" 
          desc="Dollar strength index. Inverse correlation with gold." 
        />
        <MacroCard 
          title="VIX (Fear)" 
          value={macroData?.vix || '...'} 
          icon="📉" 
          desc="Market volatility. >20 indicates high fear/uncertainty." 
        />
        <MacroCard 
          title="Gold Spot" 
          value={macroData ? `$${macroData.gold_price}` : '...'} 
          icon="🥇" 
          desc="Live XAU/USD price. The ultimate safe haven." 
        />
      </div>

      {/* Metric Dictionary */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#000000', marginBottom: '16px' }}>
          Metric Dictionary
        </h3>
        
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', marginBottom: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#000000', marginBottom: '8px', marginTop: 0 }}>
            📊 How US10Y Affects Gold
          </h4>
          <p style={{ fontSize: '14px', color: '#000000', lineHeight: '1.6', margin: 0 }}>
            Gold yields 0%. When Treasury yields rise, investors often sell gold to buy bonds. However, if yields rise due to inflation fears, gold may rise as an inflation hedge.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', marginBottom: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#000000', marginBottom: '8px', marginTop: 0 }}>
            💵 How DXY Affects Gold
          </h4>
          <p style={{ fontSize: '14px', color: '#000000', lineHeight: '1.6', margin: 0 }}>
            Gold is priced in Dollars. A stronger dollar makes gold more expensive for foreign buyers, reducing demand. A weaker dollar boosts gold prices.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#000000', marginBottom: '8px', marginTop: 0 }}>
            📉 How VIX Affects Gold
          </h4>
          <p style={{ fontSize: '14px', color: '#000000', lineHeight: '1.6', margin: 0 }}>
            The VIX measures S&P 500 fear. Extreme spikes often cause a "dash for cash" where everything (including gold) is sold to cover margin calls, before gold eventually rallies as a safe haven.
          </p>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}