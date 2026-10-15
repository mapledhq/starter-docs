import Link from "next/link";
import { mapled } from "@/lib/mapled";
import { pageTree } from "@/lib/tree";

export default async function Home() {
  const settings = await mapled.getSingle("docs-settings");
  const { roots } = await pageTree();

  return (
    <article>
      <h1>{settings?.data.title ?? "Docs"}</h1>
      {settings?.data.description ? <p className="lead">{settings.data.description}</p> : null}
      {roots.length === 0 ? <p className="empty">No pages yet. Write one in Mapled and publish it.</p> : null}
      <div className="cards">
        {roots.map((section) => (
          <section key={section.id} className="card">
            <h2>
              <Link href={`/${section.slug}`}>{section.title}</Link>
            </h2>
            {section.summary ? <p className="muted">{section.summary}</p> : null}
            {section.children.length > 0 ? (
              <ul>
                {section.children.map((page) => (
                  <li key={page.id}>
                    <Link href={`/${page.slug}`}>{page.title}</Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}
