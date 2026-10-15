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
      <form action="/search" className="search">
        <input type="search" name="q" defaultValue={q} placeholder="Search the docs" aria-label="Search the docs" maxLength={200} />
      </form>
      {found && found.total === 0 ? <p className="muted">Nothing found for “{q}”.</p> : null}
      {found ? (
        <ul className="children">
          {found.records.map((page) => (
            <li key={page.id}>
              <Link href={`/${page.data.slug}`}>{page.data.title}</Link>
              {page.data.summary ? <span className="muted"> · {page.data.summary}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
