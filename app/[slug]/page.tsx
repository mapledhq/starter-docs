import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/rich-text";
import { mapled } from "@/lib/mapled";
import { ancestors, pageTree } from "@/lib/tree";

type Props = { params: Promise<{ slug: string }> };

// Pages that exist at build time are made then; a page published later gets
// its address on the first visit, without a deploy.
export async function generateStaticParams() {
  const { flat } = await pageTree();
  return flat.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await mapled.getRecordBySlug("pages", (await params).slug, { fields: ["title", "summary"] });
  return page ? { title: page.data.title, description: page.data.summary ?? undefined } : {};
}

export default async function DocPage({ params }: Props) {
  const page = await mapled.getRecordBySlug("pages", (await params).slug);
  if (!page) notFound();

  const { byId, flat } = await pageTree();
  const here = byId.get(page.id);
  const trail = here ? ancestors(here, byId) : [];
  const at = flat.findIndex((p) => p.id === page.id);
  const previous = at > 0 ? flat[at - 1] : null;
  const next = at >= 0 && at < flat.length - 1 ? flat[at + 1] : null;

  return (
    <article>
      {trail.length > 0 ? (
        <p className="breadcrumbs">
          {trail.map((p) => (
            <span key={p.id}>
              <Link href={`/${p.slug}`}>{p.title}</Link> /{" "}
            </span>
          ))}
        </p>
      ) : null}
      <h1>{page.data.title}</h1>
      {page.data.summary ? <p className="lead">{page.data.summary}</p> : null}
      <RichText>{page.data.body}</RichText>
      {here && here.children.length > 0 ? (
        <ul className="children">
          {here.children.map((child) => (
            <li key={child.id}>
              <Link href={`/${child.slug}`}>{child.title}</Link>
              {child.summary ? <span className="muted"> · {child.summary}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      <nav className="pager" aria-label="Pages">
        {previous ? <Link href={`/${previous.slug}`}>← {previous.title}</Link> : <span />}
        {next ? <Link href={`/${next.slug}`}>{next.title} →</Link> : <span />}
      </nav>
    </article>
  );
}
