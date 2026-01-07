// Definição dos Elementos e Cores
export const ELEMENTOS = {
  AGUA: { cor: "#3498db", forteContra: "FOGO" },
  FOGO: { cor: "#e74c3c", forteContra: "AR" },
  TERRA: { cor: "#795548", forteContra: "AGUA" },
  AR: { cor: "#ecf0f1", forteContra: "TERRA" },
  LUZ: { cor: "#f1c40f", forteContra: "ESCURIDAO" },
  ESCURIDAO: { cor: "#8e44ad", forteContra: "LUZ" },
};

// Mapa ajustado para 1280x720
export const CAMINHO = [
  { x: 0, y: 360 }, // Início (Esquerda)
  { x: 640, y: 360 }, // Vai até ao meio
  { x: 640, y: 150 }, // Sobe
  { x: 1000, y: 150 }, // Direita
  { x: 1000, y: 600 }, // Desce
  { x: 1280, y: 600 }, // Fim (Direita)
];
