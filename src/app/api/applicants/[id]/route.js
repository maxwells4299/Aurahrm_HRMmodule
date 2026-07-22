import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET a single applicant by tracking ID (Applicant track page & HR review page)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const applicant = await db.applicant.findUnique({
      where: { id },
      include: {
        job: true,
        onboardingTasks: true,
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(applicant);
  } catch (error) {
    console.error('Error fetching applicant:', error);
    return NextResponse.json({ error: 'Failed to fetch applicant details' }, { status: 500 });
  }
}

// PATCH applicant (e.g. sign offer, update details)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, signature } = body;

    const applicant = await db.applicant.findUnique({
      where: { id },
      include: { onboardingTasks: true },
    });

    if (!applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }

    if (action === 'SIGN_OFFER') {
      if (!signature) {
        return NextResponse.json({ error: 'Signature is required' }, { status: 400 });
      }

      // Transition status to ONBOARDING, set signedAt and create onboarding tasks
      const updatedApplicant = await db.applicant.update({
        where: { id },
        data: {
          status: 'ONBOARDING',
          signedAt: new Date(),
          offerLetterUrl: `/uploads/signed_offer_${id}.pdf`, // Simulated signed offer letter URL
        },
      });

      // Clear existing tasks if any, and seed onboarding tasks
      await db.onboardingTask.deleteMany({ where: { applicantId: id } });

      await db.onboardingTask.createMany({
        data: [
          {
            title: 'Submit ID Proof',
            description: 'Upload a copy of your Government Issued Passport, National ID, or Drivers License.',
            status: 'PENDING',
            requiredFile: true,
            applicantId: id,
          },
          {
            title: 'Signed Employment Agreement',
            description: 'Sign and return the official employment contract (Completed via digital signature).',
            status: 'COMPLETED',
            requiredFile: true,
            fileUrl: `/uploads/signed_offer_${id}.pdf`,
            applicantId: id,
          },
          {
            title: 'Submit Academic Certificates',
            description: 'Upload your high-resolution Bachelor / Master degree transcripts or certificates.',
            status: 'PENDING',
            requiredFile: true,
            applicantId: id,
          },
          {
            title: 'Direct Deposit & Tax Form W-4',
            description: 'Provide your banking details for monthly payroll configuration and submit W-4 tax details.',
            status: 'PENDING',
            requiredFile: true,
            applicantId: id,
          },
        ],
      });

      console.log(`[BPMN Event: Record Acceptance] Applicant ${applicant.name} signed offer for ${id}. Status changed to ONBOARDING.`);

      return NextResponse.json(updatedApplicant);
    }

    // General updates
    const updated = await db.applicant.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating applicant:', error);
    return NextResponse.json({ error: 'Failed to update applicant' }, { status: 500 });
  }
}
