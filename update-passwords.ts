import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { db as prisma } from './src/lib/db.js'

async function main() {
  const defaultPassword = await bcrypt.hash('password123', 10);

  await prisma.user.updateMany({
    where: {
      email: {
        in: ['author1@slnews.local', 'editorial@slnews.local']
      }
    },
    data: {
      password: defaultPassword
    }
  });

  console.log("Passwords updated successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
