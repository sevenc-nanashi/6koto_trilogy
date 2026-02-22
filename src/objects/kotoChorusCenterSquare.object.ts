import p5 from "p5";
import { defineObject, numberStep } from "vi5";
import { clip, easeOutQuint, unlerp } from "../utils/ease";
import { currentFrameInfo } from "../utils/currentFrameInfo";
import {
  drumsMidiNumbers,
  kotoDrumsMidiTrack,
  kotoMidi,
  DrumPattern,
  kotoDrumsMidiPatterns,
} from "../utils/midi";
import { useRenderingContext } from "../utils/useRenderingContext";
import { drawFilledRotatedSquare, drawRotatedSquare } from "../utils/shape";

const baseSize = 200;
const expand = 20;
const snareExpand = 20;
const cymbalSize = baseSize * 0.6;
export default defineObject({
  id: "koto-chorus-center-square",
  label: "Koto Chorus Center Square",
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
    const lastKick = kotoDrumsMidiTrack.notes.findLast(
      (note) =>
        note.midi === drumsMidiNumbers.kick &&
        note.time <= ctx.frameInfo.globalTime,
    );
    const kickElapsed = lastKick
      ? frame.measure -
        kotoMidi.toneJsMidi.header.ticksToMeasures(lastKick.ticks)
      : Infinity;
    const lastSnare = kotoDrumsMidiTrack.notes.findLast(
      (note) =>
        note.midi === drumsMidiNumbers.snare &&
        note.time <= ctx.frameInfo.globalTime,
    );
    const expandedRadius =
      baseSize / 2 +
      (1 - easeOutQuint(clip(kickElapsed * 4))) * expand * params.activate;

    const snareElapsed = lastSnare
      ? frame.measure -
        kotoMidi.toneJsMidi.header.ticksToMeasures(lastSnare.ticks)
      : Infinity;
    const snareRadius =
      baseSize / 2 -
      easeOutQuint(clip(snareElapsed * 4)) * snareExpand * params.activate;

    const lastCymbal: DrumPattern | undefined = kotoDrumsMidiPatterns.findLast(
      (pattern) =>
        (pattern.cymbal || pattern.subCymbal) &&
        pattern.time <= ctx.frameInfo.globalTime,
    );

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

    if (lastCymbal) {
      const elapsed =
        frame.measure -
        kotoMidi.toneJsMidi.header.ticksToMeasures(lastCymbal.ticks);
      const progress = clip(unlerp(0, 2, elapsed));
      if (lastCymbal.cymbal) {
        p.noStroke();
        p.fill(255, 255 * (1 - easeOutQuint(progress)) * params.activate);
        drawFilledRotatedSquare(p, cymbalSize / 2);
      } else if (lastCymbal.subCymbal) {
        p.stroke(255, 255 * (1 - easeOutQuint(progress)) * params.activate);
        drawRotatedSquare(p, cymbalSize / 2);
      }
    }
  },
});
