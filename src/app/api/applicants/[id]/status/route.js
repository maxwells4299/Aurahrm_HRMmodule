import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      status, 
      interviewDate, 
      interviewer, 
      interviewNotes, 
      interviewScore, 
      salaryOffered, 
      startDate 
    } = body;

    const applicant = await db.applicant.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }

    const updateData = {};
    if (status) updateData.status = status;

    // Interview data updates
    if (interviewDate !== undefined) updateData.interviewDate = interviewDate ? new Date(interviewDate) : null;
    if (interviewer !== undefined) updateData.interviewer = interviewer;
    if (interviewNotes !== undefined) updateData.interviewNotes = interviewNotes;
    if (interviewScore !== undefined) updateData.interviewScore = interviewScore;

    // Offer data updates
    if (salaryOffered !== undefined) updateData.salaryOffered = parseInt(salaryOffered) || null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;

    // Perform update
    const updatedApplicant = await db.applicant.update({
      where: { id },
      data: updateData,
    });

    console.log(`[BPMN State Update] Applicant ${applicant.name} (${id}) transitioned to status: ${status || applicant.status}`);

    // If status is updated to COMPLETED (meaning onboarding is finished and candidate starts working):
    // Promote them to the Employee directory!
    if (status === 'COMPLETED') {
      // Check if employee record already exists
      const existingEmployee = await db.employee.findUnique({
        where: { email: applicant.email },
      });

      if (!existingEmployee) {
        const salary = applicant.salaryOffered || 60000; // fallback salary
        const joinDate = applicant.startDate || new Date(); // fallback join date

        await db.employee.create({
          data: {
            name: applicant.name,
            email: applicant.email,
            phone: applicant.phone,
            role: applicant.job.title,
            department: applicant.job.department,
            joinDate: joinDate,
            salary: salary,
            status: 'Active',
          },
        });
        console.log(`[HR System Event] Applicant ${applicant.name} promoted to active Employee Directory. Role: ${applicant.job.title}`);
      }
    }

    return NextResponse.json(updatedApplicant);
  } catch (error) {
    console.error('Error updating applicant status:', error);
    return NextResponse.json({ error: 'Failed to update applicant status' }, { status: 500 });
  }
}
