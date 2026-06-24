import { PrismaClient } from '../generated/prisma/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL) });
try {
  const users = await prisma.user.findMany();
  console.log('Users:', users.length, '| Emails:', users.map(u => u.email).join(', '));
} catch (e) {
  console.error('DB Error:', e.message);
} finally {
  await prisma['$disconnect']();
}
