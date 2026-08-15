// plugins/satteri-table.ts
import { defineHastPlugin } from 'satteri'
import type { Element } from 'hast'

export const satteriTable = defineHastPlugin({
  name: 'satteri-table',
  element: {
    filter: ['table'],
    visit(node: Element, ctx) {
      ctx.replaceNode(node, {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrapper'] },
        children: [node],
      })
    },
  },
})
