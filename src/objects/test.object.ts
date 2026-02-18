import { defineObject } from "vi5";

export default defineObject({
  id: "test-object",
  label: "6o Test Object",
  parameters: {},
  setup(ctx, p, params) {
    return ctx.createCanvas(200, 200);
  },
  draw(ctx, p, params) {
    p.clear();
    p.resetMatrix();
    p.noSmooth();
    p.stroke(255);
    p.translate(100, 100);
    p.line(0, -100, 100, 0);
    p.line(0, -100, -100, 0);
    p.line(0, 100, 100, 0);
    p.line(0, 100, -100, 0);
  },
});
