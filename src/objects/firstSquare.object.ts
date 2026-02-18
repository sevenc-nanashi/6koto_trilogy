import { defineObject, numberStep } from "vi5";
import { clip, easeOutQuint, unlerp } from "../utils/ease";
import { currentFrameInfo } from "../utils/currentFrameInfo";
import { drumsMidi, drumsMidiNumbers, mainMidi } from "../utils/midi";

const baseSize = 200;
const expand = 20;
export default defineObject({
  id: "first-square",
  label: "First Square",
  parameters: {
    circleProgress: {
      type: "number",
      label: "Circle Progress",
      default: 0,
      min: 0,
      max: 1,
      step: numberStep["0.001"],
    },
    activate: {
      type: "number",
      label: "Activate",
      default: 0,
      min: 0,
      max: 1,
      step: numberStep["1"],
    },
  } as const,
  setup(ctx, p, params) {
    return ctx.createCanvas(baseSize + expand * 2, baseSize + expand * 2);
  },
  draw(ctx, p, params) {
    p.clear();
    p.resetMatrix();
    p.noSmooth();
    p.stroke(255);
    p.translate(baseSize / 2 + expand, baseSize / 2 + expand);
    const frame = currentFrameInfo(ctx);
    const lastKick = drumsMidi.notes.findLast(
      (note) =>
        note.midi === drumsMidiNumbers.kick &&
        note.time <= ctx.frameInfo.currentTime,
    );
    const kickElapsed = lastKick
      ? frame.measure -
        mainMidi.toneJsMidi.header.ticksToMeasures(lastKick.ticks)
      : Infinity;
    const radius =
      baseSize / 2 +
      (1 - easeOutQuint(clip(kickElapsed * 4))) * expand * params.activate;

    const topRightProgress = clip(unlerp(0, 0.25, params.circleProgress));
    const bottomRightProgress = clip(unlerp(0.25, 0.5, params.circleProgress));
    const bottomLeftProgress = clip(unlerp(0.5, 0.75, params.circleProgress));
    const topLeftProgress = clip(unlerp(0.75, 1, params.circleProgress));
    p.line(
      0,
      -radius,
      radius * topRightProgress,
      -radius * (1 - topRightProgress),
    );
    p.line(
      radius,
      0,
      radius * (1 - bottomRightProgress),
      radius * bottomRightProgress,
    );
    p.line(
      0,
      radius,
      -radius * bottomLeftProgress,
      radius * (1 - bottomLeftProgress),
    );
    p.line(
      -radius,
      0,
      -radius * (1 - topLeftProgress),
      -radius * topLeftProgress,
    );
  },
});
