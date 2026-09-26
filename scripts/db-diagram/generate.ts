#!/usr/bin/env bun
/**
 * Generuje interaktywny diagram zależności między tabelami z prisma/schema.prisma.
 *
 *   bun scripts/db-diagram/generate.ts [plik-wyjściowy.html]
 *
 * Domyślnie zapisuje docs/db-diagram.html (jeden samodzielny plik, bez zależności).
 * Parsuje schemat bezpośrednio (klucze obce, onDelete, unikalność, komentarze), układa
 * węzły algorytmem siłowym (deterministycznie) i wkleja dane do template.html.
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join, resolve } from "path";

const ROOT = resolve(import.meta.dir, "../..");
const SCHEMA = join(ROOT, "prisma/schema.prisma");
const TEMPLATE = join(import.meta.dir, "template.html");
const OUT = resolve(process.argv[2] ?? join(ROOT, "docs/db-diagram.html"));

// ---------------------------------------------------------------------------
// Domeny (ręczne przypisanie — nagłówki sekcji w schema.prisma nie zawsze pasują
// do modeli pod nimi). Tabele łączące many-to-many trafiają do domeny słownika.
// Nowy model bez przypisania ląduje w „Inne” i generator o tym ostrzega.
// ---------------------------------------------------------------------------
const DOMAINS: { id: string; name: string; models: string[] }[] = [
  { id: "auth", name: "Konta i logowanie", models: ["User", "Account", "Session", "VerificationToken", "PhoneVerification", "LoginHistory", "AccountDeletion", "RegistrationAuditLog", "CompanyData", "UserBlock", "UserOnlineStatus", "CaseCreationTicket", "CaseOtpVerification"] },
  { id: "profiles", name: "Klienci i kancelarie", models: ["Client", "LawFirm", "FavoriteLawFirm", "AccountManager", "Service", "Certificate", "Document", "Badge", "LawFirmBadge"] },
  { id: "geo", name: "Geografia", models: ["Voivodeship", "County", "City", "PostalCode", "LawFirmVoivodeship", "LawFirmCity", "LawFirmCounty"] },
  { id: "cats", name: "Kategorie i specjalizacje", models: ["Category", "ExpertiseCategory", "CategoryExpertiseCategory", "LawFirmCategory", "CaseCategory", "CaseReferralCategory"] },
  { id: "cases", name: "Sprawy, oferty i opinie", models: ["Case", "CaseReferral", "Offer", "Negotiation", "Review", "ReviewReport"] },
  { id: "chat", name: "Komunikacja", models: ["Message", "Conversation", "ChatMessage", "TypingIndicator", "Notification", "NotificationSettings"] },
  { id: "consult", name: "Konsultacje", models: ["ConsultationAvailability", "ConsultationBooking", "ConsultationRequest", "ConsultationInterest"] },
  { id: "billing", name: "Punkty, płatności i promocje", models: ["Order", "PointTransaction", "SubscriptionPlan", "Invoice", "Promotion", "PromotionConfig", "PromotionStats", "OrderOverride", "PartnerProgram", "PartnerPointsHistory"] },
  { id: "blog", name: "Blog", models: ["BlogCategory", "BlogPost"] },
  { id: "stats", name: "Statystyki kancelarii", models: ["LawFirmStats", "LawFirmWeekdayStats", "LawFirmCategoryStats"] },
  { id: "cms", name: "Treści, pomoc i reklamy", models: ["Page", "Module", "PageModule", "HelpCategory", "HelpQuestion", "HomepageTestimonial", "PartnerLogo", "Newsletter", "ContactForm", "Advertisement", "AdClient"] },
  { id: "survey", name: "Ankiety", models: ["Survey", "SurveyQuestion", "SurveyOption", "SurveyResponse", "SurveyAnswer"] },
  { id: "system", name: "System, e-mail i zadania", models: ["EmailTemplate", "EmailLog", "ScheduledEmail", "Settings", "SystemLog", "ScheduledJob", "ScheduledJobRun", "BugReport"] },
];

// Miękkie referencje: pole *Id wskazujące na inną tabelę, ale BEZ @relation (brak FK w bazie).
// Lista weryfikowana ręcznie (pozostałe pola *Id to identyfikatory zewnętrzne, np. providerAccountId).
const SOFT_REFS: [model: string, field: string, target: string][] = [
  ["AccountDeletion", "requestedByUserId", "User"],
  ["Conversation", "lastMessageSenderId", "User"],
  ["UserBlock", "blockerId", "User"],
  ["UserBlock", "blockedId", "User"],
  ["UserOnlineStatus", "userId", "User"],
  ["TypingIndicator", "userId", "User"],
  ["SystemLog", "userId", "User"],
];

// ---------------------------------------------------------------------------
// Parser schema.prisma
// ---------------------------------------------------------------------------
type Field = {
  name: string; type: string; list: boolean; optional: boolean; id: boolean; unique: boolean;
  def?: string; comment?: string;
  rel?: { name?: string; fields: string[]; references: string[]; onDelete?: string };
};
type Model = { name: string; line: number; doc: string; fields: Field[]; uniques: string[][]; indexes: string[][] };

const lines = readFileSync(SCHEMA, "utf8").split("\n");
const modelNames = new Set<string>();
for (const l of lines) { const m = l.match(/^model (\w+)/); if (m) modelNames.add(m[1]); }

const models: Model[] = [];
const enums: Record<string, string[]> = {};
for (let i = 0; i < lines.length; i++) {
  const em = lines[i].match(/^enum (\w+) \{/);
  if (em) {
    const vals: string[] = [];
    for (i++; !/^\}/.test(lines[i]); i++) {
      const t = lines[i].trim();
      const v = t.match(/^(\w+)/);
      if (v && !t.startsWith("//")) vals.push(v[1]);
    }
    enums[em[1]] = vals;
    continue;
  }
  const mm = lines[i].match(/^model (\w+) \{/);
  if (!mm) continue;

  const doc: string[] = [];
  for (let j = i - 1; j >= 0 && /^\/\/\/?/.test(lines[j]) && !/={5}/.test(lines[j]); j--) doc.unshift(lines[j].replace(/^\/\/\/?\s*/, ""));
  const model: Model = { name: mm[1], line: i + 1, doc: doc.join(" ").trim(), fields: [], uniques: [], indexes: [] };

  for (i++; !/^\}/.test(lines[i]); i++) {
    const raw = lines[i];
    const comment = raw.match(/\/\/\s*(.*)$/)?.[1].trim();
    const l = raw.replace(/\/\/.*$/, "").trim();
    if (!l) continue;
    let m: RegExpMatchArray | null;
    if ((m = l.match(/^@@unique\(\[([^\]]+)\]/))) { model.uniques.push(m[1].split(",").map((s) => s.trim())); continue; }
    if ((m = l.match(/^@@index\(\[([^\]]+)\]/))) { model.indexes.push(m[1].split(",").map((s) => s.trim())); continue; }
    if (l.startsWith("@@")) continue;

    const fm = l.match(/^(\w+)\s+(\w+)(\[\])?(\?)?\s*(.*)$/);
    if (!fm) continue;
    const [, name, type, list, opt, rest] = fm;
    const f: Field = { name, type, list: !!list, optional: !!opt, id: /@id\b/.test(rest), unique: /@unique\b/.test(rest), comment: comment || undefined };
    const d = rest.match(/@default\(((?:[^()]|\([^()]*\))*)\)/);
    if (d) f.def = d[1];
    if (modelNames.has(type)) {
      const args = rest.match(/@relation\((.*)\)/)?.[1] ?? "";
      const fl = args.match(/fields:\s*\[([^\]]*)\]/);
      const rf = args.match(/references:\s*\[([^\]]*)\]/);
      f.rel = {
        name: args.match(/^\s*(?:name:\s*)?"([^"]+)"/)?.[1],
        fields: fl ? fl[1].split(",").map((s) => s.trim()) : [],
        references: rf ? rf[1].split(",").map((s) => s.trim()) : [],
        onDelete: args.match(/onDelete:\s*(\w+)/)?.[1],
      };
    }
    model.fields.push(f);
  }
  models.push(model);
}
const modelByName = new Map(models.map((m) => [m.name, m]));

