import "./style.css";
import {
  DECORATION_HAPPINESS,
  DECORATION_PRICES,
  INCUBATION_DURATION,
  MAX_DECORATIONS,
  MAX_TERRARIUMS,
  PUPA_DURATION,
  TERRARIUM_SIZES,
} from "./data/balance";
import { DECORATION_THEME_NAMES, DECORATION_THEMES, DECORATION_TYPE_NAMES, DECORATION_TYPES, type DecorationType } from "./data/decorations";
import {
  advance,
  buyDecoration,
  buySpecimen,
  buyTerrarium,
  decorationSellPrice,
  decorationUpgradePrice,
  layingDue,
  hasRoom,
  moveSalamander,
  newGame,
  nextTerrariumPrice,
  occupied,
  sellDecoration,
  sellSalamander,
  TOTAL_SPECIES,
  upgradeDecoration,
  upgradePrice,
  upgradeTerrarium,
} from "./game/game";
import { sellPrice } from "./game/rarity";
import { type Salamander, speciesName } from "./game/salamander";
import { load, reset, save } from "./game/save";
import type { GameState } from "./game/state";
import { adultMales, capacity, happiness, type Terrarium } from "./game/terrarium";
import { COLOR_IDS } from "./data/colors";
import { discoveryMapSvg, recipesList, TOTAL_LINKS } from "./render/discovery";
import { MARKET } from "./data/balance";
import { COLLECTIONS } from "./data/collections";
import { COLORS } from "./data/colors";
import { PATTERNS } from "./data/patterns";
import {
  claimCollection,
  collectionProgress,
  collectionReward,
  deliverOrder,
  orderCandidates,
  type Requirement,
  requirementName,
} from "./game/goals";
import { COLOR_HEX } from "./render/salamander";
import { salamanderSvg } from "./render/salamander";

type Tab = "terrariums" | "market" | "goals" | "encyclopedia";

let state: GameState = load() ?? newGame(Date.now());
advance(state, Date.now());

const ui = {
  tab: "terrariums" as Tab,
  selected: null as string | null,
  /** Chosen terrarium for each market offer, kept across renders. */
  targets: {} as Record<string, string>,
  toast: "",
  /** Collections expanded in the Goals tab, kept across renders. */
  openCollections: new Set<string>(),
};

const app = document.querySelector<HTMLDivElement>("#app")!;

const fmt = (n: number) => Math.round(n).toLocaleString("en");
const STAGE_NAMES = { egg: "Egg", pupa: "Pupa", adult: "Adult" };
const SIZE_NAMES = { small: "Small", medium: "Medium", large: "Large" };

function timer(until: number): string {
  return `<span data-until="${until}">${countdown(until)}</span>`;
}

