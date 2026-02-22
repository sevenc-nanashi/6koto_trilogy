import { defineObject } from "vi5";
import { akaDrumsMidiPatterns, aoDrumsMidiPatterns } from "../utils/midi";
import { drawDrumStack, height, width } from "./drumStack";

export default defineObject({
  id: "ao-drum-stack",
  label: "Ao Drum Stack",
  parameters: {
    color: {
      type: "color",
      label: "Color",
      default: {
        r: 255,
        g: 255,
        b: 255,
        a: 255,
      },
    },
  } as const,
  setup(ctx, p, params) {
    return ctx.createCanvas(width, height);
  },
  draw(ctx, p, params) {
    drawDrumStack(p, ctx, aoDrumsMidiPatterns, [
      params.color.r,
      params.color.g,
      params.color.b,
    ]);
  },
});
