'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from './lib/supabase';
import GoldChart from './components/GoldChart';
import { showVolatilityAlert } from './lib/notifications';
import BottomNavBar from './components/BottomNavBar';
import DigitalClock from './components/DigitalClock';

export default function Home() {
  const [volatilityZone, setVolatilityZone] = useState('LOADING...');

  useEffect(() => {
    const fetchVolatility = async () => {
      const { data } = await supabase
        .from('daily_volatility_metrics')
        .select('trading_zone')
        .order('date', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const zone = data[0].trading_zone;
        setVolatilityZone(zone);
        showVolatilityAlert(zone);
      }
    };

    fetchVolatility();
  }, []);

  return (
    <div style={{ 
      maxWidth: '480px', 
      margin: '0 auto', 
      padding: '24px 16px 140px 16px',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: '800', color: '#000000', margin: '0 0 16px 0', textAlign: 'center' }}>
          Aurum Terminal
        </h1>
        
        {/* Digital Clock */}
        <div style={{ 
          marginBottom: '24px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <DigitalClock />
        </div>

        {volatilityZone !== 'LOADING...' && (
          <p style={{ fontSize: '14px', color: '#000000', marginTop: '8px', fontWeight: '600', textAlign: 'center' }}>
            Current Zone: <span style={{ color: '#000000' }}>{volatilityZone}</span>
          </p>
        )}
      </div>

      {/* Market Positioning Bar */}
      <div style={{ 
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', color: '#000000', fontWeight: '700' }}>Market Positioning</span>
          <span style={{ fontSize: '13px', color: '#000000' }}>Buy vs Sell</span>
        </div>
        
        {/* Fluid Colored Bar */}
        <div style={{ 
          display: 'flex', 
          height: '48px', 
          borderRadius: '24px', 
          overflow: 'hidden'
        }}>
          {/* Retail Side (Pink) */}
          <div style={{ 
            width: '35%', 
            background: 'linear-gradient(135deg, #F472B6, #EC4899)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontWeight: '700', 
            fontSize: '13px'
          }}>
            Retail 35%
          </div>
          
          {/* Institutional Side (Green) */}
          <div style={{ 
            width: '65%', 
            background: 'linear-gradient(135deg, #34D399, #10B981)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontWeight: '700', 
            fontSize: '13px'
          }}>
            Institutional 65%
          </div>
        </div>
      </div>

      {/* Live Chart Card */}
      <div style={{ 
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#000000', margin: 0 }}>
            XAU/USD Live Chart
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: '#10b981',
              animation: 'pulse 2s infinite' 
            }}></div>
            <span style={{ fontSize: '12px', color: '#000000', fontWeight: '700' }}>LIVE</span>
          </div>
        </div>
        <div style={{ 
          padding: '12px', 
          borderRadius: '12px', 
          backgroundColor: '#f9fafb'
        }}>
          <GoldChart />
        </div>
      </div>

      {/* Key Price Levels - Navigation Button */}
      <Link 
        href="/key-levels" 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          minHeight: '72px',
          padding: '16px 24px',
          marginBottom: '16px',
          textDecoration: 'none',
          backgroundColor: '#ffffff',
          color: '#000000',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
             Key Price Levels
          </span>
          <span style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginTop: '4px' }}>
            Live M1 tracking • Gold & Bitcoin
          </span>
        </div>
        <span style={{ fontSize: '24px', color: '#000000', fontWeight: '700' }}>
          →
        </span>
      </Link>

      {/* Analyze Institutional Flows Button */}
      <Link 
        href="/flows" 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: '64px',
          padding: '16px 24px',
          marginBottom: '24px',
          textDecoration: 'none',
          fontSize: '16px',
          fontWeight: '700',
          backgroundColor: '#ffffff',
          color: '#000000',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease'
        }}
      >
         Analyze Institutional Flows
      </Link>

      <BottomNavBar />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}