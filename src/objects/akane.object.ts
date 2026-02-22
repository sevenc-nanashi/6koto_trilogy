import { defineObject, numberStep } from "vi5";
import akaneBodyUrl from "../assets/akane_body.png";
import akaneBody2Url from "../assets/akane_body_2.png";
import akaneFootUrl from "../assets/akane_foot.png";
import akaneEyeClosedUrl from "../assets/aoi_eye_closed.png";
import akaneEyeOpenUrl from "../assets/aoi_eye_open.png";
import akaneHeadUrl from "../assets/akane_head.png";
import akaneMouthAUrl from "../assets/aoi_mouth_a.png";
import akaneMouthEUrl from "../assets/aoi_mouth_e.png";
import akaneMouthIUrl from "../assets/aoi_mouth_i.png";
import akaneMouthNUrl from "../assets/aoi_mouth_n.png";
import akaneMouthOUrl from "../assets/aoi_mouth_o.png";
import akaneMouthUUrl from "../assets/aoi_mouth_u.png";
import { currentFrameInfo } from "../utils/currentFrameInfo";
import lab from "../assets/aka.lab?raw";
import kotoLab from "../assets/koto_aka.lab?raw";
import {
  drawSwingCharacter,
  loadSwingCharacterImages,
  parseLabEntries,
  SwingCharacterImages,
  SwingCharacterImageSetUrls,
} from "./swingCharacter";

let akaneImages: SwingCharacterImages;

// 別画像セットを使う場合は、このURL定義を差し替える。
const akaneImageSetUrls: SwingCharacterImageSetUrls = {
  body: akaneBodyUrl,
  body2: akaneBody2Url,
  foot: akaneFootUrl,
  eyeClosed: akaneEyeClosedUrl,
  eyeOpen: akaneEyeOpenUrl,
  head: akaneHeadUrl,
  mouths: {
    a: akaneMouthAUrl,
    i: akaneMouthIUrl,
    u: akaneMouthUUrl,
    e: akaneMouthEUrl,
    o: akaneMouthOUrl,
    n: akaneMouthNUrl,
  },
};
const labEntries = parseLabEntries(lab);
const kotoLabEntries = parseLabEntries(kotoLab);

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
    akaneImages = await loadSwingCharacterImages(p, akaneImageSetUrls);
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
      eyeOffsetX: -4,
      mouthOffsetX: -4,
      images: akaneImages,
      labEntries: params.koto ? kotoLabEntries : labEntries,
      shut: params.shut,
    });
  },
});
