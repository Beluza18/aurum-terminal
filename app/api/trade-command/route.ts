import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    console.log('🚀 Trade Command API Called');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('Environment Check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables!');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Supabase configuration' 
      }, { status: 500 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { action, symbol, lots, sl, tp, ticket } = body;

    if (!action || !symbol) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('trade_commands')
      .insert({
        action: action,
        symbol: symbol,
        lots: lots?.toString() || '0.05',
        sl: sl || 0,
        tp: tp || 0,
        ticket: ticket || 0,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    console.log('✅ Trade command inserted:', data);
    
    return NextResponse.json({ 
      success: true, 
      message: `Trade command ${action} sent to MT4`,
      commandId: data.id
    });
    
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}