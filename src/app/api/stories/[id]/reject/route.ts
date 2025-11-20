import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { canApproveStory } from '@/lib/permissions/acl';
import { sendStoryRejectionNotification } from '@/lib/email/resend';

// Shared rejection logic
async function rejectStory(params: Promise<{ id: string }>, reason?: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized', status: 401 };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found', status: 404 };
    }

    const { id: storyId } = await params;

    // Check permissions
    const canReject = await canApproveStory(user.id, storyId);
    if (!canReject) {
      return { success: false, error: 'You do not have permission to reject this story', status: 403 };
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
            id: true,
            rootPersonName: true,
          },
        },
      },
    });

    if (!story) {
      return { success: false, error: 'Story not found', status: 404 };
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

    return { success: true, treeId: story.tree.id };
  } catch (error) {
    console.error('Error rejecting story:', error);
    return { success: false, error: 'Failed to reject story', status: 500 };
  }
}

// GET /api/stories/:id/reject - Reject via email link
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await rejectStory(params);
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://avamae.org';
  
  if (result.success) {
    // Redirect to the tree page with a success message
    return NextResponse.redirect(`${appUrl}/trees/${result.treeId}?story=rejected`);
  } else {
    // Redirect with error
    return NextResponse.redirect(`${appUrl}?error=${encodeURIComponent(result.error || 'Failed to reject story')}`);
  }
}

// POST /api/stories/:id/reject - Reject via API
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json().catch(() => ({}));
  const { reason } = body;
  
  const result = await rejectStory(params, reason);
  
  if (result.success) {
    return NextResponse.json({ 
      success: true,
      message: 'Story rejected and removed',
    });
  } else {
    return NextResponse.json(
      { error: result.error },
      { status: result.status || 500 }
    );
  }
}

