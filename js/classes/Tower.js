import { ELEMENTOS } from "../constants.js";
import { Projectile } from "./Projectile.js";

export class Tower {
  constructor(x, y, elementoTipo) {
    this.x = x;
    this.y = y;
    this.tipo = elementoTipo;
    this.cor = ELEMENTOS[elementoTipo].cor;

    // Atributos de combate
    this.raioAlcance = 200;
    this.dano = 25;
    this.velocidadeAtaque = 60; // Frames entre tiros (60 frames = 1 segundo)
    this.cooldown = 0; // Contador regressivo

    this.largura = 40;
    this.altura = 40;
  }

  // Recebe a lista de inimigos para procurar alvo e a lista de projéteis para adicionar o tiro
  atualizar(inimigos, listaProjeteis) {
    // 1. Gestão do Cooldown (Recarga)
    if (this.cooldown > 0) {
      this.cooldown--;
    }

    // 2. Procurar alvo se a arma estiver carregada
    if (this.cooldown <= 0) {
      // Filtra inimigos que estão dentro do alcance
      const alvosPossiveis = inimigos.filter((mob) => {
        const dx = mob.x - this.x;
        const dy = mob.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist <= this.raioAlcance;
      });

      // Se houver alguém no alcance, dispara no primeiro (o mais antigo)
      if (alvosPossiveis.length > 0) {
        const alvo = alvosPossiveis[0];
        this.atirar(alvo, listaProjeteis);
        this.cooldown = this.velocidadeAtaque; // Reinicia a recarga
      }
    }
  }

  atirar(alvo, listaProjeteis) {
    // Cria um projétil novo na posição da torre
    listaProjeteis.push(
      new Projectile(this.x, this.y, alvo, this.tipo, this.dano)
    );
  }

  desenhar(ctx) {
    // Área de alcance (só desenha se passarmos o mouse - opcional, deixei fixo por enquanto para debug)
    /* ctx.beginPath();
        ctx.arc(this.x, this.y, this.raioAlcance, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fill(); 
        */

    // Base da Torre
    ctx.fillStyle = this.cor;
    ctx.fillRect(
      this.x - this.largura / 2,
      this.y - this.altura / 2,
      this.largura,
      this.altura
    );

    // Borda Branca
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      this.x - this.largura / 2,
      this.y - this.altura / 2,
      this.largura,
      this.altura
    );
  }
}
