import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);

    const newUser = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'APPLICANT'
      }
    });

    console.log(`[Auth Register] Created new user: ${newUser.email} with role: ${newUser.role}`);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Registration API error:', err);
    // Return the real error details so we can diagnose Vercel issues
    return NextResponse.json({
      error: 'Internal registration error',
      detail: err?.message ?? String(err),
      code: err?.code,
      meta: err?.meta,
    }, { status: 500 });
  }
}

