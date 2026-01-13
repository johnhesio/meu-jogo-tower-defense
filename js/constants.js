// js/constants.js

// Definição dos Elementos e Cores
export const ELEMENTOS = {
  AGUA: { cor: "#3498db", forteContra: "FOGO" },
  FOGO: { cor: "#e74c3c", forteContra: "AR" },
  TERRA: { cor: "#795548", forteContra: "AGUA" },
  AR: { cor: "#ecf0f1", forteContra: "TERRA" },
  LUZ: { cor: "#f1c40f", forteContra: "ESCURIDAO" },
  ESCURIDAO: { cor: "#8e44ad", forteContra: "LUZ" },
};

// NOVO CAMINHO (Estilo Serpentina / Ziguezague)
// Desenhado para maximizar o tempo de jogo na resolução 1280x720
export const CAMINHO = [
  // 1. Entra pela Esquerda (Topo)
  { x: 0, y: 150 },

  // 2. Vai até quase ao fim da Direita
  { x: 1100, y: 150 },

  // 3. Desce para o meio
  { x: 1100, y: 360 },

  // 4. Volta tudo para a Esquerda
  { x: 180, y: 360 },

  // 5. Desce mais um pouco
  { x: 180, y: 570 },

  // 6. Vai até ao fim da Direita (Saída)
  { x: 1280, y: 570 },
];
