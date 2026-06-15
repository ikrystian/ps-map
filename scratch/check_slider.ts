import { prisma } from "../lib/prisma";

async function main() {
  console.log("=== CHECKING SLIDER CONDITIONS ===");

  // 1. Get categories settings
  const categoriesSetting = await prisma.settings.findUnique({
    where: { key: "homepageConsultedCategories" },
  });
  console.log("homepageConsultedCategories setting in DB:", categoriesSetting);
  let homepageConsultedCategoryIds: string[] = [];
  if (categoriesSetting?.value) {
    try {
      homepageConsultedCategoryIds = JSON.parse(categoriesSetting.value);
      console.log("Parsed category IDs:", homepageConsultedCategoryIds);
    } catch (e) {
      console.error("Failed to parse homepageConsultedCategories value:", e);
    }
  }

  // 2. Fetch active categories
  const categories = await prisma.category.findMany({
    where: { aktywna: true },
  });
  console.log(`Active categories count in DB: ${categories.length}`);
  categories.forEach(c => {
    console.log(`- [${c.id}] ${c.nazwa} (slug: ${c.slug})`);
  });

  // 3. Determine tabs before filter
  let tabs = categories.filter(c => homepageConsultedCategoryIds.includes(c.id));
  console.log(`Tabs filtered by settings count: ${tabs.length}`);
  if (tabs.length === 0) {
    tabs = categories.slice(0, 6);
    console.log("Fallback to first 6 active categories used:", tabs.map(t => t.nazwa));
  } else {
    console.log("Tabs to check:", tabs.map(t => t.nazwa));
  }

  // 4. Fetch homepage promotions (consulted data)
  const now = new Date();
  const consultedPromotions = await prisma.promotion.findMany({
    where: {
      typPromocji: "NAJCZESCIEJ_KONSULTOWANE",
      aktywna: true,
      startPromocji: {
        lte: now,
      },
      koniecPromocji: {
        gte: now,
      },
    },
    include: {
      lawFirm: {
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  console.log(`Active NAJCZESCIEJ_KONSULTOWANE promotions count: ${consultedPromotions.length}`);
  const consultedByCat: Record<string, any[]> = {};
  consultedPromotions.forEach((p) => {
    const cat = p.kategoriaPromocji || "";
    if (cat) {
      if (!consultedByCat[cat]) {
        consultedByCat[cat] = [];
      }
      if (!consultedByCat[cat].some((f) => f.id === p.lawFirm.id)) {
        consultedByCat[cat].push(p.lawFirm);
      }
    }
  });
  console.log("Promotions grouped by category ID:", Object.keys(consultedByCat).reduce((acc, catId) => {
    acc[catId] = consultedByCat[catId].map(f => f.nazwa);
    return acc;
  }, {} as Record<string, string[]>));

  // 5. Fetch verified law firms
  // Mocking the query from /api/law-firms?limit=15&verifiedOnly=true
  // Note: on homepage we fetch verification and holiday settings
  const lawFirms = await prisma.lawFirm.findMany({
    where: {
      aktywna: true,
      NOT: {
        user: { notificationSettings: { urlop: true } },
      },
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
    // We fetch limit=15, but since verifiedOnly=true sorting prioritizes verified ones
    // Wait, the API GET fetches `take: limit * 2` (30) then sorts by score and slices to `limit` (15).
    // Let's get them and calculate their score to see which 15 make it to the client.
  });

  console.log(`Total active, not-on-vacation law firms: ${lawFirms.length}`);

  // Let's compute average rating and score for sorting
  const lawFirmsWithScore = await Promise.all(
    lawFirms.map(async (firm: any) => {
      // get reviews
      const reviews = await prisma.review.findMany({
        where: {
          lawFirmId: firm.id,
          aktywna: true,
          zweryfikowana: true,
        }
      });
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.ocenaOgolna, 0) / reviews.length
        : 0;

      // Base score
      const baseScore = firm.zweryfikowana ? 1000 : 0;
      const viewScore = firm.wyswietleniaProfilu * 0.1;
      const ratingScore = avgRating * 50;
      // We don't worry about boost for now since we just want to see if any firm matches the categories.
      // Wait, let's keep it simple: the homepage gets 15 firms.
      const finalScore = baseScore + viewScore + ratingScore;

      return {
        ...firm,
        avgRating,
        _score: finalScore,
      };
    })
  );

  // Sort by score descending
  const sorted = lawFirmsWithScore.sort((a, b) => b._score - a._score);
  const top15 = sorted.slice(0, 15);
  console.log("Top 15 law firms sent to homepage:", top15.map(f => `${f.nazwa} (Verified: ${f.zweryfikowana}, Score: ${f._score})`));

  // 6. Evaluate activeTabs
  console.log("\nEvaluating tabs criteria:");
  const activeTabs = tabs.filter((tab) => {
    const hasPromotions = consultedByCat[tab.id] && consultedByCat[tab.id].length > 0;
    const hasFirms = top15.some(firm => firm.categories?.some((c: any) => c.category?.id === tab.id));
    console.log(`Category "${tab.nazwa}" [id: ${tab.id}]:`);
    console.log(`  - Has active promotions in DB: ${hasPromotions}`);
    if (hasPromotions) console.log(`    Promoted firms:`, consultedByCat[tab.id].map(f => f.nazwa));
    console.log(`  - Has firms in homepage top 15: ${hasFirms}`);
    if (hasFirms) {
      const matching = top15.filter(firm => firm.categories?.some((c: any) => c.category?.id === tab.id));
      console.log(`    Matching firms:`, matching.map(f => f.nazwa));
    }
    return hasPromotions || hasFirms;
  });

  console.log(`\nActive tabs count: ${activeTabs.length}`);
  if (activeTabs.length === 0) {
    console.log("RESULT: activeTabs.length is 0 -> Slider returns null and is HIDDEN.");
  } else {
    console.log("RESULT: activeTabs.length > 0 -> Slider should render tabs:", activeTabs.map(t => t.nazwa));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
