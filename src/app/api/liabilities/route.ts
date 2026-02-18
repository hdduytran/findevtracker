import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const liabilities = await prisma.liability.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(liabilities);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      totalAmount,
      monthlyDue,
      dueDay,
      startDate, // passed from frontend as key, but usually we just track creation or endDate
      endDate,
      type,
      interestRate,
      description,
      statementDay,
      limit, // for credit card as totalAmount
    } = body;

    // Logic for CREDIT_CARD: create an Account + Liability linked
    if (type === "CREDIT_CARD") {
      // 1. Create the Account first
      const account = await prisma.account.create({
        data: {
          name,
          type: "CREDIT",
          balance: 0, // starts at 0 debt (or negative if we consider limit? typically 0 usage)
          icon: "credit-card",
          color: "#EF4444",
        },
      });

      // 2. Create the Liability linked to Account
      const liability = await prisma.liability.create({
        data: {
          name,
          totalAmount: parseFloat(limit || 0), // Credit limit
          monthlyDue: parseFloat(monthlyDue || 0), // Min payment usually
          dueDay: parseInt(dueDay),
          statementDay: parseInt(statementDay),
          type: "CREDIT_CARD",
          description,
          linkedAccountId: account.id,
          currentDebt: 0,
        },
      });

      // 3. Link Account back to Liability
      await prisma.account.update({
        where: { id: account.id },
        data: { liabilityId: liability.id },
      });

      return NextResponse.json(liability, { status: 201 });
    }

    // Logic for INSTALLMENT / LOAN
    const liability = await prisma.liability.create({
      data: {
        name,
        totalAmount: parseFloat(totalAmount),
        paidAmount: 0,
        monthlyDue: parseFloat(monthlyDue),
        dueDay: parseInt(dueDay),
        endDate: endDate ? new Date(endDate) : undefined,
        type: type || "INSTALLMENT",
        interestRate: parseFloat(interestRate || 0),
        description,
      },
    });

    return NextResponse.json(liability, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create liability" },
      { status: 500 }
    );
  }
}
