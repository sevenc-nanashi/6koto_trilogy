import { aoMidi } from "../utils/midi";
import { createAccentPhraseObject } from "./accentPhrase";

export default createAccentPhraseObject({
  id: "aoi-accent-phrase",
  label: "Aoi Accent Phrase",
  midi: aoMidi,
  topMidi: 96,
  shouldSplitSection({ currentNote, previousNote }) {
    return (
      currentNote.ticks >
      previousNote.ticks + previousNote.durationTicks
    );
  },
});
