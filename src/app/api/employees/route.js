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

// GET all employees (Directory view)
export async function GET() {
  try {
    const auth = await checkAuth(['EMPLOYEE', 'HR_ADMIN']);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const employees = await db.employee.findMany({
      orderBy: { joinDate: 'desc' },
      include: {
        leaves: true
      }
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

// POST create a new employee directly
export async function POST(request) {
  try {
    const auth = await checkAuth(['HR_ADMIN']);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, role, department, salary, joinDate } = body;

    if (!name || !email || !phone || !role || !department || !salary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingEmployee = await db.employee.findUnique({
      where: { email },
    });

    if (existingEmployee) {
      return NextResponse.json({ error: 'Employee with this email already exists' }, { status: 400 });
    }

    const employee = await db.employee.create({
      data: {
        name,
        email,
        phone,
        role,
        department,
        salary: parseInt(salary) || 50000,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        status: 'Active',
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
