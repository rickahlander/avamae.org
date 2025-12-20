import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { canContributeToTree } from '@/lib/permissions/acl';
import { getAuthenticatedUserId } from '@/lib/auth/user';

// POST /api/branches - Create a new branch
export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      treeId,
      parentBranchId,
      branchTypeId,
      title,
      description,
      url,
      dateOccurred,
      metadata,
      photos,
    } = body;

    // Validate required fields
    if (!treeId || !branchTypeId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use ACL system to check permissions
    const hasPermission = await canContributeToTree(userId, treeId);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get tree for moderation mode check
    const tree = await prisma.tree.findUnique({
      where: { id: treeId },
      select: {
        ownerId: true,
        moderationMode: true,
      },
    });

    if (!tree) {
      return NextResponse.json({ error: 'Tree not found' }, { status: 404 });
    }

    // Look up branch type by name or ID
    let branchType;
    if (branchTypeId.includes('-')) {
      // It's a UUID
      branchType = await prisma.branchType.findUnique({
        where: { id: branchTypeId },
      });
    } else {
      // It's a name
      branchType = await prisma.branchType.findFirst({
        where: { name: branchTypeId },
      });
    }

    if (!branchType) {
      return NextResponse.json(
        { error: 'Branch type not found' },
        { status: 400 }
      );
    }

    // Determine if branch needs approval
    const needsApproval =
      tree.moderationMode === 'MODERATED' && tree.ownerId !== userId;

    // Use a transaction to ensure branch and media are created together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create branch
      const branch = await tx.branch.create({
        data: {
          treeId,
          parentBranchId: parentBranchId || null,
          branchTypeId: branchType.id,
          title,
          description,
          url,
          dateOccurred: dateOccurred ? new Date(dateOccurred) : null,
          metadata,
          createdByUserId: userId,
          approved: !needsApproval,
          approvedBy: !needsApproval ? userId : null,
          approvedAt: !needsApproval ? new Date() : null,
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

      // 2. Handle photos if provided
      if (photos && Array.isArray(photos) && photos.length > 0) {
        await tx.branchMedia.createMany({
          data: photos.map((photoUrl: string) => ({
            branchId: branch.id,
            mediaType: 'PHOTO',
            url: photoUrl,
            uploadedBy: userId,
          })),
        });

        // Fetch branch again with media
        return await tx.branch.findUnique({
          where: { id: branch.id },
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
      }

      return branch;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : String(error);
    console.error('Error creating branch:', errorDetails);
    return NextResponse.json(
      { error: 'Failed to create branch', details: errorDetails },
      { status: 500 }
    );
  }
}

