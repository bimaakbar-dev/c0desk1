// plugins/satteri-table.ts
import { defineHastPlugin } from 'satteri'
import type { Element } from 'hast'

export const satteriTable = defineHastPlugin({
  name: 'satteri-table',
  element: {
    filter: ['table'],
    visit(node: Element, ctx) {
      const parent = ctx.parent(node)
      if (!parent || !('children' in parent)) return

      const index = ctx.indexOf(node)
      if (index === undefined) return

      const wrapper: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrapper'] },
        children: [node],
      }

      const children = [...parent.children]
      children[index] = wrapper
      ctx.setProperty(parent, 'children', children)
    },
  },
})
