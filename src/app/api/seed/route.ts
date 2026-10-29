import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const forceReset = Boolean(body.forceReset);
    const result = await seedDatabase(forceReset);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao semear banco' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const forceReset = url.searchParams.get('force') === 'true';
    const result = await seedDatabase(forceReset);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao semear banco' }, { status: 500 });
  }
}
