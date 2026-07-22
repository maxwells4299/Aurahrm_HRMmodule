import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';

async function checkAuth(requiredRoles = []) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session-token')?.value;
  const session = verifySessionToken(token);
  if (!session) return { authenticated: false };
  if (requiredRoles.length > 0 && !requiredRoles.includes(session.role)) {
    return { authenticated: true, authorized: false, session };
  }
  return { authenticated: true, authorized: true, session };
}

// GET all applicants (HR Panel - Protected to HR_ADMIN)
export async function GET(request) {
  try {
    const auth = await checkAuth(['HR_ADMIN']);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const jobId = searchParams.get('jobId');

    const where = {};
    if (status && status !== 'All') {
      where.status = status;
    }
    if (jobId) {
      where.jobId = jobId;
    }

    const applicants = await db.applicant.findMany({
      where,
      include: {
        job: true,
      },
      orderBy: { appliedAt: 'desc' },
    });

    return NextResponse.json(applicants);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return NextResponse.json({ error: 'Failed to fetch applicants' }, { status: 500 });
  }
}

// POST a new application (Careers Portal - Publicly Accessible)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, jobId, coverLetter, resumeUrl, transcriptUrl, portfolioUrl } = body;

    if (!name || !email || !phone || !jobId || !resumeUrl || !transcriptUrl || !coverLetter) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify job exists
    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job opening not found' }, { status: 404 });
    }

    // Create the applicant. Generate a unique track code
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const trackingId = `APP-${randomSuffix}`;

    const applicant = await db.applicant.create({
      data: {
        id: trackingId,
        name,
        email,
        phone,
        resumeUrl,
        transcriptUrl,
        portfolioUrl: portfolioUrl || null,
        coverLetter,
        status: 'RECEIVED',
        jobId,
      },
      include: {
        job: true,
      }
    });

    console.log(`[BPMN Event: Receive Application] Applicant ${name} applied for "${job.title}" (ID: ${trackingId}). Notification dispatched.`);

    return NextResponse.json(applicant, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
