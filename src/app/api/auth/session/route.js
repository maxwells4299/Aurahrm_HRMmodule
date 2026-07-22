import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('session-token');
    const token = tokenCookie?.value;

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ session: null });
    }

    return NextResponse.json({
      session: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      }
    });
  } catch (err) {
    console.error('Session API error:', err);
    return NextResponse.json({ error: 'Internal session lookup error' }, { status: 500 });
  }
}
