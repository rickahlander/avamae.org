/**
 * Convert a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Generate a unique slug with a number suffix if needed
 */
export async function generateUniqueSlug(
  baseName: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = slugify(baseName);
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${slugify(baseName)}-${counter}`;
    counter++;
  }

  return slug;
}

