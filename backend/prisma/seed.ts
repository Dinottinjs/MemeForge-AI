import { PrismaClient } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  const password_hash = await argon2.hash('root3009!')
  
  const admin = await prisma.users.upsert({
    where: { email: 'admin' },
    update: {},
    create: {
      email: 'admin',
      password_hash,
      plan_type: 'SUPER_ADMIN'
    }
  })
  console.log('Admin account seeded:', admin)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
