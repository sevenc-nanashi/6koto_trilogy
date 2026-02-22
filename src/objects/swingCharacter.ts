import p5 from "p5";
import { useRenderingContext } from "../utils/useRenderingContext";

export type SwingCharacterImageSetUrls = {
  body: string;
  body2: string;
  foot: string;
  eyeClosed: string;
  eyeOpen: string;
  head: string;
  mouths: Record<string, string>;
};

export type SwingCharacterImages = {
  body: p5.Image;
  body2: p5.Image;
  foot: p5.Image;
  eyeClosed: p5.Image;
  eyeOpen: p5.Image;
  head: p5.Image;
  mouths: Record<string, p5.Image>;
};

export type LabEntry = {
  start: number;
  end: number;
  label: string;
};

export function parseLabEntries(lab: string): LabEntry[] {
  return lab
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(" ") as [string, string, string])
    .map(([start100ns, end100ns, label]) => ({
      start: parseInt(start100ns) / 1e7,
      end: parseInt(end100ns) / 1e7,
      label,
    }));
}

export async function loadSwingCharacterImages(
  p: p5,
  urls: SwingCharacterImageSetUrls,
): Promise<SwingCharacterImages> {
  const [body, body2, foot, eyeClosed, eyeOpen, head] = await Promise.all([
    p.loadImage(urls.body),
    p.loadImage(urls.body2),
    p.loadImage(urls.foot),
    p.loadImage(urls.eyeClosed),
    p.loadImage(urls.eyeOpen),
    p.loadImage(urls.head),
  ]);

  const mouths: Record<string, p5.Image> = {};
  for (const [mouthKey, url] of Object.entries(urls.mouths)) {
    mouths[mouthKey] = await p.loadImage(url);
  }

  return {
    body,
    body2,
    foot,
    eyeClosed,
    eyeOpen,
    head,
    mouths,
  };
}

export function drawSwingCharacter(
  p: p5,
  params: {
    frameMeasure: number;
    globalTime: number;
    swing: number;
    swingInterval: number;
    swingMeasureFactor: number;
    swingOverride: number;
    bodySwing: number;
    eye: number;
    eyeOffsetX: number;
    mouthOffsetX: number;
    images: SwingCharacterImages;
    labEntries: LabEntry[];
    shut: number;
  },
) {
  p.clear();
  p.resetMatrix();
  p.noSmooth();
  p.image(params.images.foot, 0, 0);

  using _ = useRenderingContext(p);
  const bodyShift = (
    params.swingOverride !== -1
      ? params.swingOverride === 1
      : (params.frameMeasure * params.swingMeasureFactor) % 1 >=
        params.swingInterval
  )
    ? 0
    : params.swing;
  p.translate(0, bodyShift);
  const bodyImage =
    params.bodySwing === -1
      ? ((params.frameMeasure * params.swingMeasureFactor) % 1) -
          params.swingInterval / 4 >=
        params.swingInterval
        ? params.images.body
        : params.images.body2
      : params.bodySwing === 1
        ? params.images.body2
        : params.images.body;
  p.image(bodyImage, 0, 0);
  p.image(params.images.head, 0, 0);
  p.image(
    params.eye >= 0.5 ? params.images.eyeOpen : params.images.eyeClosed,
    params.eyeOffsetX,
    0,
  );
  const labEntry = params.labEntries.find(
    (entry) =>
      params.globalTime >= entry.start && params.globalTime < entry.end,
  );
  if (params.shut < 0.5 && labEntry && params.images.mouths[labEntry.label]) {
    const mouth = params.images.mouths[labEntry.label];
    p.image(mouth, params.mouthOffsetX, 0);
  } else {
    p.image(params.images.mouths["n"]!, params.mouthOffsetX, 0);
  }
}
