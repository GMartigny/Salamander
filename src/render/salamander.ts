import type { ColorId } from "../data/colors";
import type { PatternId } from "../data/patterns";
import type { Genome, Stage } from "../game/salamander";

/** Display color of each gene color. */
export const COLOR_HEX: Record<ColorId, string> = {
  white: "#f4f1ea",
  silver: "#b9c0c7",
  gold: "#d9a92e",
  yellow: "#f2d43d",
  orange: "#f08a24",
  red: "#d93b30",
  brown: "#8a5a2b",
  pink: "#f29ab8",
  purple: "#8e44ad",
  lightBlue: "#5bc8e8",
  darkBlue: "#2f5fb3",
  lightGreen: "#8fd16a",
  neonGreen: "#b6f23a",
  pineGreen: "#2f6b3a",
  black: "#2a2a30",
  transparent: "#dbe8ee",
  chameleon: "#d93b30",
};

const CHAMELEON_CYCLE = "#d93b30;#f08a24;#f2d43d;#8fd16a;#5bc8e8;#8e44ad;#d93b30";
const OUTLINE = 'stroke="rgba(0,0,0,.35)" stroke-width=".8"';

let uid = 0;

/** Fill attributes and animation for a gene color. */
function paint(color: ColorId): { attrs: string; inner: string } {
  if (color === "transparent") return { attrs: `fill="${COLOR_HEX.transparent}" fill-opacity=".45"`, inner: "" };
  if (color === "chameleon") {
    return {
      attrs: `fill="${COLOR_HEX.chameleon}"`,
      inner: `<animate attributeName="fill" values="${CHAMELEON_CYCLE}" dur="8s" repeatCount="indefinite"/>`,
    };
  }
  return { attrs: `fill="${COLOR_HEX[color]}"`, inner: "" };
}

function shape(tag: string, attrs: string, color: ColorId): string {
  const { attrs: fill, inner } = paint(color);
  return `<${tag} ${attrs} ${fill}>${inner}</${tag}>`;
}

const HEAD = 'cx="50" cy="22" rx="13" ry="12"';
const BODY = 'cx="50" cy="56" rx="14" ry="24"';
const TAIL = 'd="M42 74 Q46 104 50 116 Q54 104 58 74 Z"';
const LEGS = [
  'cx="35" cy="42" rx="8" ry="3.5" transform="rotate(-25 35 42)"',
  'cx="65" cy="42" rx="8" ry="3.5" transform="rotate(25 65 42)"',
  'cx="35" cy="70" rx="8" ry="3.5" transform="rotate(25 35 70)"',
  'cx="65" cy="70" rx="8" ry="3.5" transform="rotate(-25 65 70)"',
];
const FEET = [
  [28, 38],
  [72, 38],
  [28, 74],
  [72, 74],
] as const;

function silhouette(color: ColorId, outline = true): string {
  const line = outline ? OUTLINE : "";
  return [
    shape("path", `${TAIL} ${line}`, color),
    ...LEGS.map((l) => shape("ellipse", `${l} ${line}`, color)),
    ...FEET.map(([x, y]) => shape("circle", `cx="${x}" cy="${y}" r="2.6" ${line}`, color)),
    shape("ellipse", `${BODY} ${line}`, color),
    shape("ellipse", `${HEAD} ${line}`, color),
  ].join("");
}

function star(cx: number, cy: number, r: number): string {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 ? r * 0.45 : r;
    return `${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`;
  });
  return `points="${points.join(" ")}"`;
}

