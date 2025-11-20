import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { canApproveStory } from '@/lib/permissions/acl';

// POST /api/stories/:id/approve - Approve a story
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const storyId = params.id;

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

