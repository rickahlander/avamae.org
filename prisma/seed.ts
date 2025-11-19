import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed branch types
  const branchTypes = [
    { name: 'organ_donation', description: 'Organ Donation', isSystem: true },
    { name: 'healed_relationship', description: 'Healed Relationship', isSystem: true },
    { name: 'foundation', description: 'Foundation/Organization', isSystem: true },
    { name: 'charity', description: 'Charity Connection', isSystem: true },
    { name: 'inspired_act', description: 'Inspired Act of Kindness', isSystem: true },
    { name: 'life_touched', description: 'Life Touched/Changed', isSystem: true },
  ];

  for (const type of branchTypes) {
    // Check if already exists
    const existing = await prisma.branchType.findFirst({
      where: { name: type.name },
    });

    if (!existing) {
      await prisma.branchType.create({
        data: type,
      });
      console.log(`✓ Created branch type: ${type.description}`);
    } else {
      console.log(`⊙ Branch type already exists: ${type.description}`);
    }
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

