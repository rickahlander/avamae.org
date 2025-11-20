import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { canEditStory, canDeleteStory } from '@/lib/permissions/acl';

// GET /api/stories/:id - Get a single story
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params;

    const story = await prisma.story.findUnique({
      where: { id: storyId },
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

    // If story is not approved, only show to moderators and author
    if (!story.approved) {
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

      if (!user || (user.id !== story.authorId && !(await canEditStory(user.id, storyId)))) {
        return NextResponse.json(
          { error: 'Story not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}

// PUT /api/stories/:id - Update a story
export async function PUT(
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
    const body = await request.json();
    const { title, content, photos } = body;

    // Check permissions
    const canEdit = await canEditStory(user.id, storyId);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this story' },
        { status: 403 }
      );
    }

    // Verify story exists
    const existingStory = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Update story
    const story = await prisma.story.update({
      where: { id: storyId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
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
      },
    });

    // Update photos if provided
    if (photos !== undefined && Array.isArray(photos)) {
      // Delete existing photos
      await prisma.storyMedia.deleteMany({
        where: { storyId },
      });

      // Create new photos
      if (photos.length > 0) {
        await Promise.all(
          photos.map((photoUrl: string) =>
            prisma.storyMedia.create({
              data: {
                storyId,
                mediaType: 'PHOTO',
                url: photoUrl,
                uploadedBy: user.id,
              },
            })
          )
        );
      }
    }

    // Refetch with updated media
    const updatedStory = await prisma.story.findUnique({
      where: { id: storyId },
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

    return NextResponse.json(updatedStory);
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    );
  }
}

// DELETE /api/stories/:id - Delete a story
export async function DELETE(
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
    const canDelete = await canDeleteStory(user.id, storyId);
    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this story' },
        { status: 403 }
      );
    }

    // Delete story (media will be cascade deleted)
    await prisma.story.delete({
      where: { id: storyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}

