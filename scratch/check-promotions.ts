import { prisma } from "../lib/prisma"

async function main() {
  const promotions = await prisma.promotion.findMany({
    include: {
      lawFirm: true
    }
  })
  console.log("ALL PROMOTIONS IN DATABASE:")
  console.log(JSON.stringify(promotions, null, 2))
}

main()
