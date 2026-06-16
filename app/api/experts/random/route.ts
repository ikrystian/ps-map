import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lawFirms = await prisma.lawFirm.findMany({
      where: {
        aktywna: true,
        user: { deletedAt: null },
      },
      select: {
        id: true,
        slug: true,
        nazwa: true,
        nazwaFirmy: true,
        opis: true,
        logo: true,
        zdjecieGlowne: true,
        user: {
          select: {
            imie: true,
            nazwisko: true,
            image: true,
            miasto: true,
            voivodeship: { select: { nazwa: true } },
          },
        },
        mainCategory: { select: { nazwa: true } },
        categories: {
          orderBy: { kolejnosc: "asc" },
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
