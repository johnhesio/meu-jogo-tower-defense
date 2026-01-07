import { ELEMENTOS, CAMINHO } from '../constants.js';

export class Enemy {
    constructor(elementoTipo) {
        this.waypointIndex = 0;
        this.x = CAMINHO[0].x;
        this.y = CAMINHO[0].y;
        this.velocidade = 2;
        this.tipo = elementoTipo;
        this.cor = ELEMENTOS[elementoTipo].cor;
        this.raio = 20;
    }

    atualizar() {
        // Lógica de movimento (igual à anterior)
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
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
        ctx.fillStyle = this.cor;
        ctx.fill();
        ctx.closePath();
    }
}