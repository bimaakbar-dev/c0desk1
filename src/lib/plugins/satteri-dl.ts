// src/lib/mdx/satteri-dl.ts
import { defineMdastPlugin } from "satteri";

function extractText(node: any): string {
  if (!node) return "";
  if (typeof node.value === "string") return node.value;
  if (Array.isArray(node.children)) {
    return node.children.map(extractText).join("");
  }
  return "";
}

export const satteriDl = defineMdastPlugin({
  name: "satteri-dl",

  containerDirective(node, ctx) {
    const name = node.name?.toLowerCase();
    if (name !== "dl" && name !== "definition") {
      return;
    }

    const children = node.children || [];
    const dlChildren: any[] = [];

    ctx.setProperty(node, "data", {
      ...(node.data || {}),
      hName: "dl",
      hProperties: {
        ...(node.data?.hProperties || {}),
        className: ["prop-dl"],
      },
    });

    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      if (child.type === "paragraph") {
        const tag = i % 2 === 0 ? "dt" : "dd";
        
        dlChildren.push({
          ...child,
          data: {
            ...(child.data || {}),
            hName: tag,
            hProperties: {
              ...(child.data?.hProperties || {}),
              className: [tag === "dt" ? "prop-dt" : "prop-dd"],
            },
          },
        });
      } else {
        dlChildren.push(child);
      }
    }

    ctx.setProperty(node, "children", dlChildren as any);
  },
});