import p5 from "p5";
import { defineObject, numberStep } from "vi5";
import { clip, easeOutQuint, unlerp } from "../utils/ease";
import { currentFrameInfo } from "../utils/currentFrameInfo";
import { drumsMidiNumbers, aoDrumsMidiTrack, aoMidi } from "../utils/midi";
import { useRenderingContext } from "../utils/useRenderingContext";

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
  id: "ao-drum-stack",
  label: "Ao Drum Stack",
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
    const lastKick = aoDrumsMidiTrack.notes.findLast(
      (note) =>
        note.midi === drumsMidiNumbers.kick &&
        note.time <= ctx.frameInfo.globalTime,
    );
    const kickElapsed = lastKick
      ? frame.measure - aoMidi.toneJsMidi.header.ticksToMeasures(lastKick.ticks)
      : Infinity;
    const lastSnare = aoDrumsMidiTrack.notes.findLast(
      (note) =>
        note.midi === drumsMidiNumbers.snare &&
        note.time <= ctx.frameInfo.globalTime,
    );
    const expandedRadius =
      baseSize / 2 +
      (1 - easeOutQuint(clip(kickElapsed * 4))) * expand * params.activate;

    const snareElapsed = lastSnare
      ? frame.measure -
        aoMidi.toneJsMidi.header.ticksToMeasures(lastSnare.ticks)
      : Infinity;
    const snareRadius =
      baseSize / 2 -
      easeOutQuint(clip(snareElapsed * 4)) * snareExpand * params.activate;

    drawRotatedSquare(p, expandedRadius, params.circleProgress);
    {
      using _ = useRenderingContext(p);
      p.stroke(
        255,
        snareElapsed < 0.25
          ? 255 * (1 - easeOutQuint(clip(snareElapsed * 2))) * params.activate
          : 0,
      );
      drawRotatedSquare(p, snareRadius, params.circleProgress);
    }
  },
});
