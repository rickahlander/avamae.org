import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { canViewTree, canEditTree, canDeleteTree } from '@/lib/permissions/acl';
import { getAuthenticatedUserId } from '@/lib/auth/user';

// GET /api/trees/[id] - Get a specific tree
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();

    const tree = await prisma.tree.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        media: true,
        branches: {
          include: {
            branchType: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            media: true,
          },
          orderBy: {
            dateOccurred: 'asc',
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!tree) {
      return NextResponse.json({ error: 'Tree not found' }, { status: 404 });
    }

    // Check access permissions if user is authenticated
    if (userId) {
      const hasAccess = await canViewTree(userId, id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    // Unauthenticated users can view public trees (tree-level visibility TBD)

    // Transform the data to match what TreeVisualization expects
    const transformedTree = {
      ...tree,
      rootPersonProfilePhoto: tree.rootPersonPhotoUrl,
      rootPersonPhotos: tree.media?.map(m => m.url) || [],
    };

    return NextResponse.json(transformedTree);
  } catch (error) {
    console.error('Error fetching tree:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tree' },
      { status: 500 }
    );
  }
}

// PUT /api/trees/[id] - Update a tree
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use ACL system to check permissions
    const hasPermission = await canEditTree(userId, id);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      rootPersonName,
      rootPersonBirthDate,
      rootPersonDeathDate,
      rootPersonStory,
      rootPersonPhotoUrl,
      rootPersonPhotos,
      moderationMode,
    } = body;

    // Update tree
    const updatedTree = await prisma.tree.update({
      where: { id },
      data: {
        rootPersonName,
        rootPersonBirthDate: rootPersonBirthDate
          ? new Date(rootPersonBirthDate)
          : null,
        rootPersonDeathDate: rootPersonDeathDate
          ? new Date(rootPersonDeathDate)
          : null,
        rootPersonStory,
        rootPersonPhotoUrl,
        moderationMode,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        media: true,
      },
    });

    // Handle additional photos if provided
    if (rootPersonPhotos && Array.isArray(rootPersonPhotos)) {
      // Delete existing media
      await prisma.treeMedia.deleteMany({
        where: { treeId: id },
      });

      // Create new media records
      if (rootPersonPhotos.length > 0) {
        await prisma.treeMedia.createMany({
          data: rootPersonPhotos.map((photoUrl: string) => ({
            treeId: id,
            mediaType: 'PHOTO',
            url: photoUrl, // base64 data URL for local dev, S3 URL for production
            uploadedBy: userId,
          })),
        });
      }
    }

    // Fetch updated tree with media
    const treeWithMedia = await prisma.tree.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        media: true,
      },
    });

    return NextResponse.json(treeWithMedia);
  } catch (error) {
    console.error('Error updating tree:', error);
    return NextResponse.json(
      { error: 'Failed to update tree' },
      { status: 500 }
    );
  }
}

// DELETE /api/trees/[id] - Delete a tree
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use ACL system to check permissions
    const hasPermission = await canDeleteTree(userId, id);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete tree (cascades to branches, members, etc.)
    await prisma.tree.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tree:', error);
    return NextResponse.json(
      { error: 'Failed to delete tree' },
      { status: 500 }
    );
  }
}