function countdown(until: number): string {
  const s = Math.max(0, Math.ceil((until - Date.now()) / 1000));
  return s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s` : `${s} s`;
}

function stageEnd(s: Salamander): number | null {
  if (s.stage === "egg") return s.stageSince + INCUBATION_DURATION;
  if (s.stage === "pupa") return s.stageSince + PUPA_DURATION;
  return null;
}

function salamanderCard(s: Salamander, terrarium: Terrarium): string {
  const selected = ui.selected === s.id;
  const end = stageEnd(s);
  const others = state.terrariums.filter((t) => t !== terrarium);
  const actions = selected
    ? `<div class="actions">
        ${s.stage === "adult" ? `<button data-action="sell" data-id="${s.id}">Sell · ${fmt(sellPrice(s.genome))} 🪙</button>` : ""}
        ${others
          .map(
            (t) =>
              `<button data-action="move" data-id="${s.id}" data-to="${t.id}" ${hasRoom(state, t) ? "" : "disabled"}>Move to #${t.rank}</button>`,
          )
          .join("")}
      </div>`
    : "";
  const name = s.stage === "adult" ? speciesName(s.genome) : "???";
  return `<div class="card salamander-card ${selected ? "selected" : ""}" data-action="select" data-id="${s.id}">
    ${salamanderSvg(s.genome, s.stage, s.sex)}
    <div class="name">${name}</div>
    <div class="meta">${s.stage === "egg" ? "" : `${s.sex === "female" ? "♀" : "♂"} · `}${STAGE_NAMES[s.stage]}${end ? ` · ${timer(end)}` : ""}</div>
    ${femaleStatus(s, terrarium)}
    ${actions}
  </div>`;
}

function femaleStatus(s: Salamander, terrarium: Terrarium): string {
  if (s.sex !== "female" || s.stage !== "adult") return "";
  const due = layingDue(s);
  if (due !== null) {
    return due > Date.now()
      ? `<div class="status pregnant">🥚 Pregnant · lays in ${timer(due)}</div>`
      : `<div class="status pregnant">🥚 Ready to lay · needs room</div>`;
  }
  if (s.restUntil && s.restUntil > Date.now()) return `<div class="status">💤 Resting ${timer(s.restUntil)}</div>`;
  if (!adultMales(terrarium).length) return `<div class="status">Needs a ♂ in the terrarium</div>`;
  return `<div class="status">💞 Looking for a mate</div>`;
}

function decorationSlots(t: Terrarium): string {
  return DECORATION_TYPES.map((type) => {
    const d = t.decorations.find((x) => x.type === type);
    if (!d) return `<div class="slot empty">${DECORATION_TYPE_NAMES[type]}</div>`;
    const price = decorationUpgradePrice(d.quality);
    return `<div class="slot theme-${d.theme}">
      <div>${DECORATION_THEME_NAMES[d.theme]} ${DECORATION_TYPE_NAMES[type].toLowerCase()}</div>
      <div class="stars">${"★".repeat(d.quality)}${"☆".repeat(3 - d.quality)}</div>
      ${price ? `<button data-action="upgrade-deco" data-id="${t.id}" data-type="${type}">↑ ${fmt(price)} 🪙</button>` : ""}
      <button data-action="sell-deco" data-id="${t.id}" data-type="${type}">Sell ${fmt(decorationSellPrice(d.spent))} 🪙</button>
    </div>`;
  }).join("");
}

function terrariumsView(): string {
  if (!state.terrariums.length) {
    return `<p class="empty-state">You have no terrarium yet. Buy one at the market, then a pair of salamanders.</p>
      <button class="primary" data-action="tab" data-tab="market">Go to the market</button>`;
  }
  return state.terrariums
    .map((t) => {
      const upgrade = upgradePrice(t);
      const deliveries = state.deliveries.filter((d) => d.terrariumId === t.id);
      return `<section class="terrarium">
        <header>
          <h2>Terrarium #${t.rank} <small>${SIZE_NAMES[t.size]} · ${occupied(state, t)}/${capacity(t)}</small></h2>
          ${upgrade ? `<button data-action="upgrade-terrarium" data-id="${t.id}">→ ${SIZE_NAMES[t.size === "small" ? "medium" : "large"]} · ${fmt(upgrade)} 🪙</button>` : ""}
        </header>
        <div class="stats">
          <span>Happiness <meter min="0" max="1" value="${happiness(t)}"></meter></span>
          <span>${hasRoom(state, t) ? "" : "Full: pregnant females wait for a free slot to lay"}</span>
        </div>
        <div class="slots">${decorationSlots(t)}</div>
        <div class="grid">
          ${t.inhabitants.map((s) => salamanderCard(s, t)).join("")}
          ${deliveries
            .map(
              (d) => `<div class="card salamander-card pending">${salamanderSvg(d.salamander.genome, "adult", d.salamander.sex)}<div class="name">${speciesName(d.salamander.genome)}</div><div class="meta">Arriving in ${timer(d.arrivesAt)}</div></div>`,
            )
            .join("")}
        </div>
      </section>`;
    })
    .join("");
}

function targetSelect(offerId: string, needsRoom: boolean): string {
  const options = state.terrariums.filter((t) => !needsRoom || hasRoom(state, t));
  if (!options.length) return "";
  const current = ui.targets[offerId] && options.some((t) => t.id === ui.targets[offerId]) ? ui.targets[offerId] : options[0]!.id;
  ui.targets[offerId] = current;
  return `<select data-target-for="${offerId}">${options.map((t) => `<option value="${t.id}" ${t.id === current ? "selected" : ""}>Terrarium #${t.rank}</option>`).join("")}</select>`;
}

function marketView(): string {
  const canBuyTerrarium = state.terrariums.length < MAX_TERRARIUMS;
  const specimens = state.market.specimens
    .map((o) => {
      const select = targetSelect(o.id, true);
      return `<div class="card">
        ${salamanderSvg(o.genome, "adult", o.sex)}
        <div class="name">${speciesName(o.genome)}</div>
        <div class="meta">${o.sex === "female" ? "♀" : "♂"} · ${fmt(o.price)} 🪙</div>
        ${select ? `${select}<button class="primary" data-action="buy-specimen" data-id="${o.id}">Buy</button>` : `<div class="meta">Needs a terrarium with room</div>`}
      </div>`;
    })
    .join("");
  const decorations = state.market.decorations
    .map((o) => {
      const select = targetSelect(o.id, false);
      return `<div class="card deco theme-${o.theme}">
        <div class="name">${DECORATION_THEME_NAMES[o.theme]} ${DECORATION_TYPE_NAMES[o.type].toLowerCase()}</div>
        <div class="meta">${fmt(DECORATION_PRICES.purchase)} 🪙 · replaces the ${DECORATION_TYPE_NAMES[o.type].toLowerCase()}</div>
        ${select ? `${select}<button class="primary" data-action="buy-deco" data-id="${o.id}">Buy</button>` : `<div class="meta">Needs a terrarium</div>`}
      </div>`;
    })
    .join("");
  return `<p class="meta">New offer in ${timer(state.market.refreshedAt + MARKET.rotation)}</p>
    <h2>Terrariums</h2>
    <div class="card wide">
      <div>Small terrarium (${TERRARIUM_SIZES.small.capacity} salamanders) · ${state.terrariums.length}/${MAX_TERRARIUMS} owned</div>
      ${canBuyTerrarium ? `<button class="primary" data-action="buy-terrarium">Buy · ${fmt(nextTerrariumPrice(state))} 🪙</button>` : ""}
    </div>
    <h2>Specimens</h2>
    <div class="grid">${specimens || `<p class="meta">Sold out until the next offer.</p>`}</div>
    <h2>Decorations</h2>
    <div class="grid">${decorations || `<p class="meta">Sold out until the next offer.</p>`}</div>`;
}

function swatch(color: keyof typeof COLORS): string {
  return `<span class="swatch" style="background:${COLOR_HEX[color]}"></span>${COLORS[color].name}`;
}

function requirementText(r: Requirement): string {
  const parts: string[] = [];
  if (r.primary) parts.push(`Body ${swatch(r.primary)}`);
  if (r.secondary) parts.push(`Pattern color ${swatch(r.secondary)}`);
  if (r.pattern) parts.push(`Pattern <strong>${PATTERNS[r.pattern].name}</strong>`);
  return parts.join(" · ");
}

function goalsView(): string {
  const orders = (state.orders ?? [])
    .map((o) => {
      const ready = orderCandidates(state, o) !== null;
      return `<div class="card">
        <div class="name">Order · ${fmt(o.reward)} 🪙</div>
        <ul class="requirements">${o.requirements.map((r) => `<li><span class="latin">${requirementName(r)}</span><br>${requirementText(r)}</li>`).join("")}</ul>
        <div class="meta">Expires in ${timer(o.expiresAt)}</div>
        <button class="primary" data-action="deliver" data-id="${o.id}" ${ready ? "" : "disabled"}>${ready ? "Deliver" : "Missing salamanders"}</button>
      </div>`;
    })
    .join("");
  const claimed = new Set(state.claimedCollections ?? []);
  const collections = COLLECTIONS.map((c) => {
    const done = collectionProgress(state, c);
    const complete = done === c.members.length;
    const action = claimed.has(c.id)
      ? `<div class="meta">✓ Reward claimed</div>`
      : `<button class="primary" data-action="claim" data-id="${c.id}" ${complete ? "" : "disabled"}>Claim ${fmt(collectionReward(c))} 🪙</button>`;
    return `<details class="card collection" data-collection="${c.id}" ${ui.openCollections.has(c.id) ? "open" : ""}>
      <summary><span class="name">${c.name}</span> <span class="meta">${done} / ${c.members.length}</span></summary>
      <ul class="species">${c.members.map((m) => `<li class="${state.discovered.includes(m) ? "found" : ""}">${state.discovered.includes(m) ? "✓ " : ""}${m}</li>`).join("")}</ul>
      ${action}
    </details>`;
  }).join("");
  return `<h2>Special orders</h2>
    <p class="meta">Deliver adults with the requested traits before the order expires.</p>
    <div class="orders">${orders}</div>
    <h2>Collections</h2>
    <p class="meta">${claimed.size} / ${COLLECTIONS.length} completed. Discover every member to claim the reward.</p>
    ${collections}`;
}

function encyclopediaView(): string {
  const found = state.discovered.length;
  const seen = Object.keys(state.decorationsSeen).length;
  const total = DECORATION_THEMES.length * DECORATION_TYPES.length;
  return `<h2>Discovery map</h2>
    <p>${state.discoveredColors.length} / ${COLOR_IDS.length} colors · ${state.discoveredLinks.length} / ${TOTAL_LINKS} mutations observed</p>
    ${discoveryMapSvg(state)}
    <h2>Pattern recipes</h2>
    ${recipesList(state)}
    <h2>Species</h2>
    <p>${found} / ${fmt(TOTAL_SPECIES)} discovered (${((100 * found) / TOTAL_SPECIES).toFixed(2)} %)</p>
    <ul class="species">${[...state.discovered].sort().map((n) => `<li>${n}</li>`).join("")}</ul>
    <h2>Decorations</h2>
    <p>${seen} / ${total} found</p>
    <ul class="species">${Object.entries(state.decorationsSeen)
      .map(([key, q]) => {
        const [theme, type] = key.split(":") as [keyof typeof DECORATION_THEME_NAMES, DecorationType];
        return `<li>${DECORATION_THEME_NAMES[theme]} ${DECORATION_TYPE_NAMES[type].toLowerCase()} ${"★".repeat(q)}</li>`;
      })
      .join("")}</ul>
    <p class="meta">Max happiness: ${MAX_DECORATIONS} decorations of one theme at ${"★".repeat(3)} (+${DECORATION_HAPPINESS[3]} each).</p>
    <button class="danger" data-action="reset">Restart the game</button>`;
}

function render(): void {
  const views = { terrariums: terrariumsView, market: marketView, goals: goalsView, encyclopedia: encyclopediaView };
  app.innerHTML = `
    <header class="top"><h1>Salamanders</h1><div class="coins">${fmt(state.coins)} 🪙</div></header>
    <main>${views[ui.tab]()}</main>
    ${ui.toast ? `<div class="toast">${ui.toast}</div>` : ""}
    <nav class="tabs">
      ${(["terrariums", "market", "goals", "encyclopedia"] as const)
        .map((t) => `<button data-action="tab" data-tab="${t}" class="${ui.tab === t ? "active" : ""}">${{ terrariums: "🏠 Home", market: "🛒 Market", goals: "🎯 Goals", encyclopedia: "📖 Species" }[t]}</button>`)
        .join("")}
    </nav>`;
}

function commit(error: string | null = null): void {
  ui.toast = error ?? "";
  if (error) setTimeout(() => ((ui.toast = ""), render()), 2500);
  save(state);
  render();
}

app.addEventListener(
  "toggle",
  (event) => {
    const details = event.target as HTMLDetailsElement;
    const id = details.dataset.collection;
    if (!id) return;
    if (details.open) ui.openCollections.add(id);
    else ui.openCollections.delete(id);
  },
  true,
);

app.addEventListener("change", (event) => {
  const select = event.target as HTMLSelectElement;
  if (select.dataset.targetFor) ui.targets[select.dataset.targetFor] = select.value;
});

app.addEventListener("click", (event) => {
  const el = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!el || el.tagName === "SELECT") return;
  if ((event.target as HTMLElement).tagName === "SELECT") return;
  const { action, id = "", to = "", type = "", tab } = el.dataset;
  const now = Date.now();
  switch (action) {
    case "deliver":
      return commit(deliverOrder(state, id, now));
    case "claim":
      return commit(claimCollection(state, id));
    case "tab":
      ui.tab = tab as Tab;
      ui.selected = null;
      return commit();
    case "select":
      ui.selected = ui.selected === id ? null : id;
      return render();
    case "sell":
      ui.selected = null;
      return commit(sellSalamander(state, id, now));
    case "move":
      ui.selected = null;
      return commit(moveSalamander(state, id, to, now));
    case "buy-terrarium":
      return commit(buyTerrarium(state));
    case "upgrade-terrarium":
      return commit(upgradeTerrarium(state, id, now));
    case "buy-specimen":
      return commit(buySpecimen(state, id, ui.targets[id] ?? "", now));
    case "buy-deco":
      return commit(buyDecoration(state, id, ui.targets[id] ?? ""));
    case "sell-deco":
      return commit(sellDecoration(state, id, type as DecorationType));
    case "upgrade-deco":
      return commit(upgradeDecoration(state, id, type as DecorationType));
    case "reset":
      if (!confirm("Restart from scratch?")) return;
      reset();
      state = newGame(Date.now());
      return commit();
  }
});

/** Cheap fingerprint of what changes the screen, to redraw only when needed. */
function fingerprint(): string {
  return JSON.stringify([
    state.coins,
    state.market.refreshedAt,
    (state.orders ?? []).map((o) => o.id),
    state.deliveries.length,
    state.terrariums.map((t) => t.inhabitants.map((s) => [s.stage, !!s.pregnancy, s.nextMatingAt == null, (s.restUntil ?? 0) > Date.now()])),
  ]);
}

let last = fingerprint();
setInterval(() => {
  advance(state, Date.now());
  const current = fingerprint();
  if (current !== last) {
    last = current;
    save(state);
    render();
  } else {
    for (const el of app.querySelectorAll<HTMLElement>("[data-until]")) el.textContent = countdown(Number(el.dataset.until));
  }
}, 1000);

render();
