import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { canViewTree, canEditTree, canDeleteTree } from '@/lib/permissions/acl';
import { getAuthenticatedUserId } from '@/lib/auth/user';

// GET /api/trees/[id] - Get a specific tree (by ID or slug)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();

    // Check if id is a UUID or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    const tree = await prisma.tree.findUnique({
      where: isUUID ? { id } : { slug: id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        media: true,
        links: {
          orderBy: {
            order: 'asc',
          },
        },
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

    // All users (authenticated and unauthenticated) can view trees
    // In the future, we could add a privacy setting to restrict access to members only

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
      url,
      rootPersonPhotoUrl,
      rootPersonPhotos,
      links,
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
        url,
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
            url: photoUrl, // base64 data URL for local dev, Vercel Blob URL for production
            uploadedBy: userId,
          })),
        });
      }
    }

    // Handle social media/web links if provided
    if (links && Array.isArray(links)) {
      // Delete existing links
      await prisma.treeLink.deleteMany({
        where: { treeId: id },
      });

      // Create new links
      if (links.length > 0) {
        await prisma.treeLink.createMany({
          data: links.map((link: { label?: string; url: string }, index: number) => ({
            treeId: id,
            label: link.label || null,
            url: link.url,
            order: index,
          })),
        });
      }
    }

    // Fetch updated tree with media and links
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
        links: {
          orderBy: {
            order: 'asc',
          },
        },
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

