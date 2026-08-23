import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const MT4_PATH = 'C:\\Users\\adria\\AppData\\Roaming\\MetaQuotes\\Terminal\\90EE0B955C830663792F78FA31F6785A\\MQL4\\Files';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTCUSD';
    
    // Attempt 1: Try Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        const { data, error } = await supabase
          .from('key_levels')
          .select('*')
          .eq('symbol', symbol)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          const formattedData = {
            symbol: data.symbol,
            current_price: data.current_price,
            timestamp: data.timestamp,
            levels: {
              yesterday: { high: data.yesterday_high, low: data.yesterday_low, date: new Date(data.timestamp).toISOString().split('T')[0] },
              monday: { high: data.monday_high, low: data.monday_low, date: new Date(data.timestamp).toISOString().split('T')[0] },
              friday: { high: data.friday_high, low: data.friday_low, date: new Date(data.timestamp).toISOString().split('T')[0] }
            }
          };
          return NextResponse.json({ success: true, data: formattedData });
        }
      } catch (supabaseErr) {
        console.log('️ Supabase unavailable, falling back to local file');
      }
    }

    // Attempt 2: Fall back to local MT4 file
    const filename = `key_levels_${symbol}.json`;
    const filepath = path.join(MT4_PATH, filename);
    
    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ 
        success: false, 
        error: `Key levels file not found for ${symbol}. Ensure MT4 EA is running.` 
      }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json({ success: true, data });
    
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}