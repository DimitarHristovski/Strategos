/** 11 birds per flock — base cluster + per-flock jitter so groups never look identical */
const BIRD_COUNT = 11;

/** Deterministic scatter — each of 4 flocks forms a different irregular cluster */
function scatterOffset(flockIdx: number, birdIdx: number): [number, number] {
  let h = Math.imul(flockIdx + 1, 1009) + Math.imul(birdIdx, 7919);
  const next = () => {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    return h / 4294967296;
  };
  const angle = next() * Math.PI * 2;
  const rad = 3 + next() * 16;
  const jx = Math.cos(angle) * rad + (next() - 0.5) * 10;
  const jy = Math.sin(angle) * rad + (next() - 0.5) * 10;
  return [jx, jy];
}

const FLOCKS: readonly {
  path: "a" | "b" | "c" | "d";
  top: string;
  left: string;
  dur: string;
  delay: string;
}[] = [
  { path: "a", top: "10%", left: "12%", dur: "52s", delay: "-6s" },
  { path: "b", top: "48%", left: "58%", dur: "58s", delay: "-22s" },
  { path: "c", top: "26%", left: "6%", dur: "48s", delay: "-14s" },
  { path: "d", top: "34%", left: "72%", dur: "55s", delay: "-35s" }
];

/**
 * Four flocks of black dots — slow winding paths, scattered formation per flock.
 */
export function BattlefieldSkyLayer() {
  return (
    <div className="battlefield-sky-layer" aria-hidden>
      <div className="battlefield-sky-layer__clouds">
        <span className="battlefield-cloud battlefield-cloud--a" />
        <span className="battlefield-cloud battlefield-cloud--b" />
        <span className="battlefield-cloud battlefield-cloud--c" />
        <span className="battlefield-cloud battlefield-cloud--d" />
        <span className="battlefield-cloud battlefield-cloud--e" />
        <span className="battlefield-cloud battlefield-cloud--f" />
        <span className="battlefield-cloud battlefield-cloud--g" />
        <span className="battlefield-cloud battlefield-cloud--h" />
        <span className="battlefield-cloud battlefield-cloud--i" />
        <span className="battlefield-cloud battlefield-cloud--j" />
        <span className="battlefield-cloud battlefield-cloud--k" />
        <span className="battlefield-cloud battlefield-cloud--l" />
        <span className="battlefield-cloud battlefield-cloud--m" />
        <span className="battlefield-cloud battlefield-cloud--n" />
      </div>
      <div className="battlefield-sky-layer__birds">
        {FLOCKS.map((flock, fi) => (
          <div
            key={fi}
            className={`battlefield-bird-flock battlefield-bird-flock--path-${flock.path}`}
            style={{
              top: flock.top,
              left: flock.left,
              ["--bird-dur" as string]: flock.dur,
              ["--bird-delay" as string]: flock.delay
            }}
          >
            {Array.from({ length: BIRD_COUNT }, (_, bi) => {
              const [ox, oy] = scatterOffset(fi, bi);
              return (
                <span
                  key={bi}
                  className="battlefield-bird-dot"
                  style={{ transform: `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px)` }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
