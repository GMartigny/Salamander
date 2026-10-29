import "./style.css";
import { createInitialState } from "./game/state";

const state = createInitialState();
const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = `
    <h1>Salamanders</h1>
    <p>${state.coins} coins</p>
  `;
}
