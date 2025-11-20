/**
 * Format a user's name for display based on privacy settings
 * Returns "First Name + Last Initial" (e.g., "John D.")
 */
export function formatNameForDisplay(fullName: string): string {
  if (!fullName || fullName.trim() === '') {
    return 'Anonymous';
  }

  const parts = fullName.trim().split(/\s+/);
  
  if (parts.length === 1) {
    // Only one name provided, show it as is
    return parts[0];
  }

  // First name + last initial
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  
  return `${firstName} ${lastInitial}.`;
}

/**
 * Check if user can view full names
 * Full names are visible to:
 * - The user themselves
 * - Users with edit access to the content
 */
export function canViewFullName(
  viewerId: string | null,
  subjectUserId: string,
  hasEditAccess: boolean = false
): boolean {
  if (!viewerId) {
    // Not authenticated - no full names
    return false;
  }
  
  if (viewerId === subjectUserId) {
    // Viewing your own name
    return true;
  }
  
  if (hasEditAccess) {
    // Has edit access (moderator, admin, etc.)
    return true;
  }
  
  return false;
}

