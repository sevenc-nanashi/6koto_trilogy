import { Vi5Context } from "vi5";
import midi from "../assets/20260208_6oclock_ao.mid?mid";

export function currentFrameInfo(ctx: Vi5Context): {
  measure: number;
  ticks: number;
} {
  const ticks = midi.header.secondsToTicks(ctx.frameInfo.globalTime);
  const measure = midi.header.ticksToMeasures(ticks);
  return { measure, ticks };
}
