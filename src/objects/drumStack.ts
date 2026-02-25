import p5 from "p5";
import { Vi5Context } from "vi5";
import { DrumPattern, midiHeader } from "../utils/midi";
import { currentFrameInfo } from "../utils/currentFrameInfo";
import { drawFilledRotatedSquare, drawRotatedSquare } from "../utils/shape";
import { useRenderingContext } from "../utils/useRenderingContext";
import { clip, easeOutQuint, lerp } from "../utils/ease";

export const height = 270;
export const size = 18;
const padding = 10;
export const width = size * 2 + padding * 2;
const beatsPerMeasure = 8;
const slicePadding = 1;
const lastMeasureOpacity = 0.45;
type RgbColor = readonly [number, number, number];
const cellSubdivisionCandidates = [1, 2, 3, 4] as const; // 8th / 12th / 16th
const quantizeTolerance = 1e-4;

function drawDrumPattern(
  p: p5,
  pattern: DrumPattern,
  progress: number,
  color: RgbColor,
  opacity = 1,
  scale = 1,
) {
  using _ = useRenderingContext(p);
  p.scale(scale);
  p.stroke(color[0], color[1], color[2], 255 * opacity);
  p.fill(color[0], color[1], color[2], 255 * opacity);
  if (pattern.closedHiHat) {
    using _stroke = useRenderingContext(p);
    p.stroke(color[0], color[1], color[2], 255 * opacity * progress);
    drawRotatedSquare(p, size / 2);
  }
  if (pattern.openHiHat) {
    using _stroke = useRenderingContext(p);
    p.translate(size / 2 - 2, size / 2 - 2);
    p.fill(color[0], color[1], color[2], 255 * opacity * progress);
    drawFilledRotatedSquare(p, 1);
  }

  const scaledSize = lerp(size / 2 - 4, size / 2, progress);
  if (pattern.kick && pattern.snare) {
    drawRotatedSquare(p, scaledSize - 3);
    drawFilledRotatedSquare(p, scaledSize - 5);
  } else if (pattern.kick) {
    drawFilledRotatedSquare(p, scaledSize - 3);
  } else if (pattern.snare) {
    drawRotatedSquare(p, scaledSize - 3);
  }
}

export function drawDrumStack(
  p: p5,
  ctx: Vi5Context,
  patterns: DrumPattern[],
  color: RgbColor = [255, 255, 255],
) {
  p.clear();
  p.resetMatrix();
  p.stroke(255);
  p.strokeWeight(0.5);
  p.noSmooth();
  const frame = currentFrameInfo(ctx);
  const initialTime =
    ctx.frameInfo.globalTime - ctx.frameInfo.currentTime - 0.05;

  const currentMeasure = Math.floor(frame.measure);
  const lastMeasure = currentMeasure - 1;
  const currentMeasurePatterns = patterns.filter(
    (pattern) =>
      pattern.time >= initialTime &&
      Math.floor(midiHeader.ticksToMeasures(pattern.ticks)) === currentMeasure,
  );
  const lastMeasurePatterns = patterns.filter(
    (pattern) =>
      pattern.time >= initialTime &&
      Math.floor(midiHeader.ticksToMeasures(pattern.ticks)) === lastMeasure,
  );

  const visiblePatterns = [...lastMeasurePatterns, ...currentMeasurePatterns];
  const beatCells = new Map<
    string,
    { beatInMeasure: number; measureOffset: number; patterns: DrumPattern[] }
  >();
  for (const pattern of visiblePatterns) {
    const measure = midiHeader.ticksToMeasures(pattern.ticks);
    const measureFloor = Math.floor(measure);
    const beatInMeasure = Math.floor(
      (measure - measureFloor + Number.EPSILON) * beatsPerMeasure,
    );
    const measureOffset = measureFloor - currentMeasure;
    const key = `${measureOffset}:${beatInMeasure}`;
    if (!beatCells.has(key)) {
      beatCells.set(key, { beatInMeasure, measureOffset, patterns: [] });
    }
    beatCells.get(key)!.patterns.push(pattern);
  }

  const measureColumnOffset =
    (size + padding) * easeOutQuint(clip((frame.measure % 1) * 4));

  const sortedCells = [...beatCells.values()].toSorted(
    (a, b) =>
      a.beatInMeasure - b.beatInMeasure || a.measureOffset - b.measureOffset,
  );
  for (const cell of sortedCells) {
    const sortedPatterns = cell.patterns.toSorted((a, b) => a.ticks - b.ticks);
    const bestGrid = getBestCellGrid(sortedPatterns, cell.beatInMeasure);
    const sliceCount = bestGrid?.subdivisions ?? sortedPatterns.length;
    const isDivided = sliceCount > 1;
    for (const [index, pattern] of sortedPatterns.entries()) {
      const progress = clip(
        (frame.measure - midiHeader.ticksToMeasures(pattern.ticks)) * 16,
      );
      if (progress <= 0) {
        continue;
      }

      using _ = useRenderingContext(p);
      const xOffset = cell.measureOffset * measureColumnOffset;
      const opacity = cell.measureOffset === -1 ? lastMeasureOpacity : 1;
      p.translate(
        Math.floor(ctx.mainCanvas.width - size / 2 + xOffset) - 0.5,
        Math.floor(
          ctx.mainCanvas.height -
            cell.beatInMeasure * (size + padding) -
            size / 2 -
            padding,
        ) + 0.5,
      );
      const sliceIndex = bestGrid?.slots[index] ?? index;
      clipToSlice(p, sliceIndex, sliceCount, size / 2 + 2);
      drawDrumPattern(
        p,
        pattern,
        progress,
        isDivided ? color : [255, 255, 255],
        opacity,
      );
    }
  }
}

