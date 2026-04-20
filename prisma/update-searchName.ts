// prisma/update-searchName.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany()
  
  let updated = 0
  for (const product of products) {
    await prisma.product.update({
      where: { article: product.article },
      data: { searchName: product.name.toLowerCase() }
    })
    updated++
  }
  
  console.log(`Обновлено товаров: ${updated}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())