import 'dotenv/config'
import { db as prisma } from './src/lib/db.js'
import bcrypt from 'bcryptjs'

async function main() {
  const users = await prisma.user.findMany()
  console.log("Users:", users.map(u => ({ email: u.email, id: u.id, role: u.role })))
  
  const user = await prisma.user.findUnique({ where: { email: 'author1@slnews.local' } })
  if (user) {
    const isValid = await bcrypt.compare('password123', user.password ?? '')
    console.log("author1 password match:", isValid)
  }
}

main()
  .catch(console.error)
