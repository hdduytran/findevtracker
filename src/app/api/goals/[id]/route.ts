import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, targetAmount, currentAmount } = body;

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        name,
        targetAmount,
        currentAmount,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Failed to update goal", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}
