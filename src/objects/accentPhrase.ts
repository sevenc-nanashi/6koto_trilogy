import type { Note } from "@tonejs/midi/dist/Note";
import type p5 from "p5";
import { defineObject } from "vi5";
import { currentFrameInfo } from "../utils/currentFrameInfo";
import { clip, easeOutQuint } from "../utils/ease";
import { midiHeader } from "../utils/midi";
import { useRenderingContext } from "../utils/useRenderingContext";

type AccentPhraseMidi = {
  toneJsMidi: {
    tracks: {
      name: string;
      notes: Note[];
    }[];
  };
};

type SplitContext = {
  currentNote: Note;
  previousNote: Note;
  sectionStartNote: Note;
};

type AccentPhraseOptions = {
  id: string;
  label: string;
  midi: AccentPhraseMidi;
  topMidi: number;
  shouldSplitSection: (context: SplitContext) => boolean;
};

const width = 64;
const noteHeight = 2;
const keepDuration = 0.2;
const fadeOutDuration = 0.4;

const getAccentPhraseTrack = (midi: AccentPhraseMidi) => {
  const accentPhraseTrackIndex = midi.toneJsMidi.tracks.findIndex(
    (track) => track.name === "Accent Phrase",
  );
  return midi.toneJsMidi.tracks[accentPhraseTrackIndex + 1]!;
};

const getSections = (
  notes: Note[],
  shouldSplitSection: AccentPhraseOptions["shouldSplitSection"],
) => {
  const sections: Note[][] = [];
  let currentSection: Note[] | undefined;

  for (const note of notes) {
    if (!currentSection || currentSection.length === 0) {
      currentSection = [note];
      sections.push(currentSection);
      continue;
    }

    const previousNote = currentSection[currentSection.length - 1];
    const sectionStartNote = currentSection[0];

    if (
      shouldSplitSection({
        currentNote: note,
        previousNote,
        sectionStartNote,
      })
    ) {
      currentSection = [note];
      sections.push(currentSection);
      continue;
    }

    currentSection.push(note);
  }

  return sections;
};

export const createAccentPhraseObject = ({
  id,
  label,
  midi,
  topMidi,
  shouldSplitSection,
}: AccentPhraseOptions) => {
  const track = getAccentPhraseTrack(midi);
  const sections = getSections(track.notes, shouldSplitSection);

  return defineObject({
    id,
    label,
    parameters: {} as const,
    setup(ctx, p) {
      return ctx.createCanvas(width, noteHeight * 36);
    },
    draw(ctx, p) {
      p.clear();
      p.resetMatrix();
      p.translate(0, 0.5);

      const frame = currentFrameInfo(ctx);
      const currentSection = sections.find(
        (section) =>
          midiHeader.ticksToMeasures(frame.ticks) >=
            midiHeader.ticksToMeasures(section[0].ticks) &&
          (midiHeader.ticksToMeasures(frame.ticks) <
            midiHeader.ticksToMeasures(
              section[section.length - 1].ticks +
                section[section.length - 1].durationTicks,
            ) ||
            ctx.frameInfo.globalTime <
              midiHeader.ticksToSeconds(
                section[section.length - 1].ticks +
                  section[section.length - 1].durationTicks,
              ) +
                fadeOutDuration),
      );

      if (!currentSection) return;

      const fadeOutProgress = clip(
        (ctx.frameInfo.globalTime -
          midiHeader.ticksToSeconds(
            currentSection[currentSection.length - 1].ticks +
              currentSection[currentSection.length - 1].durationTicks,
          ) -
          keepDuration) /
          (fadeOutDuration - keepDuration),
      );

      using _context = useRenderingContext(p);
      p.translate(p.width / 2, p.height * (1 / 8));

      const leftX = -width / 2;
      const rightX = width / 2;
      p.fill(255);
      p.noStroke();

      const ticksStart = currentSection[0].ticks;
      const ticksEnd =
        currentSection[currentSection.length - 1].ticks +
        currentSection[currentSection.length - 1].durationTicks;

      for (const note of currentSection) {
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
};
