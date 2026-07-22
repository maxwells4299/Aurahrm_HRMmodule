import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session-token')?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    // Fetch all applications matching the candidate's email address
    const applications = await db.applicant.findMany({
      where: {
        email: {
          equals: session.email,
          mode: 'insensitive'
        }
      },
      include: {
        job: true,
        onboardingTasks: true
      },
      orderBy: { appliedAt: 'desc' }
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applicant applications:', error);
    return NextResponse.json({ error: 'Failed to fetch candidate applications' }, { status: 500 });
  }
}
