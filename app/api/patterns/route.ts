import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const MT4_PATH = 'C:\\Users\\adria\\AppData\\Roaming\\MetaQuotes\\Terminal\\90EE0B955C830663792F78FA31F6785A\\MQL4\\Files';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe');
    
    // Attempt 1: Try Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        let query = supabase
          .from('detected_patterns')
          .select('*')
          .order('detected_at', { ascending: false });

        if (timeframe) {
          query = query.eq('timeframe', timeframe);
        }

        const { data: patterns, error } = await query.limit(50);

        if (patterns && !error) {
          return NextResponse.json({ success: true, patterns, count: patterns.length });
        }
      } catch (supabaseErr) {
        console.log('⚠️ Supabase unavailable, falling back to local files');
      }
    }

    // Attempt 2: Fall back to local MT4 gap files
    const patterns: any[] = [];
    const timeframes = timeframe ? [timeframe.toLowerCase()] : ['m1', 'm5', 'm15'];
    
    for (const tf of timeframes) {
      const filename = `gap_${tf}.json`;
      const filepath = path.join(MT4_PATH, filename);
      
      if (fs.existsSync(filepath)) {
        try {
          const content = fs.readFileSync(filepath, 'utf8');
          const data = JSON.parse(content);
          
          patterns.push({
            id: patterns.length + 1,
            pattern_name: data.type === 'gap_up' ? 'BULLISH GAP' : 'BEARISH GAP',
            bias: data.type === 'gap_up' ? 'bullish' : 'bearish',
            price_at_detection: data.price,
            timeframe: data.timeframe || tf.toUpperCase(),
            gap_size: data.gapSize,
            top_price: data.top_price,
            bot_price: data.bot_price,
            detected_at: data.time || new Date().toISOString()
          });
        } catch (err) {
          console.error(`Error reading ${filename}:`, err);
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      patterns: patterns.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()),
      count: patterns.length
    });
    
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Pattern ID required' }, { status: 400 });
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      
      const { error } = await supabase
        .from('detected_patterns')
        .delete()
        .eq('id', parseInt(id));

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Pattern deleted' });
    
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}