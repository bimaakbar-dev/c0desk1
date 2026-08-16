// src/lib/mdx/satteri-card.ts
import { defineMdastPlugin } from 'satteri';

function extractText(children: any[]): string {
  if (!Array.isArray(children)) return '';
  return children.map((c) => (c.type === 'text' ? c.value : extractText(c.children || []))).join('');
}

function getAttributes(node: any): Record<string, string> {
  const props = node.attributes || {};
  const attrs: Record<string, string> = {};
  if (props.icon) attrs.icon = props.icon;
  if (props.href) attrs.href = props.href;
  if (props.class) attrs.class = props.class;
  return attrs;
}

export const satteriCard = defineMdastPlugin({
  name: 'satteri-card',

  containerDirective(node, ctx) {
    if (node.name !== 'card') return;

    const firstChild = node.children?.[0];
    const hasLabelNode =
      firstChild?.type === 'paragraph' && firstChild.data?.directiveLabel;
    const label = hasLabelNode ? extractText(firstChild.children).trim() : '';
    const hasLabel = !!label;

    const attrs = getAttributes(node);
    const hasIcon = !!attrs.icon;
    const hasHref = !!attrs.href;
    const extraClass = attrs.class || '';

    const bodyChildren = hasLabelNode ? node.children.slice(1) : node.children;

    const cardClasses = ['card'];
    if (!hasLabel) cardClasses.push('card-no-title');
    if (!hasIcon) cardClasses.push('card-no-icon');
    if (extraClass) cardClasses.push(extraClass);

    const newChildren: any[] = [];

    // Header — synthetic aja (icon + title plain text), gak butuh markdown arbitrary
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
            properties: { className: ['card-icon'], dataIcon: attrs.icon },
            children: [],
          }],
        });
      }
      if (hasLabel) {
        headerHastChildren.push({
          type: 'element',
          tagName: 'div',
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

    // Body — biarin converter bawaan yang urus, apapun isinya
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

    let hName = 'div';
    let hProperties: Record<string, unknown> = { className: cardClasses };

    if (hasHref) {
      hName = 'a';
      hProperties = {
        className: [...cardClasses, 'card-link'],
        href: attrs.href,
        target: attrs.href.startsWith('http') ? '_blank' : '_self',
        rel: attrs.href.startsWith('http') ? 'noopener noreferrer' : undefined,
      };
    } else {
      hProperties = { className: cardClasses };
    }

    ctx.setProperty(node, 'data', {
      ...(node.data ?? {}),
      hName,
      hProperties,
    });
    ctx.setProperty(node, 'children', newChildren);
  },
});