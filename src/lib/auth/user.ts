import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

/**
 * Get the authenticated user's database ID from Clerk
 * Returns null if not authenticated or user not found in database
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    return null;
  }

  // Look up user in our database by clerkId
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkId },
    select: { id: true },
  });

  return user?.id || null;
}

/**
 * Get the authenticated user's full details from the database
 * Returns null if not authenticated or user not found
 */
export async function getAuthenticatedUser() {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkId },
  });

  return user;
}

