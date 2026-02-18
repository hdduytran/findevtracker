import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    include: { category: true, account: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, type, accountId, categoryId, note, toAccountId } = body;

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
        liabilityId: body.liabilityId || null,
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
