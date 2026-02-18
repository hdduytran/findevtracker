import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import path from "path";

const dbPath = path.resolve(__dirname, "../dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear
  await prisma.transaction.deleteMany();
  await prisma.cryptoHolding.deleteMany();
  await prisma.account.deleteMany();
  await prisma.category.deleteMany();
  await prisma.liability.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.goal.deleteMany();

  // === ACCOUNTS ===
  const salary = await prisma.account.create({
    data: {
      name: "Tài khoản Lương",
      type: "BANK",
      balance: 45000000,
      icon: "building-2",
      color: "#3B82F6",
    },
  });
  const momo = await prisma.account.create({
    data: {
      name: "Ví Momo",
      type: "CASH",
      balance: 2500000,
      icon: "smartphone",
      color: "#EC4899",
    },
  });
  const savings = await prisma.account.create({
    data: {
      name: "Tiết kiệm",
      type: "BANK",
      balance: 80000000,
      icon: "piggy-bank",
      color: "#10B981",
    },
  });
  const binance = await prisma.account.create({
    data: {
      name: "Binance",
      type: "CRYPTO",
      balance: 35000000,
      icon: "bitcoin",
      color: "#F59E0B",
    },
  });
  const creditCard = await prisma.account.create({
    data: {
      name: "Thẻ tín dụng VPBank",
      type: "CREDIT",
      balance: -8500000,
      icon: "credit-card",
      color: "#EF4444",
    },
  });
  const investAccount = await prisma.account.create({
    data: {
      name: "Quỹ đầu tư cổ phiếu",
      type: "INVESTMENT",
      balance: 15000000,
      icon: "trending-up",
      color: "#8B5CF6",
    },
  });

  // === LIABILITIES ===
  const iphoneInstallment = await prisma.liability.create({
    data: {
      name: "iPhone 15 trả góp",
      totalAmount: 30000000,
      paidAmount: 15000000,
      monthlyDue: 2500000,
      dueDay: 15,
      type: "INSTALLMENT",
      endDate: new Date("2026-06-15"),
      interestRate: 0,
      description: "Trả góp 12 tháng qua Kredivo, lãi suất 0%",
    },
  });

  const vpbankLiability = await prisma.liability.create({
    data: {
      name: "Thẻ tín dụng VPBank",
      totalAmount: 50000000,
      paidAmount: 0,
      monthlyDue: 8500000,
      dueDay: 25,
      type: "CREDIT_CARD",
      statementDay: 5,
      currentDebt: 8500000,
      linkedAccountId: creditCard.id,
      description: "Hạn mức 50 triệu. Sao kê ngày 5, thanh toán ngày 25.",
    },
  });

  await prisma.liability.create({
    data: {
      name: "DigitalOcean Server",
      totalAmount: 0,
      paidAmount: 0,
      monthlyDue: 350000,
      dueDay: 1,
      type: "SUBSCRIPTION",
      description: "VPS hosting cho side project",
    },
  });

  await prisma.liability.create({
    data: {
      name: "Netflix Premium",
      totalAmount: 0,
      paidAmount: 0,
      monthlyDue: 260000,
      dueDay: 10,
      type: "SUBSCRIPTION",
      description: "Gói Premium 4K",
    },
  });

  // Link credit card account to liability
  await prisma.account.update({
    where: { id: creditCard.id },
    data: { liabilityId: vpbankLiability.id },
  });

  // === CATEGORIES ===
  const catSalary = await prisma.category.create({
    data: {
      name: "Lương",
      type: "INCOME",
      group: "SALARY",
      icon: "banknote",
      color: "#10B981",
    },
  });
  const catFreelance = await prisma.category.create({
    data: {
      name: "Freelance",
      type: "INCOME",
      group: "BUSINESS",
      icon: "laptop",
      color: "#3B82F6",
    },
  });
  const catApiSales = await prisma.category.create({
    data: {
      name: "Bán API/Phần mềm",
      type: "INCOME",
      group: "BUSINESS",
      icon: "code",
      color: "#8B5CF6",
    },
  });
  const catFood = await prisma.category.create({
    data: {
      name: "Ăn uống",
      type: "EXPENSE",
      group: "DAILY_FUEL",
      icon: "utensils",
      color: "#F59E0B",
    },
  });
  const catCoffee = await prisma.category.create({
    data: {
      name: "Cà phê",
      type: "EXPENSE",
      group: "DAILY_FUEL",
      icon: "coffee",
      color: "#92400E",
    },
  });
  const catTransport = await prisma.category.create({
    data: {
      name: "Di chuyển",
      type: "EXPENSE",
      group: "DAILY_FUEL",
      icon: "car",
      color: "#06B6D4",
    },
  });
  const catShopping = await prisma.category.create({
    data: {
      name: "Mua sắm",
      type: "EXPENSE",
      group: "OPEX",
      icon: "shopping-bag",
      color: "#EC4899",
    },
  });
  const catBills = await prisma.category.create({
    data: {
      name: "Hóa đơn",
      type: "EXPENSE",
      group: "OPEX",
      icon: "file-text",
      color: "#EF4444",
    },
  });
  const catEntertainment = await prisma.category.create({
    data: {
      name: "Giải trí",
      type: "EXPENSE",
      group: "LIFESTYLE",
      icon: "gamepad-2",
      color: "#A855F7",
    },
  });
  const catHealth = await prisma.category.create({
    data: {
      name: "Sức khỏe",
      type: "EXPENSE",
      group: "LIFESTYLE",
      icon: "heart-pulse",
      color: "#F43F5E",
    },
  });
  const catSub = await prisma.category.create({
    data: {
      name: "Đăng ký dịch vụ",
      type: "EXPENSE",
      group: "OPEX",
      icon: "repeat",
      color: "#6366F1",
    },
  });
  const catTransfer = await prisma.category.create({
    data: {
      name: "Chuyển khoản",
      type: "TRANSFER",
      icon: "arrow-right-left",
      color: "#14B8A6",
    },
  });
  const catInvestTransfer = await prisma.category.create({
    data: {
      name: "Nạp quỹ đầu tư",
      type: "TRANSFER",
      group: "INVESTMENT",
      icon: "trending-up",
      color: "#8B5CF6",
    },
  });

  // === TRANSACTIONS ===
  const today = new Date();
  const d = (daysAgo: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return date;
  };

  // Income
  await prisma.transaction.create({
    data: {
      amount: 20000000,
      date: d(1),
      note: "Lương tháng 2",
      type: "INCOME",
      accountId: salary.id,
      categoryId: catSalary.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 12000000,
      date: d(3),
      note: "Freelance mobile app",
      type: "INCOME",
      accountId: salary.id,
      categoryId: catFreelance.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 8500000,
      date: d(5),
      note: "Bán API tháng 2",
      type: "INCOME",
      accountId: salary.id,
      categoryId: catApiSales.id,
    },
  });

  // Expenses — regular accounts
  await prisma.transaction.create({
    data: {
      amount: 85000,
      date: d(0),
      note: "Cơm trưa + nước",
      type: "EXPENSE",
      accountId: momo.id,
      categoryId: catFood.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 55000,
      date: d(0),
      note: "Highlands Coffee",
      type: "EXPENSE",
      accountId: momo.id,
      categoryId: catCoffee.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 120000,
      date: d(1),
      note: "Grab đi khách hàng",
      type: "EXPENSE",
      accountId: momo.id,
      categoryId: catTransport.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 65000,
      date: d(1),
      note: "Bún bò + trà đá",
      type: "EXPENSE",
      accountId: momo.id,
      categoryId: catFood.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 45000,
      date: d(2),
      note: "The Coffee House",
      type: "EXPENSE",
      accountId: momo.id,
      categoryId: catCoffee.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 75000,
      date: d(2),
      note: "Phở + gỏi cuốn",
      type: "EXPENSE",
      accountId: momo.id,
      categoryId: catFood.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 350000,
      date: d(3),
      note: "DigitalOcean tháng 2",
      type: "EXPENSE",
      accountId: salary.id,
      categoryId: catSub.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 260000,
      date: d(5),
      note: "Netflix Premium",
      type: "EXPENSE",
      accountId: salary.id,
      categoryId: catSub.id,
    },
  });

  // Credit card expenses (increases debt)
  await prisma.transaction.create({
    data: {
      amount: 2500000,
      date: d(2),
      note: "AirPods Pro case",
      type: "EXPENSE",
      accountId: creditCard.id,
      categoryId: catShopping.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 890000,
      date: d(4),
      note: "Khám tổng quát",
      type: "EXPENSE",
      accountId: creditCard.id,
      categoryId: catHealth.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 450000,
      date: d(6),
      note: "Cinema + dinner",
      type: "EXPENSE",
      accountId: creditCard.id,
      categoryId: catEntertainment.id,
    },
  });

  // Transfers
  await prisma.transaction.create({
    data: {
      amount: 10000000,
      date: d(1),
      note: "Gửi tiết kiệm",
      type: "TRANSFER",
      accountId: salary.id,
      categoryId: catTransfer.id,
      toAccountId: savings.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 5000000,
      date: d(3),
      note: "Nạp Momo",
      type: "TRANSFER",
      accountId: salary.id,
      categoryId: catTransfer.id,
      toAccountId: momo.id,
    },
  });

  // Transfer to investment
  await prisma.transaction.create({
    data: {
      amount: 5000000,
      date: d(2),
      note: "Nạp quỹ cổ phiếu T2",
      type: "TRANSFER",
      accountId: salary.id,
      categoryId: catInvestTransfer.id,
      toAccountId: investAccount.id,
    },
  });

  // Installment payment
  await prisma.transaction.create({
    data: {
      amount: 2500000,
      date: d(3),
      note: "Trả góp iPhone 15 - Kỳ 7",
      type: "EXPENSE",
      accountId: salary.id,
      categoryId: catBills.id,
      liabilityId: iphoneInstallment.id,
    },
  });

  // Older transactions for chart variety
  await prisma.transaction.create({
    data: {
      amount: 20000000,
      date: d(32),
      note: "Lương tháng 1",
      type: "INCOME",
      accountId: salary.id,
      categoryId: catSalary.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 5000000,
      date: d(35),
      note: "Freelance web",
      type: "INCOME",
      accountId: salary.id,
      categoryId: catFreelance.id,
    },
  });
  await prisma.transaction.create({
    data: {
      amount: 1200000,
      date: d(30),
      note: "Mua quần áo",
      type: "EXPENSE",
      accountId: momo.id,
      categoryId: catShopping.id,
    },
  });

  // === ACHIEVEMENTS ===
  await prisma.achievement.createMany({
    data: [
      {
        title: "Tiền mặt là vua",
        description: "Tổng tiền mặt > 100 triệu VND",
        conditionKey: "cash_king",
        icon: "crown",
        isUnlocked: true,
        unlockedAt: d(10),
      },
      {
        title: "Nghiện cà phê",
        description: "Chi tiêu cà phê > 500k/tháng",
        conditionKey: "coffee_addict",
        icon: "coffee",
        isUnlocked: true,
        unlockedAt: d(5),
      },
      {
        title: "Chiến binh nợ",
        description: "Trả hết 1 khoản trả góp",
        conditionKey: "debt_warrior",
        icon: "sword",
        isUnlocked: false,
      },
      {
        title: "Streak 7 ngày",
        description: "Ghi chép 7 ngày liên tục",
        conditionKey: "streak_7",
        icon: "flame",
        isUnlocked: true,
        unlockedAt: d(3),
      },
      {
        title: "Nhà đầu tư F0",
        description: "Mua crypto lần đầu",
        conditionKey: "first_crypto",
        icon: "rocket",
        isUnlocked: true,
        unlockedAt: d(15),
      },
      {
        title: "Lá chắn tài chính",
        description: "Quỹ dự phòng đạt 80%",
        conditionKey: "emergency_fund",
        icon: "shield-check",
        isUnlocked: true,
        unlockedAt: d(8),
      },
      {
        title: "Vô địch tiết kiệm",
        description: "Tiết kiệm > 30% thu nhập 3 tháng liên tục",
        conditionKey: "saving_champion",
        icon: "trophy",
        isUnlocked: false,
      },
      {
        title: "Tốc biến",
        description: "Thu nhập tăng 50% so với tháng trước",
        conditionKey: "income_surge",
        icon: "zap",
        isUnlocked: false,
      },
    ],
  });

  // === GOALS ===
  await prisma.goal.create({
    data: {
      name: "Quỹ dự phòng",
      targetAmount: 100000000,
      currentAmount: 80000000,
      deadline: new Date("2026-06-01"),
      icon: "shield",
    },
  });
  await prisma.goal.create({
    data: {
      name: "Quỹ đầu tư cổ phiếu 2026",
      targetAmount: 50000000,
      currentAmount: 15000000,
      deadline: new Date("2026-12-31"),
      icon: "trending-up",
      linkedAccountId: investAccount.id,
    },
  });

  // === CRYPTO ===
  await prisma.cryptoHolding.create({
    data: {
      coin: "Bitcoin",
      symbol: "BTC",
      quantity: 0.012,
      entryPrice: 2400000000,
      buyDate: d(30),
      note: "DCA tháng 1",
    },
  });
  await prisma.cryptoHolding.create({
    data: {
      coin: "Ethereum",
      symbol: "ETH",
      quantity: 0.5,
      entryPrice: 78000000,
      buyDate: d(15),
      note: "DCA tháng 2",
    },
  });
  await prisma.cryptoHolding.create({
    data: {
      coin: "Solana",
      symbol: "SOL",
      quantity: 10,
      entryPrice: 4800000,
      buyDate: d(7),
      note: "Entry mới",
    },
  });

  console.log("✅ Seed completed!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
