import { NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring and load balancers
 * Returns 200 OK if the application is running
 */
export async function GET() {
  console.log('[HEALTH CHECK] Health endpoint called at:', new Date().toISOString());
  
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'avamae',
    },
    { status: 200 }
  );
}

