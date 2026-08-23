import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const MT4_PATH = 'C:\\Users\\adria\\AppData\\Roaming\\MetaQuotes\\Terminal\\90EE0B955C830663792F78FA31F6785A\\MQL4\\Files';

// Try Supabase first, fall back to local file
export async function GET() {
  try {
    // Attempt 1: Try Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        const { data, error } = await supabase
          .from('account_states')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          return NextResponse.json({ success: true, data });
        }
      } catch (supabaseErr) {
        console.log('️ Supabase unavailable, falling back to local file');
      }
    }

    // Attempt 2: Fall back to local MT4 file
    const filepath = path.join(MT4_PATH, 'account_state.json');
    
    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ 
        success: false, 
        error: 'No data available. Ensure MT4 EA is running.' 
      }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json({ success: true, data });
    
  } catch (error: any) {
    console.error(' API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}