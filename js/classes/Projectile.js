import { ELEMENTOS } from "../constants.js";

export class Projectile {
  constructor(x, y, alvo, elementoTipo, dano) {
    this.x = x;
    this.y = y;
    this.alvo = alvo; // O inimigo que este tiro está a perseguir
    this.tipo = elementoTipo;
    this.cor = ELEMENTOS[elementoTipo].cor;
    this.dano = dano;

    this.velocidade = 8; // Rapidez do tiro
    this.raio = 5;
    this.hit = false; // Marca se já acertou
  }

  atualizar() {
    // Se o inimigo já morreu ou sumiu, o tiro some também
    if (!this.alvo || this.alvo.vida <= 0) {
      this.hit = true;
      return;
    }

    // Matemática para perseguir o alvo
    const dx = this.alvo.x - this.x;
    const dy = this.alvo.y - this.y;
    const distancia = Math.sqrt(dx * dx + dy * dy);

    // Se estiver muito perto, colidiu!
    if (distancia < this.velocidade + this.alvo.raio) {
      this.hit = true;
      return; // A lógica de dano será feita no main.js
    }

    // Move o projétil na direção do inimigo
    this.x += (dx / distancia) * this.velocidade;
    this.y += (dy / distancia) * this.velocidade;
  }

  desenhar(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
    ctx.fillStyle = this.cor;
    ctx.fill();
    ctx.closePath();
  }
}
