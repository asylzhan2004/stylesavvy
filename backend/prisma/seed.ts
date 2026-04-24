import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('Asylzhan1999', 10);

  await prisma.user.upsert({
    where: { email: 'admin@gravity.com' },
    update: {},
    create: {
      email: 'admin@gravity.com',
      name: 'Gravity Admin',
      password: adminPassword,
      role: 'admin',
    },
  });

  console.log('Seeded 1 admin user.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
