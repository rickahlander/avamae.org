import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { canViewBranch, canEditBranch, canDeleteBranch } from '@/lib/permissions/acl';
import { getAuthenticatedUserId } from '@/lib/auth/user';

// GET /api/branches/[id] - Get a specific branch
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();

    const branch = await prisma.branch.findUnique({
      where: { id },
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
        stories: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        childBranches: {
          include: {
            branchType: true,
          },
        },
      },
    });

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // Check permissions if user is authenticated
    if (userId) {
      const hasAccess = await canViewBranch(userId, id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    // Unauthenticated users can view public branches (based on tree visibility)

    return NextResponse.json(branch);
  } catch (error) {
    console.error('Error fetching branch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branch' },
      { status: 500 }
    );
  }
}

// PUT /api/branches/[id] - Update a branch
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
    const hasPermission = await canEditBranch(userId, id);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, dateOccurred, metadata, photos, branchTypeId } = body;

    // Look up branch type by name or ID if provided
    let resolvedBranchTypeId = branchTypeId;
    if (branchTypeId) {
      if (branchTypeId.includes('-')) {
        // It's already a UUID
        resolvedBranchTypeId = branchTypeId;
      } else {
        // It's a name, look it up
        const branchType = await prisma.branchType.findFirst({
          where: { name: branchTypeId },
        });
        if (branchType) {
          resolvedBranchTypeId = branchType.id;
        }
      }
    }

    // Update branch
    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: {
        title,
        description,
        dateOccurred: dateOccurred ? new Date(dateOccurred) : null,
        metadata,
        ...(resolvedBranchTypeId && { branchTypeId: resolvedBranchTypeId }),
      },
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
    });

    // Handle photos if provided
    if (photos && Array.isArray(photos)) {
      // Delete existing media
      await prisma.branchMedia.deleteMany({
        where: { branchId: id },
      });

      // Create new media records
      if (photos.length > 0) {
        await prisma.branchMedia.createMany({
          data: photos.map((photoUrl: string) => ({
            branchId: id,
            mediaType: 'PHOTO',
            url: photoUrl, // base64 data URL for local dev, S3 URL for production
            uploadedBy: userId,
          })),
        });
      }
    }

    // Fetch updated branch with media
    const branchWithMedia = await prisma.branch.findUnique({
      where: { id },
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
    });

    return NextResponse.json(branchWithMedia);
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json(
      { error: 'Failed to update branch' },
      { status: 500 }
    );
  }
}

// DELETE /api/branches/[id] - Delete a branch
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
    const hasPermission = await canDeleteBranch(userId, id);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete branch (cascades to child branches, media, stories)
    await prisma.branch.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json(
      { error: 'Failed to delete branch' },
      { status: 500 }
    );
  }
}

