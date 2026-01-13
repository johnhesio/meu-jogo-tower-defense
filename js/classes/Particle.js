export class Particle {
  constructor(x, y, cor) {
    this.x = x;
    this.y = y;
    this.cor = cor;

    // Movimento aleatório (Explosão)
    const angulo = Math.random() * Math.PI * 2;
    const velocidade = Math.random() * 3 + 1; // Velocidade entre 1 e 4

    this.vx = Math.cos(angulo) * velocidade;
    this.vy = Math.sin(angulo) * velocidade;

    this.vida = 1.0; // Opacidade (começa em 100%)
    this.decaimento = Math.random() * 0.03 + 0.02; // Velocidade que desaparece
    this.tamanho = Math.random() * 3 + 2;
  }

  atualizar() {
    this.x += this.vx;
    this.y += this.vy;

    // Diminui a opacidade e o tamanho
    this.vida -= this.decaimento;
    this.tamanho *= 0.95;
  }

  desenhar(ctx) {
    ctx.save();
    ctx.globalAlpha = this.vida; // Aplica transparência
    ctx.fillStyle = this.cor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.tamanho, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
