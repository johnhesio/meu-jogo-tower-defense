import { CAMINHO } from './constants.js';
import { Enemy } from './classes/Enemy.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const inimigos = [];

// Função para criar waves (teste)
function spawnEnemy() {
    inimigos.push(new Enemy('FOGO'));
    inimigos.push(new Enemy('AGUA'));
}

function loop() {
    // 1. Limpar
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Desenhar Caminho
    ctx.beginPath();
    ctx.moveTo(CAMINHO[0].x, CAMINHO[0].y);
    for (let p of CAMINHO) ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 40;
    ctx.stroke();

    // 3. Gerir Inimigos
    inimigos.forEach((mob) => {
        mob.atualizar();
        mob.desenhar(ctx); // Passamos o ctx para o inimigo se desenhar
    });

    requestAnimationFrame(loop);
}

// Iniciar
setInterval(spawnEnemy, 2000); // Cria inimigos a cada 2s
loop();