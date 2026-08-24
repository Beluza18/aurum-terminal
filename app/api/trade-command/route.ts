import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, symbol, lots, sl, tp, ticket } = body;

    const { data, error } = await supabase
      .from('trade_commands')
      .insert({
        action: action,
        symbol: symbol,
        lots: lots.toString(), // Ensure it's a string (handles both '0.05' and 'BUY')
        sl: sl || null,
        tp: tp || null,
        ticket: ticket || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Trade command ${action} sent to MT4`,
      commandId: data.id
    });
    
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}