// Krawędzie: strona z fields:[...] trzyma klucz obcy (dziecko -> rodzic)
type Edge = { from: string; to: string; field: string; fk: string[]; ref: string[]; opt: boolean; card: "1:1" | "N:1"; del: string; explicit: boolean; name?: string };
const edges: Edge[] = [];
for (const m of models) {
  for (const f of m.fields) {
    if (!f.rel?.fields.length) continue;
    const fkFields = f.rel.fields.map((n) => m.fields.find((x) => x.name === n)!);
    const opt = fkFields.every((x) => x.optional);
    const target = modelByName.get(f.type)!;
    const back = target.fields.find((x) => x.type === m.name && x.rel && !x.rel.fields.length && (x.rel.name ?? "") === (f.rel!.name ?? ""));
    const oneToOne =
      fkFields.some((x) => x.unique) ||
      (!!back && !back.list) ||
      m.uniques.some((u) => u.length === f.rel!.fields.length && u.every((n) => f.rel!.fields.includes(n)));
    edges.push({
      from: m.name, to: f.type, field: f.name, fk: f.rel.fields, ref: f.rel.references, opt,
      card: oneToOne ? "1:1" : "N:1",
      // domyślne akcje Prisma: relacja wymagana -> Restrict, opcjonalna -> SetNull
      del: f.rel.onDelete ?? (opt ? "SetNull" : "Restrict"),
      explicit: !!f.rel.onDelete,
      name: f.rel.name,
    });
  }
}

