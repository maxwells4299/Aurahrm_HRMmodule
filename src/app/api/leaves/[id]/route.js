import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const leave = await db.leave.findUnique({
      where: { id },
    });

    if (!leave) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    const updatedLeave = await db.leave.update({
      where: { id },
      data: { status },
      include: {
        employee: true,
      }
    });

    console.log(`[Leave Request Update] Leave ID ${id} for Employee ${updatedLeave.employee.name} updated to ${status}`);

    return NextResponse.json(updatedLeave);
  } catch (error) {
    console.error('Error updating leave status:', error);
    return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 });
  }
}
