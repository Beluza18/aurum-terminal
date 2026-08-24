import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('🔍 Environment Check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      url: supabaseUrl
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables!');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Supabase configuration' 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('account_states')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data || { balance: 0, equity: 0, margin: 0, free_margin: 0, positions: [] }
    });
    
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}