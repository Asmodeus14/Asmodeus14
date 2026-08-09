/**
 * Renders assets/stats-dark.svg and assets/stats-light.svg from the GitHub
 * GraphQL API.
 *
 * Why this exists rather than github-readme-stats: the shared instance at
 * github-readme-stats.vercel.app has been returning 503 DEPLOYMENT_PAUSED, and
 * github-profile-trophy returns 402. Both put permanently broken images on the
 * profiles that use them. Rendering here and committing the result means the
 * card is served from raw.githubusercontent.com with the same availability as
 * the repository itself, and depends on no third party at runtime.
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

/**
 * Third-party source vendored into a repository.
 *
 * Linguist attributes these bytes to the repository owner because the affected
 * repos carry no .gitattributes, which is why Nyx — a Rust kernel — currently
 * reports to GitHub as 52% C. Nyx embeds ACPICA (C + ASL) and lwext4 (C) under
 * nyx-kernel/acpica-core, nyx-kernel/acpica-includes and nyx-kernel/lwext4.
 *
 * These pairs are subtracted below and the exclusion is disclosed in the
 * rendered card, so the chart is accurate rather than merely flattering.
 * Delete an entry once the upstream repo marks the path linguist-vendored.
 */
const VENDORED = {
  Nyx: ["C", "ASL"],
};

