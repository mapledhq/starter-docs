import type { Metadata } from "next";
import Link from "next/link";
import { mapled } from "@/lib/mapled";

export const metadata: Metadata = { title: "Search" };

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function SearchPage({ searchParams }: Props) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 200) ?? "";
  // full-text search of the published pages: every word has to be there, the last may be the start of one
  const found = q ? await mapled.getRecords("pages", { search: q, fields: ["title", "slug", "summary"], limit: 20, revalidate: 60 }) : null;

  return (
    <article>
      <h1>Search</h1>
      {/* the field is the sidebar's (components/search-box.tsx), filled with these words */}
      {!found ? <p className="muted">Type what you are looking for in “Search the docs” and press Enter.</p> : null}
      {found && found.total === 0 ? <p className="muted">Nothing found for “{q}”.</p> : null}
      {found && found.total > 0 ? (
        <p className="muted">
          {found.total === 1 ? "1 page" : `${found.total} pages`} for “{q}”{found.total > found.records.length ? `, the first ${found.records.length} shown` : ""}
        </p>
      ) : null}
      {found ? (
        <ul className="children">
          {found.records.map((page) => (
            <li key={page.id}>
              <Link href={`/${page.data.slug}`}>{page.data.title}</Link>
              {page.data.summary ? <span className="muted"> • {page.data.summary}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
