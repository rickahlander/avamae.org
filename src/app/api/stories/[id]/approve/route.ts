import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { canApproveStory } from '@/lib/permissions/acl';

// Shared approval logic
async function approveStory(params: Promise<{ id: string }>) {
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
    const canApprove = await canApproveStory(user.id, storyId);
    if (!canApprove) {
      return NextResponse.json(
        { error: 'You do not have permission to approve this story' },
        { status: 403 }
      );
    }

    // Verify story exists
    const existingStory = await prisma.story.findUnique({
      where: { id: storyId },
      select: {
        id: true,
        approved: true,
        treeId: true,
      },
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    if (existingStory.approved) {
      return NextResponse.json(
        { error: 'Story is already approved' },
        { status: 400 }
      );
    }

    // Approve story
    const story = await prisma.story.update({
      where: { id: storyId },
      data: {
        approved: true,
        approvedBy: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        media: true,
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { success: true, story };
  } catch (error) {
    console.error('Error approving story:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to approve story' };
  }
}

// GET /api/stories/:id/approve - Approve via email link
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await approveStory(params);
  
  if (result.success) {
    const story = result.story!;
    // Redirect to the tree page with a success message
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://avamae.org';
    return NextResponse.redirect(`${appUrl}/trees/${story.treeId}?story=approved`);
  } else {
    // Redirect with error
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://avamae.org';
    return NextResponse.redirect(`${appUrl}?error=${encodeURIComponent(result.error || 'Failed to approve story')}`);
  }
}

// POST /api/stories/:id/approve - Approve via API
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await approveStory(params);
  
  if (result.success) {
    return NextResponse.json(result.story);
  } else {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }
}

