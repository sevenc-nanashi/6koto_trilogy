import { kotoMidi } from "../utils/midi";
import { createAccentPhraseObject } from "./accentPhrase";

export default createAccentPhraseObject({
  id: "koto-accent-phrase",
  label: "Koto Accent Phrase",
  midi: kotoMidi,
  topMidi: 98,
  shouldSplitSection({ currentNote, previousNote }) {
    return (
      currentNote.ticks !==
      previousNote.ticks + previousNote.durationTicks
    );
  },
});
