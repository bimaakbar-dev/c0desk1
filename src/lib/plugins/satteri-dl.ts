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

    // Proses anak-anak di dalam :::dl
    const processedChildren = children.map((child: any) => {
      if (!child) return child;

      // Cek apakah ini text directive dengan nama 'dt' -> misal ::dt[Type]
      if (child.type === "textDirective" && child.name === "dt") {
        return {
          ...child,
          data: {
            ...(child.data || {}),
            hName: "dt",
            hProperties: {
              ...(child.data?.hProperties || {}),
              className: ["prop-dt"],
            },
          },
        };
      }

      // Selain ::dt (biasanya paragraf atau teks penjelas di bawahnya), jadikan <dd>
      if (child.type === "paragraph" || child.type === "text") {
        return {
          ...child,
          data: {
            ...(child.data || {}),
            hName: "dd",
            hProperties: {
              ...(child.data?.hProperties || {}),
              className: ["prop-dd"],
            },
          },
        };
      }

      return child;
    });

    ctx.setProperty(node, "children", processedChildren as any);
  },
});
