import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { canSubmitStory, canViewPendingStories } from '@/lib/permissions/acl';
import { sendStoryApprovalNotification } from '@/lib/email/resend';

// POST /api/stories - Create a new story
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { treeId, branchId, title, content, photos } = body;

    if (!treeId || !title || !content) {
      return NextResponse.json(
        { error: 'Tree ID, title, and content are required' },
        { status: 400 }
      );
    }

    // Check permissions
    const canSubmit = await canSubmitStory(user.id, treeId);
    if (!canSubmit) {
      return NextResponse.json(
        { error: 'You do not have permission to submit stories to this tree' },
        { status: 403 }
      );
    }

    // Verify tree exists
    const tree = await prisma.tree.findUnique({
      where: { id: treeId },
      select: { id: true, rootPersonName: true },
    });

    if (!tree) {
      return NextResponse.json(
        { error: 'Tree not found' },
        { status: 404 }
      );
    }

    // Create story and media in a transaction
    const story = await prisma.$transaction(async (tx) => {
      const newStory = await tx.story.create({
        data: {
          treeId,
          branchId: branchId || null,
          title,
          content,
          authorId: user.id,
          approved: false,
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
        },
      });

      // Create story media if photos provided
      if (photos && Array.isArray(photos) && photos.length > 0) {
        await tx.storyMedia.createMany({
          data: photos.map((photoUrl: string) => ({
            storyId: newStory.id,
            mediaType: 'PHOTO',
            url: photoUrl,
            uploadedBy: user.id,
          })),
        });

        // Re-fetch with media
        return await tx.story.findUnique({
          where: { id: newStory.id },
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
          },
        });
      }

      return newStory;
    });

    // Get moderators to notify
    const moderators = await prisma.treeMember.findMany({
      where: {
        treeId,
        role: {
          in: ['OWNER', 'ADMIN', 'MODERATOR'],
        },
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Send email notifications to moderators
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://avamae.org';
    const emailPromises = moderators.map((moderator) =>
      sendStoryApprovalNotification({
        storyId: story.id,
        treeId,
        treeName: tree.rootPersonName,
        storyTitle: title,
        storyAuthor: user.name,
        recipientEmail: moderator.user.email,
        recipientName: moderator.user.name,
        appUrl,
      })
    );

    // Send emails asynchronously (don't wait for them)
    Promise.all(emailPromises).catch((emailError) => {
      console.error('Error sending approval notifications:', emailError);
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Failed to create or retrieve story' },
        { status: 500 }
      );
    }

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : String(error);
    console.error('Error creating story:', errorDetails);
    return NextResponse.json(
      { error: 'Failed to create story', details: errorDetails },
      { status: 500 }
    );
  }
}

// GET /api/stories?treeId=xxx&includePending=true
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const treeId = searchParams.get('treeId');
    const includePending = searchParams.get('includePending') === 'true';

    if (!treeId) {
      return NextResponse.json(
        { error: 'Tree ID is required' },
        { status: 400 }
      );
    }

    // Build query filter
    const where: any = {
      treeId,
    };

    // If user is authenticated and is a moderator, they can see pending stories
    if (userId && includePending) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (user) {
        const canViewPending = await canViewPendingStories(user.id, treeId);
        if (!canViewPending) {
          // Not a moderator, only show approved stories
          where.approved = true;
        }
        // Otherwise, show all stories (both approved and pending)
      } else {
        // User not found, only show approved
        where.approved = true;
      }
    } else {
      // Not authenticated or not requesting pending, only show approved
      where.approved = true;
    }

    const stories = await prisma.story.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

