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
    this.hit = false; // Se deve ser destruído

    // Lógica de Perfuração (AR)
    // Se for AR, atravessa 3 inimigos. Outros elementos, apenas 1.
    this.pierce = elementoTipo === "AR" ? 3 : 1;

    // Lista de IDs de inimigos já atingidos para não atingir o mesmo 2x
    // (Usamos o objeto do inimigo como referência)
    this.inimigosAtingidos = [];

    // Lógica de Sniper (LUZ) - Tiro Instantâneo/Muito Rápido
    if (elementoTipo === "LUZ") {
      this.velocidade = 20;
    }
  }

  atualizar() {
    // Se for teleguiado (padrão) e o alvo ainda existir
    // Nota: Para tiros de AR (que perfuram), geralmente fazemos linha reta,
    // mas para simplificar, vamos manter a perseguição ao alvo principal
    // e se ele morrer, o tiro continua na última direção (vetor).

    if (this.alvo) {
      const dx = this.alvo.x - this.x;
      const dy = this.alvo.y - this.y;
      const distancia = Math.sqrt(dx * dx + dy * dy);

      this.vx = (dx / distancia) * this.velocidade;
      this.vy = (dy / distancia) * this.velocidade;
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  desenhar(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
    ctx.fillStyle = this.cor;
    ctx.fill();
    ctx.closePath();
  }
}
