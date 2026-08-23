import { NextResponse } from 'next/server';

export async function GET() {
  const now = new Date();
  
  return NextResponse.json({
    success: true,
    local: {
      time: now.toLocaleTimeString('en-US', { hour12: false }),
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    utc: {
      time: now.toISOString().split('T')[1].split('.')[0],
      hours: now.getUTCHours(),
      minutes: now.getUTCMinutes(),
      seconds: now.getUTCSeconds()
    },
    timestamp: now.getTime(),
    note: "Broker MT4 time is typically UTC+2 or UTC+3 depending on Daylight Saving Time."
  });
}