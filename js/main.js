import { CAMINHO, ELEMENTOS, WAVES } from "./constants.js";
import { Enemy } from "./classes/Enemy.js";
import { Tower } from "./classes/Tower.js";
import { Particle } from "./classes/Particle.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const inimigos = [];
const torres = [];
const projeteis = [];
const particulas = [];

// Estado do Jogo
let dinheiro = 150;
let vidas = 20;
let jogoRodando = true;
const CUSTO_TORRE = 50;
let elementoSelecionado = "AGUA";

// === VARIÁVEIS DO RATO (MOUSE) ===
let mouseX = 0;
let mouseY = 0;
let mouseNoCanvas = false; // Só desenha o fantasma se o rato estiver no jogo

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
const telaVitoria = document.getElementById("victory-screen");

// === SELEÇÃO ===
const botoes = document.querySelectorAll(".tower-btn");
botoes.forEach((botao) => {
  botao.addEventListener("click", () => {
    elementoSelecionado = botao.dataset.element;
    botoes.forEach((b) => b.classList.remove("selected"));
    botao.classList.add("selected");
  });
});

// === RASTREAMENTO DO RATO (NOVO) ===
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const escalaX = canvas.width / rect.width;
  const escalaY = canvas.height / rect.height;

  mouseX = (event.clientX - rect.left) * escalaX;
  mouseY = (event.clientY - rect.top) * escalaY;
  mouseNoCanvas = true;
});

canvas.addEventListener("mouseleave", () => {
  mouseNoCanvas = false;
});

// === CLIQUE (CONSTRUIR) ===
canvas.addEventListener("click", () => {
  if (!jogoRodando || !mouseNoCanvas) return;

  if (dinheiro >= CUSTO_TORRE) {
    // Pequena lógica para não construir muito perto do caminho
    // (Isso é opcional, mas evita torres flutuando no meio da estrada)
    let muitoPertoDaEstrada = false;
    // Verifica distância de cada ponto do caminho (simplificado)
    // Para uma verificação perfeita precisaria de matemática de colisão linha-ponto

    if (!muitoPertoDaEstrada) {
      torres.push(new Tower(mouseX, mouseY, elementoSelecionado));
      dinheiro -= CUSTO_TORRE;

      // Efeito de construção
      for (let k = 0; k < 10; k++) {
        particulas.push(new Particle(mouseX, mouseY, "#fff"));
      }
    }
  }
});

// === LOGICA DE GESTÃO DE WAVES ===
function gerenciarWaves() {
  if (waveIndex >= WAVES.length && inimigos.length === 0) {
    jogoRodando = false;
    telaVitoria.classList.remove("hidden");
    return;
  }

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

  if (estadoWave === "COMBAT") {
    if (inimigos.length === 0) {
      dinheiro += 100;
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

  // 1. Desenho do Mapa
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

  // 2. Torres
  torres.forEach((t) => {
    t.atualizar(inimigos, projeteis);
    t.desenhar(ctx);

    // Se passar o rato em cima de uma torre existente, mostra o alcance dela
    const dx = mouseX - t.x;
    const dy = mouseY - t.y;
    if (Math.sqrt(dx * dx + dy * dy) < 20) {
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.raioAlcance, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

  // 3. Projéteis
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

        // Efeito visual de impacto
        for (let k = 0; k < 5; k++)
          particulas.push(new Particle(p.x, p.y, p.cor));

        let danoFinal = p.dano;
        const regra = ELEMENTOS[p.tipo];
        if (regra.forteContra === mob.tipo) {
          danoFinal *= 2;
          for (let k = 0; k < 3; k++)
            particulas.push(new Particle(p.x, p.y, "#fff"));
        }
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

  // 4. Partículas
  for (let i = particulas.length - 1; i >= 0; i--) {
    const part = particulas[i];
    part.atualizar();
    part.desenhar(ctx);
    if (part.vida <= 0) particulas.splice(i, 1);
  }

  // 5. Inimigos
  for (let i = inimigos.length - 1; i >= 0; i--) {
    const mob = inimigos[i];
    mob.atualizar();
    mob.desenhar(ctx);

    if (mob.vida <= 0) {
      inimigos.splice(i, 1);
      dinheiro += 15;
      for (let k = 0; k < 10; k++)
        particulas.push(new Particle(mob.x, mob.y, mob.corBase));
    } else if (mob.waypointIndex >= CAMINHO.length - 1) {
      inimigos.splice(i, 1);
      vidas--;
      if (vidas <= 0) {
        jogoRodando = false;
        telaGameOver.classList.remove("hidden");
      }
    }
  }

  // === 6. DESENHO DO FANTASMA (PREVIEW DA CONSTRUÇÃO) - NOVO ===
  if (mouseNoCanvas && dinheiro >= CUSTO_TORRE) {
    // Define o raio baseado no elemento selecionado
    let raioPreview = 180; // Padrão
    if (elementoSelecionado === "LUZ") raioPreview = 300;

    // Desenha o círculo de alcance
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, raioPreview, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)"; // Transparente
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"; // Borda visível
    ctx.setLineDash([5, 5]); // Linha tracejada
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]); // Reseta linha

    // Desenha uma "caixa" onde a torre vai ficar
    ctx.fillStyle = ELEMENTOS[elementoSelecionado].cor;
    ctx.globalAlpha = 0.5; // Fantasma transparente
    ctx.fillRect(mouseX - 20, mouseY - 20, 40, 40);
    ctx.globalAlpha = 1.0;
  }

  requestAnimationFrame(loop);
}

loop();
