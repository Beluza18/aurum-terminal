import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MT4_PATH = 'C:\\Users\\adria\\AppData\\Roaming\\MetaQuotes\\Terminal\\90EE0B955C830663792F78FA31F6785A\\MQL4\\Files';
const COMMAND_FILE = path.join(MT4_PATH, 'remote_trade.txt');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const action = String(body.action || '').toUpperCase().trim();
    const symbol = String(body.symbol || '').trim();
    const lots = Number(body.lots) || 0;
    const sl = Number(body.sl) || 0;
    const tp = Number(body.tp) || 0;
    const ticket = Number(body.ticket) || 0;
    const tradeType = String(body.tradeType || '').toUpperCase().trim(); // For MODIFY_ALL
    
    console.log('📥 Received:', { action, symbol, lots, sl, tp, ticket, tradeType });
    
    const validActions = ['BUY', 'SELL', 'MODIFY', 'MODIFY_ALL', 'CLOSE', 'CLOSE_ALL'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
    
    // Format: ACTION,SYMBOL,LOTS/TYPE,SL,TP,TICKET
    // For MODIFY_ALL, 'lots' field is repurposed to pass the 'tradeType' (BUY/SELL)
    const param3 = (action === 'MODIFY_ALL') ? tradeType : lots.toString();
    const command = `${action},${symbol},${param3},${sl},${tp},${ticket}`;
    
    console.log('📝 Writing command:', command);
    
    if (!fs.existsSync(MT4_PATH)) {
      return NextResponse.json({ success: false, error: 'MT4 folder not found' }, { status: 500 });
    }
    
    // Atomic write to prevent race conditions
    const tempFile = COMMAND_FILE + '.tmp';
    fs.writeFileSync(tempFile, command, 'utf8');
    fs.renameSync(tempFile, COMMAND_FILE);
    
    console.log('✅ Command written successfully');
    return NextResponse.json({ success: true, message: 'Command sent' });
    
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}