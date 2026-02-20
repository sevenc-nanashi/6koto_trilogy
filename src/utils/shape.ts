import p5 from "p5";
import { clip, unlerp } from "./ease";

export function drawRotatedSquare(p: p5, size: number, progress = 1) {
  if (size <= 0) return;
  const topRightProgress = clip(unlerp(0, 0.25, progress));
  const bottomRightProgress = clip(unlerp(0.25, 0.5, progress));
  const bottomLeftProgress = clip(unlerp(0.5, 0.75, progress));
  const topLeftProgress = clip(unlerp(0.75, 1, progress));
  p.line(0, -size, size * topRightProgress, -size * (1 - topRightProgress));
  p.line(size, 0, size * (1 - bottomRightProgress), size * bottomRightProgress);
  p.line(0, size, -size * bottomLeftProgress, size * (1 - bottomLeftProgress));
  p.line(-size, 0, -size * (1 - topLeftProgress), -size * topLeftProgress);
}

export function drawFilledRotatedSquare(p: p5, size: number) {
  if (size <= 0) return;
  p.beginShape();
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 2) * i;
    p.vertex(size * Math.cos(angle), size * Math.sin(angle));
  }
  p.endShape(p.CLOSE);
}
