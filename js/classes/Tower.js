import { ELEMENTOS } from '../constants.js';
import { Projectile } from './Projectile.js';

export class Tower {
    constructor(x, y, elementoTipo) {
        this.x = x;
        this.y = y;
        this.tipo = elementoTipo;
        this.cor = ELEMENTOS[elementoTipo].cor;
        
        this.largura = 40;
        this.altura = 40;

        // === SISTEMA DE NÍVEIS ===
        this.nivel = 1;
        this.maxNivel = 3; // Máximo de 3 níveis

        // Stats Base
        this.raioAlcance = 180; 
        this.dano = 20;
        this.velocidadeAtaque = 60; // Frames (60 = 1 segundo)
        this.cooldown = 0;

        // Ajustes Iniciais por Elemento
        this.aplicarAtributosElementais();
    }

    aplicarAtributosElementais() {
        if (this.tipo === 'LUZ') {
            this.raioAlcance = 300; this.dano = 40; this.velocidadeAtaque = 90; 
        } 
        else if (this.tipo === 'TERRA') {
            this.velocidadeAtaque = 80; this.dano = 30;             
        }
        else if (this.tipo === 'AR') {
            this.dano = 15;             
        }
    }

    // === NOVO: FUNÇÃO DE UPGRADE ===
    upgrade() {
        if (this.nivel >= this.maxNivel) return false;

        this.nivel++;
        
        // Aumenta poder a cada nível
        this.dano *= 1.5;             // +50% Dano
        this.raioAlcance *= 1.1;      // +10% Alcance
        this.velocidadeAtaque *= 0.9; // -10% Tempo de espera (atira mais rápido)

        return true; // Sucesso
    }

    atualizar(inimigos, listaProjeteis) {
        if (this.cooldown > 0) this.cooldown--;

        if (this.cooldown <= 0) {
            const alvosPossiveis = inimigos.filter(mob => {
                const dx = mob.x - this.x;
                const dy = mob.y - this.y;
                return Math.sqrt(dx*dx + dy*dy) <= this.raioAlcance;
            });

            if (alvosPossiveis.length > 0) {
                let alvo = alvosPossiveis[0];
                if (this.tipo === 'ESCURIDAO') {
                    alvo = alvosPossiveis.sort((a, b) => a.vida - b.vida)[0];
                }
                this.atirar(alvo, listaProjeteis);
                this.cooldown = this.velocidadeAtaque;
            }
        }
    }

    atirar(alvo, listaProjeteis) {
        listaProjeteis.push(new Projectile(this.x, this.y, alvo, this.tipo, this.dano));
    }

    desenhar(ctx) {
        // A torre cresce um pouquinho a cada nível
        const tamanhoExtra = (this.nivel - 1) * 4;

        // 1. BASE
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x - 20 - tamanhoExtra/2, this.y - 20 - tamanhoExtra/2, 40 + tamanhoExtra, 40 + tamanhoExtra);
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - 20 - tamanhoExtra/2, this.y - 20 - tamanhoExtra/2, 40 + tamanhoExtra, 40 + tamanhoExtra);

        // 2. CRISTAL
        ctx.fillStyle = this.cor;
        ctx.fillRect(this.x - 12, this.y - 12, 24, 24);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - 12, this.y - 12, 24, 24);

        // 3. INDICADORES DE NÍVEL (Bolinhas Douradas)
        for(let i = 0; i < this.nivel; i++) {
            ctx.beginPath();
            // Desenha bolinhas empilhadas ao lado da torre
            ctx.arc(this.x + 26 + tamanhoExtra/2, this.y - 10 + (i * 10), 4, 0, Math.PI * 2);
            ctx.fillStyle = '#f1c40f'; // Ouro
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
        }

        // 4. ÍCONE
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        
        let icone = "";
        if(this.tipo === 'AGUA') icone = "💧";
        if(this.tipo === 'FOGO') icone = "🔥";
        if(this.tipo === 'TERRA') icone = "🪨";
        if(this.tipo === 'AR') icone = "🌪️";
        if(this.tipo === 'LUZ') icone = "✨";
        if(this.tipo === 'ESCURIDAO') icone = "🌑";
        
        ctx.fillText(icone, this.x, this.y + 1);
    }
}