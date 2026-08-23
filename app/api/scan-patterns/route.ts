import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key missing' },
        { status: 500 }
      );
    }

    console.log('[API] Fetching data from Twelve Data...');

    // Fetch M1, M5, M15 data
    const [m1Res, m5Res, m15Res] = await Promise.all([
      fetch(`https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=1min&outputsize=100&apikey=${apiKey}`),
      fetch(`https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=5min&outputsize=100&apikey=${apiKey}`),
      fetch(`https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=15min&outputsize=100&apikey=${apiKey}`)
    ]);

    const m1Data = await m1Res.json();
    const m5Data = await m5Res.json();
    const m15Data = await m15Res.json();

    const patterns: any[] = [];

    // Detect gaps in M1
    if (m1Data.values) {
      const m1Candles = m1Data.values.map((item: any) => ({
        time: item.datetime,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close)
      })).reverse();

      console.log(`[API] Analyzing ${m1Candles.length} M1 candles for gaps...`);

      for (let i = 1; i < m1Candles.length; i++) {
        const prev = m1Candles[i - 1];
        const curr = m1Candles[i];

        // Gap Up
        if (curr.low > prev.high) {
          const gapPips = ((curr.low - prev.high) / 0.10).toFixed(1);
          console.log(`[API] GAP UP detected: ${gapPips} pips at ${curr.time}`);
          
          patterns.push({
            name: 'Gap Up',
            type: 'bullish',
            timeframe: 'M1',
            time: curr.time,
            price: curr.open,
            description: `Gap of ${gapPips} pips detected. Previous close: $${prev.close.toFixed(2)}, Current open: $${curr.open.toFixed(2)}`
          });
        }

        // Gap Down
        if (curr.high < prev.low) {
          const gapPips = ((prev.low - curr.high) / 0.10).toFixed(1);
          console.log(`[API] GAP DOWN detected: ${gapPips} pips at ${curr.time}`);
          
          patterns.push({
            name: 'Gap Down',
            type: 'bearish',
            timeframe: 'M1',
            time: curr.time,
            price: curr.open,
            description: `Gap of ${gapPips} pips detected. Previous close: $${prev.close.toFixed(2)}, Current open: $${curr.open.toFixed(2)}`
          });
        }
      }
    }

    // Detect engulfing patterns and doji in M5
    if (m5Data.values) {
      const m5Candles = m5Data.values.map((item: any) => ({
        time: item.datetime,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close)
      })).reverse();

      for (let i = 1; i < m5Candles.length; i++) {
        const prev = m5Candles[i - 1];
        const curr = m5Candles[i];

        // Bullish Engulfing
        if (prev.close < prev.open && curr.close > curr.open && 
            curr.open < prev.close && curr.close > prev.open) {
          patterns.push({
            name: 'Bullish Engulfing',
            type: 'bullish',
            timeframe: 'M5',
            time: curr.time,
            price: curr.close,
            description: 'Strong bullish reversal pattern detected'
          });
        }

        // Bearish Engulfing
        if (prev.close > prev.open && curr.close < curr.open && 
            curr.open > prev.close && curr.close < prev.open) {
          patterns.push({
            name: 'Bearish Engulfing',
            type: 'bearish',
            timeframe: 'M5',
            time: curr.time,
            price: curr.close,
            description: 'Strong bearish reversal pattern detected'
          });
        }

        // Doji
        const bodySize = Math.abs(curr.close - curr.open);
        const range = curr.high - curr.low;
        if (range > 0 && bodySize / range < 0.1) {
          patterns.push({
            name: 'Doji',
            type: 'neutral',
            timeframe: 'M5',
            time: curr.time,
            price: curr.close,
            description: 'Market indecision - potential reversal'
          });
        }
      }
    }

    console.log(`[API] Total patterns found: ${patterns.length}`);

    return NextResponse.json({
      success: true,
      patterns: patterns.slice(0, 20), // Return last 20 patterns
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}