import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')          // Replace spaces with -
    .replace(/-+/g, '-')           // Replace multiple - with single -
    .replace(/^-+|-+$/g, '');      // Trim - from start/end
}

async function fixTreeSlugs() {
  try {
    console.log('Fetching all trees...');
    const trees = await prisma.tree.findMany({
      select: {
        id: true,
        slug: true,
        rootPersonName: true,
      },
    });

    console.log(`Found ${trees.length} trees`);

    for (const tree of trees) {
      // Check if slug looks bad (has timestamps or other weird patterns)
      const hasBadSlug = /\d{13,}/.test(tree.slug); // 13+ digit numbers (timestamps)
      
      if (hasBadSlug) {
        console.log(`\nFixing bad slug for: ${tree.rootPersonName}`);
        console.log(`  Old slug: ${tree.slug}`);
        
        // Generate new slug
        let newSlug = slugify(tree.rootPersonName);
        let counter = 1;
        
        // Check for uniqueness
        let existingTree = await prisma.tree.findFirst({
          where: {
            slug: newSlug,
            NOT: { id: tree.id },
          },
        });
        
        while (existingTree) {
          newSlug = `${slugify(tree.rootPersonName)}-${counter}`;
          existingTree = await prisma.tree.findFirst({
            where: {
              slug: newSlug,
              NOT: { id: tree.id },
            },
          });
          counter++;
        }
        
        // Update the tree
        await prisma.tree.update({
          where: { id: tree.id },
          data: { slug: newSlug },
        });
        
        console.log(`  New slug: ${newSlug}`);
      }
    }

    console.log('\n✅ Done! All slugs have been fixed.');
  } catch (error) {
    console.error('Error fixing slugs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTreeSlugs();

