import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lawFirms = await prisma.lawFirm.findMany({
      where: {
        aktywna: true,
        uzytkownikTestowy: false,
        user: { deletedAt: null },
      },
      select: {
        id: true,
        slug: true,
        nazwa: true,
        logo: true,
        user: {
          select: {
            image: true,
            miasto: true,
          },
        },
        mainCategory: { select: { nazwa: true } },
        // Karta pokazuje tylko jedną kategorię (fallback, gdy brak głównej).
        categories: {
          orderBy: { kolejnosc: "asc" },
          take: 1,
          select: { category: { select: { nazwa: true } } },
        },
      },
    });

    // Shuffle in memory to ensure randomness
    const shuffled = [...lawFirms].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 25);

    return NextResponse.json(selected, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching random experts:", error);
    return NextResponse.json(
      { error: "Failed to fetch random experts" },
      { status: 500 },
    );
  }
}
