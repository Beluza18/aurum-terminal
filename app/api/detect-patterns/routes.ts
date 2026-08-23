import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, just return success to test
    return NextResponse.json({ 
      success: true, 
      message: 'Pattern detection API working',
      patterns: []
    });
  } catch (error) {
    console.error('Pattern detection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to detect patterns' }, 
      { status: 500 }
    );
  }
}