function getBestCellGrid(
  patterns: DrumPattern[],
  beatInMeasure: number,
): { subdivisions: number; slots: number[]; error: number } | undefined {
  const candidates = cellSubdivisionCandidates
    .map((subdivisions) => {
      const fit = getCellSlots(patterns, beatInMeasure, subdivisions);
      if (fit === undefined) {
        return undefined;
      }
      return { subdivisions, ...fit };
    })
    .filter(
      (
        candidate,
      ): candidate is {
        subdivisions: 1 | 2 | 3 | 4;
        slots: number[];
        error: number;
      } => candidate !== undefined,
    );

  if (candidates.length === 0) {
    return undefined;
  }

  return candidates.toSorted(
    (a, b) => a.error - b.error || a.subdivisions - b.subdivisions,
  )[0];
}

function getCellSlots(
  patterns: DrumPattern[],
  beatInMeasure: number,
  subdivisions: number,
): { slots: number[]; error: number } | undefined {
  const slots: number[] = [];
  const seen = new Set<number>();
  let totalError = 0;

  for (const pattern of patterns) {
    const measure = midiHeader.ticksToMeasures(pattern.ticks);
    const measureFloor = Math.floor(measure);
    const beatProgressInCell =
      (measure - measureFloor) * beatsPerMeasure - beatInMeasure;
    const clamped = Math.min(1, Math.max(0, beatProgressInCell));
    const raw = clamped * subdivisions;
    const rounded = Math.round(raw);
    const error = Math.abs(raw - rounded);
    if (error > quantizeTolerance) {
      return undefined;
    }

    const slot = rounded >= subdivisions ? subdivisions - 1 : rounded;
    if (seen.has(slot)) {
      return undefined;
    }
    seen.add(slot);
    slots.push(slot);
    totalError += error;
  }

  return { slots, error: totalError };
}

function clipToSlice(p: p5, index: number, count: number, halfSize: number) {
  if (count <= 1) {
    return;
  }
  if (count === 4) {
    clipToGridSlice(p, index, halfSize);
    return;
  }

  const fullSize = halfSize * 2;
  const sliceHeight = fullSize / count;
  const reversedIndex = count - 1 - index;
  const top = -halfSize + sliceHeight * reversedIndex + slicePadding / 2;
  const bottom =
    -halfSize + sliceHeight * (reversedIndex + 1) - slicePadding / 2;
  if (bottom <= top) {
    return;
  }

  const context = p.drawingContext as CanvasRenderingContext2D;
  context.beginPath();
  context.rect(-halfSize, top, fullSize, bottom - top);
  context.closePath();
  context.clip();
}

function clipToGridSlice(p: p5, index: number, halfSize: number) {
  const col = index % 2;
  const row = 1 - (Math.floor(index / 2) % 2);
  const cellSize = halfSize;
  const left = -halfSize + col * cellSize + slicePadding / 2;
  const top = -halfSize + row * cellSize + slicePadding / 2;
  const sizeWithPadding = cellSize - slicePadding;
  if (sizeWithPadding <= 0) {
    return;
  }

  const context = p.drawingContext as CanvasRenderingContext2D;
  context.beginPath();
  context.rect(left, top, sizeWithPadding, sizeWithPadding);
  context.closePath();
  context.clip();
}
