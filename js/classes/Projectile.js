import { ELEMENTOS } from "../constants.js";

export class Projectile {
  constructor(x, y, alvo, elementoTipo, dano) {
    this.x = x;
    this.y = y;
    this.alvo = alvo;
    this.tipo = elementoTipo;
    this.cor = ELEMENTOS[elementoTipo].cor;
    this.dano = dano;

    this.velocidade = 8;
    this.raio = 5;

    // === CONTROLO DE COLISÃO ===
    this.hit = false;

    // Lógica de Perfuração (AR)
    this.pierce = elementoTipo === "AR" ? 3 : 1;
    this.inimigosAtingidos = [];

    // Lógica de Sniper (LUZ)
    if (elementoTipo === "LUZ") {
      this.velocidade = 20;
    }

    // === RASTRO (TRAIL) ===
    this.history = []; // Guarda as últimas posições
    this.maxHistory = 5; // Tamanho do rastro
  }

  atualizar() {
    // 1. Guardar posição atual no histórico antes de mover
    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > this.maxHistory) {
      this.history.shift(); // Remove a mais antiga
    }

    // 2. Movimento
    if (this.alvo) {
      const dx = this.alvo.x - this.x;
      const dy = this.alvo.y - this.y;
      const distancia = Math.sqrt(dx * dx + dy * dy);

      // Pequena otimização para não tremer quando chega muito perto
      if (distancia > 1) {
        this.vx = (dx / distancia) * this.velocidade;
        this.vy = (dy / distancia) * this.velocidade;
      }
    }

    this.x += this.vx || 0;
    this.y += this.vy || 0;
  }

  desenhar(ctx) {
    // 1. Desenhar o Rastro (Cauda)
    if (this.history.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.history[0].x, this.history[0].y);
      for (let i = 1; i < this.history.length; i++) {
        ctx.lineTo(this.history[i].x, this.history[i].y);
      }
      ctx.lineTo(this.x, this.y); // Conecta à posição atual

      ctx.strokeStyle = this.cor;
      ctx.lineWidth = this.raio;
      ctx.lineCap = "round";
      ctx.globalAlpha = 0.4; // Meio transparente
      ctx.stroke();
      ctx.globalAlpha = 1.0; // Volta ao normal
    }

    // 2. Desenhar a Cabeça do Projétil
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
    ctx.fillStyle = this.cor;
    ctx.fill();
    ctx.closePath();

    // Brilho extra no centro (para ficar "mágico")
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.raio * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
  }
}
