// src/lib/plugins/satteri-accordion.ts
import { defineMdastPlugin } from "satteri";

function extractText(node: any): string {
  if (!node) return "";
  if (typeof node.value === "string") return node.value;
  if (Array.isArray(node.children)) {
    return node.children.map(extractText).join("");
  }
  return "";
}

export const satteriAccordion = defineMdastPlugin({
  name: "satteri-accordion",

  containerDirective(node, ctx) {
    const name = node.name?.toLowerCase();
    if (name !== "details" && name !== "accordion") {
      return;
    }

    let children = node.children || [];
    let summaryChildren: any[] = [];
    let remainingChildren = children;

    const attributes = node.attributes;
    if (typeof attributes?.label === "string" && attributes.label.trim()) {
      summaryChildren = [
        {
          type: "text",
          value: attributes.label.trim(),
        },
      ];
    } 
    else {
      const firstNode = children[0];
      if (firstNode) {
        summaryChildren = firstNode.children || [{ type: "text", value: extractText(firstNode) }];
        remainingChildren = children.slice(1);
      } else {
        summaryChildren = [{ type: "text", value: "Klik untuk membuka" }];
      }
    }

    ctx.setProperty(node, "data", {
      ...(node.data || {}),
      hName: "details",
      hProperties: {
        ...(node.data?.hProperties || {}),
        className: ["accordion"],
      },
    });

    const summaryNode = {
      type: "paragraph",
      data: {
        hName: "summary",
        hProperties: {
          className: ["accordion-summary"],
        },
      },
      children: summaryChildren,
    };

    const contentNode = {
      type: "div",
      data: {
        hName: "div",
        hProperties: {
          className: ["accordion-content"],
        },
      },
      children: remainingChildren,
    };

    ctx.setProperty(node, "children", [summaryNode, contentNode] as any);
  },
});