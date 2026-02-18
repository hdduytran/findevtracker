import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(accounts);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, balance, icon, color } = body;

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: parseFloat(balance),
        icon,
        color,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, type, balance, icon, color, isActive } = body;

    const account = await prisma.account.update({
      where: { id },
      data: {
        name,
        type,
        balance: balance !== undefined ? parseFloat(balance) : undefined,
        icon,
        color,
        isActive,
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}
