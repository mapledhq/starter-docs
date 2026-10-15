import type { MapledRecord } from "@mapled/next";
import { mapled } from "@/lib/mapled";

export type NavPage = { id: string; title: string; slug: string; summary: string | null; parent: string | null; children: NavPage[] };

/** Every page with its place in the tree: a page sits under its Parent and
    among its siblings by Order, smallest first, then by title. */
export async function pageTree(): Promise<{ roots: NavPage[]; byId: Map<string, NavPage>; flat: NavPage[] }> {
  const records: MapledRecord<{ title: string; slug: string; summary?: string | null; parent?: string | null; order?: number | null }>[] = [];
  // a list answers at most 100 records: read on, from the same release, until every page is here
  let release: number | undefined;
  for (let offset = 0; ; offset += 100) {
    const page = await mapled.getRecords("pages", { fields: ["title", "slug", "summary", "parent", "order"], limit: 100, offset, release });
    release ??= page.release;
    records.push(...page.records);
    if (records.length >= page.total || page.records.length === 0) break;
  }

  const order = new Map(records.map((r) => [r.id, r.data.order ?? Number.MAX_SAFE_INTEGER]));
  const byId = new Map<string, NavPage>(
    records.map((r) => [r.id, { id: r.id, title: r.data.title, slug: r.data.slug, summary: r.data.summary ?? null, parent: r.data.parent ?? null, children: [] }]),
  );
  // a Parent that leads back to the page (a page under itself, A under B under A) would hide the whole
  // loop from the tree: each page of a loop goes to the top level instead
  const looped = [...byId.values()].filter((page) => leadsBack(page, byId));
  for (const page of looped) page.parent = null;
  const roots: NavPage[] = [];
  for (const page of byId.values()) {
    const parent = page.parent ? byId.get(page.parent) : undefined;
    // a parent that isn't published leaves the page at the top level
    (parent ? parent.children : roots).push(page);
  }
  const sort = (list: NavPage[]) => {
    list.sort((a, b) => order.get(a.id)! - order.get(b.id)! || a.title.localeCompare(b.title));
    list.forEach((p) => sort(p.children));
  };
  sort(roots);

  // reading order: depth first, the way the sidebar lists them
  const flat: NavPage[] = [];
  const walk = (list: NavPage[]) => list.forEach((p) => (flat.push(p), walk(p.children)));
  walk(roots);
  return { roots, byId, flat };
}

/** Following Parent up from the page comes back to the page. */
function leadsBack(page: NavPage, byId: Map<string, NavPage>): boolean {
  const seen = new Set<string>();
  for (let at = page.parent; at && byId.has(at) && !seen.has(at); at = byId.get(at)!.parent) {
    if (at === page.id) return true;
    seen.add(at);
  }
  return false;
}

/** The pages above this one, the top first. */
export function ancestors(page: NavPage, byId: Map<string, NavPage>): NavPage[] {
  const chain: NavPage[] = [];
  const seen = new Set<string>([page.id]);
  for (let at = page.parent ? byId.get(page.parent) : undefined; at && !seen.has(at.id); at = at.parent ? byId.get(at.parent) : undefined) {
    seen.add(at.id);
    chain.unshift(at);
  }
  return chain;
}
