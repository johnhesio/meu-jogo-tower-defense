// js/constants.js

export const ELEMENTOS = {
  AGUA: {
    cor: "#3498db",
    forteContra: "FOGO",
    poder: "SLOW",
    desc: "Reduz a velocidade em 50%",
  },
  FOGO: {
    cor: "#e74c3c",
    forteContra: "AR",
    poder: "BURN",
    desc: "Causa dano contínuo",
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
    desc: "Mata se vida < 20%",
  },
};

export const CAMINHO = [
  { x: 0, y: 150 },
  { x: 1100, y: 150 },
  { x: 1100, y: 360 },
  { x: 180, y: 360 },
  { x: 180, y: 570 },
  { x: 1280, y: 570 },
];

// === CONFIGURAÇÃO DAS WAVES ===
export const WAVES = [
  // Wave 1: Introdução (Só Terra e Água)
  {
    quantidade: 5,
    intervalo: 1500, // 1.5s entre inimigos
    tipos: ["TERRA", "AGUA"],
    vidaExtra: 0, // Vida base
  },
  // Wave 2: Mais rápidos (Ar e Fogo)
  {
    quantidade: 10,
    intervalo: 1200,
    tipos: ["AR", "FOGO"],
    vidaExtra: 50, // +50 de vida
  },
  // Wave 3: Mistura
  {
    quantidade: 15,
    intervalo: 1000,
    tipos: ["AGUA", "FOGO", "TERRA", "AR"],
    vidaExtra: 100,
  },
  // Wave 4: Trevas e Luz
  {
    quantidade: 20,
    intervalo: 800,
    tipos: ["LUZ", "ESCURIDAO"],
    vidaExtra: 200,
  },
  // Wave 5: BOSS RUSH (Muitos e fortes)
  {
    quantidade: 30,
    intervalo: 500, // Spawn muito rápido
    tipos: ["AGUA", "FOGO", "TERRA", "AR", "LUZ", "ESCURIDAO"],
    vidaExtra: 500,
  },
];