const QUERY = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar { totalContributions }
      totalCommitContributions
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
      totalCount
      nodes {
        name
        stargazerCount
        languages(first: 15, orderBy: { field: SIZE, direction: DESC }) {
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

const publicRepos = user.repositories.totalCount;
const commits = user.contributionsCollection.totalCommitContributions;
const contributions =
  user.contributionsCollection.contributionCalendar.totalContributions;

// Aggregate language bytes, skipping vendored third-party trees.
const bytes = new Map();
let excludedBytes = 0;
for (const repo of repos) {
  const skip = VENDORED[repo.name] ?? [];
  for (const { size, node } of repo.languages.edges) {
    if (skip.includes(node.name)) {
      excludedBytes += size;
      continue;
    }
    const prev = bytes.get(node.name);
    bytes.set(node.name, {
      size: (prev?.size ?? 0) + size,
      color: node.color || "#8b949e",
    });
  }
}

const TOP = 5;
const ranked = [...bytes.entries()]
  .map(([name, v]) => ({ name, ...v }))
  .sort((a, b) => b.size - a.size)
  .slice(0, TOP);

const total = ranked.reduce((n, l) => n + l.size, 0) || 1;

/** WCAG relative luminance, used to keep low-contrast language colors legible. */
function luminance(hex) {
  const c = hex.replace("#", "");
  const v = [0, 2, 4].map((i) => {
    const s = parseInt(c.slice(i, i + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}

function mix(hex, target, amount) {
  const c = hex.replace("#", "");
  const t = target.replace("#", "");
  const out = [0, 2, 4].map((i) => {
    const a = parseInt(c.slice(i, i + 2), 16);
    const b = parseInt(t.slice(i, i + 2), 16);
    return Math.round(a + (b - a) * amount)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${out.join("")}`;
}

/** Nudge a language color until it reads against the given background. */
function legible(hex, bg) {
  const lum = luminance(hex);
  if (bg === "dark" && lum < 0.12) return mix(hex, "#ffffff", 0.45);
  if (bg === "light" && lum > 0.72) return mix(hex, "#000000", 0.35);
  return hex;
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const fmt = (n) => n.toLocaleString("en-US");

function render(mode) {
  const t =
    mode === "dark"
      ? {
          bg: "#0d1117",
          frame: "#30363d",
          text: "#e6edf3",
          dim: "#8b949e",
          faint: "#6e7681",
          track: "#21262d",
          accent: "#22d3ee",
        }
      : {
          bg: "#ffffff",
          frame: "#d0d7de",
          text: "#1f2328",
          dim: "#57606a",
          faint: "#8c959f",
          track: "#eaeef2",
          accent: "#0891b2",
        };

  const W = 1000;
  const H = 268;

  // Stacked language bar
  const BAR_X = 40;
  const BAR_Y = 96;
  const BAR_W = 620;
  const BAR_H = 14;

  let x = BAR_X;
  const segments = ranked
    .map((l) => {
      const w = (l.size / total) * BAR_W;
      const seg = `<rect x="${x.toFixed(1)}" y="${BAR_Y}" width="${Math.max(w, 0).toFixed(
        1
      )}" height="${BAR_H}" fill="${legible(l.color, mode)}"/>`;
      x += w;
      return seg;
    })
    .join("\n      ");

  // Legend, two rows of up to three
  const legend = ranked
    .map((l, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const lx = BAR_X + col * 210;
      const ly = BAR_Y + 48 + row * 30;
      const pct = ((l.size / total) * 100).toFixed(1);
      return `<g transform="translate(${lx} ${ly})">
        <circle cx="5" cy="-4" r="5" fill="${legible(l.color, mode)}"/>
        <text class="mono" x="18" y="0" font-size="13" fill="${t.text}">${esc(l.name)}</text>
        <text class="mono" x="18" y="0" font-size="13" fill="${t.dim}" dx="${
          l.name.length * 7.9 + 8
        }">${pct}%</text>
      </g>`;
    })
    .join("\n      ");

  const counters = [
    ["PUBLIC REPOS", fmt(publicRepos)],
    ["COMMITS · 12 MO", fmt(commits)],
    ["CONTRIBUTIONS · 12 MO", fmt(contributions)],
  ]
    .map(
      ([label, value], i) => `<g transform="translate(720 ${104 + i * 52})">
        <text class="mono" x="0" y="0" font-size="10" letter-spacing="1.4" fill="${t.faint}">${label}</text>
        <text class="mono" x="0" y="26" font-size="26" font-weight="700" fill="${t.text}">${value}</text>
      </g>`
    )
    .join("\n      ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Public code: language distribution and activity for ${esc(
    LOGIN
  )}">
  <title>Public code — language distribution and activity</title>
  <defs>
    <style>
      .mono { font-family: "DejaVu Sans Mono","Liberation Mono",Consolas,Menlo,monospace; }
    </style>
    <clipPath id="bar"><rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" rx="7"/></clipPath>
  </defs>

  <rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="${t.bg}"/>

  <text class="mono" x="40" y="46" font-size="15" font-weight="700" letter-spacing="2" fill="${t.text}">PUBLIC CODE</text>
  <line x1="40" y1="62" x2="${W - 40}" y2="62" stroke="${t.frame}"/>

  <text class="mono" x="40" y="84" font-size="11" letter-spacing="1.2" fill="${t.faint}">LANGUAGE DISTRIBUTION</text>

  <rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" rx="7" fill="${t.track}"/>
  <g clip-path="url(#bar)">
      ${segments}
  </g>

      ${legend}

      ${counters}

  <text class="mono" x="40" y="${
    H - 22
  }" font-size="10.5" fill="${t.faint}">Excludes ${fmt(
    Math.round(excludedBytes / 1024)
  )} KB of vendored third-party C and ASL (ACPICA, lwext4) embedded in Nyx.</text>

  <rect x="0.5" y="0.5" width="${W - 1}" height="${
    H - 1
  }" rx="14" fill="none" stroke="${t.frame}"/>
</svg>
`;
}

await mkdir("assets", { recursive: true });
await writeFile("assets/stats-dark.svg", render("dark"), "utf8");
await writeFile("assets/stats-light.svg", render("light"), "utf8");

console.log(
  `wrote stats cards — ${ranked
    .map((l) => `${l.name} ${((l.size / total) * 100).toFixed(1)}%`)
    .join(", ")}`
);
console.log(
  `excluded ${Math.round(excludedBytes / 1024)} KB vendored; repos=${publicRepos} commits=${commits} contributions=${contributions}`
);