const soft = SOFT_REFS.map(([model, field, target]) => {
  const f = modelByName.get(model)?.fields.find((x) => x.name === field);
  if (!f || f.rel || f.type !== "String" || !modelByName.has(target)) throw new Error(`Nieprawidłowa miękka referencja: ${model}.${field} -> ${target}`);
  return { from: model, to: target, field, opt: f.optional };
});

// ---------------------------------------------------------------------------
// Domeny
// ---------------------------------------------------------------------------
const domainOf = new Map<string, string>();
for (const d of DOMAINS) for (const m of d.models) {
  if (!modelByName.has(m)) console.warn(`⚠ domena ${d.id}: model ${m} nie istnieje w schemacie (usunięty?)`);
  domainOf.set(m, d.id);
}
const unmapped = models.filter((m) => !domainOf.has(m.name)).map((m) => m.name);
if (unmapped.length) {
  console.warn(`⚠ modele bez domeny (trafiają do „Inne”): ${unmapped.join(", ")}`);
  DOMAINS.push({ id: "other", name: "Inne", models: unmapped });
  for (const m of unmapped) domainOf.set(m, "other");
}
// odcienie rozstawione „co 5” (5 i N względnie pierwsze), żeby sąsiednie domeny na liście różniły się kolorem
const domains = DOMAINS.filter((d) => d.models.some((m) => modelByName.has(m))).map((d, i, all) => ({
  id: d.id, name: d.name, hue: Math.round((((i * 5) % all.length) * 360) / all.length + 20) % 360,
}));

// ---------------------------------------------------------------------------
// Układ siłowy (deterministyczny) — sprężyny po FK, klastrowanie po domenach, kolizje prostokątów
// ---------------------------------------------------------------------------
type N = { name: string; domain: string; w: number; h: number; x: number; y: number };
const nodes: N[] = models.map((m) => ({ name: m.name, domain: domainOf.get(m.name)!, w: Math.round(m.name.length * 7.1 + 28), h: 30, x: 0, y: 0 }));
const idx = new Map(nodes.map((n, i) => [n.name, i]));
const links: [number, number][] = [...edges, ...soft].filter((e) => e.from !== e.to).map((e) => [idx.get(e.from)!, idx.get(e.to)!]);

function mulberry32(a: number) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

type Island = { id: string; idx: number[]; rel: Map<number, [number, number]>; bw: number; bh: number; w: number; h: number; x: number; y: number };

