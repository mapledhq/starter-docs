import { useId } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type HastNode = { properties?: Record<string, unknown>; children?: HastNode[] };

/** The footnotes heading's id is fixed upstream (`footnote-label`, and every
    reference points at it); this gives it the block's prefix too. */
function prefixFootnoteLabel(prefix: string) {
  const label = `${prefix}footnote-label`;
  const walk = (node: HastNode) => {
    const props = node.properties;
    if (props?.id === "footnote-label") props.id = label;
    if (props && Array.isArray(props.ariaDescribedBy)) {
      props.ariaDescribedBy = props.ariaDescribedBy.map((v) => (v === "footnote-label" ? label : v));
    }
    node.children?.forEach(walk);
  };
  return (tree: HastNode) => walk(tree);
}

/** Rich text fields are Markdown, with GitHub's tables, task lists and
    strikethrough (remark-gfm). react-markdown renders it as elements and
    never as raw HTML, so an editor's text can't inject markup into the page.
    Each block prefixes the ids it writes (footnotes), so two rich texts on
    one page don't share them. */
export function RichText({ children }: { children: string | null | undefined }) {
  const prefix = `rt${useId().replace(/[^A-Za-z0-9_-]/g, "")}-`;
  if (!children) return null;
  return (
    <div className="prose">
      <Markdown remarkPlugins={[remarkGfm]} remarkRehypeOptions={{ clobberPrefix: prefix }} rehypePlugins={[[prefixFootnoteLabel, prefix]]}>{children}</Markdown>
    </div>
  );
}
