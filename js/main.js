import { CAMINHO, ELEMENTOS } from "./constants.js";
import { Enemy } from "./classes/Enemy.js";
import { Tower } from "./classes/Tower.js";
// O Projectile é criado internamente pela Torre, não precisa importar aqui

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Listas de objetos do jogo
const inimigos = [];
const torres = [];
const projeteis = [];

// === ESTADO DO JOGO (ECONOMIA E VIDAS) ===
let dinheiro = 100; // Dinheiro inicial
let vidas = 20; // Vidas iniciais
let jogoRodando = true; // Para controlar o Game Over
const CUSTO_TORRE = 50;
let elementoSelecionado = "AGUA";

// Referências HTML
const displayVidas = document.getElementById("lives-display");
const displayDinheiro = document.getElementById("money-display");
const telaGameOver = document.getElementById("game-over-screen");

// === SELEÇÃO DE TORRE ===
const botoes = document.querySelectorAll(".tower-btn");
botoes.forEach((botao) => {
  botao.addEventListener("click", () => {
    elementoSelecionado = botao.dataset.element;
    botoes.forEach((b) => b.classList.remove("selected"));
    botao.classList.add("selected");
  });
});

// === CLIQUE NO MAPA (COMPRAR TORRE) ===
canvas.addEventListener("click", (event) => {
  if (!jogoRodando) return; // Não faz nada se o jogo acabou

  const rect = canvas.getBoundingClientRect();
  const escalaX = canvas.width / rect.width;
  const escalaY = canvas.height / rect.height;
  const canvasX = (event.clientX - rect.left) * escalaX;
  const canvasY = (event.clientY - rect.top) * escalaY;

  // 1. Verificar se tem dinheiro
  if (dinheiro >= CUSTO_TORRE) {
    // 2. Criar a torre
    const novaTorre = new Tower(canvasX, canvasY, elementoSelecionado);
    torres.push(novaTorre);

    // 3. Descontar dinheiro
    dinheiro -= CUSTO_TORRE;
    console.log("Torre comprada! Saldo: " + dinheiro);
  } else {
    console.log("Dinheiro insuficiente!");
    // Opcional: Efeito visual ou sonoro de erro
  }
});

// === GERADOR DE INIMIGOS ===
function spawnEnemy() {
  if (!jogoRodando) return;
  const tipos = ["AGUA", "FOGO", "TERRA", "AR", "LUZ", "ESCURIDAO"];
  const tipoAleatorio = tipos[Math.floor(Math.random() * tipos.length)];
  inimigos.push(new Enemy(tipoAleatorio));
}
setInterval(spawnEnemy, 2000);

// === LOOP PRINCIPAL ===
function loop() {
  if (!jogoRodando) return; // Para o desenho se deu Game Over

  // 1. DESENHO DO MAPA
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

  // 2. ATUALIZAR INTERFACE HTML
  displayVidas.innerText = vidas;
  displayDinheiro.innerText = dinheiro;

  // 3. TORRES
  torres.forEach((torre) => {
    torre.atualizar(inimigos, projeteis);
    torre.desenhar(ctx);
  });

  // 4. PROJÉTEIS
  for (let i = projeteis.length - 1; i >= 0; i--) {
    const p = projeteis[i];
    p.atualizar();
    p.desenhar(ctx);

    if (p.hit) {
      if (p.alvo && p.alvo.vida > 0) {
        // Cálculo de Dano Elemental
        let danoFinal = p.dano;
        const tipoInimigo = p.alvo.tipo;
        const regra = ELEMENTOS[p.tipo];
        if (regra.forteContra === tipoInimigo) danoFinal *= 2;

        p.alvo.vida -= danoFinal;
      }
      projeteis.splice(i, 1);
    }
  }

  // 5. INIMIGOS
  for (let i = inimigos.length - 1; i >= 0; i--) {
    const mob = inimigos[i];
    mob.atualizar();
    mob.desenhar(ctx);

    // CASO 1: Inimigo Morreu
    if (mob.vida <= 0) {
      inimigos.splice(i, 1);
      dinheiro += 10; // Ganha dinheiro!
    }
    // CASO 2: Inimigo chegou ao fim (Fuga)
    else if (mob.waypointIndex >= CAMINHO.length - 1) {
      inimigos.splice(i, 1);
      vidas -= 1; // Perde vida!

      // Verifica Game Over
      if (vidas <= 0) {
        jogoRodando = false;
        telaGameOver.classList.remove("hidden"); // Mostra tela de fim
      }
    }
  }

  requestAnimationFrame(loop);
}

// Inicia
loop();