function layout() {
  const n = nodes.length;
  const domIds = domains.map((d) => d.id);
  const islands: Island[] = domIds.map((id) => ({ id, idx: nodes.map((p, i) => (p.domain === id ? i : -1)).filter((i) => i >= 0), rel: new Map(), bw: 0, bh: 0, w: 0, h: 0, x: 0, y: 0 }));
  const islandOf = (i: number) => islands.find((is) => is.id === nodes[i].domain)!;
  const LABEL = 70, MARGIN = 48;

  const collideNodes = (ids: number[], pos: Map<number, [number, number]>, pad: number) => {
    for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) {
      const pa = pos.get(ids[a])!, pb = pos.get(ids[b])!, na = nodes[ids[a]], nb = nodes[ids[b]];
      const ox = (na.w + nb.w) / 2 + pad - Math.abs(pa[0] - pb[0]);
      const oy = (na.h + nb.h) / 2 + pad - Math.abs(pa[1] - pb[1]);
      if (ox <= 0 || oy <= 0) continue;
      if (ox < oy) { const sg = pa[0] < pb[0] ? -1 : 1; pa[0] += (sg * ox) / 2; pb[0] -= (sg * ox) / 2; }
      else { const sg = pa[1] < pb[1] ? -1 : 1; pa[1] += (sg * oy) / 2; pb[1] -= (sg * oy) / 2; }
    }
  };

  // Poziom 1: układ wnętrza jednej domeny. ext = kierunek (wektor jednostkowy) do powiązanych tabel z innych domen —
  // tabele z połączeniami zewnętrznymi są delikatnie wypychane na tę stronę wyspy.
  const intra = (is: Island, ext: Map<number, [number, number]>, seed: number) => {
    const rnd = mulberry32(seed);
    const ids = is.idx, m = ids.length;
    const local = new Set(ids);
    const ls = links.filter(([a, b]) => local.has(a) && local.has(b));
    const deg = new Map(ids.map((i) => [i, 0]));
    ls.forEach(([a, b]) => { deg.set(a, deg.get(a)! + 1); deg.set(b, deg.get(b)! + 1); });
    const pos = new Map<number, [number, number]>();
    const R = 45 * Math.sqrt(m) + 40;
    ids.forEach((i, k) => {
      const prev = is.rel.get(i);
      if (prev) pos.set(i, [prev[0], prev[1]]);
      else { const an = (k / m) * Math.PI * 2 + rnd(); pos.set(i, [Math.cos(an) * R * (0.4 + rnd() * 0.6), Math.sin(an) * R * (0.4 + rnd() * 0.6)]); }
    });
    const ITER = 700;
    for (let it = 0; it < ITER; it++) {
      const alpha = Math.pow(1 - it / ITER, 1.5) * 0.9 + 0.05;
      const f = new Map<number, [number, number]>(ids.map((i) => [i, [0, 0]]));
      for (let a = 0; a < m; a++) for (let b = a + 1; b < m; b++) {
        const pa = pos.get(ids[a])!, pb = pos.get(ids[b])!;
        const dx = pa[0] - pb[0], dy = pa[1] - pb[1], d = Math.max(Math.hypot(dx, dy), 15);
        const fr = 110 / d / d;
        f.get(ids[a])![0] += dx * fr; f.get(ids[a])![1] += dy * fr; f.get(ids[b])![0] -= dx * fr; f.get(ids[b])![1] -= dy * fr;
      }
      for (const [a, b] of ls) {
        const pa = pos.get(a)!, pb = pos.get(b)!;
        const dx = pb[0] - pa[0], dy = pb[1] - pa[1], d = Math.max(Math.hypot(dx, dy), 1);
        const rest = (nodes[a].w + nodes[b].w) / 2 * 0.6 + 38 + 5 * Math.sqrt(Math.max(deg.get(a)!, deg.get(b)!));
        const fs = (d - rest) * 0.07;
        f.get(a)![0] += (dx / d) * fs; f.get(a)![1] += (dy / d) * fs; f.get(b)![0] -= (dx / d) * fs; f.get(b)![1] -= (dy / d) * fs;
      }
      for (const i of ids) {
        const p = pos.get(i)!, fi = f.get(i)!, e = ext.get(i);
        fi[0] -= p[0] * 0.035; fi[1] -= p[1] * 0.035;
        if (e) { fi[0] += e[0] * 4; fi[1] += e[1] * 4; }
      }
      for (const i of ids) {
        const p = pos.get(i)!, fi = f.get(i)!;
        const sp = Math.hypot(fi[0], fi[1]), cap = 22 * alpha + 1, mul = sp * 0.4 > cap ? cap / sp : 0.4;
        p[0] += fi[0] * mul; p[1] += fi[1] * mul;
      }
      collideNodes(ids, pos, 16);
    }
    for (let i = 0; i < 200; i++) collideNodes(ids, pos, 16);
    const x0 = Math.min(...ids.map((i) => pos.get(i)![0] - nodes[i].w / 2)), x1 = Math.max(...ids.map((i) => pos.get(i)![0] + nodes[i].w / 2));
    const y0 = Math.min(...ids.map((i) => pos.get(i)![1] - nodes[i].h / 2)), y1 = Math.max(...ids.map((i) => pos.get(i)![1] + nodes[i].h / 2));
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    ids.forEach((i) => { const p = pos.get(i)!; is.rel.set(i, [p[0] - cx, p[1] - cy]); });
    is.bw = x1 - x0; is.bh = y1 - y0; is.w = is.bw + 2 * MARGIN; is.h = is.bh + 2 * MARGIN + LABEL;
  };

  // Poziom 2: rozmieszczenie wysp (prostokątów) — sprężyny proporcjonalne do liczby relacji między domenami
  const weight = new Map<string, number>();
  const key = (a: number, b: number) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const isIdx = new Map(islands.map((is, i) => [is.id, i]));
  for (const [a, b] of links) {
    const ia = isIdx.get(nodes[a].domain)!, ib = isIdx.get(nodes[b].domain)!;
    if (ia !== ib) weight.set(key(ia, ib), (weight.get(key(ia, ib)) ?? 0) + 1);
  }
  const collideIslands = (gap: number) => {
    for (let a = 0; a < islands.length; a++) for (let b = a + 1; b < islands.length; b++) {
      const A = islands[a], B = islands[b];
      const ox = (A.w + B.w) / 2 + gap - Math.abs(A.x - B.x), oy = (A.h + B.h) / 2 + gap - Math.abs(A.y - B.y);
      if (ox <= 0 || oy <= 0) continue;
      if (ox < oy) { const sg = A.x < B.x ? -1 : 1; A.x += (sg * ox) / 2; B.x -= (sg * ox) / 2; }
      else { const sg = A.y < B.y ? -1 : 1; A.y += (sg * oy) / 2; B.y -= (sg * oy) / 2; }
    }
  };
  const inter = (fresh: boolean) => {
    const rnd = mulberry32(99);
    const tot = islands.map((_, i) => [...weight.entries()].filter(([k]) => k.split("|").map(Number).includes(i)).reduce((s, [, w]) => s + w, 0));
    if (fresh) {
      const order = islands.map((_, i) => i).sort((a, b) => tot[b] - tot[a]);
      order.forEach((i, r) => { const an = r * 2.4 + rnd(); const rad = r === 0 ? 0 : 260 + r * 55; islands[i].x = Math.cos(an) * rad; islands[i].y = Math.sin(an) * rad; });
    }
    const ITER = 1200;
    for (let it = 0; it < ITER; it++) {
      const alpha = Math.pow(1 - it / ITER, 1.4) * 0.9 + 0.05;
      const fx = new Array(islands.length).fill(0), fy = new Array(islands.length).fill(0);
      for (let a = 0; a < islands.length; a++) for (let b = a + 1; b < islands.length; b++) {
        const dx = islands[a].x - islands[b].x, dy = islands[a].y - islands[b].y, d = Math.max(Math.hypot(dx, dy), 30);
        const fr = 90000 / d / d;
        fx[a] += (dx / d) * fr; fy[a] += (dy / d) * fr; fx[b] -= (dx / d) * fr; fy[b] -= (dy / d) * fr;
      }
      for (const [k, w] of weight) {
        const [a, b] = k.split("|").map(Number);
        const dx = islands[b].x - islands[a].x, dy = islands[b].y - islands[a].y, d = Math.max(Math.hypot(dx, dy), 1);
        const rest = (Math.hypot(islands[a].w, islands[a].h) + Math.hypot(islands[b].w, islands[b].h)) / 4;
        const fs = (d - rest) * 0.012 * Math.min(Math.sqrt(w), 3);
        fx[a] += (dx / d) * fs; fy[a] += (dy / d) * fs; fx[b] -= (dx / d) * fs; fy[b] -= (dy / d) * fs;
      }
      islands.forEach((is, i) => { fx[i] -= is.x * 0.004; fy[i] -= is.y * 0.004; });
      islands.forEach((is, i) => { const sp = Math.hypot(fx[i], fy[i]), cap = 40 * alpha + 1, mul = sp * 0.5 > cap ? cap / sp : 0.5; is.x += fx[i] * mul; is.y += fy[i] * mul; });
      collideIslands(64);
    }
    for (let i = 0; i < 300; i++) collideIslands(64);
  };

  // runda 0: wyspy bez informacji o sąsiadach, potem 3 rundy „dopasuj wnętrze do położenia sąsiadów”
  islands.forEach((is, k) => intra(is, new Map(), 1000 + k));
  inter(true);
  for (let round = 0; round < 3; round++) {
    const gp = (i: number): [number, number] => { const is = islandOf(i), r = is.rel.get(i)!; return [is.x + r[0], is.y + LABEL / 2 + r[1]]; };
    islands.forEach((is, k) => {
      const ext = new Map<number, [number, number]>();
      for (const [a, b] of links) for (const [me, other] of [[a, b], [b, a]] as const) {
        if (nodes[me].domain !== is.id || nodes[other].domain === is.id) continue;
        const pm = [is.x, is.y + LABEL / 2], po = gp(other);
        const dx = po[0] - pm[0], dy = po[1] - pm[1], d = Math.max(Math.hypot(dx, dy), 1);
        const cur = ext.get(me) ?? [0, 0];
        ext.set(me, [cur[0] + dx / d, cur[1] + dy / d]);
      }
      // uśrednienie: tabela z wieloma powiązaniami w różne strony nie jest wypychana na jedną stronę
      ext.forEach((v, i) => { const c = links.filter(([a, b]) => (a === i || b === i) && nodes[a].domain !== nodes[b].domain).length; ext.set(i, [v[0] / Math.max(c, 1) * Math.min(c, 3), v[1] / Math.max(c, 1) * Math.min(c, 3)]); });
      intra(is, ext, 2000 + round * 50 + k);
    });
    inter(false);
  }

  if (process.env.DEBUG_LAYOUT) islands.forEach((is) => console.log(`   ${is.id.padEnd(9)} n=${is.idx.length} wnętrze ${Math.round(is.bw)}×${Math.round(is.bh)} @ (${Math.round(is.x)},${Math.round(is.y)})`));
  for (const is of islands) for (const i of is.idx) { const r = is.rel.get(i)!; nodes[i].x = is.x + r[0]; nodes[i].y = is.y + LABEL / 2 + r[1]; }
  const minX = Math.min(...nodes.map((p) => p.x - p.w / 2)), minY = Math.min(...nodes.map((p) => p.y - p.h / 2));
  for (const p of nodes) { p.x = Math.round(p.x - minX + 160); p.y = Math.round(p.y - minY + 160); }
  const maxX = Math.max(...nodes.map((p) => p.x + p.w / 2)), maxY = Math.max(...nodes.map((p) => p.y + p.h / 2));
  const len = links.reduce((s, [a, b]) => s + Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y), 0);
  console.log(`  układ: ${Math.round(maxX)}×${Math.round(maxY)} px, łączna długość krawędzi ${Math.round(len)} px`);
}
layout();

