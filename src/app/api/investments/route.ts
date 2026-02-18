import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const holdings = await prisma.cryptoHolding.findMany({
      orderBy: { buyDate: "desc" },
    });
    return NextResponse.json(holdings);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch holdings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { coin, symbol, quantity, entryPrice, buyDate, note } = json;

    const holding = await prisma.cryptoHolding.create({
      data: {
        coin,
        symbol: symbol.toUpperCase(),
        quantity:
          typeof quantity === "string" ? parseFloat(quantity) : quantity,
        entryPrice:
          typeof entryPrice === "string" ? parseFloat(entryPrice) : entryPrice,
        buyDate: new Date(buyDate),
        note,
      },
    });

    return NextResponse.json(holding);
  } catch (error) {
    console.error("Error creating holding:", error);
    return NextResponse.json(
      { error: "Failed to create holding" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const json = await request.json();
    const { id, coin, symbol, quantity, entryPrice, buyDate, note } = json;

    const holding = await prisma.cryptoHolding.update({
      where: { id },
      data: {
        coin,
        symbol: symbol.toUpperCase(),
        quantity:
          typeof quantity === "string" ? parseFloat(quantity) : quantity,
        entryPrice:
          typeof entryPrice === "string" ? parseFloat(entryPrice) : entryPrice,
        buyDate: new Date(buyDate),
        note,
      },
    });

    return NextResponse.json(holding);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update holding" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.cryptoHolding.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete holding" },
      { status: 500 }
    );
  }
}
