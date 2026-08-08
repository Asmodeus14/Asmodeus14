/**
 * Generates assets/stats-dark.svg and assets/stats-light.svg from the GitHub
 * GraphQL API.
 *
 * Why this exists: the shared github-readme-stats.vercel.app instance returns
 * 503 under load, which puts broken images on the profile. Rendering the card
 * here and committing it means it is served from raw.githubusercontent.com with
 * the same availability as the repo itself.
 *
 * Usage: GITHUB_TOKEN=... LOGIN=Asmodeus14 node .github/scripts/gen-stats.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";

const LOGIN = process.env.LOGIN || "Asmodeus14";
const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error("GITHUB_TOKEN is required");
  process.exit(1);
}

const QUERY = `
query($login: String!) {
  user(login: $login) {
    followers { totalCount }
    contributionsCollection {
      contributionCalendar { totalContributions }
      totalCommitContributions
      totalPullRequestContributions
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
      totalCount
      nodes {
        stargazerCount
        languages(first: 12, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
  }
}`;

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
    "User-Agent": "asmodeus14-profile-stats",
  },
  body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
});

if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
const json = await res.json();
if (json.errors) throw new Error(JSON.stringify(json.errors));

const user = json.data.user;
const repos = user.repositories.nodes;

const stars = repos.reduce((n, r) => n + r.stargazerCount, 0);
const contributions =
  user.contributionsCollection.contributionCalendar.totalContributions;

// aggregate language bytes across all non-fork repos
const bytes = new Map();
for (const repo of repos) {
  for (const { size, node } of repo.languages.edges) {
    const prev = bytes.get(node.name);
    bytes.set(node.name, {
      size: (prev?.size ?? 0) + size,
      color: node.color || "#8b949e",
    });
  }
}

const ranked = [...bytes.entries()]
  .map(([name, v]) => ({ name, ...v }))
  .sort((a, b) => b.size - a.size);

const total = ranked.reduce((n, l) => n + l.size, 0) || 1;
const TOP = 6;
const top = ranked.slice(0, TOP);
const restSize = ranked.slice(TOP).reduce((n, l) => n + l.size, 0);
if (restSize > 0) top.push({ name: "Other", size: restSize, color: "#6e7681" });
for (const l of top) l.pct = (l.size / total) * 100;

const STATS = [
  { value: user.repositories.totalCount, label: "REPOSITORIES" },
  { value: stars, label: "STARS EARNED" },
  { value: contributions, label: "CONTRIBUTIONS / YR" },
  { value: user.followers.totalCount, label: "FOLLOWERS" },
];

const xml = (s) =>
  String(s).replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c])
  );

const compact = (n) =>
  n >= 10000 ? `${(n / 1000).toFixed(1)}k` : String(n);

/* ---- contrast correction -------------------------------------------------
 * GitHub's own language colors are tuned for a white background, so several are
 * unusable on a dark card: C is #555555 and would be an almost invisible blob
 * despite being a top-3 language here. Nudge each color toward the readable end
 * for the theme being rendered rather than trusting the upstream value.
 * ------------------------------------------------------------------------ */
const toRgb = (hex) => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return Number.isNaN(n) || h.length !== 6
    ? [139, 148, 158]
    : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const toHex = (rgb) =>
  "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

// WCAG relative luminance
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const mix = (rgb, target, amount) =>
  rgb.map((v, i) => v + (target[i] - v) * amount);

const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];

/** Lighten (dark theme) or darken (light theme) until the color is legible. */
function legible(hex, theme) {
  let rgb = toRgb(hex);
  const target = theme === "dark" ? WHITE : BLACK;
  const ok = () =>
    theme === "dark" ? luminance(rgb) >= 0.18 : luminance(rgb) <= 0.55;
  for (let i = 0; i < 12 && !ok(); i++) rgb = mix(rgb, target, 0.12);
  return toHex(rgb);
}

