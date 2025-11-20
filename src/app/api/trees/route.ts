import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedUserId } from '@/lib/auth/user';

// GET /api/trees - Get all trees (user's trees or public trees)
export async function GET(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view'); // 'my-trees' or 'public'

    let trees;

    if (view === 'my-trees' && userId) {
      // Get trees where user is owner or member
      trees = await prisma.tree.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId: userId } } },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          branches: {
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              branches: true,
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Get all trees (no visibility filtering yet)
      trees = await prisma.tree.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              branches: true,
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json(trees);
  } catch (error: any) {
    console.error('Error fetching trees:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to fetch trees', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/trees - Create a new tree
export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      rootPersonName,
      rootPersonBirthDate,
      rootPersonDeathDate,
      rootPersonStory,
      rootPersonPhotoUrl,
      moderationMode = 'MODERATED',
    } = body;

    // Validate required fields
    if (!rootPersonName) {
      return NextResponse.json(
        { error: 'Root person name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name  
    const baseSlug = rootPersonName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')          // Replace spaces with -
      .replace(/-+/g, '-')           // Replace multiple - with single -
      .replace(/^-+|-+$/g, '');      // Trim - from start/end

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    
    // Check if slug exists
    let existingTree = await prisma.tree.findUnique({ where: { slug } });
    
    while (existingTree) {
      slug = `${baseSlug}-${counter}`;
      existingTree = await prisma.tree.findUnique({ where: { slug } });
      counter++;
    }

    // Create tree
    const tree = await prisma.tree.create({
      data: {
        slug,
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
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(tree, { status: 201 });
  } catch (error) {
    console.error('Error creating tree:', error);
    return NextResponse.json(
      { error: 'Failed to create tree' },
      { status: 500 }
    );
  }
}

