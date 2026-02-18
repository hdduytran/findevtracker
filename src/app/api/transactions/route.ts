import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = parseInt(searchParams.get("skip") || "0");
  const period = searchParams.get("period") || "all";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let where: any = {};

  // Date filtering logic matching lib/period.ts
  if (period !== "all") {
    const now = new Date();
    let startDate;

    if (period === "custom" && from && to) {
      where.date = {
        gte: new Date(from),
        lte: new Date(to),
      };
    } else {
      if (period === "day") {
        startDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (period === "week") {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
      } else if (period === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      if (startDate) {
        where.date = { gte: startDate };
      }
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true, account: true },
    orderBy: { date: "desc" },
    take: limit,
    skip: skip,
  });

  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let {
      amount,
      type,
      accountId,
      categoryId,
      note,
      toAccountId,
      liabilityId,
    } = body;

    // Handle missing category for TRANSFER (e.g. Credit Card payment)
    if (type === "TRANSFER" && !categoryId) {
      const defaultCat = await prisma.category.findFirst({
        where: { type: "TRANSFER" },
      });
      if (defaultCat) {
        categoryId = defaultCat.id;
      } else {
        // Fallback to any category to satisfy schema
        const anyCat = await prisma.category.findFirst();
        if (anyCat) categoryId = anyCat.id;
      }
    }

    if (!amount || !type || !accountId || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        accountId,
        categoryId,
        note: note || null,
        toAccountId: toAccountId || null,
        liabilityId: liabilityId || null,
      },
    });

    const amountFloat = parseFloat(amount);

    // Update account balances and related logic
    if (type === "INCOME") {
      // 1. Increment account balance
      const account = await prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: amountFloat } },
      });

      // 2. If it's a CREDIT account (refund), decrement the debt
      if (account.type === "CREDIT" && account.liabilityId) {
        await prisma.liability.update({
          where: { id: account.liabilityId },
          data: { currentDebt: { decrement: amountFloat } },
        });
      }
    } else if (type === "EXPENSE") {
      // 1. Decrement account balance
      const account = await prisma.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amountFloat } },
      });

      // 2. If it's a CREDIT account (spending), increment the debt
      if (account.type === "CREDIT" && account.liabilityId) {
        await prisma.liability.update({
          where: { id: account.liabilityId },
          data: { currentDebt: { increment: amountFloat } },
        });
      }

      // 3. If linked to a specific Liability (e.g. Installment payment), increment paidAmount
      if (body.liabilityId) {
        const liability = await prisma.liability.findUnique({
          where: { id: body.liabilityId },
        });
        if (liability && liability.type === "INSTALLMENT") {
          await prisma.liability.update({
            where: { id: body.liabilityId },
            data: { paidAmount: { increment: amountFloat } },
          });
        }
      }
    } else if (type === "TRANSFER" && toAccountId) {
      // 1. Decrement source
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amountFloat } },
      });

      // 2. Increment destination
      const targetAcc = await prisma.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: amountFloat } },
      });

      // 3. If transfer TO a CREDIT account (paying off debt), decrement the debt
      if (targetAcc.type === "CREDIT" && targetAcc.liabilityId) {
        await prisma.liability.update({
          where: { id: targetAcc.liabilityId },
          data: { currentDebt: { decrement: amountFloat } },
        });
      }

      // 4. If transfer to INVESTMENT/CRYPTO account, update linked Goal if exists
      if (targetAcc.type === "INVESTMENT" || targetAcc.type === "CRYPTO") {
        const goal = await prisma.goal.findFirst({
          where: { linkedAccountId: toAccountId },
        });
        if (goal) {
          await prisma.goal.update({
            where: { id: goal.id },
            data: { currentAmount: { increment: amountFloat } },
          });
        }
      }
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Transaction creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
