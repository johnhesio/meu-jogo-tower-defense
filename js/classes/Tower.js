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
      this.raioAlcance = 300; // Alcance enorme (Sniper)
      this.dano = 40; // Dano alto
      this.velocidadeAtaque = 90; // Atira devagar
    } else if (elementoTipo === "TERRA") {
      this.velocidadeAtaque = 80; // Lento
      this.dano = 30; // Dano alto
    } else if (elementoTipo === "AR") {
      this.dano = 15; // Dano menor, mas acerta vários
    }
  }

  atualizar(inimigos, listaProjeteis) {
    if (this.cooldown > 0) {
      this.cooldown--;
    }

    if (this.cooldown <= 0) {
      // Filtra inimigos no alcance
      const alvosPossiveis = inimigos.filter((mob) => {
        const dx = mob.x - this.x;
        const dy = mob.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist <= this.raioAlcance;
      });

      if (alvosPossiveis.length > 0) {
        // Estratégia de Alvo:
        // Escuridão prefere inimigos com pouca vida (para executar)
        let alvo;
        if (this.tipo === "ESCURIDAO") {
          alvo = alvosPossiveis.sort((a, b) => a.vida - b.vida)[0];
        } else {
          alvo = alvosPossiveis[0]; // O primeiro que entrou (padrão)
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
    // Visual simples da Torre
    ctx.fillStyle = this.cor;
    ctx.fillRect(
      this.x - this.largura / 2,
      this.y - this.altura / 2,
      this.largura,
      this.altura
    );

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      this.x - this.largura / 2,
      this.y - this.altura / 2,
      this.largura,
      this.altura
    );

    // Ícone do elemento no topo (Opcional, só para ficar bonito)
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    let icone = "";
    if (this.tipo === "AGUA") icone = "💧";
    if (this.tipo === "FOGO") icone = "🔥";
    if (this.tipo === "TERRA") icone = "🪨";
    if (this.tipo === "AR") icone = "🌪️";
    if (this.tipo === "LUZ") icone = "✨";
    if (this.tipo === "ESCURIDAO") icone = "🌑";
    ctx.fillText(icone, this.x, this.y + 7);
  }
}
