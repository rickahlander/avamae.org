import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { canApproveStory } from '@/lib/permissions/acl';
import { sendStoryRejectionNotification } from '@/lib/email/resend';

// POST /api/stories/:id/reject - Reject (delete) a story
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { id: storyId } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Check permissions
    const canReject = await canApproveStory(user.id, storyId);
    if (!canReject) {
      return NextResponse.json(
        { error: 'You do not have permission to reject this story' },
        { status: 403 }
      );
    }

    // Get story details before deletion
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        author: {
          select: {
            email: true,
            name: true,
          },
        },
        tree: {
          select: {
            rootPersonName: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Send rejection notification to author
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://avamae.org';
    sendStoryRejectionNotification({
      storyTitle: story.title,
      treeName: story.tree.rootPersonName,
      recipientEmail: story.author.email,
      recipientName: story.author.name,
      rejectionReason: reason,
      appUrl,
    }).catch((error) => {
      console.error('Error sending rejection notification:', error);
    });

    // Delete story (media will be cascade deleted)
    await prisma.story.delete({
      where: { id: storyId },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Story rejected and removed',
    });
  } catch (error) {
    console.error('Error rejecting story:', error);
    return NextResponse.json(
      { error: 'Failed to reject story' },
      { status: 500 }
    );
  }
}

