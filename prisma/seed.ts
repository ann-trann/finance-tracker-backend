import { PrismaClient, Prisma } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {

  /*
  =================
  USER
  =================
  */

  const password = await bcrypt.hash("123456", 10)

  const user = await prisma.user.upsert({
    where: { email: "demo@gmail.com" },
    update: {},
    create: {
      email: "demo@gmail.com",
      password
    }
  })

  console.log("User created:", user.email)

/*
=================
WALLETS
=================
*/

  const cashWallet = await prisma.wallet.upsert({
    where: { id: "wallet-cash" },
    update: {},
    create: {
      id: "wallet-cash",
      name: "Cash",
      balance: new Prisma.Decimal(500),
      userId: user.id
    }
  })

  const bankWallet = await prisma.wallet.upsert({
    where: { id: "wallet-bank" },
    update: {},
    create: {
      id: "wallet-bank",
      name: "Bank",
      balance: new Prisma.Decimal(2000),
      userId: user.id
    }
  })

console.log("Wallets created:", cashWallet.name, bankWallet.name)

  /*
  =================
  CATEGORY HELPERS
  =================
  */

  const createParent = async (name: string, type: "expense" | "income") => {
    return prisma.category.create({
      data: {
        name,
        type,
        isDefault: true
      }
    })
  }

  const createChild = async (
    name: string,
    type: "expense" | "income",
    parentId: string
  ) => {
    return prisma.category.create({
      data: {
        name,
        type,
        isDefault: true,
        parentId
      }
    })
  }

  /*
  =================
  EXPENSE
  =================
  */

  const food = await createParent("Ăn uống", "expense")

  await createParent("Bảo hiểm", "expense")
  await createParent("Chi phí khác", "expense")
  await createParent("Đầu tư", "expense")

  const transport = await createParent("Di chuyển", "expense")
  await createChild("Bảo dưỡng xe", "expense", transport.id)

  const family = await createParent("Gia đình", "expense")
  await createChild("Dịch vụ gia đình", "expense", family.id)
  await createChild("Sửa & trang trí nhà", "expense", family.id)
  await createChild("Vật nuôi", "expense", family.id)

  const entertainment = await createParent("Giải trí", "expense")
  await createChild("Dịch vụ trực tuyến", "expense", entertainment.id)
  await createChild("Vui - chơi", "expense", entertainment.id)

  await createParent("Giáo dục", "expense")

  const bills = await createParent("Hóa đơn & Tiện ích", "expense")
  await createChild("Hóa đơn điện", "expense", bills.id)
  await createChild("Hóa đơn điện thoại", "expense", bills.id)
  await createChild("Hóa đơn gas", "expense", bills.id)
  await createChild("Hóa đơn internet", "expense", bills.id)
  await createChild("Hóa đơn nước", "expense", bills.id)
  await createChild("Hóa đơn tiện ích khác", "expense", bills.id)
  await createChild("Hóa đơn TV", "expense", bills.id)
  await createChild("Thuê nhà", "expense", bills.id)

  const shopping = await createParent("Mua sắm", "expense")
  await createChild("Đồ dùng cá nhân", "expense", shopping.id)
  await createChild("Đồ gia dụng", "expense", shopping.id)
  await createChild("Làm đẹp", "expense", shopping.id)

  await createParent("Quà tặng & quyên góp", "expense")

  const health = await createParent("Sức khỏe", "expense")
  await createChild("Khám sức khỏe", "expense", health.id)
  await createChild("Thể dục thể thao", "expense", health.id)

  await createParent("Tiền chuyển đi", "expense")
  await createParent("Trả lãi", "expense")

  /*
  =================
  INCOME
  =================
  */

  await prisma.category.createMany({
    data: [
      { name: "Lương", type: "income", isDefault: true },
      { name: "Thu lãi", type: "income", isDefault: true },
      { name: "Thu nhập khác", type: "income", isDefault: true },
      { name: "Tiền chuyển đến", type: "income", isDefault: true }
    ]
  })

  /*
  =================
  DEBT / LOAN
  =================
  */

  await prisma.category.createMany({
    data: [
      { name: "Cho vay", type: "expense", isDefault: true },
      { name: "Đi vay", type: "income", isDefault: true },
      { name: "Thu nợ", type: "income", isDefault: true },
      { name: "Trả nợ", type: "expense", isDefault: true }
    ]
  })

  console.log("Categories seeded")

  /*
  =================
  GET CATEGORY MAP
  =================
  */

  const categories = await prisma.category.findMany()

  const getCategory = (name: string) => {
    const cat = categories.find((c) => c.name === name)
    if (!cat) throw new Error(`Category not found: ${name}`)
    return cat.id
  }

  /*
  =================
  TRANSACTIONS
  =================
  */

  await prisma.transaction.createMany({
    data: [

      // ===== JANUARY =====

      {
        amount: 25,
        type: "expense",
        description: "Ăn trưa",
        date: new Date("2026-01-03"),
        userId: user.id,
        walletId: cashWallet.id,
        categoryId: getCategory("Ăn uống")
      },
      {
        amount: 5,
        type: "expense",
        description: "Cafe sáng",
        date: new Date("2026-01-04"),
        userId: user.id,
        walletId: cashWallet.id,
        categoryId: getCategory("Ăn uống")
      },
      {
        amount: 40,
        type: "expense",
        description: "Mua đồ gia dụng",
        date: new Date("2026-01-06"),
        userId: user.id,
        walletId: cashWallet.id,
        categoryId: getCategory("Đồ gia dụng")
      },
      {
        amount: 120,
        type: "expense",
        description: "Thuê nhà tháng 1",
        date: new Date("2026-01-01"),
        userId: user.id,
        walletId: bankWallet.id,
        categoryId: getCategory("Thuê nhà")
      },

      {
        amount: 2000,
        type: "income",
        description: "Lương tháng 1",
        date: new Date("2026-01-01"),
        userId: user.id,
        walletId: bankWallet.id,
        categoryId: getCategory("Lương")
      },
      {
        amount: 300,
        type: "income",
        description: "Freelance",
        date: new Date("2026-01-15"),
        userId: user.id,
        walletId: bankWallet.id,
        categoryId: getCategory("Thu nhập khác")
      },

      // ===== FEBRUARY =====

      {
        amount: 30,
        type: "expense",
        description: "Ăn tối",
        date: new Date("2026-02-02"),
        userId: user.id,
        walletId: cashWallet.id,
        categoryId: getCategory("Ăn uống")
      },
      {
        amount: 50,
        type: "expense",
        description: "Mỹ phẩm",
        date: new Date("2026-02-05"),
        userId: user.id,
        walletId: cashWallet.id,
        categoryId: getCategory("Làm đẹp")
      },

      {
        amount: 2000,
        type: "income",
        description: "Lương tháng 2",
        date: new Date("2026-02-01"),
        userId: user.id,
        walletId: bankWallet.id,
        categoryId: getCategory("Lương")
      },
      {
        amount: 200,
        type: "income",
        description: "Thu lãi đầu tư",
        date: new Date("2026-02-15"),
        userId: user.id,
        walletId: bankWallet.id,
        categoryId: getCategory("Thu lãi")
      }

    ]
  })

  console.log("Transactions seeded")

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