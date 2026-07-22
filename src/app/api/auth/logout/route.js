import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session-token');
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout API error:', err);
    return NextResponse.json({ error: 'Internal logout error' }, { status: 500 });
  }
}
