import Link from "next/link";

export default function NotFound() {
  return (
    <article>
      <h1>Page not found</h1>
      <p className="lead">
        It may have been moved or unpublished. <Link href="/">Go to the start</Link>.
      </p>
    </article>
  );
}
