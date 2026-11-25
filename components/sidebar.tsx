import Link from "next/link";
import type { NavPage } from "@/lib/tree";
import { SearchBox } from "./search-box";

/** The tree of pages, as editors order it in Mapled. */
export function Sidebar({ roots }: { roots: NavPage[] }) {
  return (
    <nav className="sidebar" aria-label="Documentation">
      <SearchBox />
      <Tree pages={roots} />
    </nav>
  );
}

function Tree({ pages }: { pages: NavPage[] }) {
  if (pages.length === 0) return null;
  return (
    <ul>
      {pages.map((page) => (
        <li key={page.id}>
          <Link href={`/${page.slug}`}>{page.title}</Link>
          <Tree pages={page.children} />
        </li>
      ))}
    </ul>
  );
}
