import { akaMidi, midiHeader } from "../utils/midi";
import { createAccentPhraseObject } from "./accentPhrase";

export default createAccentPhraseObject({
  id: "aka-accent-phrase",
  label: "Aka Accent Phrase",
  midi: akaMidi,
  topMidi: 96,
  shouldSplitSection({ currentNote, sectionStartNote }) {
    return (
      midiHeader.ticksToMeasures(currentNote.ticks) -
        midiHeader.ticksToMeasures(sectionStartNote.ticks) >=
      1
    );
  },
});
