export * as aoMidi from "../assets/20260208_6oclock_ao.mid?mid";
export * as akaMidi from "../assets/20260215_6oclock_aka.mid?mid";
export * as kotoMidi from "../assets/20260204_6oclock_koto.mid?mid";

import { toneJsMidi as aoToneJsMidi } from "../assets/20260208_6oclock_ao.mid?mid";
import { toneJsMidi as akaToneJsMidi } from "../assets/20260215_6oclock_aka.mid?mid";
import { toneJsMidi as kotoToneJsMidi } from "../assets/20260204_6oclock_koto.mid?mid";

export const midiHeader = aoToneJsMidi.header;
export const drumsMidiNumbers = {
  kick: 36,
  snare: 37,
  closedHiHat: 38,
  openHihat: 39,
};
export const aoDrumsMidiTrack = aoToneJsMidi.tracks.find(
  (t) => t.name === "Sitala",
)!;
export const akaDrumsMidiTrack = akaToneJsMidi.tracks.find(
  (t) => t.name === "Sitala",
)!;
export const kotoDrumsMidiTrack = kotoToneJsMidi.tracks.find(
  (t) => t.name === "Sitala",
)!;
export const akaSubCymbalMidiTrack =
  akaToneJsMidi.tracks[
    akaToneJsMidi.tracks.findIndex((t) => t.name === "Sitala") - 2
  ]!;
export const akaCymbalMidiTrack =
  akaToneJsMidi.tracks[
    akaToneJsMidi.tracks.findIndex((t) => t.name === "Sitala") - 1
  ]!;
export const aoSubCymbalMidiTrack =
  aoToneJsMidi.tracks[
    aoToneJsMidi.tracks.findIndex((t) => t.name === "Sitala") - 2
  ]!;
export const aoCymbalMidiTrack =
  aoToneJsMidi.tracks[
    aoToneJsMidi.tracks.findIndex((t) => t.name === "Sitala") - 1
  ]!;
export const kotoSubCymbalMidiTrack =
  kotoToneJsMidi.tracks[
    kotoToneJsMidi.tracks.findIndex((t) => t.name === "Sitala") - 3
  ]!;
export const kotoCymbalMidiTrack =
  kotoToneJsMidi.tracks[
    kotoToneJsMidi.tracks.findIndex((t) => t.name === "Sitala") - 2
  ]!;
export type DrumPattern = {
  ticks: number;
  time: number;
  kick: boolean;
  snare: boolean;
  closedHiHat: boolean;
  openHiHat: boolean;
  subCymbal: boolean;
  cymbal: boolean;
};

const defaultPattern: DrumPattern = {
  ticks: 0,
  time: 0,
  kick: false,
  snare: false,
  closedHiHat: false,
  openHiHat: false,
  subCymbal: false,
  cymbal: false,
};
function createDrumPatterns(
  track: typeof aoDrumsMidiTrack,
  subCymbalTrack: typeof akaSubCymbalMidiTrack,
  cymbalTrack: typeof akaCymbalMidiTrack,
): DrumPattern[] {
  const patterns: DrumPattern[] = [];
  const map = new Map<number, DrumPattern>();
  for (const note of track.notes) {
    if (!map.has(note.ticks)) {
      const pattern = {
        ...defaultPattern,
        ticks: note.ticks,
        time: note.time,
      };
      map.set(note.ticks, pattern);
    }
    const pattern = map.get(note.ticks)!;
    if (note.midi === drumsMidiNumbers.kick) {
      pattern.kick = true;
    } else if (note.midi === drumsMidiNumbers.snare) {
      pattern.snare = true;
    } else if (note.midi === drumsMidiNumbers.closedHiHat) {
      pattern.closedHiHat = true;
    } else if (note.midi === drumsMidiNumbers.openHihat) {
      pattern.openHiHat = true;
    }
  }
  for (const note of subCymbalTrack.notes) {
    if (!map.has(note.ticks)) {
      const pattern = {
        ...defaultPattern,
        ticks: note.ticks,
        time: note.time,
      };
      map.set(note.ticks, pattern);
    }
    const pattern = map.get(note.ticks)!;
    if (note.midi === 38) {
      pattern.closedHiHat = true;
    } else {
      pattern.subCymbal = true;
    }
  }
  for (const note of cymbalTrack.notes) {
    if (!map.has(note.ticks)) {
      const pattern = {
        ...defaultPattern,
        ticks: note.ticks,
        time: note.time,
      };
      map.set(note.ticks, pattern);
    }
    const pattern = map.get(note.ticks)!;
    pattern.cymbal = true;
  }

  for (const pattern of map.values()) {
    patterns.push(pattern);
  }
  patterns.sort((a, b) => a.ticks - b.ticks);
  return patterns;
}

export const aoDrumsMidiPatterns = createDrumPatterns(
  aoDrumsMidiTrack,
  aoSubCymbalMidiTrack,
  aoCymbalMidiTrack,
);
export const akaDrumsMidiPatterns = createDrumPatterns(
  akaDrumsMidiTrack,
  akaSubCymbalMidiTrack,
  akaCymbalMidiTrack,
);
export const kotoDrumsMidiPatterns = createDrumPatterns(
  kotoDrumsMidiTrack,
  kotoSubCymbalMidiTrack,
  kotoCymbalMidiTrack,
);
