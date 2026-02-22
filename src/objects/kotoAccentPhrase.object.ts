import type { Note } from "@tonejs/midi/dist/Note";
import type p5 from "p5";
import { clip, easeOutQuint } from "../utils/ease";
import { kotoMidi, midiHeader } from "../utils/midi";
import { defineObject } from "vi5";
import { currentFrameInfo } from "../utils/currentFrameInfo";
import { useRenderingContext } from "../utils/useRenderingContext";

const track =
  kotoMidi.toneJsMidi.tracks[
    kotoMidi.toneJsMidi.tracks.findIndex(
      (track) => track.name === "Accent Phrase",
    ) + 1
  ];

const getSections = () => {
  let lastSection: { notes: Note[]; apIndex: number } = {
    notes: [],
    apIndex: -2,
  };
  const sections: { notes: Note[]; apIndex: number }[] = [lastSection];
  for (const note of track.notes) {
    if (
      lastSection.notes.length > 0 &&
      note.ticks !==
        lastSection.notes[lastSection.notes.length - 1].ticks +
          lastSection.notes[lastSection.notes.length - 1].durationTicks
    ) {
      lastSection = {
        notes: [],
        apIndex: -2,
      };
      sections.push(lastSection);
    }

    lastSection.notes.push(note);
  }
  return sections;
};

const sections = getSections();

const width = 32;
const topMidi = 98;
const noteHeight = 1;
const keepDuration = 0.2;
const fadeOutDuration = 0.4;
export default defineObject({
  id: "koto-accent-phrase",
  label: "Koto Accent Phrase",
  parameters: {} as const,
  setup(ctx, p) {
    return ctx.createCanvas(width, noteHeight * 36);
  },
  draw(ctx, p) {
    p.clear();
    const frame = currentFrameInfo(ctx);
    const currentSection = sections.find(
      (section) =>
        midiHeader.ticksToMeasures(frame.ticks) >=
          midiHeader.ticksToMeasures(section.notes[0].ticks) &&
        (midiHeader.ticksToMeasures(frame.ticks) <
          midiHeader.ticksToMeasures(
            section.notes[section.notes.length - 1].ticks +
              section.notes[section.notes.length - 1].durationTicks,
          ) ||
          ctx.frameInfo.globalTime <
            midiHeader.ticksToSeconds(
              section.notes[section.notes.length - 1].ticks +
                section.notes[section.notes.length - 1].durationTicks,
            ) +
              fadeOutDuration),
    );

    if (!currentSection) return;

    const fadeOutProgress = clip(
      (ctx.frameInfo.globalTime -
        midiHeader.ticksToSeconds(
          currentSection.notes[currentSection.notes.length - 1].ticks +
            currentSection.notes[currentSection.notes.length - 1].durationTicks,
        ) -
        keepDuration) /
        (fadeOutDuration - keepDuration),
    );

    using _context = useRenderingContext(p);
    p.translate(p.width / 2, p.height * (1 / 8));

    const leftX = -width / 2;
    const rightX = +width / 2;
    p.fill(255);
    p.noStroke();
    const ticksStart = currentSection.notes[0].ticks;
    const ticksEnd =
      currentSection.notes[currentSection.notes.length - 1].ticks +
      currentSection.notes[currentSection.notes.length - 1].durationTicks;
    for (const note of currentSection.notes) {
      const noteLeftX = p.map(note.ticks, ticksStart, ticksEnd, leftX, rightX);
      const noteRightX = p.map(
        note.ticks + note.durationTicks,
        ticksStart,
        ticksEnd,
        leftX,
        rightX,
      );
      const noteTopY = (topMidi - note.midi) * noteHeight - 0.5;

      let brightness = 64;
      if (
        note.ticks <= frame.ticks &&
        frame.ticks <= note.ticks + note.durationTicks
      ) {
        brightness = 255;
      } else if (note.ticks < frame.ticks) {
        brightness = 200;
      }

      p.fill(255, brightness * (1 - fadeOutProgress));
      p.rect(
        Math.round(noteLeftX),
        noteTopY + noteHeight * easeOutQuint(fadeOutProgress),
        Math.round(noteRightX) - Math.round(noteLeftX),
        noteHeight,
      );
    }
  },
});