// ---------------------------------------------------------------------------
// Dane dla szablonu
// ---------------------------------------------------------------------------
const fkTargets = new Map<string, string>();
for (const e of edges) e.fk.forEach((f, i) => fkTargets.set(`${e.from}.${f}`, `${e.to}.${e.ref[i] ?? "id"}`));

const data = {
  meta: {
    generated: new Date().toISOString().slice(0, 10),
    schemaLines: lines.length,
    provider: lines.join("\n").match(/datasource db \{[^}]*provider\s*=\s*"(\w+)"/)?.[1] ?? "?",
  },
  domains,
  enums,
  models: models.map((m, i) => ({
    name: m.name, domain: domainOf.get(m.name), line: m.line, doc: m.doc, x: nodes[i].x, y: nodes[i].y, w: nodes[i].w,
    fields: m.fields.filter((f) => !f.rel).map((f) => ({
      n: f.name, t: f.type, l: f.list || undefined, o: f.optional || undefined, id: f.id || undefined, u: f.unique || undefined,
      d: f.def, c: f.comment, e: enums[f.type] ? 1 : undefined, fk: fkTargets.get(`${m.name}.${f.name}`),
    })),
    uniques: m.uniques,
  })),
  edges,
  soft,
};

const json = JSON.stringify(data).replace(/</g, "\\u003c");
const html = readFileSync(TEMPLATE, "utf8").replace("/*__DATA__*/null", () => json);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);

const linked = new Set([...edges, ...soft].flatMap((e) => [e.from, e.to]));
console.log(
  `✔ ${OUT}\n  modeli: ${models.length} | domen: ${domains.length} | relacji FK: ${edges.length} (1:1: ${edges.filter((e) => e.card === "1:1").length}, samo-relacji: ${edges.filter((e) => e.from === e.to).length}) | miękkich: ${soft.length} | enumów: ${Object.keys(enums).length} | bez żadnych powiązań: ${models.filter((m) => !linked.has(m.name)).length}`,
);
