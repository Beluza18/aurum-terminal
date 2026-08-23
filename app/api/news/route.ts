import { NextResponse } from 'next/server';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

export async function GET() {
  if (!FINNHUB_KEY) {
    console.error('❌ FINNHUB_API_KEY is missing in .env.local');
    return NextResponse.json({ error: 'API key missing' }, { status: 500 });
  }

  try {
    console.log('📡 Fetching news from Finnhub...');

    // 1. Fetch General News (Covers Macro, Gold, and Global Markets)
    const generalRes = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`);
    const generalText = await generalRes.text();
    
    let generalData: any[] = [];
    try {
      const parsed = JSON.parse(generalText);
      if (Array.isArray(parsed)) {
        generalData = parsed.map((n: any) => ({ ...n, category: 'Macro', impact: 'High' }));
      }
    } catch (e) {
      console.warn('⚠️ General news parsing failed, skipping.');
    }

    // 2. Fetch Crypto News (BTC)
    const cryptoRes = await fetch(`https://finnhub.io/api/v1/crypto/news?symbol=BINANCE:BTCUSDT&token=${FINNHUB_KEY}`);
    const cryptoText = await cryptoRes.text();
    
    let cryptoData: any[] = [];
    try {
      const parsed = JSON.parse(cryptoText);
      if (Array.isArray(parsed)) {
        cryptoData = parsed.map((n: any) => ({ ...n, category: 'Crypto', impact: 'Medium' }));
      }
    } catch (e) {
      console.warn('⚠️ Crypto news parsing failed, skipping.');
    }

    // 3. Attempt Forex News (Graceful fallback if it returns HTML)
    let forexData: any[] = [];
    try {
      const forexRes = await fetch(`https://finnhub.io/api/v1/forex/news?symbol=OANDA:XAU_USD&token=${FINNHUB_KEY}`);
      const forexText = await forexRes.text();
      
      // Check if it's valid JSON before parsing
      if (forexText.trim().startsWith('[') || forexText.trim().startsWith('{')) {
        const parsed = JSON.parse(forexText);
        if (Array.isArray(parsed)) {
          forexData = parsed.map((n: any) => ({ ...n, category: 'Gold', impact: 'High' }));
        }
      } else {
        console.warn('⚠️ Forex news returned HTML (likely free tier limit). Skipping Forex news.');
      }
    } catch (e) {
      console.warn('⚠️ Forex news request failed, skipping.');
    }

    // Combine all successful data
    const allNews = [...generalData, ...cryptoData, ...forexData];

    if (allNews.length === 0) {
      return NextResponse.json({ success: true, news: [] });
    }

    // Sort by newest first and take top 25
    const sortedNews = allNews
      .sort((a: any, b: any) => b.datetime - a.datetime)
      .slice(0, 25)
      .map((item: any) => ({
        id: item.id?.toString() || Math.random().toString(36),
        title: item.headline,
        summary: item.summary,
        time: new Date(item.datetime * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        category: item.category,
        impact: item.impact || 'Medium',
        url: item.url
      }));

    console.log(`✅ Successfully fetched ${sortedNews.length} news items.`);
    return NextResponse.json({ success: true, news: sortedNews });

  } catch (error: any) {
    console.error('❌ [News API] Crash:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}