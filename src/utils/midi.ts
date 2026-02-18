export * as mainMidi from "../assets/20260208_6oclock_ao.mid?mid";

import { toneJsMidi } from "../assets/20260208_6oclock_ao.mid?mid";

export const drumsMidi = toneJsMidi.tracks.find((t) => t.name === "Sitala")!;
export const drumsMidiNumbers = {
  kick: 36,
};
