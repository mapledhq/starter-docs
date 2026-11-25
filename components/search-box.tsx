"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** The one search field of the site, in the sidebar. A search is a page
    of its own (`/search?q=`), so nothing shows while typing: the hint
    under the field says what starts it. On the results page the field
    holds the words searched for. */
export function SearchBox() {
  return (
    // reading the address makes a prerendered page wait for the browser:
    // until then the field is there, empty, and works without scripts
    <Suspense fallback={<SearchForm q="" />}>
      <CurrentSearch />
    </Suspense>
  );
}

function CurrentSearch() {
  const onResults = usePathname() === "/search";
  const q = useSearchParams().get("q")?.trim().slice(0, 200) ?? "";
  // keyed by the words: another search fills the field again
  return <SearchForm key={onResults ? q : ""} q={onResults ? q : ""} />;
}

function SearchForm({ q }: { q: string }) {
  return (
    <form action="/search" className="search" role="search">
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="Search the docs"
        aria-label="Search the docs"
        aria-describedby="search-hint"
        maxLength={200}
        enterKeyHint="search"
      />
      <p id="search-hint" className="search-hint">
        Press <kbd>Enter</kbd> to search
      </p>
    </form>
  );
}
