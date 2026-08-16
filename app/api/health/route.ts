import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';

  try {
    const conn = await connectToDatabase();
    if (conn) {
      dbStatus = 'connected';
    } else {
      dbStatus = 'fallback_memory_active';
    }
  } catch (e: any) {
    dbStatus = `error: ${e.message}`;
  }

  const responseTimeMs = Date.now() - startTime;

  return NextResponse.json({
    status: 'healthy',
    app: 'Elance Dating Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    responseTimeMs,
    environment: process.env.NODE_ENV || 'development',
  });
}
