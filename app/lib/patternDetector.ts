// lib/patternDetector.ts

export interface Candle {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
  
  export interface DetectedPattern {
    name: string;
    type: 'bullish' | 'bearish' | 'neutral';
    timeframe: string;
    time: string;
    price: number;
    description: string;
    strength: 'strong' | 'medium' | 'weak';
  }
  
  // Detect GAP (price gap between candles)
  export function detectGap(current: Candle, previous: Candle): DetectedPattern | null {
    const gapUp = current.low > previous.high;
    const gapDown = current.high < previous.low;
    
    if (gapUp || gapDown) {
      const gapSize = gapUp 
        ? ((current.low - previous.high) / previous.high) * 100
        : ((previous.low - current.high) / previous.high) * 100;
      
      return {
        name: gapUp ? 'Gap Up' : 'Gap Down',
        type: gapUp ? 'bullish' : 'bearish',
        timeframe: 'M1',
        time: current.time,
        price: current.close,
        description: `${gapUp ? 'Bullish' : 'Bearish'} gap of ${gapSize.toFixed(2)}%`,
        strength: gapSize > 0.5 ? 'strong' : gapSize > 0.2 ? 'medium' : 'weak'
      };
    }
    return null;
  }
  
  // Detect Doji
  export function detectDoji(candle: Candle, timeframe: string): DetectedPattern | null {
    const bodySize = Math.abs(candle.close - candle.open);
    const totalRange = candle.high - candle.low;
    
    if (totalRange > 0 && (bodySize / totalRange) < 0.1) {
      return {
        name: 'Doji',
        type: 'neutral',
        timeframe,
        time: candle.time,
        price: candle.close,
        description: 'Market indecision - potential reversal',
        strength: 'medium'
      };
    }
    return null;
  }
  
  // Detect Hammer
  export function detectHammer(candle: Candle, timeframe: string): DetectedPattern | null {
    const bodySize = Math.abs(candle.close - candle.open);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    
    if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5 && candle.close > candle.open) {
      return {
        name: 'Hammer',
        type: 'bullish',
        timeframe,
        time: candle.time,
        price: candle.close,
        description: 'Bullish reversal at support',
        strength: 'strong'
      };
    }
    return null;
  }
  
  // Detect Bullish Engulfing
  export function detectBullishEngulfing(current: Candle, previous: Candle, timeframe: string): DetectedPattern | null {
    if (
      previous.close < previous.open &&
      current.close > current.open &&
      current.close > previous.open &&
      current.open < previous.close
    ) {
      return {
        name: 'Bullish Engulfing',
        type: 'bullish',
        timeframe,
        time: current.time,
        price: current.close,
        description: 'Strong bullish reversal pattern',
        strength: 'strong'
      };
    }
    return null;
  }
  
  // Detect Bearish Engulfing
  export function detectBearishEngulfing(current: Candle, previous: Candle, timeframe: string): DetectedPattern | null {
    if (
      previous.close > previous.open &&
      current.close < current.open &&
      current.close < previous.open &&
      current.open > previous.close
    ) {
      return {
        name: 'Bearish Engulfing',
        type: 'bearish',
        timeframe,
        time: current.time,
        price: current.close,
        description: 'Strong bearish reversal pattern',
        strength: 'strong'
      };
    }
    return null;
  }
  
  // Detect Morning Star (3 candles)
  export function detectMorningStar(c1: Candle, c2: Candle, c3: Candle, timeframe: string): DetectedPattern | null {
    if (
      c1.close < c1.open &&
      Math.abs(c2.close - c2.open) < (c2.high - c2.low) * 0.3 &&
      c3.close > c3.open &&
      c3.close > (c1.open + c1.close) / 2
    ) {
      return {
        name: 'Morning Star',
        type: 'bullish',
        timeframe,
        time: c3.time,
        price: c3.close,
        description: 'Bullish reversal (3-candle pattern)',
        strength: 'strong'
      };
    }
    return null;
  }
  
  // Main detection function
  export function detectAllPatterns(candles: Candle[], timeframe: string): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    if (candles.length < 2) return patterns;
  
    const current = candles[0];
    const previous = candles[1];
  
    // Check for GAP (most important for M1)
    const gap = detectGap(current, previous);
    if (gap) patterns.push(gap);
  
    // Check for Doji
    const doji = detectDoji(current, timeframe);
    if (doji) patterns.push(doji);
  
    // Check for Hammer
    const hammer = detectHammer(current, timeframe);
    if (hammer) patterns.push(hammer);
  
    // Check for Engulfing patterns
    if (candles.length >= 2) {
      const bullishEngulfing = detectBullishEngulfing(current, previous, timeframe);
      if (bullishEngulfing) patterns.push(bullishEngulfing);
  
      const bearishEngulfing = detectBearishEngulfing(current, previous, timeframe);
      if (bearishEngulfing) patterns.push(bearishEngulfing);
    }
  
    // Check for Morning Star (needs 3 candles)
    if (candles.length >= 3) {
      const morningStar = detectMorningStar(candles[2], candles[1], current, timeframe);
      if (morningStar) patterns.push(morningStar);
    }
  
    return patterns;
  }