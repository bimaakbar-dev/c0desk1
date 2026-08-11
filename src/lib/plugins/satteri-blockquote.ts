// src/lib/mdx/satteri-quote.ts
import { defineMdastPlugin } from "satteri";

export const satteriQuote = defineMdastPlugin({
  name: "satteri-quote",

  containerDirective(node: any, ctx: any) {
    if (node.name !== "quote") return;

    const figcaptionChildren: any[] = [];
    const blockquoteChildren: any[] = [];

    for (const child of node.children) {
      if (child.type === "paragraph") {
        const hasUser = child.children?.some(
          (c: any) => c.type === "textDirective" && c.name === "user"
        );

        if (hasUser) {
          figcaptionChildren.push(child);
        } else {
          blockquoteChildren.push(child);
        }
      } else {
        blockquoteChildren.push(child);
      }
    }

    const blockquote = {
      type: "element",
      data: {
        hName: "blockquote",
      },
      children: blockquoteChildren,
    };

    const figcaption = {
      type: "element",
      data: {
        hName: "figcaption",
      },
      children: figcaptionChildren,
    };

    ctx.setProperty(node, "data", {
      hName: "figure",
    });

    ctx.setProperty(node, "children", [
      blockquote,
      ...(figcaptionChildren.length > 0 ? [figcaption] : []),
    ]);
  },
});