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

// GET leaves (Filtered by employee if role is EMPLOYEE)
export async function GET() {
  try {
    const auth = await checkAuth(['EMPLOYEE', 'HR_ADMIN']);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let filter = {};
    if (auth.session.role === 'EMPLOYEE') {
      const emp = await db.employee.findUnique({
        where: { email: auth.session.email }
      });
      if (!emp) {
        return NextResponse.json([]);
      }
      filter = { employeeId: emp.id };
    }

    const leaves = await db.leave.findMany({
      where: filter,
      include: {
        employee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return NextResponse.json({ error: 'Failed to fetch leaves' }, { status: 500 });
  }
}

// POST create a leave request
export async function POST(request) {
  try {
    const auth = await checkAuth(['EMPLOYEE', 'HR_ADMIN']);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { employeeId, type, startDate, endDate, reason } = body;

    if (!employeeId || !type || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify employee exists
    const employee = await db.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Enforce that employees can only request leaves for themselves
    if (auth.session.role === 'EMPLOYEE' && employee.email !== auth.session.email) {
      return NextResponse.json({ error: 'You can only request leaves for your own profile' }, { status: 403 });
    }

    const leave = await db.leave.create({
      data: {
        employeeId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING',
      },
      include: {
        employee: true,
      }
    });

    return NextResponse.json(leave, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
  }
}
