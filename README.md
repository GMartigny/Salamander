# Salamanders

A collection game where you raise and crossbreed small virtual salamanders to bring out rare mutations. Responsive web, playable on mobile in portrait, idle-style with no friction.

The game design is described in [doc/GDD.md](doc/GDD.md).

## Getting started

```sh
npm install
npm run dev
```

## Scripts

- `npm run dev`: development server
- `npm run build`: type check, then production build
- `npm test`: unit tests (Vitest)

## Structure

```
doc/          Game design document
src/
  data/       Game data: colors and mutation graph, patterns, details, decorations
  game/       Logic: salamanders, genetics, terrariums, game state
  render/     Procedural salamander drawing
  ui/         Screens (terrariums, market, orders, encyclopedia)
  main.ts     Entry point
```
