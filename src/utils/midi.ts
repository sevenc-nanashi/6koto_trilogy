export * as aoMidi from "../assets/20260208_6oclock_ao.mid?mid";
export * as akaMidi from "../assets/20260215_6oclock_aka.mid?mid";

import { toneJsMidi as aoToneJsMidi } from "../assets/20260208_6oclock_ao.mid?mid";
import { toneJsMidi as akaToneJsMidi } from "../assets/20260215_6oclock_aka.mid?mid";

export const midiHeader = aoToneJsMidi.header;
export const drumsMidiNumbers = {
  kick: 36,
  snare: 37,
  closedHiHat: 38,
};
export const aoDrumsMidiTrack = aoToneJsMidi.tracks.find(
  (t) => t.name === "Sitala",
)!;
export const akaDrumsMidiTrack = akaToneJsMidi.tracks.find(
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
export type DrumPattern = {
  ticks: number;
  time: number;
  kick: boolean;
  snare: boolean;
  closedHiHat: boolean;
  subCymbal: boolean;
  cymbal: boolean;
};

const defaultPattern: DrumPattern = {
  ticks: 0,
  time: 0,
  kick: false,
  snare: false,
  closedHiHat: false,
  subCymbal: false,
  cymbal: false,
};
function creaetDrumPatterns(track: typeof aoDrumsMidiTrack): DrumPattern[] {
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
    }
  }
  for (const note of akaSubCymbalMidiTrack.notes) {
    if (!map.has(note.ticks)) {
      const pattern = {
        ...defaultPattern,
        ticks: note.ticks,
        time: note.time,
      };
      map.set(note.ticks, pattern);
    }
    const pattern = map.get(note.ticks)!;
    pattern.subCymbal = true;
  }
  for (const note of akaCymbalMidiTrack.notes) {
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
  return patterns;
}

export const aoDrumsMidiPatterns = creaetDrumPatterns(aoDrumsMidiTrack);
export const akaDrumsMidiPatterns = creaetDrumPatterns(akaDrumsMidiTrack);
