import { ELEMENTOS, CAMINHO } from "../constants.js";

export class Enemy {
  constructor(elementoTipo) {
    this.waypointIndex = 0;
    this.x = CAMINHO[0].x;
    this.y = CAMINHO[0].y;

    this.velocidade = 1.5;
    this.maxVida = 100; // Vida total
    this.vida = 100; // Vida atual
    this.raio = 20;

    this.tipo = elementoTipo;
    this.cor = ELEMENTOS[elementoTipo].cor;
  }

  atualizar() {
    const alvo = CAMINHO[this.waypointIndex + 1];
    if (!alvo) return;

    const dx = alvo.x - this.x;
    const dy = alvo.y - this.y;
    const distancia = Math.sqrt(dx * dx + dy * dy);

    if (distancia < this.velocidade) {
      this.waypointIndex++;
    } else {
      this.x += (dx / distancia) * this.velocidade;
      this.y += (dy / distancia) * this.velocidade;
    }
  }

  desenhar(ctx) {
    // Corpo do Inimigo
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
    ctx.fillStyle = this.cor;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.closePath();

    // === BARRA DE VIDA ===
    const larguraBarra = 40;
    const alturaBarra = 5;
    const xBarra = this.x - larguraBarra / 2;
    const yBarra = this.y - this.raio - 10;

    // Fundo vermelho (dano)
    ctx.fillStyle = "red";
    ctx.fillRect(xBarra, yBarra, larguraBarra, alturaBarra);

    // Frente verde (vida atual)
    const percentualVida = this.vida / this.maxVida;
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(xBarra, yBarra, larguraBarra * percentualVida, alturaBarra);
  }
}
