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

const cashInitial = new Prisma.Decimal(500)
const bankInitial = new Prisma.Decimal(2000)

const cashWallet = await prisma.wallet.upsert({
  where: { id: "wallet-cash" },
  update: {},
  create: {
    id: "wallet-cash",
    name: "Tiền mặt",

    initialBalance: cashInitial,
    balance: cashInitial,

    userId: user.id
  }
})

const bankWallet = await prisma.wallet.upsert({
  where: { id: "wallet-bank" },
  update: {},
  create: {
    id: "wallet-bank",
    name: "Ngân hàng",

    initialBalance: bankInitial,
    balance: bankInitial,

    userId: user.id
  }
})

console.log("Wallets created:", cashWallet.name, bankWallet.name)

  /*
  =================
  CATEGORY HELPERS
  =================
  */

  const createParent = (name: string, type: "expense" | "income", icon: string) =>
    prisma.category.create({
      data: { name, type, icon, isDefault: true }
    })

  const createChild = (
    name: string,
    type: "expense" | "income",
    icon: string,
    parentId: string
  ) =>
    prisma.category.create({
      data: { name, type, icon, isDefault: true, parentId }
    })

  /*
  =================
  EXPENSE
  =================
  */

  await createParent("Ăn uống",              "expense", "Utensils")
  await createParent("Bảo hiểm",             "expense", "Shield")
  await createParent("Chi phí khác",         "expense", "MoreHorizontal")
  await createParent("Đầu tư",               "expense", "TrendingUp")

  const transport = await createParent("Di chuyển", "expense", "Car")
  await createChild("Bảo dưỡng xe", "expense", "Wrench", transport.id)

  const family = await createParent("Gia đình", "expense", "Home")
  await createChild("Dịch vụ gia đình",    "expense", "ConciergeBell", family.id)
  await createChild("Sửa & trang trí nhà", "expense", "Hammer",        family.id)
  await createChild("Vật nuôi",            "expense", "PawPrint",      family.id)

  const entertainment = await createParent("Giải trí", "expense", "Gamepad2")
  await createChild("Dịch vụ trực tuyến", "expense", "Tv",       entertainment.id)
  await createChild("Vui - chơi",         "expense", "Laugh",    entertainment.id)

  await createParent("Giáo dục", "expense", "BookOpen")

  const bills = await createParent("Hóa đơn & Tiện ích", "expense", "FileText")
  await createChild("Hóa đơn điện",          "expense", "Zap",        bills.id)
  await createChild("Hóa đơn điện thoại",    "expense", "Phone",      bills.id)
  await createChild("Hóa đơn gas",           "expense", "Flame",      bills.id)
  await createChild("Hóa đơn internet",      "expense", "Wifi",       bills.id)
  await createChild("Hóa đơn nước",          "expense", "Droplets",   bills.id)
  await createChild("Hóa đơn tiện ích khác", "expense", "Receipt",    bills.id)
  await createChild("Hóa đơn TV",            "expense", "Monitor",    bills.id)
  await createChild("Thuê nhà",              "expense", "Building2",  bills.id)

  const shopping = await createParent("Mua sắm", "expense", "ShoppingBag")
  await createChild("Đồ dùng cá nhân", "expense", "Backpack",    shopping.id)
  await createChild("Đồ gia dụng",     "expense", "Sofa",        shopping.id)
  await createChild("Làm đẹp",        "expense", "Sparkles",    shopping.id)

  await createParent("Quà tặng & quyên góp", "expense", "Gift")

  const health = await createParent("Sức khỏe", "expense", "HeartPulse")
  await createChild("Khám sức khỏe",    "expense", "Stethoscope", health.id)
  await createChild("Thể dục thể thao", "expense", "Dumbbell",    health.id)

  await createParent("Tiền chuyển đi", "expense", "ArrowUpRight")
  await createParent("Trả lãi",        "expense", "Percent")

  /*
  =================
  INCOME
  =================
  */

  await prisma.category.createMany({
    data: [
      { name: "Lương",          type: "income", icon: "Wallet",      isDefault: true },
      { name: "Thu lãi",        type: "income", icon: "PiggyBank",   isDefault: true },
      { name: "Thu nhập khác",  type: "income", icon: "CirclePlus",  isDefault: true },
      { name: "Tiền chuyển đến",type: "income", icon: "ArrowDownLeft", isDefault: true }
    ]
  })

  /*
  =================
  DEBT / LOAN
  =================
  */

  await prisma.category.createMany({
    data: [
      { name: "Cho vay", type: "expense", icon: "HandCoins",  isDefault: true },
      { name: "Đi vay",  type: "income",  icon: "Landmark",   isDefault: true },
      { name: "Thu nợ",  type: "income",  icon: "ArrowDownToLine", isDefault: true },
      { name: "Trả nợ",  type: "expense", icon: "ArrowUpToLine",   isDefault: true }
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

    console.log("Transactions seeded")

  /*
  =================
  UPDATE WALLET BALANCE
  =================
  */

  const wallets = await prisma.wallet.findMany({
    include: {
      transactions: true
    }
  })

  for (const wallet of wallets) {

    let balance = Number(wallet.initialBalance)

    for (const t of wallet.transactions) {

      if (t.type === "income") {
        balance += Number(t.amount)
      }

      if (t.type === "expense") {
        balance -= Number(t.amount)
      }

    }

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: new Prisma.Decimal(balance)
      }
    })
  }

  console.log("Wallet balances updated")
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