import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { canApproveStory } from '@/lib/permissions/acl';

// GET /api/stories/:id/approve - Approve via email link
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
    const canApprove = await canApproveStory(user.id, storyId);
    if (!canApprove) {
      return NextResponse.redirect(`${appUrl}?error=Permission+denied`);
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
      return NextResponse.redirect(`${appUrl}?error=Story+not+found`);
    }

    if (existingStory.approved) {
      return NextResponse.redirect(`${appUrl}/trees/${existingStory.treeId}?story=already_approved`);
    }

    // Approve story
    await prisma.story.update({
      where: { id: storyId },
      data: {
        approved: true,
        approvedBy: user.id,
      },
    });

    // Redirect to the tree page with a success message
    return NextResponse.redirect(`${appUrl}/trees/${existingStory.treeId}?story=approved`);
  } catch (error) {
    console.error('Error approving story:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://avamae.org';
    return NextResponse.redirect(`${appUrl}?error=Failed+to+approve+story`);
  }
}

// POST /api/stories/:id/approve - Approve via API
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

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error approving story:', error);
    return NextResponse.json(
      { error: 'Failed to approve story' },
      { status: 500 }
    );
  }
}

