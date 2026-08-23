'use client';

import { useEffect, useRef } from 'react';

export default function GoldChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing widgets
    containerRef.current.innerHTML = '';

    // Create TradingView widget script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined') {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: 'OANDA:XAUUSD',
          interval: '60',
          timezone: 'exchange',
          theme: 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerRef.current?.id || 'tradingview_chart',
          hide_side_toolbar: false,
          studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650'
        });
      }
    };

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div 
      ref={containerRef}
      id="tradingview_chart"
      className="w-full h-[400px] rounded-3xl overflow-hidden shadow-level-3 bg-white"
    />
  );
}