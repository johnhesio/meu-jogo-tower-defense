import { ELEMENTOS, CAMINHO } from "../constants.js";

export class Enemy {
  // Agora aceita vidaExtra no construtor
  constructor(elementoTipo, vidaExtra = 0) {
    this.waypointIndex = 0;
    this.x = CAMINHO[0].x;
    this.y = CAMINHO[0].y;

    this.velocidadeBase = 2;
    this.velocidadeAtual = 2;

    // Vida Base (150) + Dificuldade da Wave
    this.maxVida = 150 + vidaExtra;
    this.vida = this.maxVida;

    this.raio = 20;
    this.tipo = elementoTipo;
    this.corBase = ELEMENTOS[elementoTipo].cor;

    // Debuffs
    this.slowTimer = 0;
    this.stunTimer = 0;
    this.burnTimer = 0;
    this.burnTick = 0;
  }

  atualizar() {
    this.velocidadeAtual = this.velocidadeBase;

    if (this.slowTimer > 0) {
      this.velocidadeAtual *= 0.5;
      this.slowTimer--;
    }
    if (this.stunTimer > 0) {
      this.velocidadeAtual = 0;
      this.stunTimer--;
    }
    if (this.burnTimer > 0) {
      this.burnTimer--;
      this.burnTick++;
      if (this.burnTick % 30 === 0) this.vida -= 5;
    }

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
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);

    if (this.stunTimer > 0) ctx.fillStyle = "#795548";
    else if (this.slowTimer > 0) ctx.fillStyle = "#85C1E9";
    else if (this.burnTimer > 0) ctx.fillStyle = "#E67E22";
    else ctx.fillStyle = this.corBase;

    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.closePath();

    if (this.stunTimer > 0) this.desenharStatus(ctx, "⛔", -15);
    if (this.slowTimer > 0) this.desenharStatus(ctx, "❄️", -15);
    if (this.burnTimer > 0) this.desenharStatus(ctx, "🔥", -25);

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
