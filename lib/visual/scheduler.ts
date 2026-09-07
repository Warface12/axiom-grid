type Tick = (now: number, dt: number) => boolean;

const jobs = new Set<Tick>();
let raf = 0;
let last = 0;
let running = false;

function loop(now: number) {
  raf = 0;
  if (document.visibilityState !== "visible") {
    running = false;
    return;
  }
  const dt = Math.min(48, last ? now - last : 16);
  last = now;
  let need = false;
  jobs.forEach((tick) => {
    if (tick(now, dt)) need = true;
  });
  if (need && jobs.size) {
    raf = requestAnimationFrame(loop);
  } else {
    running = false;
    last = 0;
  }
}

export function wakeVisuals() {
  if (running || !jobs.size) return;
  if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
  running = true;
  raf = requestAnimationFrame(loop);
}

export function subscribeVisual(tick: Tick) {
  jobs.add(tick);
  wakeVisuals();
  return () => {
    jobs.delete(tick);
    if (!jobs.size && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
      running = false;
    }
  };
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") wakeVisuals();
  });
}