const THEMES = {
  dark: {
    name: "dark",
    bg: "#0d1117", border: "#30363d", label: "#8b949e",
    track: "#21262d", a: "#22d3ee", b: "#8b5cf6", file: "stats-dark.svg",
  },
  light: {
    name: "light",
    bg: "#ffffff", border: "#d0d7de", label: "#57606a",
    track: "#eaeef2", a: "#0891b2", b: "#7c3aed", file: "stats-light.svg",
  },
};

const W = 880, H = 210;
const BAR_X = 410, BAR_W = 430, BAR_Y = 74;

function render(t) {
  // stacked language bar
  const shown = top.map((l) => ({ ...l, ink: legible(l.color, t.name) }));

  let cursor = BAR_X;
  const segments = shown
    .map((l, i) => {
      const w = Math.max(2, (l.pct / 100) * BAR_W);
      const x = cursor;
      cursor += w;
      const first = i === 0;
      const last = i === shown.length - 1;
      // square off inner edges so the bar reads as one continuous pill
      const rx = first || last ? 5 : 0;
      return `<rect x="${x.toFixed(1)}" y="${BAR_Y}" width="${w.toFixed(1)}" height="10" rx="${rx}" fill="${l.ink}"/>`;
    })
    .join("\n      ");

  const legend = shown
    .map((l, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = BAR_X + col * 220;
      const y = 112 + row * 26;
      return `<g transform="translate(${x} ${y})">
        <circle cx="5" cy="-4" r="5" fill="${l.ink}"/>
        <text class="lg" x="18" y="0">${xml(l.name)}</text>
        <text class="pct" x="205" y="0" text-anchor="end">${l.pct.toFixed(1)}%</text>
      </g>`;
    })
    .join("\n      ");

  const cells = STATS.map((s, i) => {
    const x = 44 + (i % 2) * 166;
    const y = 86 + Math.floor(i / 2) * 66;
    return `<g>
        <text class="num" x="${x}" y="${y}">${compact(s.value)}</text>
        <text class="lab" x="${x}" y="${y + 18}">${s.label}</text>
      </g>`;
  }).join("\n      ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="GitHub statistics for ${xml(LOGIN)}">
  <title>${xml(LOGIN)} — ${STATS.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(", ")}</title>
  <defs>
    <linearGradient id="num" gradientUnits="userSpaceOnUse" x1="44" y1="0" x2="340" y2="0">
      <stop offset="0%" stop-color="${t.a}"/>
      <stop offset="100%" stop-color="${t.b}"/>
    </linearGradient>
    <style>
      .mono { font-family: "DejaVu Sans Mono","Liberation Mono",Consolas,Menlo,monospace; }
      .num { font-size: 34px; font-weight: 700; fill: url(#num); }
      .lab { font-size: 10.5px; letter-spacing: 1.6px; fill: ${t.label}; }
      .hd  { font-size: 10.5px; letter-spacing: 1.6px; fill: ${t.label}; }
      .lg  { font-size: 12.5px; fill: ${t.label}; }
      .pct { font-size: 12.5px; fill: ${t.label}; opacity: .75; }
    </style>
  </defs>

  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="${t.bg}" stroke="${t.border}"/>

  <g class="mono">
      ${cells}

      <line x1="372" y1="38" x2="372" y2="172" stroke="${t.border}"/>

      <text class="hd" x="${BAR_X}" y="58">TOP LANGUAGES</text>
      <rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="10" rx="5" fill="${t.track}"/>
      ${segments}
      ${legend}
  </g>
</svg>
`;
}

await mkdir("assets", { recursive: true });
for (const t of Object.values(THEMES)) {
  await writeFile(`assets/${t.file}`, render(t), "utf8");
  console.log(`wrote assets/${t.file}`);
}
console.log(
  `stats: ${STATS.map((s) => `${s.label}=${s.value}`).join("  ")}\n` +
  `languages: ${top.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(", ")}`
);
