import { ELEMENTOS } from "../constants.js";
import { Projectile } from "./Projectile.js";

export class Tower {
  constructor(x, y, elementoTipo) {
    this.x = x;
    this.y = y;
    this.tipo = elementoTipo;
    this.cor = ELEMENTOS[elementoTipo].cor;

    this.largura = 40;
    this.altura = 40;

    // === ESTATÍSTICAS BASE ===
    this.raioAlcance = 180;
    this.dano = 20;
    this.velocidadeAtaque = 60; // Frames (60 = 1 seg)
    this.cooldown = 0;

    // === ESTATÍSTICAS ESPECIAIS POR ELEMENTO ===
    if (elementoTipo === "LUZ") {
      this.raioAlcance = 300; // Sniper
      this.dano = 40;
      this.velocidadeAtaque = 90;
    } else if (elementoTipo === "TERRA") {
      this.velocidadeAtaque = 80; // Lento
      this.dano = 30;
    } else if (elementoTipo === "AR") {
      this.dano = 15;
    }
  }

  atualizar(inimigos, listaProjeteis) {
    if (this.cooldown > 0) {
      this.cooldown--;
    }

    if (this.cooldown <= 0) {
      const alvosPossiveis = inimigos.filter((mob) => {
        const dx = mob.x - this.x;
        const dy = mob.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist <= this.raioAlcance;
      });

      if (alvosPossiveis.length > 0) {
        let alvo;
        // Prioridade de alvo: Escuridão foca nos fracos, outros no primeiro
        if (this.tipo === "ESCURIDAO") {
          alvo = alvosPossiveis.sort((a, b) => a.vida - b.vida)[0];
        } else {
          alvo = alvosPossiveis[0];
        }

        this.atirar(alvo, listaProjeteis);
        this.cooldown = this.velocidadeAtaque;
      }
    }
  }

  atirar(alvo, listaProjeteis) {
    listaProjeteis.push(
      new Projectile(this.x, this.y, alvo, this.tipo, this.dano)
    );
  }

  desenhar(ctx) {
    // 1. Desenhar a BASE da torre (Cinza Escuro)
    ctx.fillStyle = "#2c3e50";
    // Sombra leve
    ctx.fillRect(this.x - 20, this.y - 20, 40, 40);

    // Detalhe da base (Borda metálica)
    ctx.strokeStyle = "#95a5a6";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x - 20, this.y - 20, 40, 40);

    // 2. Desenhar o CRISTAL ELEMENTAL (Menor, no centro)
    ctx.fillStyle = this.cor;
    ctx.fillRect(this.x - 12, this.y - 12, 24, 24);

    // Brilho do cristal (Borda clara)
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x - 12, this.y - 12, 24, 24);

    // 3. ÍCONE DO ELEMENTO (No topo)
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";

    let icone = "";
    if (this.tipo === "AGUA") icone = "💧";
    if (this.tipo === "FOGO") icone = "🔥";
    if (this.tipo === "TERRA") icone = "🪨";
    if (this.tipo === "AR") icone = "🌪️";
    if (this.tipo === "LUZ") icone = "✨";
    if (this.tipo === "ESCURIDAO") icone = "🌑";

    ctx.fillText(icone, this.x, this.y + 1); // +1 para ajuste visual
  }
}
