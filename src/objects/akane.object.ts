import { defineObject, numberStep } from "vi5";
import akaneBodyUrl from "../assets/akane_body.png";
import akaneBody2Url from "../assets/akane_body_2.png";
import akaneFootUrl from "../assets/akane_foot.png";
import akaneEyeClosedUrl from "../assets/aoi_eye_closed.png";
import akaneEyeOpenUrl from "../assets/aoi_eye_open.png";
import akaneHeadUrl from "../assets/akane_head.png";
import p5 from "p5";
import { currentFrameInfo } from "../utils/currentFrameInfo";
import { useRenderingContext } from "../utils/useRenderingContext";
import lab from "../assets/aka.lab?raw";

let akaneBody: p5.Image;
let akaneBody2: p5.Image;
let akaneFoot: p5.Image;
let akaneEyeClosed: p5.Image;
let akaneEyeOpen: p5.Image;
let akaneHead: p5.Image;

const akaneMouthUrls = import.meta.glob<string>("../assets/aoi_mouth_*.png", {
  eager: true,
  import: "default",
  query: "?url",
});
const akaneMouths: Record<string, p5.Image> = {};

const labEntries = lab
  .split("\n")
  .map((line) => line.trim().split(" ") as [string, string, string])
  .map(([start100ns, end100ns, label]) => ({
    start: parseInt(start100ns) / 1e7,
    end: parseInt(end100ns) / 1e7,
    label,
  }));

export default defineObject({
  id: "akane-body",
  label: "SwingAkane",
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
    swingMeasureFactor: {
      type: "number",
      label: "Swing Measure Factor",
      default: 4,
      min: 0,
      max: 16,
      step: numberStep["1"],
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
    [
      akaneBody,
      akaneBody2,
      akaneFoot,
      akaneEyeClosed,
      akaneEyeOpen,
      akaneHead,
    ] = await Promise.all([
      p.loadImage(akaneBodyUrl),
      p.loadImage(akaneBody2Url),
      p.loadImage(akaneFootUrl),
      p.loadImage(akaneEyeClosedUrl),
      p.loadImage(akaneEyeOpenUrl),
      p.loadImage(akaneHeadUrl),
    ]);
    for (const [key, url] of Object.entries(akaneMouthUrls)) {
      const match = key.match(/aoi_mouth_(.)\.png/);
      if (match) {
        akaneMouths[match[1]] = await p.loadImage(url);
      }
    }
    return ctx.createCanvas(30, 60);
  },
  draw(ctx, p, params) {
    const frame = currentFrameInfo(ctx);
    p.clear();
    p.resetMatrix();
    p.noSmooth();
    p.image(akaneFoot, 0, 0);

    {
      using _ = useRenderingContext(p);
      const bodyShift = (
        params.swingOverride !== -1
          ? params.swingOverride === 1
          : (frame.measure * params.swingMeasureFactor) % 1 >=
            params.swingInterval
      )
        ? 0
        : params.swing;
      p.translate(0, bodyShift);
      const bodyImage =
        params.bodySwing === -1
          ? ((frame.measure * params.swingMeasureFactor) % 1) -
              params.swingInterval / 4 >=
            params.swingInterval
            ? akaneBody
            : akaneBody2
          : params.bodySwing === 1
            ? akaneBody2
            : akaneBody;
      p.image(bodyImage, 0, 0);
      p.image(akaneHead, 0, 0);
      p.image(params.eye >= 0.5 ? akaneEyeOpen : akaneEyeClosed, -4, 0);
      const labEntry = labEntries.find(
        (entry) =>
          ctx.frameInfo.globalTime >= entry.start &&
          ctx.frameInfo.globalTime < entry.end,
      );
      if (labEntry && akaneMouths[labEntry.label]) {
        const mouth = akaneMouths[labEntry.label];
        p.image(mouth, -4, 0);
      } else {
        p.image(akaneMouths["n"]!, -4, 0);
      }
    }
  },
});
