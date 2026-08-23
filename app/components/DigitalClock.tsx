'use client';

import { useState, useEffect } from 'react';

export default function DigitalClock() {
  const [time, setTime] = useState(() => new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Prevent hydration mismatch by not rendering until client is mounted
  if (!isMounted) {
    return (
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px 0'
      }}>
        <div style={{
          fontSize: '64px',
          fontWeight: '800',
          color: '#000000',
          fontFamily: 'monospace'
        }}>
          --:--:--
        </div>
      </div>
    );
  }

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px 0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'monospace'
      }}>
        {/* Hours */}
        <div style={{
          fontSize: '64px',
          fontWeight: '800',
          color: '#000000',
          lineHeight: 1,
          letterSpacing: '-2px'
        }}>
          {hours}
        </div>

        {/* Colon */}
        <div style={{
          fontSize: '64px',
          fontWeight: '800',
          color: '#000000',
          lineHeight: 1,
          animation: 'blink 1s infinite'
        }}>
          :
        </div>

        {/* Minutes */}
        <div style={{
          fontSize: '64px',
          fontWeight: '800',
          color: '#000000',
          lineHeight: 1,
          letterSpacing: '-2px'
        }}>
          {minutes}
        </div>

        {/* Colon */}
        <div style={{
          fontSize: '64px',
          fontWeight: '800',
          color: '#000000',
          lineHeight: 1,
          animation: 'blink 1s infinite'
        }}>
          :
        </div>

        {/* Seconds */}
        <div style={{
          fontSize: '64px',
          fontWeight: '800',
          color: '#6b7280',
          lineHeight: 1,
          letterSpacing: '-2px'
        }}>
          {seconds}
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}