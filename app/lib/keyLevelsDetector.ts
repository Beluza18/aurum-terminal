// lib/keyLevelsDetector.ts

export interface Candle {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }
  
  export interface KeyLevel {
    dayType: 'monday' | 'friday';
    levelType: 'high' | 'low';
    price: number;
    detectedAt: string;
    color: string;
    status: 'active' | 'pending' | 'completed';
  }
  
  // Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  function getDayOfWeek(date: Date): number {
    return date.getDay();
  }
  
  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  // Find the most recent Monday in the candle data
  function findMostRecentMonday(candles: Candle[]): string | null {
    // Sort candles by time (oldest first)
    const sortedCandles = [...candles].sort((a, b) => 
      new Date(a.time).getTime() - new Date(b.time).getTime()
    );
    
    // Find the first candle from this week
    const now = new Date();
    const currentDay = getDayOfWeek(now);
    const daysBack = currentDay === 0 ? 6 : currentDay - 1; // Days since Monday
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysBack);
    weekStart.setHours(0, 0, 0, 0);
    
    // Look for Monday candles
    for (const candle of sortedCandles) {
      const candleDate = new Date(candle.time);
      const candleDay = getDayOfWeek(candleDate);
      
      if (candleDay === 1) { // Monday
        return formatDate(candleDate);
      }
    }
    
    // If no Monday found, use the earliest candle's date
    if (sortedCandles.length > 0) {
      const earliestDate = new Date(sortedCandles[sortedCandles.length - 1].time);
      return formatDate(earliestDate);
    }
    
    return null;
  }
  
  // Detect current week's Monday levels
  export function detectCurrentMondayLevels(candles: Candle[]): KeyLevel[] {
    const mondayDate = findMostRecentMonday(candles);
    
    if (!mondayDate) {
      console.log('[Detector] No Monday date found in candles');
      return [];
    }
    
    console.log('[Detector] Looking for Monday from:', mondayDate);
    
    // Filter candles from Monday onwards
    const weekCandles = candles.filter(c => {
      const candleDate = c.time.split(' ')[0];
      return candleDate >= mondayDate;
    });
    
    console.log('[Detector] Week candles found:', weekCandles.length);
    
    if (weekCandles.length === 0) {
      return [];
    }
    
    // Find the high and low for the week (or Monday if we have it)
    let weekHigh = 0;
    let weekLow = 999999;
    
    weekCandles.forEach(candle => {
      if (candle.high > weekHigh) weekHigh = candle.high;
      if (candle.low < weekLow) weekLow = candle.low;
    });
    
    console.log('[Detector] Week High:', weekHigh, 'Low:', weekLow);
    
    return [
      {
        dayType: 'monday',
        levelType: 'high',
        price: weekHigh,
        detectedAt: mondayDate,
        color: '#3B82F6',
        status: 'active'
      },
      {
        dayType: 'monday',
        levelType: 'low',
        price: weekLow,
        detectedAt: mondayDate,
        color: '#60A5FA',
        status: 'active'
      }
    ];
  }
  
  // Prepare Friday levels
  export function prepareFridayLevels(candles: Candle[]): KeyLevel[] {
    const now = new Date();
    const currentDay = getDayOfWeek(now);
    const currentHour = now.getHours();
    
    // Check if it's Friday 22:00 or later
    const isFridayEnd = currentDay === 5 && currentHour >= 22;
    
    const todayStr = formatDate(now);
    
    if (!isFridayEnd) {
      return [
        {
          dayType: 'friday',
          levelType: 'high',
          price: 0,
          detectedAt: todayStr,
          color: '#EF4444',
          status: 'pending'
        },
        {
          dayType: 'friday',
          levelType: 'low',
          price: 0,
          detectedAt: todayStr,
          color: '#F87171',
          status: 'pending'
        }
      ];
    }
    
    // Detect today's levels
    const todayCandles = candles.filter(c => {
      const candleDate = c.time.split(' ')[0];
      return candleDate === todayStr;
    });
    
    if (todayCandles.length === 0) return [];
    
    let todayHigh = 0;
    let todayLow = 999999;
    
    todayCandles.forEach(candle => {
      if (candle.high > todayHigh) todayHigh = candle.high;
      if (candle.low < todayLow) todayLow = candle.low;
    });
    
    return [
      {
        dayType: 'friday',
        levelType: 'high',
        price: todayHigh,
        detectedAt: todayStr,
        color: '#EF4444',
        status: 'completed'
      },
      {
        dayType: 'friday',
        levelType: 'low',
        price: todayLow,
        detectedAt: todayStr,
        color: '#F87171',
        status: 'completed'
      }
    ];
  }