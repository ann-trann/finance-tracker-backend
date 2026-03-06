// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// async function main() {
//   await prisma.category.createMany({
//     data: [
//       { name: "Food", type: "expense", isDefault: true },
//       { name: "Transport", type: "expense", isDefault: true },
//       { name: "Shopping", type: "expense", isDefault: true },
//       { name: "Salary", type: "income", isDefault: true }
//     ],
//     skipDuplicates: true
//   })

//   console.log("Seeded categories")
// }

// main()
//   .then(() => prisma.$disconnect())
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {

  // hash password so the user can login normally
  const password = await bcrypt.hash("123456", 10)

  // create sample user
  const user = await prisma.user.upsert({
    where: { email: "demo@gmail.com" },
    update: {},
    create: {
      email: "demo@gmail.com",
      password
    }
  })

  console.log("User created:", user.email)

  // create default categories
  await prisma.category.createMany({
    data: [
      { name: "Food", type: "expense", isDefault: true },
      { name: "Transport", type: "expense", isDefault: true },
      { name: "Shopping", type: "expense", isDefault: true },
      { name: "Salary", type: "income", isDefault: true }
    ],
    skipDuplicates: true
  })

  // create user custom categories
  const customCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Coffee",
        type: "expense",
        userId: user.id
      }
    }),
    prisma.category.create({
      data: {
        name: "Entertainment",
        type: "expense",
        userId: user.id
      }
    }),
    prisma.category.create({
      data: {
        name: "Freelance",
        type: "income",
        userId: user.id
      }
    }),
    prisma.category.create({
      data: {
        name: "Investment",
        type: "income",
        userId: user.id
      }
    })
  ])

  console.log("Custom categories created")

  const categories = await prisma.category.findMany()

  const getCategory = (name: string) =>
    categories.find((c) => c.name === name)?.id as string

  // create 20 sample transactions
  await prisma.transaction.createMany({
    data: [
      { amount: 12, type: "expense", description: "Lunch", date: new Date("2026-01-03"), userId: user.id, categoryId: getCategory("Food") },
      { amount: 5, type: "expense", description: "Coffee", date: new Date("2026-01-05"), userId: user.id, categoryId: getCategory("Coffee") },
      { amount: 40, type: "expense", description: "Groceries", date: new Date("2026-01-06"), userId: user.id, categoryId: getCategory("Food") },
      { amount: 8, type: "expense", description: "Bus ticket", date: new Date("2026-01-07"), userId: user.id, categoryId: getCategory("Transport") },
      { amount: 20, type: "expense", description: "Movie", date: new Date("2026-01-08"), userId: user.id, categoryId: getCategory("Entertainment") },
      { amount: 15, type: "expense", description: "Coffee with friends", date: new Date("2026-01-09"), userId: user.id, categoryId: getCategory("Coffee") },
      { amount: 120, type: "expense", description: "Clothes", date: new Date("2026-01-10"), userId: user.id, categoryId: getCategory("Shopping") },
      { amount: 6, type: "expense", description: "Taxi", date: new Date("2026-01-11"), userId: user.id, categoryId: getCategory("Transport") },
      { amount: 18, type: "expense", description: "Dinner", date: new Date("2026-01-12"), userId: user.id, categoryId: getCategory("Food") },
      { amount: 9, type: "expense", description: "Latte", date: new Date("2026-01-13"), userId: user.id, categoryId: getCategory("Coffee") },

      { amount: 2000, type: "income", description: "Monthly Salary", date: new Date("2026-01-01"), userId: user.id, categoryId: getCategory("Salary") },
      { amount: 500, type: "income", description: "Freelance project", date: new Date("2026-01-04"), userId: user.id, categoryId: getCategory("Freelance") },
      { amount: 200, type: "income", description: "Stock profit", date: new Date("2026-01-06"), userId: user.id, categoryId: getCategory("Investment") },
      { amount: 300, type: "income", description: "Freelance website", date: new Date("2026-01-15"), userId: user.id, categoryId: getCategory("Freelance") },
      { amount: 100, type: "income", description: "Dividends", date: new Date("2026-01-18"), userId: user.id, categoryId: getCategory("Investment") },

      { amount: 14, type: "expense", description: "Lunch", date: new Date("2026-02-02"), userId: user.id, categoryId: getCategory("Food") },
      { amount: 7, type: "expense", description: "Coffee", date: new Date("2026-02-03"), userId: user.id, categoryId: getCategory("Coffee") },
      { amount: 30, type: "expense", description: "Dinner", date: new Date("2026-02-04"), userId: user.id, categoryId: getCategory("Food") },
      { amount: 10, type: "expense", description: "Taxi", date: new Date("2026-02-05"), userId: user.id, categoryId: getCategory("Transport") },
      { amount: 50, type: "expense", description: "Shoes", date: new Date("2026-02-06"), userId: user.id, categoryId: getCategory("Shopping") }
    ]
  })

  console.log("20 transactions seeded")
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log("Seed completed")
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })