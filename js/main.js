import { CAMINHO, ELEMENTOS, WAVES } from './constants.js';
import { Enemy } from './classes/Enemy.js';
import { Tower } from './classes/Tower.js';
import { Particle } from './classes/Particle.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const inimigos = [];
const torres = [];
const projeteis = [];
const particulas = [];

// Estado
let dinheiro = 150;
let vidas = 20;
let jogoRodando = true;
const CUSTO_TORRE = 50;
const CUSTO_UPGRADE = 100; // Custo para evoluir
let elementoSelecionado = 'AGUA'; 

// Mouse
let mouseX = 0;
let mouseY = 0;
let mouseNoCanvas = false;

// Waves
let waveIndex = 0;          
let inimigosParaSpawnar = 0; 
let tempoParaProximoSpawn = 0;
let tempoProximaWave = 0;    
let estadoWave = 'WAITING';  

// HTML
const displayVidas = document.getElementById('lives-display');
const displayDinheiro = document.getElementById('money-display');
const displayWave = document.getElementById('wave-display');
const telaGameOver = document.getElementById('game-over-screen');
const telaVitoria = document.getElementById('victory-screen');

// Seleção
const botoes = document.querySelectorAll('.tower-btn');
botoes.forEach(botao => {
    botao.addEventListener('click', () => {
        elementoSelecionado = botao.dataset.element;
        botoes.forEach(b => b.classList.remove('selected'));
        botao.classList.add('selected');
    });
});

// Rastrear Mouse
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height;
    mouseX = (event.clientX - rect.left) * escalaX;
    mouseY = (event.clientY - rect.top) * escalaY;
    mouseNoCanvas = true;
});
canvas.addEventListener('mouseleave', () => mouseNoCanvas = false);

// === CLIQUE INTELIGENTE (CORRIGIDO) ===
canvas.addEventListener('click', (event) => {
    if (!jogoRodando || !mouseNoCanvas) return;

    // 1. Calcular clique
    const rect = canvas.getBoundingClientRect();
    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height;
    const clickX = (event.clientX - rect.left) * escalaX;
    const clickY = (event.clientY - rect.top) * escalaY;

    // 2. VERIFICAR SE CLICOU EM TORRE EXISTENTE (UPGRADE)
    for (let t of torres) {
        const dx = clickX - t.x;
        const dy = clickY - t.y;
        
        // Se acertou na torre
        if (Math.sqrt(dx*dx + dy*dy) < 40) {
            
            if (t.nivel < t.maxNivel) {
                if (dinheiro >= CUSTO_UPGRADE) {
                    t.upgrade();
                    dinheiro -= CUSTO_UPGRADE;
                    
                    // Efeito Visual de Upgrade
                    for(let k=0; k<15; k++) particulas.push(new Particle(t.x, t.y, '#f1c40f'));
                    console.log("Upgrade realizado!");
                } else {
                    console.log("Dinheiro insuficiente para upgrade.");
                }
            } else {
                console.log("Nível máximo!");
            }
            return; // SAI DA FUNÇÃO. IMPEDE CONSTRUÇÃO.
        }
    }

    // 3. VERIFICAR SE PODE CONSTRUIR (ESPAÇO LIVRE)
    let espacoLivre = true;
    for (let t of torres) {
        const dx = clickX - t.x;
        const dy = clickY - t.y;
        // Se estiver a menos de 50px de outra torre
        if (Math.sqrt(dx*dx + dy*dy) < 50) {
            espacoLivre = false;
            break;
        }
    }

    // 4. CONSTRUIR
    if (espacoLivre) {
        if (dinheiro >= CUSTO_TORRE) {
            torres.push(new Tower(clickX, clickY, elementoSelecionado));
            dinheiro -= CUSTO_TORRE;
            // Efeito
            for(let k=0; k<10; k++) particulas.push(new Particle(clickX, clickY, '#fff'));
        }
    }
});

// Waves
function gerenciarWaves() {
    if (waveIndex >= WAVES.length && inimigos.length === 0) {
        jogoRodando = false; 
        telaVitoria.classList.remove('hidden'); 
        return;
    }
    if (estadoWave === 'WAITING') {
        tempoProximaWave++;
        if (tempoProximaWave < 300) { 
            ctx.fillStyle = "white"; ctx.font = "40px Orbitron"; ctx.textAlign = "center";
            ctx.fillText(`Próxima Wave em: ${Math.ceil((300 - tempoProximaWave)/60)}`, canvas.width/2, 100);
        } else { iniciarWave(); }
    }
    if (estadoWave === 'SPAWNING') {
        tempoParaProximoSpawn--;
        if (tempoParaProximoSpawn <= 0) {
            spawnEnemy();
            const dadosWave = WAVES[waveIndex];
            tempoParaProximoSpawn = dadosWave.intervalo / 16;
            inimigosParaSpawnar--;
            if (inimigosParaSpawnar <= 0) estadoWave = 'COMBAT'; 
        }
    }
    if (estadoWave === 'COMBAT') {
        if (inimigos.length === 0) {
            dinheiro += 100; 
            waveIndex++;     
            estadoWave = 'WAITING'; 
            tempoProximaWave = 0;   
        }
    }
}

function iniciarWave() {
    if (waveIndex >= WAVES.length) return; 
    const dadosWave = WAVES[waveIndex];
    inimigosParaSpawnar = dadosWave.quantidade;
    estadoWave = 'SPAWNING';
    displayWave.innerText = waveIndex + 1;
}

function spawnEnemy() {
    const dadosWave = WAVES[waveIndex];
    const tipoAleatorio = dadosWave.tipos[Math.floor(Math.random() * dadosWave.tipos.length)];
    inimigos.push(new Enemy(tipoAleatorio, dadosWave.vidaExtra));
}

// Loop
function loop() {
    if (!jogoRodando) return;

    // Mapa
    ctx.fillStyle = '#4CAF50'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); ctx.moveTo(CAMINHO[0].x, CAMINHO[0].y);
    for (let p of CAMINHO) ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = '#795548'; ctx.lineWidth = 80; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 74; ctx.stroke();

    displayVidas.innerText = vidas;
    displayDinheiro.innerText = dinheiro;

    gerenciarWaves();

    // Torres
    let torreSobMouse = null;
    torres.forEach(t => {
        t.atualizar(inimigos, projeteis);
        t.desenhar(ctx);

        // Detetar se o mouse está em cima para mostrar info
        const dx = mouseX - t.x;
        const dy = mouseY - t.y;
        if (Math.sqrt(dx*dx + dy*dy) < 30) torreSobMouse = t;
    });

    // === INFO DE UPGRADE (Visual quando passa o rato) ===
    if (torreSobMouse) {
        // Círculo de alcance
        ctx.beginPath();
        ctx.arc(torreSobMouse.x, torreSobMouse.y, torreSobMouse.raioAlcance, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.lineWidth = 1; ctx.stroke();

        // Texto do Custo
        if (torreSobMouse.nivel < torreSobMouse.maxNivel) {
            ctx.fillStyle = "#f1c40f"; // Dourado
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            // Fundo preto para ler melhor
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = "black";
            ctx.fillRect(torreSobMouse.x - 50, torreSobMouse.y - 60, 100, 25);
            ctx.globalAlpha = 1.0;
            
            // Texto
            ctx.fillStyle = "#f1c40f";
            ctx.fillText(`UP: $${CUSTO_UPGRADE}`, torreSobMouse.x, torreSobMouse.y - 42);
        } else {
            ctx.fillStyle = "#e74c3c"; // Vermelho
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "center";
            ctx.fillText("MAX LEVEL", torreSobMouse.x, torreSobMouse.y - 45);
        }
    }

    // Projéteis
    for (let i = projeteis.length - 1; i >= 0; i--) {
        const p = projeteis[i];
        p.atualizar();
        p.desenhar(ctx);
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) { projeteis.splice(i, 1); continue; }

        for (let j = 0; j < inimigos.length; j++) {
            const mob = inimigos[j];
            if (p.inimigosAtingidos.includes(mob)) continue;
            const dx = mob.x - p.x; const dy = mob.y - p.y;
            if (Math.sqrt(dx*dx + dy*dy) < mob.raio + p.raio) {
                p.inimigosAtingidos.push(mob); p.pierce--; 
                for(let k=0; k<5; k++) particulas.push(new Particle(p.x, p.y, p.cor));
                
                let danoFinal = p.dano;
                const regra = ELEMENTOS[p.tipo];
                if (regra.forteContra === mob.tipo) { danoFinal *= 2; for(let k=0; k<3; k++) particulas.push(new Particle(p.x, p.y, '#fff')); }
                if (p.tipo === mob.tipo) danoFinal *= 0.5;

                if (p.tipo === 'AGUA') mob.slowTimer = 120;
                if (p.tipo === 'FOGO') mob.burnTimer = 180;
                if (p.tipo === 'TERRA' && Math.random() < 0.25) mob.stunTimer = 60;
                if (p.tipo === 'ESCURIDAO' && mob.vida < mob.maxVida * 0.2) danoFinal = 9999;
                
                mob.vida -= danoFinal;
                if (p.pierce <= 0) { p.hit = true; break; }
            }
        }
        if (p.hit) projeteis.splice(i, 1);
    }

    // Partículas
    for (let i = particulas.length - 1; i >= 0; i--) {
        const part = particulas[i]; part.atualizar(); part.desenhar(ctx);
        if (part.vida <= 0) particulas.splice(i, 1);
    }

    // Inimigos
    for (let i = inimigos.length - 1; i >= 0; i--) {
        const mob = inimigos[i]; mob.atualizar(); mob.desenhar(ctx);
        if (mob.vida <= 0) {
            inimigos.splice(i, 1); dinheiro += 15;
            for(let k=0; k<10; k++) particulas.push(new Particle(mob.x, mob.y, mob.corBase));
        } else if (mob.waypointIndex >= CAMINHO.length - 1) {
            inimigos.splice(i, 1); vidas--;
            if (vidas <= 0) { jogoRodando = false; telaGameOver.classList.remove('hidden'); }
        }
    }

    // GHOST TOWER (Só desenha se NÃO estiver em cima de uma torre)
    if (mouseNoCanvas && dinheiro >= CUSTO_TORRE && !torreSobMouse) {
        let raioPreview = 180;
        if (elementoSelecionado === 'LUZ') raioPreview = 300;
        
        ctx.beginPath(); ctx.arc(mouseX, mouseY, raioPreview, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);

        ctx.fillStyle = ELEMENTOS[elementoSelecionado].cor;
        ctx.globalAlpha = 0.5; ctx.fillRect(mouseX - 20, mouseY - 20, 40, 40); ctx.globalAlpha = 1.0;
    }

    requestAnimationFrame(loop);
}

loop();