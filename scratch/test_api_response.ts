import { GET } from "../app/api/homepage-promotions/route";
import { NextRequest } from "next/server";

async function main() {
  console.log("=== TESTING HOMEPAGE PROMOTIONS API RESPONSE ===");
  const req = new NextRequest("http://localhost:3000/api/homepage-promotions");
  const res = await GET(req);
  const data = await res.json();

  console.log("Keys in 'consulted' promotions response:", Object.keys(data.consulted));
  console.log("consultedCategoryIds:", data.consultedCategoryIds);

  const matched = Object.keys(data.consulted).filter(key => data.consultedCategoryIds.includes(key));
  console.log("Number of keys matching configured category UUIDs:", matched.length);
  if (matched.length > 0) {
    console.log("Matched category IDs:", matched);
  } else {
    console.log("WARNING: No matching keys found!");
  }
}

main().catch(console.error);
