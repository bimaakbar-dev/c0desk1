// src/lib/mdx/satteri-grid.ts
import { defineMdastPlugin } from 'satteri';

export const satteriGrid = defineMdastPlugin({
  name: 'satteri-grid',

  containerDirective(node, ctx) {
    const name = node.name?.toLowerCase();

    if (name === 'grid') {
      ctx.setProperty(node, 'data', {
        ...(node.data || {}),
        hName: 'div',
        hProperties: {
          className: ['grid'],
        },
      });
      return;
    }

    if (name === 'col') {
      ctx.setProperty(node, 'data', {
        ...(node.data || {}),
        hName: 'div',
        hProperties: {
          className: ['col'],
        },
      });
    }
  },
});