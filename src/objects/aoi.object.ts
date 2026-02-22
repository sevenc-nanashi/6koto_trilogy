import { defineObject, numberStep } from "vi5";
import aoiBodyUrl from "../assets/aoi_body.png";
import aoiBody2Url from "../assets/aoi_body_2.png";
import aoiFootUrl from "../assets/aoi_foot.png";
import aoiEyeClosedUrl from "../assets/aoi_eye_closed.png";
import aoiEyeOpenUrl from "../assets/aoi_eye_open.png";
import aoiHeadUrl from "../assets/aoi_head.png";
import aoiMouthAUrl from "../assets/aoi_mouth_a.png";
import aoiMouthEUrl from "../assets/aoi_mouth_e.png";
import aoiMouthIUrl from "../assets/aoi_mouth_i.png";
import aoiMouthNUrl from "../assets/aoi_mouth_n.png";
import aoiMouthOUrl from "../assets/aoi_mouth_o.png";
import aoiMouthUUrl from "../assets/aoi_mouth_u.png";
import { currentFrameInfo } from "../utils/currentFrameInfo";
import lab from "../assets/ao.lab?raw";
import kotoLab from "../assets/koto_aoi.lab?raw";
import {
  drawSwingCharacter,
  loadSwingCharacterImages,
  parseLabEntries,
  SwingCharacterImages,
  SwingCharacterImageSetUrls,
} from "./swingCharacter";

let aoiImages: SwingCharacterImages;

const aoiImageSetUrls: SwingCharacterImageSetUrls = {
  body: aoiBodyUrl,
  body2: aoiBody2Url,
  foot: aoiFootUrl,
  eyeClosed: aoiEyeClosedUrl,
  eyeOpen: aoiEyeOpenUrl,
  head: aoiHeadUrl,
  mouths: {
    a: aoiMouthAUrl,
    i: aoiMouthIUrl,
    u: aoiMouthUUrl,
    e: aoiMouthEUrl,
    o: aoiMouthOUrl,
    n: aoiMouthNUrl,
  },
};
const labEntries = parseLabEntries(lab);
const kotoLabEntries = parseLabEntries(kotoLab);

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
    koto: {
      type: "boolean",
      label: "Koto Mode",
      default: false,
    },
    shut: {
      type: "number",
      label: "Shut",
      default: 0,
      min: 0,
      max: 1,
      step: numberStep["1"],
    },
  } as const,
  async setup(ctx, p, params) {
    aoiImages = await loadSwingCharacterImages(p, aoiImageSetUrls);
    return ctx.createCanvas(30, 60);
  },
  draw(ctx, p, params) {
    const frame = currentFrameInfo(ctx);
    drawSwingCharacter(p, {
      frameMeasure: frame.measure,
      globalTime: ctx.frameInfo.globalTime,
      swing: params.swing,
      swingInterval: params.swingInterval,
      swingMeasureFactor: params.swingMeasureFactor,
      swingOverride: params.swingOverride,
      bodySwing: params.bodySwing,
      eye: params.eye,
      eyeOffsetX: 0,
      mouthOffsetX: 0,
      images: aoiImages,
      labEntries: params.koto ? kotoLabEntries : labEntries,
      shut: params.shut,
    });
  },
});
