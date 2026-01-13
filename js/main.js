import { CAMINHO, ELEMENTOS, WAVES } from "./constants.js";
import { Enemy } from "./classes/Enemy.js";
import { Tower } from "./classes/Tower.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const inimigos = [];
const torres = [];
const projeteis = [];

// Estado do Jogo
let dinheiro = 150;
let vidas = 20;
let jogoRodando = true;
const CUSTO_TORRE = 50;
let elementoSelecionado = "AGUA";

// === SISTEMA DE WAVES ===
let waveIndex = 0;
let inimigosParaSpawnar = 0;
let tempoParaProximoSpawn = 0;
let tempoProximaWave = 0;
let estadoWave = "WAITING";

// Referências HTML
const displayVidas = document.getElementById("lives-display");
const displayDinheiro = document.getElementById("money-display");
const displayWave = document.getElementById("wave-display");
const telaGameOver = document.getElementById("game-over-screen");
const telaVitoria = document.getElementById("victory-screen"); // NOVO

// === SELEÇÃO ===
const botoes = document.querySelectorAll(".tower-btn");
botoes.forEach((botao) => {
  botao.addEventListener("click", () => {
    elementoSelecionado = botao.dataset.element;
    botoes.forEach((b) => b.classList.remove("selected"));
    botao.classList.add("selected");
  });
});

canvas.addEventListener("click", (event) => {
  if (!jogoRodando) return;
  const rect = canvas.getBoundingClientRect();
  const escalaX = canvas.width / rect.width;
  const escalaY = canvas.height / rect.height;
  const canvasX = (event.clientX - rect.left) * escalaX;
  const canvasY = (event.clientY - rect.top) * escalaY;

  if (dinheiro >= CUSTO_TORRE) {
    torres.push(new Tower(canvasX, canvasY, elementoSelecionado));
    dinheiro -= CUSTO_TORRE;
  }
});

// === LOGICA DE GESTÃO DE WAVES ===
function gerenciarWaves() {
  // CONDIÇÃO DE VITÓRIA
  // Se passamos da última wave E não há mais inimigos vivos
  if (waveIndex >= WAVES.length && inimigos.length === 0) {
    jogoRodando = false; // Para o jogo
    telaVitoria.classList.remove("hidden"); // Mostra Tela de Vitória
    return;
  }

  // 1. ESPERANDO
  if (estadoWave === "WAITING") {
    tempoProximaWave++;
    if (tempoProximaWave < 300) {
      ctx.fillStyle = "white";
      ctx.font = "40px Orbitron";
      ctx.textAlign = "center";
      ctx.fillText(
        `Próxima Wave em: ${Math.ceil((300 - tempoProximaWave) / 60)}`,
        canvas.width / 2,
        100
      );
    } else {
      iniciarWave();
    }
  }

  // 2. SPAWNING
  if (estadoWave === "SPAWNING") {
    tempoParaProximoSpawn--;
    if (tempoParaProximoSpawn <= 0) {
      spawnEnemy();
      const dadosWave = WAVES[waveIndex];
      tempoParaProximoSpawn = dadosWave.intervalo / 16;
      inimigosParaSpawnar--;
      if (inimigosParaSpawnar <= 0) {
        estadoWave = "COMBAT";
      }
    }
  }

  // 3. COMBATE
  if (estadoWave === "COMBAT") {
    if (inimigos.length === 0) {
      dinheiro += 100; // Bónus
      waveIndex++;
      estadoWave = "WAITING";
      tempoProximaWave = 0;
    }
  }
}

function iniciarWave() {
  if (waveIndex >= WAVES.length) return;
  const dadosWave = WAVES[waveIndex];
  inimigosParaSpawnar = dadosWave.quantidade;
  estadoWave = "SPAWNING";
  displayWave.innerText = waveIndex + 1;
}

function spawnEnemy() {
  const dadosWave = WAVES[waveIndex];
  const tipoAleatorio =
    dadosWave.tipos[Math.floor(Math.random() * dadosWave.tipos.length)];
  inimigos.push(new Enemy(tipoAleatorio, dadosWave.vidaExtra));
}

// === LOOP ===
function loop() {
  if (!jogoRodando) return;

  // Mapa
  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(CAMINHO[0].x, CAMINHO[0].y);
  for (let p of CAMINHO) ctx.lineTo(p.x, p.y);
  ctx.strokeStyle = "#795548";
  ctx.lineWidth = 80;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.strokeStyle = "#5D4037";
  ctx.lineWidth = 74;
  ctx.stroke();

  displayVidas.innerText = vidas;
  displayDinheiro.innerText = dinheiro;

  gerenciarWaves();

  // Torres
  torres.forEach((t) => {
    t.atualizar(inimigos, projeteis);
    t.desenhar(ctx);
  });

  // Projéteis
  for (let i = projeteis.length - 1; i >= 0; i--) {
    const p = projeteis[i];
    p.atualizar();
    p.desenhar(ctx);

    if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
      projeteis.splice(i, 1);
      continue;
    }

    for (let j = 0; j < inimigos.length; j++) {
      const mob = inimigos[j];
      if (p.inimigosAtingidos.includes(mob)) continue;

      const dx = mob.x - p.x;
      const dy = mob.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mob.raio + p.raio) {
        p.inimigosAtingidos.push(mob);
        p.pierce--;

        let danoFinal = p.dano;
        const regra = ELEMENTOS[p.tipo];
        if (regra.forteContra === mob.tipo) danoFinal *= 2;
        if (p.tipo === mob.tipo) danoFinal *= 0.5;

        if (p.tipo === "AGUA") mob.slowTimer = 120;
        if (p.tipo === "FOGO") mob.burnTimer = 180;
        if (p.tipo === "TERRA" && Math.random() < 0.25) mob.stunTimer = 60;
        if (p.tipo === "ESCURIDAO" && mob.vida < mob.maxVida * 0.2)
          danoFinal = 9999;

        mob.vida -= danoFinal;

        if (p.pierce <= 0) {
          p.hit = true;
          break;
        }
      }
    }
    if (p.hit) projeteis.splice(i, 1);
  }

  // Inimigos
  for (let i = inimigos.length - 1; i >= 0; i--) {
    const mob = inimigos[i];
    mob.atualizar();
    mob.desenhar(ctx);

    if (mob.vida <= 0) {
      inimigos.splice(i, 1);
      dinheiro += 15;
    } else if (mob.waypointIndex >= CAMINHO.length - 1) {
      inimigos.splice(i, 1);
      vidas--;
      if (vidas <= 0) {
        jogoRodando = false;
        telaGameOver.classList.remove("hidden"); // Derrota
      }
    }
  }

  requestAnimationFrame(loop);
}

loop();
