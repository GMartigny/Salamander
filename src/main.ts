import "./style.css";
import { createInitialState } from "./game/state";

const state = createInitialState();
const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = `
    <h1>Salamandres</h1>
    <p>${state.coins} pièces</p>
  `;
}
