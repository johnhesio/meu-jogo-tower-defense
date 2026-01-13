import { ELEMENTOS, CAMINHO } from "../constants.js";

export class Enemy {
  constructor(elementoTipo) {
    this.waypointIndex = 0;
    this.x = CAMINHO[0].x;
    this.y = CAMINHO[0].y;

    // Status Base
    this.velocidadeBase = 2; // Velocidade normal
    this.velocidadeAtual = 2;
    this.maxVida = 150; // Aumentei um pouco a vida para testar os poderes
    this.vida = 150;
    this.raio = 20;

    this.tipo = elementoTipo;
    this.corBase = ELEMENTOS[elementoTipo].cor;

    // === CONTROLO DE EFEITOS (DEBUFFS) ===
    this.slowTimer = 0; // Tempo restante de lentidão (Água)
    this.stunTimer = 0; // Tempo restante parado (Terra)
    this.burnTimer = 0; // Tempo restante queimando (Fogo)
    this.burnTick = 0; // Controle para dano por segundo
  }

  atualizar() {
    // 1. Gerir Efeitos de Status
    this.velocidadeAtual = this.velocidadeBase;

    // Efeito: ÁGUA (Slow)
    if (this.slowTimer > 0) {
      this.velocidadeAtual *= 0.5; // 50% de velocidade
      this.slowTimer--;
    }

    // Efeito: TERRA (Stun)
    if (this.stunTimer > 0) {
      this.velocidadeAtual = 0; // Parado
      this.stunTimer--;
    }

    // Efeito: FOGO (Burn - Dano por tempo)
    if (this.burnTimer > 0) {
      this.burnTimer--;
      this.burnTick++;
      // Aplica dano a cada 30 frames (0.5 segundos)
      if (this.burnTick % 30 === 0) {
        this.vida -= 5; // Dano de queimadura
      }
    }

    // 2. Movimento (Se não estiver stunado)
    if (this.velocidadeAtual > 0) {
      const alvo = CAMINHO[this.waypointIndex + 1];
      if (!alvo) return;

      const dx = alvo.x - this.x;
      const dy = alvo.y - this.y;
      const distancia = Math.sqrt(dx * dx + dy * dy);

      if (distancia < this.velocidadeAtual) {
        this.waypointIndex++;
      } else {
        this.x += (dx / distancia) * this.velocidadeAtual;
        this.y += (dy / distancia) * this.velocidadeAtual;
      }
    }
  }

  desenhar(ctx) {
    // Corpo do Inimigo
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);

    // Mudar cor se estiver sob efeito
    if (this.stunTimer > 0) ctx.fillStyle = "#795548"; // Castanho (Stun)
    else if (this.slowTimer > 0) ctx.fillStyle = "#85C1E9"; // Azul claro (Gelo)
    else if (this.burnTimer > 0) ctx.fillStyle = "#E67E22"; // Laranja (Fogo)
    else ctx.fillStyle = this.corBase;

    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.closePath();

    // Indicador de Status (Texto pequeno em cima)
    if (this.stunTimer > 0) this.desenharStatus(ctx, "⛔", -15);
    if (this.slowTimer > 0) this.desenharStatus(ctx, "❄️", -15);
    if (this.burnTimer > 0) this.desenharStatus(ctx, "🔥", -25); // Um pouco mais acima

    // Barra de Vida
    const larguraBarra = 40;
    const alturaBarra = 5;
    const xBarra = this.x - larguraBarra / 2;
    const yBarra = this.y - this.raio - 10;

    ctx.fillStyle = "red";
    ctx.fillRect(xBarra, yBarra, larguraBarra, alturaBarra);

    const percentualVida = Math.max(0, this.vida / this.maxVida);
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(xBarra, yBarra, larguraBarra * percentualVida, alturaBarra);
  }

  desenharStatus(ctx, emoji, offsetY) {
    ctx.font = "12px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(emoji, this.x - 6, this.y + offsetY);
  }
}
