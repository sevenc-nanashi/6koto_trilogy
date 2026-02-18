import p5 from "p5";

export function useRenderingContext(p: p5): {
  [Symbol.dispose]: () => void;
} {
  p.push();
  return {
    [Symbol.dispose]: () => {
      p.pop();
    },
  };
}
