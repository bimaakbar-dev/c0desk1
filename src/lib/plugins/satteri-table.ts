import { defineMdastPlugin } from "satteri";

export const tableWrapper = defineMdastPlugin({
  name: "table-wrapper",
  table(node, ctx) {
    const wrapper: any = {
      type: "element",
      tagName: "div",
      properties: {
        className: ["table-wrapper"],
      },
      children: [node],
    };
    return wrapper;
  },
});