'use client';

import BottomNavBar from '../components/BottomNavBar';

export default function FlowsPage() {
  // Explicitly tell TypeScript this can be one of three values
  const currentSentiment: 'Bullish' | 'Neutral' | 'Bearish' = 'Bullish'; 

  const getSentimentDotPosition = () => {
    if (currentSentiment === 'Bullish') return '85%';
    if (currentSentiment === 'Neutral') return '50%';
    return '15%';
  };

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
        <h1 style={{ fontSize: '34px', fontWeight: '800', color: '#000000', margin: 0 }}>
          Institutional Intel
        </h1>
      </div>

      {/* 1. Sentiment Gauge Box */}
      <div style={{ 
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#000000', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🧠 Market Sentiment Gauge
        </h3>
        
        {/* The Bar */}
        <div style={{ position: 'relative', height: '16px', overflow: 'hidden', marginBottom: '12px', borderRadius: '9999px', backgroundColor: '#e5e7eb' }}>
          <div style={{ position: 'absolute', left: '0', top: '0', height: '100%', width: '33.33%', backgroundColor: '#fee2e2' }}></div>
          <div style={{ position: 'absolute', left: '33.33%', top: '0', height: '100%', width: '33.33%', backgroundColor: '#fef3c7' }}></div>
          <div style={{ position: 'absolute', left: '66.66%', top: '0', height: '100%', width: '33.34%', backgroundColor: '#d1fae5' }}></div>
          
          {/* Indicator Dot */}
          <div 
            style={{ 
              position: 'absolute',
              top: '-4px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '3px solid #ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              backgroundColor: '#000000',
              left: getSentimentDotPosition(),
              transform: 'translateX(-50%)',
              transition: 'left 0.5s ease'
            }}
          ></div>
        </div>

        {/* Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: currentSentiment === 'Bearish' ? '#000000' : '#6b7280' }}>Bearish</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: currentSentiment === 'Neutral' ? '#000000' : '#6b7280' }}>Neutral</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: currentSentiment === 'Bullish' ? '#000000' : '#6b7280' }}>Bullish</span>
        </div>

        <p style={{ fontSize: '14px', color: '#000000', lineHeight: '1.5', margin: 0 }}>
          Based on current macro divergence and momentum, institutional sentiment is leaning{' '}
          <span style={{ fontWeight: '800', color: '#000000', textDecoration: 'underline' }}>
            {currentSentiment}
          </span>.
        </p>
      </div>

      {/* 2. COT Report */}
      <div style={{ 
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#000000', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📊 COT Report
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Non-Commercials */}
          <div style={{ 
            padding: '16px 20px', 
            backgroundColor: '#d1fae5',
            borderRadius: '12px',
            border: '1px solid #a7f3d0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#000000', margin: '0 0 4px 0' }}>Non-Commercials</p>
              <p style={{ fontSize: '12px', color: '#000000', margin: 0, opacity: 0.8 }}>Hedge Funds & Large Traders</p>
            </div>
            <p style={{ fontSize: '16px', fontWeight: '800', color: '#000000', margin: 0 }}>Net Long +12,450</p>
          </div>

          {/* Commercials */}
          <div style={{ 
            padding: '16px 20px', 
            backgroundColor: '#fee2e2',
            borderRadius: '12px',
            border: '1px solid #fca5a5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#000000', margin: '0 0 4px 0' }}>Commercials</p>
              <p style={{ fontSize: '12px', color: '#000000', margin: 0, opacity: 0.8 }}>Producers & Users</p>
            </div>
            <p style={{ fontSize: '16px', fontWeight: '800', color: '#000000', margin: 0 }}>Net Short -11,200</p>
          </div>

        </div>
        <p style={{ fontSize: '13px', color: '#000000', marginTop: '16px', lineHeight: '1.5', margin: 0 }}>
          Speculators are heavily positioned long, indicating strong momentum.
        </p>
      </div>

      {/* 3. ETF Flows */}
      <div style={{ 
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#000000', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💰 GLD/IAU ETF Flows
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'center' }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f9fafb', 
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ fontSize: '13px', color: '#000000', marginBottom: '8px', fontWeight: '600' }}>SPDR Gold (GLD)</p>
            <p style={{ fontSize: '24px', fontWeight: '800', color: '#000000', margin: 0 }}>+4.2T</p>
          </div>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f9fafb', 
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ fontSize: '13px', color: '#000000', marginBottom: '8px', fontWeight: '600' }}>iShares Gold (IAU)</p>
            <p style={{ fontSize: '24px', fontWeight: '800', color: '#000000', margin: 0 }}>+1.8T</p>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: '#000000', marginTop: '16px', lineHeight: '1.5', margin: 0 }}>
          Western institutional money flowing back into gold ETFs.
        </p>
      </div>

      <BottomNavBar />
    </div>
  );
}