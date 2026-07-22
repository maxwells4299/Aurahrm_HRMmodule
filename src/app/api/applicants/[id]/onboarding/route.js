import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const taskId = formData.get('taskId');
    const file = formData.get('file');

    if (!taskId || !file) {
      return NextResponse.json({ error: 'Missing taskId or file' }, { status: 400 });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    const filename = `${id}-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    // Update the task status and fileUrl
    const updatedTask = await db.onboardingTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        fileUrl: fileUrl,
      },
    });

    console.log(`[Onboarding Task Completed] Applicant ${id} completed task ${taskId}. File saved to ${fileUrl}`);

    // Check if there are any remaining pending tasks
    const pendingTasks = await db.onboardingTask.findMany({
      where: {
        applicantId: id,
        status: 'PENDING',
      },
    });

    const allCompleted = pendingTasks.length === 0;

    if (allCompleted) {
      await db.applicant.update({
        where: { id },
        data: { status: 'DOCUMENTS_RECEIVED' },
      });
      console.log(`[BPMN State Update] Applicant ${id} uploaded all onboarding files. Transitioned to DOCUMENTS_RECEIVED.`);
    }

    return NextResponse.json({ 
      success: true, 
      task: updatedTask,
      allCompleted: allCompleted 
    });
  } catch (error) {
    console.error('Error handling onboarding file upload:', error);
    return NextResponse.json({ error: 'Failed to upload onboarding document' }, { status: 500 });
  }
}
