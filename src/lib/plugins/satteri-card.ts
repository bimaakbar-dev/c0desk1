// src/lib/mdx/satteri-card.ts
import { defineMdastPlugin } from 'satteri';

function extractText(children: any[]): string {
  if (!Array.isArray(children)) return '';
  return children.map((c) => (c.type === 'text' ? c.value : extractText(c.children || []))).join('');
}

export const satteriCard = defineMdastPlugin({
  name: 'satteri-card',

  containerDirective(node, ctx) {
    if (node.name !== 'card') return;

    // Ekstrak atribut
    const attrs = node.attributes || {};
    const hasIcon = !!attrs.icon;
    const hasHref = !!attrs.href;
    const extraClass = attrs.class || '';

    // Deteksi Label/Title
    const firstChild = node.children?.[0];
    const hasLabelNode = firstChild?.type === 'paragraph' && firstChild.data?.directiveLabel;
    const label = hasLabelNode ? extractText(firstChild.children).trim() : '';
    const hasLabel = !!label;

    const bodyChildren = hasLabelNode ? node.children.slice(1) : node.children;

    // Tentukan Class Induk
    const cardClasses = ['card'];
    if (!hasLabel) cardClasses.push('card-no-title');
    if (!hasIcon) cardClasses.push('card-no-icon');
    if (hasHref) cardClasses.push('card-link');
    if (extraClass) cardClasses.push(extraClass);

    const newChildren: any[] = [];

    // 1. Render Header (jika ada icon atau label)
    if (hasIcon || hasLabel) {
      const headerHastChildren: any[] = [];
      
      if (hasIcon) {
        headerHastChildren.push({
          type: 'element',
          tagName: 'span',
          properties: { className: ['card-icon-wrapper'] },
          children: [{
            type: 'element',
            tagName: 'span',
            properties: { 
              className: ['card-icon'], 
              // Set icon via style custom property atau bisa gunakan 'data-icon': attrs.icon
              style: `mask-image: var(--ic-${attrs.icon}); -webkit-mask-image: var(--ic-${attrs.icon});` 
            },
            children: [],
          }],
        });
      }
      
      if (hasLabel) {
        headerHastChildren.push({
          type: 'element',
          tagName: 'h4', // Semantik yang lebih baik daripada sekadar div
          properties: { className: ['card-title'] },
          children: [{ type: 'text', value: label }],
        });
      }

      newChildren.push({
        type: 'containerDirective',
        name: '_card-header',
        attributes: {},
        children: [],
        data: {
          hName: 'div',
          hProperties: { className: ['card-header'] },
          hChildren: headerHastChildren,
        },
      });
    }

    // 2. Render Body
    if (bodyChildren.length) {
      newChildren.push({
        type: 'containerDirective',
        name: '_card-body',
        attributes: {},
        children: bodyChildren,
        data: {
          hName: 'div',
          hProperties: { className: ['card-body'] },
        },
      });
    }

    // 3. Konfigurasi Wrapper (A vs DIV)
    let hName = 'div';
    let hProperties: Record<string, unknown> = { className: cardClasses };

    if (hasHref) {
      const isExternal = attrs.href.startsWith('http');
      hName = 'a';
      hProperties = {
        className: cardClasses,
        href: attrs.href,
        target: isExternal ? '_blank' : '_self',
        rel: isExternal ? 'noopener noreferrer' : undefined,
      };
    }

    // Assign back to node
    ctx.setProperty(node, 'data', {
      ...(node.data ?? {}),
      hName,
      hProperties,
    });
    ctx.setProperty(node, 'children', newChildren);
  },
});