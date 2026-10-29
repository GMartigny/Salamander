# Salamandres

Jeu de collection où l'on élève et croise de petites salamandres virtuelles pour faire apparaître des mutations rares. Web responsive, jouable sur mobile en portrait, façon idle game sans friction.

Le game design est décrit dans [doc/GDD.md](doc/GDD.md).

## Démarrer

```sh
npm install
npm run dev
```

## Scripts

- `npm run dev` : serveur de développement
- `npm run build` : vérification des types puis build de production
- `npm test` : tests unitaires (Vitest)

## Structure

```
doc/          Game design document
src/
  data/       Données du jeu : couleurs et graphe des mutations, patterns, détails
  game/       Logique : salamandres, génétique, terrariums, état de la partie
  render/     Dessin procédural des salamandres
  ui/         Écrans (terrariums, marché, commandes, encyclopédie)
  main.ts     Point d'entrée
```
