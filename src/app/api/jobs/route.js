import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all jobs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status') || 'OPEN'; // Default to open jobs

    const where = {};
    if (department && department !== 'All') {
      where.department = department;
    }
    if (status && status !== 'All') {
      where.status = status;
    }

    const jobs = await db.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applicants: true }
        }
      }
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// POST a new job opening (HR Admin action)
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, department, location, type, salaryRange, description, requirements } = body;

    if (!title || !department || !location || !type || !salaryRange || !description || !requirements) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newJob = await db.job.create({
      data: {
        title,
        department,
        location,
        type,
        salaryRange,
        description,
        requirements,
        status: 'OPEN',
      },
    });

    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
