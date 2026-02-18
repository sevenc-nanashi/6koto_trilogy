/// <reference types="vite/client" />

declare module "*.mid?mid" {
  import { Midi } from "@tonejs/midi";
  import { MidiData } from "midi-file";

  const toneJsMidi: Midi;
  const rawMidi: MidiData;
  export { toneJsMidi, rawMidi };
  export default toneJsMidi;
}
