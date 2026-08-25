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
    const dlChildren: any[] = [];

    // Ubah kontainer utama menjadi <dl>
    ctx.setProperty(node, "data", {
      ...(node.data || {}),
      hName: "dl",
      hProperties: {
        ...(node.data?.hProperties || {}),
        className: ["prop-dl"],
      },
    });

    // Ambil hanya anak yang valid (biasanya paragraf)
    const validParagraphs = children.filter(
      (child: any) => child && child.type === "paragraph"
    );

    // Petukan secara berpasangan: Genap = dt, Ganjil = dd
    validParagraphs.forEach((child: any, index: number) => {
      const isTerm = index % 2 === 0;
      const tag = isTerm ? "dt" : "dd";
      const className = isTerm ? "prop-dt" : "prop-dd";

      dlChildren.push({
        ...child,
        data: {
          ...(child.data || {}),
          hName: tag,
          hProperties: {
            ...(child.data?.hProperties || {}),
            className: [className],
          },
        },
      });
    });

    ctx.setProperty(node, "children", dlChildren as any);
  },
});