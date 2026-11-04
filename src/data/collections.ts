/**
 * Themed collections (see doc/GDD.md, "Themed collections").
 * Mirrors the "Collections" tab of the "Espèces" spreadsheet: each member is a species name.
 */

export interface Collection {
  id: string;
  name: string;
  members: readonly string[];
}

export const COLLECTIONS: readonly Collection[] = [
  {
    id: "ninja",
    name: "Ninja salamanders",
    members: ["Prasinus Caeruleolineata", "Prasinus Rutilolineata", "Prasinus Rubeolineata", "Prasinus Purpureolineata"],
  },
  { id: "plumbers", name: "Plumbers", members: ["Caeruleus Rubeogambata", "Caeruleus Viridogambata"] },
  { id: "traffic-light", name: "Traffic light", members: ["Ebenus Rubeopunctata", "Ebenus Rutilopunctata", "Ebenus Viridopunctata"] },
  {
    id: "flags",
    name: "European flags",
    members: ["Albus Caeruleolineata", "Albus Viridolineata", "Albus Rutilolineata", "Ebenus Aureolineata", "Ebenus Flavolineata"],
  },
  { id: "rasta", name: "Rasta", members: ["Prasinus Flavonebulata", "Flavus Rubeonebulata", "Rubeus Prasinonebulata"] },
  {
    id: "rainbow",
    name: "Rainbow",
    members: [
      "Rubeus Rutilogradata",
      "Rutilus Flavogradata",
      "Flavus Viridogradata",
      "Viridus Azureogradata",
      "Azureus Caeruleogradata",
      "Caeruleus Purpureogradata",
      "Purpureus Rubeogradata",
    ],
  },
  {
    id: "halloween",
    name: "Halloween",
    members: ["Rutilus Ebenocapitata", "Ebenus Albocraniata", "Vitreus Nudata", "Purpureus Citreovolutata"],
  },
  {
    id: "christmas",
    name: "Christmas",
    members: ["Rubeus Albostellata", "Prasinus Aureostellata", "Prasinus Rubeopunctata", "Albus Argenteostellata"],
  },
  {
    id: "elements",
    name: "The four elements",
    members: ["Rubeus Rutilovolutata", "Caeruleus Azureovolutata", "Fuscus Prasinovolutata", "Albus Azureonebulata"],
  },
  {
    id: "solar-system",
    name: "Solar system",
    members: [
      "Argenteus Ebenopunctata",
      "Flavus Albonebulata",
      "Caeruleus Viridomaculata",
      "Rubeus Fuscomaculata",
      "Rutilus Fuscoannulata",
      "Aureus Flavoannulata",
      "Azureus Nudata",
      "Caeruleus Ebenonebulata",
    ],
  },
  {
    id: "gemstones",
    name: "Gemstones",
    members: [
      "Rubeus Albosagittata Lucidum",
      "Caeruleus Albosagittata Lucidum",
      "Prasinus Albosagittata Lucidum",
      "Purpureus Albosagittata Lucidum",
      "Aureus Albosagittata Lucidum",
      "Vitreus Argenteosagittata Lucidum",
    ],
  },
  {
    id: "coats",
    name: "Coats",
    members: ["Albus Ebenostrigata", "Rutilus Ebenostrigata", "Aureus Ebenomaculata", "Albus Ebenomaculata", "Albus Ebenonebulata"],
  },
  {
    id: "insects",
    name: "Insects",
    members: ["Rubeus Ebenopunctata", "Flavus Ebenoannulata", "Ebenus Citreogambata Lucidum", "Rutilus Ebenovolutata"],
  },
  {
    id: "sentai",
    name: "Sentai",
    members: [
      "Rubeus Albocapitata",
      "Caeruleus Albocapitata",
      "Flavus Albocapitata",
      "Roseus Albocapitata",
      "Ebenus Albocapitata",
      "Prasinus Aureocapitata",
    ],
  },
  {
    id: "blue-elves",
    name: "Blue elves",
    members: ["Azureus Albocapitata Pumilum", "Azureus Rubeocapitata Pumilum", "Azureus Flavocapitata Pumilum"],
  },
  {
    id: "seven-dwarfs",
    name: "The seven dwarfs",
    members: [
      "Albus Rubeocapitata Pumilum",
      "Flavus Rubeocapitata Pumilum",
      "Rutilus Rubeocapitata Pumilum",
      "Fuscus Rubeocapitata Pumilum",
      "Viridus Rubeocapitata Pumilum",
      "Purpureus Rubeocapitata Pumilum",
      "Caeruleus Rubeocapitata Pumilum",
    ],
  },
  {
    id: "maze-ghosts",
    name: "Maze ghosts",
    members: ["Rubeus Nudata Oculum", "Roseus Nudata Oculum", "Azureus Nudata Oculum", "Rutilus Nudata Oculum"],
  },
  {
    id: "olympic-rings",
    name: "Olympic rings",
    members: ["Albus Caeruleoannulata", "Albus Flavoannulata", "Albus Ebenoannulata", "Albus Prasinoannulata", "Albus Rubeoannulata"],
  },
  { id: "podium", name: "Podium", members: ["Aureus Nudata Lucidum", "Argenteus Nudata Lucidum", "Fuscus Nudata Lucidum"] },
  {
    id: "fruit-basket",
    name: "Fruit basket",
    members: [
      "Rubeus Flavopunctata",
      "Flavus Fuscomaculata",
      "Prasinus Viridostrigata",
      "Rutilus Prasinocapitata",
      "Purpureus Roseopunctata",
      "Citreus Nudata",
    ],
  },
  { id: "yin-yang", name: "Yin and yang", members: ["Albus Ebenovolutata", "Ebenus Albovolutata"] },
  {
    id: "rockers",
    name: "Made-up rockers",
    members: ["Albus Ebenocapitata", "Albus Ebenostellata", "Albus Argenteocapitata", "Albus Ebenopunctata"],
  },
  { id: "helmets", name: "Helmeted duo", members: ["Ebenus Argenteocapitata", "Ebenus Aureocapitata"] },
  {
    id: "antennas",
    name: "Antenna toddlers",
    members: ["Purpureus Nudata Cornum", "Viridus Nudata Cornum", "Flavus Nudata Cornum", "Rubeus Nudata Cornum"],
  },
];
