import { defineObject, numberStep } from "vi5";
import aoiBodyUrl from "../assets/aoi_body.png";
import aoiBody2Url from "../assets/aoi_body_2.png";
import aoiFootUrl from "../assets/aoi_foot.png";
import aoiEyeClosedUrl from "../assets/aoi_eye_closed.png";
import aoiEyeOpenUrl from "../assets/aoi_eye_open.png";
import aoiHeadUrl from "../assets/aoi_head.png";
import p5 from "p5";
import { currentFrameInfo } from "../utils/currentFrameInfo";
import { useRenderingContext } from "../utils/useRenderingContext";
import lab from "../assets/ao.lab?raw";

let aoiBody: p5.Image;
let aoiBody2: p5.Image;
let aoiFoot: p5.Image;
let aoiEyeClosed: p5.Image;
let aoiEyeOpen: p5.Image;
let aoiHead: p5.Image;

const aoiMouthUrls = import.meta.glob<string>("../assets/aoi_mouth_*.png", {
  eager: true,
  import: "default",
  query: "?url",
});
const aoiMouths: Record<string, p5.Image> = {};

const labEntries = lab
  .split("\n")
  .map((line) => line.trim().split(" ") as [string, string, string])
  .map(([start100ns, end100ns, label]) => ({
    start: parseInt(start100ns) / 1e7,
    end: parseInt(end100ns) / 1e7,
    label,
  }));

export default defineObject({
  id: "aoi-body",
  label: "SwingAoi",
  parameters: {
    swing: {
      type: "number",
      label: "Swing",
      default: 0,
      max: 1,
      min: 0,
      step: numberStep["1"],
    },
    swingInterval: {
      type: "number",
      label: "Swing Interval",
      default: 0,
      min: 0,
      max: 1,
      step: numberStep["0.001"],
    },
    swingOverride: {
      type: "number",
      label: "Swing Override",
      default: -1,
      min: -1,
      max: 1,
      step: numberStep["1"],
    },
    bodySwing: {
      type: "number",
      label: "Body Swing",
      default: -1,
      min: -1,
      max: 1,
      step: numberStep["1"],
    },
    eye: {
      type: "number",
      label: "Eye Open",
      default: 0,
      min: 0,
      max: 1,
      step: numberStep["1"],
    },
  } as const,
  async setup(ctx, p, params) {
    [aoiBody, aoiBody2, aoiFoot, aoiEyeClosed, aoiEyeOpen, aoiHead] =
      await Promise.all([
        p.loadImage(aoiBodyUrl),
        p.loadImage(aoiBody2Url),
        p.loadImage(aoiFootUrl),
        p.loadImage(aoiEyeClosedUrl),
        p.loadImage(aoiEyeOpenUrl),
        p.loadImage(aoiHeadUrl),
      ]);
    for (const [key, url] of Object.entries(aoiMouthUrls)) {
      const match = key.match(/aoi_mouth_(.)\.png/);
      if (match) {
        aoiMouths[match[1]] = await p.loadImage(url);
      }
    }
    return ctx.createCanvas(30, 60);
  },
  draw(ctx, p, params) {
    const frame = currentFrameInfo(ctx);
    p.clear();
    p.resetMatrix();
    p.noSmooth();
    p.image(aoiFoot, 0, 0);

    {
      using _ = useRenderingContext(p);
      const bodyShift = (
        params.swingOverride !== -1
          ? params.swingOverride === 1
          : (frame.measure * 4) % 1 >= params.swingInterval
      )
        ? 0
        : params.swing;
      p.translate(0, bodyShift);
      const bodyImage =
        params.bodySwing === -1
          ? ((frame.measure * 4) % 1) - params.swingInterval / 4 >=
            params.swingInterval
            ? aoiBody
            : aoiBody2
          : params.bodySwing === 1
            ? aoiBody2
            : aoiBody;
      p.image(bodyImage, 0, 0);
      p.image(aoiHead, 0, 0);
      p.image(params.eye >= 0.5 ? aoiEyeOpen : aoiEyeClosed, 0, 0);
      const labEntry = labEntries.find(
        (entry) =>
          ctx.frameInfo.globalTime >= entry.start &&
          ctx.frameInfo.globalTime < entry.end,
      );
      if (labEntry && aoiMouths[labEntry.label]) {
        const mouth = aoiMouths[labEntry.label];
        p.image(mouth, 0, 0);
      } else {
        p.image(aoiMouths["n"]!, 0, 0);
      }
    }
  },
});
