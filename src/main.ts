import "./style.css";
import { DECORATION_HAPPINESS, DECORATION_PRICES, MAX_DECORATIONS, MAX_TERRARIUMS, TERRARIUM_SIZES } from "./data/balance";
import { DECORATION_THEME_NAMES, DECORATION_THEMES, DECORATION_TYPE_NAMES, DECORATION_TYPES, type DecorationType } from "./data/decorations";
import {
  advance,
  buyDecoration,
  buySpecimen,
  buyTerrarium,
  decorationUpgradePrice,
  hasRoom,
  moveSalamander,
  newGame,
  nextTerrariumPrice,
  occupied,
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
import { capacity, happiness, type Terrarium } from "./game/terrarium";
import { MARKET } from "./data/balance";
import { salamanderSvg } from "./render/salamander";

type Tab = "terrariums" | "market" | "encyclopedia";

let state: GameState = load() ?? newGame(Date.now());
advance(state, Date.now());

const ui = {
  tab: "terrariums" as Tab,
  selected: null as string | null,
  /** Chosen terrarium for each market offer, kept across renders. */
  targets: {} as Record<string, string>,
  toast: "",
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
  if (s.stage === "egg") return s.stageSince + 30_000;
  if (s.stage === "pupa") return s.stageSince + 120_000;
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
    ${salamanderSvg(s.genome, s.stage)}
    <div class="name">${name}</div>
    <div class="meta">${s.sex === "female" ? "♀" : "♂"} · ${STAGE_NAMES[s.stage]}${end ? ` · ${timer(end)}` : ""}</div>
    ${actions}
  </div>`;
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
          <span>${t.nextLayingAt ? `Next laying ${timer(t.nextLayingAt)}` : "No laying: needs a ♀ and a ♂ adult and room"}</span>
        </div>
        <div class="slots">${decorationSlots(t)}</div>
        <div class="grid">
          ${t.inhabitants.map((s) => salamanderCard(s, t)).join("")}
          ${deliveries
            .map(
              (d) => `<div class="card salamander-card pending">${salamanderSvg(d.salamander.genome)}<div class="name">${speciesName(d.salamander.genome)}</div><div class="meta">Arriving in ${timer(d.arrivesAt)}</div></div>`,
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
        ${salamanderSvg(o.genome)}
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

function encyclopediaView(): string {
  const found = state.discovered.length;
  const seen = Object.keys(state.decorationsSeen).length;
  const total = DECORATION_THEMES.length * DECORATION_TYPES.length;
  return `<h2>Species</h2>
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
  const views = { terrariums: terrariumsView, market: marketView, encyclopedia: encyclopediaView };
  app.innerHTML = `
    <header class="top"><h1>Salamanders</h1><div class="coins">${fmt(state.coins)} 🪙</div></header>
    <main>${views[ui.tab]()}</main>
    ${ui.toast ? `<div class="toast">${ui.toast}</div>` : ""}
    <nav class="tabs">
      ${(["terrariums", "market", "encyclopedia"] as const)
        .map((t) => `<button data-action="tab" data-tab="${t}" class="${ui.tab === t ? "active" : ""}">${{ terrariums: "🏠 Terrariums", market: "🛒 Market", encyclopedia: "📖 Species" }[t]}</button>`)
        .join("")}
    </nav>`;
}

function commit(error: string | null = null): void {
  ui.toast = error ?? "";
  if (error) setTimeout(() => ((ui.toast = ""), render()), 2500);
  save(state);
  render();
}

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
    state.deliveries.length,
    state.terrariums.map((t) => [t.nextLayingAt, t.inhabitants.map((s) => s.stage)]),
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
