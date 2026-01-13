import { CAMINHO, ELEMENTOS } from "./constants.js";
import { Enemy } from "./classes/Enemy.js";
import { Tower } from "./classes/Tower.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const inimigos = [];
const torres = [];
const projeteis = [];

// Estado do Jogo
let dinheiro = 150; // Começa com mais dinheiro para testar
let vidas = 20;
let jogoRodando = true;
const CUSTO_TORRE = 50;
let elementoSelecionado = "AGUA";

// Referências HTML
const displayVidas = document.getElementById("lives-display");
const displayDinheiro = document.getElementById("money-display");
const telaGameOver = document.getElementById("game-over-screen");

// === SELEÇÃO ===
const botoes = document.querySelectorAll(".tower-btn");
botoes.forEach((botao) => {
  botao.addEventListener("click", () => {
    elementoSelecionado = botao.dataset.element;
    botoes.forEach((b) => b.classList.remove("selected"));
    botao.classList.add("selected");
  });
});

// === COMPRA DE TORRES ===
canvas.addEventListener("click", (event) => {
  if (!jogoRodando) return;

  const rect = canvas.getBoundingClientRect();
  const escalaX = canvas.width / rect.width;
  const escalaY = canvas.height / rect.height;
  const canvasX = (event.clientX - rect.left) * escalaX;
  const canvasY = (event.clientY - rect.top) * escalaY;

  // Impede construir em cima do caminho (Lógica de colisão simples com linhas)
  // Para simplificar, vamos apenas permitir a compra
  if (dinheiro >= CUSTO_TORRE) {
    torres.push(new Tower(canvasX, canvasY, elementoSelecionado));
    dinheiro -= CUSTO_TORRE;
  }
});

function spawnEnemy() {
  if (!jogoRodando) return;
  const tipos = ["AGUA", "FOGO", "TERRA", "AR", "LUZ", "ESCURIDAO"];
  // Aumenta a dificuldade com o tempo: Inimigos aleatórios
  const tipoAleatorio = tipos[Math.floor(Math.random() * tipos.length)];
  inimigos.push(new Enemy(tipoAleatorio));
}
setInterval(spawnEnemy, 1800);

// === LOOP ===
function loop() {
  if (!jogoRodando) return;

  // 1. Mapa
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

  // 2. Interface
  displayVidas.innerText = vidas;
  displayDinheiro.innerText = dinheiro;

  // 3. Torres
  torres.forEach((t) => {
    t.atualizar(inimigos, projeteis);
    t.desenhar(ctx);
  });

  // 4. Projéteis (Lógica de Poderes aqui!)
  for (let i = projeteis.length - 1; i >= 0; i--) {
    const p = projeteis[i];
    p.atualizar();
    p.desenhar(ctx);

    // Verifica colisão com TODOS os inimigos (para suportar perfuração)
    // Se o projétil sai da tela, removemos
    if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
      projeteis.splice(i, 1);
      continue;
    }

    // Checa colisão com inimigos
    for (let j = 0; j < inimigos.length; j++) {
      const mob = inimigos[j];

      // Se já acertou este mob, ignora (para não dar hit duplo no mesmo frame)
      if (p.inimigosAtingidos.includes(mob)) continue;

      const dx = mob.x - p.x;
      const dy = mob.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Colisão!
      if (dist < mob.raio + p.raio) {
        // Adiciona à lista de atingidos
        p.inimigosAtingidos.push(mob);
        p.pierce--; // Gasta uma perfuração

        // === APLICAÇÃO DE DANO E PODERES ===
        let danoFinal = p.dano;
        const regra = ELEMENTOS[p.tipo];

        // Fraqueza Elemental
        if (regra.forteContra === mob.tipo) danoFinal *= 2;
        // Resistência (Mesmo elemento)
        if (p.tipo === mob.tipo) danoFinal *= 0.5;

        // 1. ÁGUA (Slow)
        if (p.tipo === "AGUA") {
          mob.slowTimer = 120; // 2 segundos (60 frames * 2)
        }

        // 2. FOGO (Burn)
        if (p.tipo === "FOGO") {
          mob.burnTimer = 180; // 3 segundos
        }

        // 3. TERRA (Chance de Stun)
        if (p.tipo === "TERRA") {
          if (Math.random() < 0.25) {
            // 25% de chance
            mob.stunTimer = 60; // 1 segundo parado
          }
        }

        // 4. ESCURIDÃO (Execução)
        if (p.tipo === "ESCURIDAO") {
          if (mob.vida < mob.maxVida * 0.2) {
            // Menos de 20% vida
            danoFinal = 9999; // Morte certa
            console.log("EXECUÇÃO!");
          }
        }

        // Aplica o Dano
        mob.vida -= danoFinal;

        // Se acabou a perfuração, o projétil some
        if (p.pierce <= 0) {
          p.hit = true; // Marca para remoção
          break; // Sai do loop de inimigos
        }
      }
    }

    // Remove projétil se já bateu o limite
    if (p.hit) {
      projeteis.splice(i, 1);
    }
  }

  // 5. Inimigos
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
        telaGameOver.classList.remove("hidden");
      }
    }
  }

  requestAnimationFrame(loop);
}

loop();
