import p5 from "p5";
import { defineObject, numberStep } from "vi5";
import { clip, easeOutQuint, unlerp } from "../utils/ease";
import { currentFrameInfo } from "../utils/currentFrameInfo";
import {
  drumsMidiNumbers,
  aoDrumsMidiTrack,
  aoMidi,
  akaDrumsMidiPatterns,
} from "../utils/midi";
import { useRenderingContext } from "../utils/useRenderingContext";
import { drawDrumStack, height, width } from "./drumStack";

function drawRotatedSquare(p: p5, size: number, progress: number) {
  const topRightProgress = clip(unlerp(0, 0.25, progress));
  const bottomRightProgress = clip(unlerp(0.25, 0.5, progress));
  const bottomLeftProgress = clip(unlerp(0.5, 0.75, progress));
  const topLeftProgress = clip(unlerp(0.75, 1, progress));
  p.line(0, -size, size * topRightProgress, -size * (1 - topRightProgress));
  p.line(size, 0, size * (1 - bottomRightProgress), size * bottomRightProgress);
  p.line(0, size, -size * bottomLeftProgress, size * (1 - bottomLeftProgress));
  p.line(-size, 0, -size * (1 - topLeftProgress), -size * topLeftProgress);
}

const baseSize = 200;
const expand = 20;
const snareExpand = 20;
export default defineObject({
  id: "aka-drum-stack",
  label: "Aka Drum Stack",
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
    p.clear();
    p.resetMatrix();
    p.noSmooth();
    p.stroke(255);
    p.translate(baseSize / 2 + expand, baseSize / 2 + expand);

    drawDrumStack(p, ctx, akaDrumsMidiPatterns, [
      params.color.r,
      params.color.g,
      params.color.b,
    ]);
  },
});
