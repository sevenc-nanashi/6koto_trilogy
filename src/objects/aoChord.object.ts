import { defineObject, numberStep } from "vi5";
import chordUrl from "../assets/achord.png";
import p5 from "p5";
import { currentFrameInfo } from "../utils/currentFrameInfo";
import { useRenderingContext } from "../utils/useRenderingContext";

let chord: p5.Image;

export default defineObject({
  id: "ao-chords",
  label: "Aoi Chords",
  parameters: {
    index: {
      type: "number",
      label: "Index",
      default: 0,
      max: 32,
      min: 0,
      step: numberStep["1"],
    },
  } as const,
  async setup(ctx, p, params) {
    chord = await p.loadImage(chordUrl);
    return ctx.createCanvas(chord.width, 160);
  },
  draw(ctx, p, params) {
    const frame = currentFrameInfo(ctx);
    p.clear();
    p.resetMatrix();
    p.noSmooth();

    p.image(chord, 0, -params.index * 160 - 60);

    // 88 | 250 | 38 | 250

    const speed = 0.5;
    const offset = 0.5;
    const measureProgress = (frame.measure * speed + offset) % 1;
    const isRight = (frame.measure * speed + offset) % 2 < 1;

    p.noStroke();
    p.fill(255);
    p.rect(88 + (isRight ? 250 + 38 : 0) + 250 * measureProgress, 60, 2, 80);
  },
});
