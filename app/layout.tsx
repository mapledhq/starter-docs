import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { draftMode } from "next/headers";
import { MapledLive } from "@mapled/next/live";
import { Sidebar } from "@/components/sidebar";
import { mapled } from "@/lib/mapled";
import { pageTree } from "@/lib/tree";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await mapled.getSingle("docs-settings");
  const title = settings?.data.title ?? "Docs";
  return { title: { default: title, template: `%s · ${title}` }, description: settings?.data.description ?? undefined };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const preview = (await draftMode()).isEnabled;
  const settings = await mapled.getSingle("docs-settings");
  const { roots } = await pageTree();

  return (
    <html lang="en">
      <body>
        {preview ? (
          <div className="preview-bar">
            You are looking at drafts. <a href="/api/mapled/preview/exit">Exit preview</a>
          </div>
        ) : null}
        <header className="site-header">
          <Link href="/" className="brand">
            {settings?.data.title ?? "Docs"}
          </Link>
        </header>
        <div className="layout">
          <Sidebar roots={roots} />
          <main>{children}</main>
        </div>
        <MapledLive />
      </body>
    </html>
  );
}
