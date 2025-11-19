import { prisma } from '@/lib/db/prisma';
import { MemberRole, BranchRole } from '@prisma/client';

/**
 * ACL Permission System
 * 
 * Hierarchy:
 * 1. SuperAdmin - can do anything
 * 2. Tree-level permissions (TreeMember.role)
 * 3. Branch-level permissions (BranchPermission.role)
 */

// Tree-level permission checks
export async function canViewTree(userId: string, treeId: string): Promise<boolean> {
  // Check if user is superadmin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  if (user?.isSuperAdmin) return true;

  // Check tree membership
  const membership = await prisma.treeMember.findUnique({
    where: {
      treeId_userId: {
        treeId: treeId,
        userId: userId,
      },
    },
  });

  return membership !== null;
}

export async function canEditTree(userId: string, treeId: string): Promise<boolean> {
  // Check if user is superadmin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  if (user?.isSuperAdmin) return true;

  // Check if user is owner or admin
  const membership = await prisma.treeMember.findUnique({
    where: {
      treeId_userId: {
        treeId: treeId,
        userId: userId,
      },
    },
  });

  if (!membership) return false;

  return ['OWNER', 'ADMIN'].includes(membership.role);
}

export async function canDeleteTree(userId: string, treeId: string): Promise<boolean> {
  // Check if user is superadmin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  if (user?.isSuperAdmin) return true;

  // Only owner can delete
  const tree = await prisma.tree.findUnique({
    where: { id: treeId },
    select: { ownerId: true },
  });

  return tree?.ownerId === userId;
}

export async function canModerateTree(userId: string, treeId: string): Promise<boolean> {
  // Check if user is superadmin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  if (user?.isSuperAdmin) return true;

  // Check if user is owner, admin, or moderator
  const membership = await prisma.treeMember.findUnique({
    where: {
      treeId_userId: {
        treeId: treeId,
        userId: userId,
      },
    },
  });

  if (!membership) return false;

  return ['OWNER', 'ADMIN', 'MODERATOR'].includes(membership.role);
}

export async function canContributeToTree(userId: string, treeId: string): Promise<boolean> {
  // Check if user is superadmin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  if (user?.isSuperAdmin) return true;

  // Check if user has contributor or higher role
  const membership = await prisma.treeMember.findUnique({
    where: {
      treeId_userId: {
        treeId: treeId,
        userId: userId,
      },
    },
  });

  if (!membership) return false;

  return ['OWNER', 'ADMIN', 'MODERATOR', 'CONTRIBUTOR'].includes(membership.role);
}

// Branch-level permission checks
export async function canViewBranch(userId: string, branchId: string): Promise<boolean> {
  // Check if user is superadmin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  if (user?.isSuperAdmin) return true;

  // Get branch to check tree membership
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { treeId: true },
  });

  if (!branch) return false;

  // Check tree-level access first
  const hasTreeAccess = await canViewTree(userId, branch.treeId);
  if (!hasTreeAccess) return false;

  // Check branch-specific permissions
  const branchPermission = await prisma.branchPermission.findUnique({
    where: {
      branchId_userId: {
        branchId: branchId,
        userId: userId,
      },
    },
  });

  // If no specific branch permission, tree access is enough
  if (!branchPermission) return true;

  // Has explicit branch permission
  return true;
}

export async function canEditBranch(userId: string, branchId: string): Promise<boolean> {
  // Check if user is superadmin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  if (user?.isSuperAdmin) return true;

  // Get branch details
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: {
      treeId: true,
      createdByUserId: true,
    },
  });

  if (!branch) return false;

  // Creator can always edit their own branch
  if (branch.createdByUserId === userId) return true;

  // Check branch-specific permissions
  const branchPermission = await prisma.branchPermission.findUnique({
    where: {
      branchId_userId: {
        branchId: branchId,
        userId: userId,
      },
    },
  });

  if (branchPermission && ['BRANCH_ADMIN', 'BRANCH_EDITOR'].includes(branchPermission.role)) {
    return true;
  }

  // Check tree-level permissions
  const membership = await prisma.treeMember.findUnique({
    where: {
      treeId_userId: {
        treeId: branch.treeId,
        userId: userId,
      },
    },
  });

  if (!membership) return false;

  return ['OWNER', 'ADMIN'].includes(membership.role);
}

export async function canDeleteBranch(userId: string, branchId: string): Promise<boolean> {
  // Check if user is superadmin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  if (user?.isSuperAdmin) return true;

  // Get branch details
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: {
      treeId: true,
      createdByUserId: true,
    },
  });

  if (!branch) return false;

  // Creator can delete their own branch
  if (branch.createdByUserId === userId) return true;

  // Check branch-specific permissions
  const branchPermission = await prisma.branchPermission.findUnique({
    where: {
      branchId_userId: {
        branchId: branchId,
        userId: userId,
      },
    },
  });

  if (branchPermission && branchPermission.role === 'BRANCH_ADMIN') {
    return true;
  }

  // Check tree-level permissions (only owner and admin can delete others' branches)
  const membership = await prisma.treeMember.findUnique({
    where: {
      treeId_userId: {
        treeId: branch.treeId,
        userId: userId,
      },
    },
  });

  if (!membership) return false;

  return ['OWNER', 'ADMIN'].includes(membership.role);
}

export async function canApproveBranch(userId: string, branchId: string): Promise<boolean> {
  // Check if user is superadmin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  if (user?.isSuperAdmin) return true;

  // Get branch to check tree
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { treeId: true },
  });

  if (!branch) return false;

  // Can moderate tree = can approve branches
  return canModerateTree(userId, branch.treeId);
}

// Helper to get user's role in a tree
export async function getUserTreeRole(userId: string, treeId: string): Promise<MemberRole | null> {
  const membership = await prisma.treeMember.findUnique({
    where: {
      treeId_userId: {
        treeId: treeId,
        userId: userId,
      },
    },
    select: { role: true },
  });

  return membership?.role || null;
}

// Helper to get user's role for a specific branch
export async function getUserBranchRole(userId: string, branchId: string): Promise<BranchRole | null> {
  const permission = await prisma.branchPermission.findUnique({
    where: {
      branchId_userId: {
        branchId: branchId,
        userId: userId,
      },
    },
    select: { role: true },
  });

  return permission?.role || null;
}

// Helper to check if user is superadmin
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  return user?.isSuperAdmin || false;
}

