import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { canApproveStory } from '@/lib/permissions/acl';
import { sendStoryRejectionNotification } from '@/lib/email/resend';

// GET /api/stories/:id/reject - Reject via email link
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://avamae.org';

    if (!userId) {
      return NextResponse.redirect(`${appUrl}/sign-in?redirect_url=${encodeURIComponent(request.url)}`);
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.redirect(`${appUrl}?error=User+not+found`);
    }

    const { id: storyId } = await params;

    // Check permissions
    const canReject = await canApproveStory(user.id, storyId);
    if (!canReject) {
      return NextResponse.redirect(`${appUrl}?error=Permission+denied`);
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
      return NextResponse.redirect(`${appUrl}?error=Story+not+found`);
    }

    // Send rejection notification to author
    sendStoryRejectionNotification({
      storyTitle: story.title,
      treeName: story.tree.rootPersonName,
      recipientEmail: story.author.email,
      recipientName: story.author.name,
      rejectionReason: 'Rejected by moderator via email link.',
      appUrl,
    }).catch((error) => {
      console.error('Error sending rejection notification:', error);
    });

    // Delete story (media will be cascade deleted)
    await prisma.story.delete({
      where: { id: storyId },
    });

    // Redirect to the tree page with a success message
    return NextResponse.redirect(`${appUrl}/trees/${story.tree.id}?story=rejected`);
  } catch (error) {
    console.error('Error rejecting story:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://avamae.org';
    return NextResponse.redirect(`${appUrl}?error=Failed+to+reject+story`);
  }
}

// POST /api/stories/:id/reject - Reject via API
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
            id: true,
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

    // Get rejection reason from body
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

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

