// src/lib/mdx/satteri-dl.ts
import { defineMdastPlugin } from "satteri";

export const satteriDl = defineMdastPlugin({
  name: "satteri-dl",

  containerDirective(node, ctx) {
    const name = node.name?.toLowerCase();
    if (name !== "dl" && name !== "definition") {
      return;
    }

    const children = node.children || [];

    // Ubah kontainer utama menjadi <dl>
    ctx.setProperty(node, "data", {
      ...(node.data || {}),
      hName: "dl",
      hProperties: {
        ...(node.data?.hProperties || {}),
        className: ["prop-dl"],
      },
    });

    const processedChildren: any[] = [];

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child) continue;

      // 1. Tangkap Leaf Directive ::dt[...]
      if (child.type === "leafDirective" && child.name === "dt") {
        processedChildren.push({
          ...child,
          data: {
            ...(child.data || {}),
            hName: "dt",
            hProperties: {
              ...(child.data?.hProperties || {}),
              className: ["prop-dt"],
            },
          },
        });
        continue;
      }

      // 2. Paragraf atau teks di bawahnya otomatis jadi <dd>
      if (child.type === "paragraph" || child.type === "text") {
        if (child.type === "paragraph" && (!child.children || child.children.length === 0)) {
          continue;
        }

        processedChildren.push({
          ...child,
          data: {
            ...(child.data || {}),
            hName: "dd",
            hProperties: {
              ...(child.data?.hProperties || {}),
              className: ["prop-dd"],
            },
          },
        });
      }
    }

    ctx.setProperty(node, "children", processedChildren as any);
  },
});