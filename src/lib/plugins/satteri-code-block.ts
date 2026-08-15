// src/lib/plugins/satteri-code-block.ts
import { defineHastPlugin } from 'satteri';
import type { Element, Text } from 'hast';

function findCodeElement(pre: Element): Element | undefined {
  return pre.children.find(
    (child): child is Element => child.type === 'element' && child.tagName === 'code'
  );
}

const TITLE_PATTERN = /^(?:\/\/|#)\s*(.+)$/;

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

      let title: string | undefined;
      const firstLine = codeEl.children[0];

      if (firstLine && firstLine.type === 'element') {
        const text = ctx.textContent(firstLine).trim();
        const match = text.match(TITLE_PATTERN);

        if (match) {
          title = match[1];
          const rest = codeEl.children.slice(1);
          ctx.setProperty(codeEl, 'children', rest);
        }
      }

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

      const titleSpan: Element | null = title
        ? {
            type: 'element',
            tagName: 'span',
            properties: { className: ['code-block-title'] },
            children: [{ type: 'text', value: title } as Text],
          }
        : null;

      const header: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['code-block-header'] },
        children: titleSpan ? [titleSpan, button] : [button],
      };

      const wrapper: Element = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: title ? ['code-block', 'has-title'] : ['code-block'],
        },
        children: [header, node],
      };

      const children = [...parent.children];
      children[index] = wrapper;
      ctx.setProperty(parent, 'children', children);
    },
  },
});
