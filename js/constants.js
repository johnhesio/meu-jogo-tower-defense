// js/constants.js

export const ELEMENTOS = {
  AGUA: {
    cor: "#3498db",
    forteContra: "FOGO",
    poder: "SLOW", // Identificador do poder
    desc: "Reduz a velocidade em 50%",
  },
  FOGO: {
    cor: "#e74c3c",
    forteContra: "AR",
    poder: "BURN",
    desc: "Causa dano contínuo (Queimadura)",
  },
  TERRA: {
    cor: "#795548",
    forteContra: "AGUA",
    poder: "STUN",
    desc: "Chance de parar o inimigo",
  },
  AR: {
    cor: "#ecf0f1",
    forteContra: "TERRA",
    poder: "PIERCE",
    desc: "Atravessa múltiplos inimigos",
  },
  LUZ: {
    cor: "#f1c40f",
    forteContra: "ESCURIDAO",
    poder: "RANGE",
    desc: "Alcance enorme e tiro rápido",
  },
  ESCURIDAO: {
    cor: "#8e44ad",
    forteContra: "LUZ",
    poder: "EXECUTE",
    desc: "Mata instantaneamente se vida < 20%",
  },
};

// Caminho Longo (Serpentina)
export const CAMINHO = [
  { x: 0, y: 150 },
  { x: 1100, y: 150 },
  { x: 1100, y: 360 },
  { x: 180, y: 360 },
  { x: 180, y: 570 },
  { x: 1280, y: 570 },
];
  