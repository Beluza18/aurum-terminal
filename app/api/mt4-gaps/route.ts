import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    console.log('[API] Fetching last 5 MT4 gaps from Supabase...');
    
    // Fetch ALL recent gaps (removed the strict .eq filter)
    const { data, error } = await supabase
      .from('detected_patterns')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('[API] Supabase error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log(`[API] Found ${data?.length || 0} recent gaps`);

    // Transform data to match frontend interface
    const patterns = (data || []).map((item: any) => ({
      name: item.pattern_name || 'Gap',
      type: item.bias === 'bullish' ? 'bullish' : 'bearish',
      timeframe: 'M1',
      time: item.detected_at,
      price: item.price_at_detection || 0,
      description: `${item.pattern_name} detected at $${item.price_at_detection?.toFixed(2) || 'N/A'}`
    }));

    return NextResponse.json({
      success: true,
      patterns,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gaps' },
      { status: 500 }
    );
  }
}