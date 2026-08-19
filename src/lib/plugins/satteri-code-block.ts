// src/lib/plugins/satteri-code-block.ts
import { defineHastPlugin } from 'satteri';
import type { Element } from 'hast';

function findCodeElement(pre: Element): Element | undefined {
  return pre.children.find(
    (child): child is Element => child.type === 'element' && child.tagName === 'code'
  );
}

export const satteriCodeBlock = defineHastPlugin({
  name: 'satteri-code-block',
  element: {
    filter: ['pre'],
    visit(node: Element, ctx) {
      const codeEl = findCodeElement(node);
      if (!codeEl) return;

      const parent = ctx.parent(node);
      if (!parent || !('children' in parent)) return;

      const index = ctx.indexOf(node);
      if (index === undefined) return;

      const iconCopy: Element = {
        type: 'element',
        tagName: 'span',
        properties: { className: ['copy-icon', 'icon-copy'] },
        children: [],
      };

      const iconCheck: Element = {
        type: 'element',
        tagName: 'span',
        properties: { className: ['copy-icon', 'icon-check'] },
        children: [],
      };

      const button: Element = {
        type: 'element',
        tagName: 'button',
        properties: {
          type: 'button',
          className: ['copy-button'],
          ariaLabel: 'Salin kode',
          dataCopyButton: '',
        },
        children: [iconCopy, iconCheck],
      };

      const wrapper: Element = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['code-block'], 
        },
        children: [button, node],
      };

      const children = [...parent.children];
      children[index] = wrapper;
      ctx.setProperty(parent, 'children', children);
    },
  },
});