/** Pattern shapes in the secondary color, clipped to the body. */
function patternShapes(pattern: PatternId, s: ColorId, primary: ColorId, id: string): string {
  switch (pattern) {
    case "recta":
      return [43, 49, 55].map((x) => shape("rect", `x="${x}" y="8" width="2.6" height="110"`, s)).join("");
    case "riga":
      return [30, 39, 48, 57, 66, 75, 86, 98].map((y) => shape("rect", `x="20" y="${y}" width="60" height="3.6"`, s)).join("");
    case "folia":
      return [38, 52, 66, 80]
        .map((y, i) => shape("ellipse", `cx="${i % 2 ? 54 : 46}" cy="${y}" rx="6" ry="3" transform="rotate(${i % 2 ? 35 : -35} ${i % 2 ? 54 : 46} ${y})"`, s))
        .join("");
    case "nuba":
      return [
        [44, 40, 8],
        [57, 55, 9],
        [45, 70, 7],
        [52, 26, 6],
      ]
        .map(([x, y, r]) => shape("circle", `cx="${x}" cy="${y}" r="${r}" opacity=".85"`, s))
        .join("");
    case "macula":
      return [
        [46, 45, 5],
        [52, 49, 3.5],
        [43, 51, 2.5],
        [56, 66, 4.5],
        [50, 72, 2.5],
        [60, 61, 2],
        [47, 22, 3],
      ]
        .map(([x, y, r]) => shape("circle", `cx="${x}" cy="${y}" r="${r}"`, s))
        .join("");
    case "puncta":
      return [
        [44, 36],
        [56, 36],
        [50, 46],
        [42, 56],
        [58, 56],
        [50, 66],
        [45, 76],
        [55, 76],
        [50, 90],
        [44, 20],
        [56, 22],
      ]
        .map(([x, y]) => shape("circle", `cx="${x}" cy="${y}" r="1.9"`, s))
        .join("");
    case "annula":
      return [
        [45, 40],
        [55, 54],
        [45, 68],
        [53, 82],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="none" stroke="${COLOR_HEX[s]}" stroke-width="1.8"/>`)
        .join("");
    case "progressa":
      return `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COLOR_HEX[s]}" stop-opacity="0"/><stop offset="1" stop-color="${COLOR_HEX[s]}"/></linearGradient></defs><rect x="0" y="0" width="100" height="120" fill="url(#${id}g)"/>`;
    case "voluta":
      return [
        "M50 34 q6 0 6 6 q0 6 -6 6 q-4 0 -4 -4",
        "M50 58 q-7 0 -7 7 q0 7 7 7 q5 0 5 -5",
        "M48 84 q5 0 5 5 q0 5 -5 5",
      ]
        .map((d) => `<path d="${d}" fill="none" stroke="${COLOR_HEX[s]}" stroke-width="2" stroke-linecap="round"/>`)
        .join("");
    case "sagitta":
      return [38, 50, 62, 74, 88]
        .map((y) => `<polyline points="42,${y + 6} 50,${y} 58,${y + 6}" fill="none" stroke="${COLOR_HEX[s]}" stroke-width="2.4" stroke-linejoin="round"/>`)
        .join("");
    case "stella":
      return (
        [
          [46, 42, 5],
          [55, 58, 6],
          [46, 74, 4],
        ] as const
      )
        .map(([x, y, r]) => shape("polygon", star(x, y, r), s))
        .join("");
    case "crania":
      return (
        shape("circle", 'cx="50" cy="50" r="8"', s) +
        shape("rect", 'x="45" y="55" width="10" height="7" rx="1.5"', s) +
        shape("circle", 'cx="47" cy="49" r="2.2"', primary) +
        shape("circle", 'cx="53" cy="49" r="2.2"', primary)
      );
    default:
      return "";
  }
}

/** SVG markup of a salamander seen from above, drawn from its genome. */
export function salamanderSvg(genome: Genome, stage: Stage = "adult"): string {
  uid += 1;
  const id = `sal${uid}`;
  const { primary, secondary, pattern, detail } = genome;

  if (stage === "egg") {
    return `<svg viewBox="0 0 100 120" class="salamander egg" role="img" aria-label="Egg">
      <ellipse cx="50" cy="66" rx="24" ry="30" fill="#f6f1df" ${OUTLINE}/>
      <circle cx="42" cy="56" r="3" fill="${COLOR_HEX[primary]}" opacity=".6"/>
      <circle cx="57" cy="72" r="2.4" fill="${COLOR_HEX[secondary]}" opacity=".6"/>
      <circle cx="47" cy="82" r="1.8" fill="${COLOR_HEX[primary]}" opacity=".6"/>
    </svg>`;
  }

  const clip = `<clipPath id="${id}c"><ellipse ${HEAD}/><ellipse ${BODY}/><path ${TAIL}/></clipPath>`;
  let body = silhouette(primary);
  if (pattern === "gamba") {
    body += [...LEGS.map((l) => shape("ellipse", `${l} ${OUTLINE}`, secondary)), ...FEET.map(([x, y]) => shape("circle", `cx="${x}" cy="${y}" r="2.6"`, secondary))].join("");
    body += shape("ellipse", `${BODY} ${OUTLINE}`, primary) + shape("ellipse", `${HEAD} ${OUTLINE}`, primary);
  } else if (pattern === "capita") {
    body += shape("ellipse", `${HEAD} ${OUTLINE}`, secondary);
  } else if (pattern !== "iustus") {
    body += `<g clip-path="url(#${id}c)">${patternShapes(pattern, secondary, primary, id)}</g>`;
  }

  let extras = "";
  if (detail === "cornum") {
    extras += shape("polygon", 'points="40,14 37,2 45,11"', secondary) + shape("polygon", 'points="60,14 63,2 55,11"', secondary);
  }
  if (detail === "palmatum") {
    extras += FEET.map(([x, y]) => shape("circle", `cx="${x}" cy="${y}" r="4.6" opacity=".9" ${OUTLINE}`, secondary)).join("");
  }
  if (detail === "frondosum") {
    extras += [44, 60, 76]
      .map((y) => `<ellipse cx="34" cy="${y}" rx="5" ry="2.4" fill="#4caf50" transform="rotate(-30 34 ${y})"/><ellipse cx="66" cy="${y}" rx="5" ry="2.4" fill="#4caf50" transform="rotate(30 66 ${y})"/>`)
      .join("");
  }
  const eye = detail === "oculum" ? 4.6 : 2.3;
  extras += `<circle cx="44" cy="17" r="${eye}" fill="#111"/><circle cx="56" cy="17" r="${eye}" fill="#111"/><circle cx="${44 + eye / 3}" cy="${17 - eye / 3}" r="${eye / 3}" fill="#fff"/><circle cx="${56 + eye / 3}" cy="${17 - eye / 3}" r="${eye / 3}" fill="#fff"/>`;

  const scale = (detail === "pumilum" ? 0.75 : 1) * (stage === "pupa" ? 0.65 : 1);
  const transform = scale === 1 ? "" : `transform="translate(50 60) scale(${scale}) translate(-50 -60)"`;
  const glow = detail === "lucidum" ? `style="filter: drop-shadow(0 0 5px ${COLOR_HEX[secondary]})"` : "";

  return `<svg viewBox="0 0 100 120" class="salamander" role="img" ${glow}><defs>${clip}</defs><g ${transform}>${body}${extras}</g></svg>`;
}
