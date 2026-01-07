import { CAMINHO, ELEMENTOS } from "./constants.js";
import { Enemy } from "./classes/Enemy.js";
import { Tower } from "./classes/Tower.js";
// Se tiveres o arquivo Projectile.js, a linha abaixo vai funcionar.
// Se der erro vermelho, avisa-me!
// Como a Torre cria o Projectile internamente, não precisamos importar aqui diretamente,
// mas precisamos garantir que a lógica de atualização dos projéteis esteja no loop.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const inimigos = [];
const torres = [];
const projeteis = []; // Lista de tiros voando

// Estado do Jogo
let elementoSelecionado = "AGUA";

// === INTERFACE (Botões) ===
const botoes = document.querySelectorAll(".tower-btn");
botoes.forEach((botao) => {
  botao.addEventListener("click", () => {
    elementoSelecionado = botao.dataset.element;
    botoes.forEach((b) => b.classList.remove("selected"));
    botao.classList.add("selected");
  });
});

// === EVENTO DE CLIQUE (COLOCAR TORRES) ===
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();

  // Cálculo de escala (Visual vs Real)
  const escalaX = canvas.width / rect.width;
  const escalaY = canvas.height / rect.height;

  const canvasX = (event.clientX - rect.left) * escalaX;
  const canvasY = (event.clientY - rect.top) * escalaY;

  // Verificar se clicou dentro do mapa e não na estrada (Opcional, mas recomendado)
  // Por enquanto, deixamos construir em qualquer lugar do canvas
  if (
    canvasX >= 0 &&
    canvasX <= canvas.width &&
    canvasY >= 0 &&
    canvasY <= canvas.height
  ) {
    const novaTorre = new Tower(canvasX, canvasY, elementoSelecionado);
    torres.push(novaTorre);
    console.log(
      `Torre criada em: ${canvasX.toFixed(0)}, ${canvasY.toFixed(0)}`
    );
  }
});

// === GERADOR DE INIMIGOS ===
function spawnEnemy() {
  const tipos = ["AGUA", "FOGO", "TERRA", "AR", "LUZ", "ESCURIDAO"];
  const tipoAleatorio = tipos[Math.floor(Math.random() * tipos.length)];
  inimigos.push(new Enemy(tipoAleatorio));
}
// Cria um inimigo a cada 2 segundos
setInterval(spawnEnemy, 2000);

// === LOOP DO JOGO ===
function loop() {
  // 1. DESENHAR O CENÁRIO (Fundo Verde)
  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. DESENHAR O CAMINHO (Estrada Marrom)
  ctx.beginPath();
  ctx.moveTo(CAMINHO[0].x, CAMINHO[0].y);
  for (let p of CAMINHO) ctx.lineTo(p.x, p.y);

  ctx.strokeStyle = "#795548"; // Marrom
  ctx.lineWidth = 80;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  // Detalhe da borda da estrada
  ctx.strokeStyle = "#5D4037";
  ctx.lineWidth = 74;
  ctx.stroke();

  // 3. Atualizar e Desenhar Torres
  torres.forEach((torre) => {
    // Passamos as listas para a torre saber quem atacar
    torre.atualizar(inimigos, projeteis);
    torre.desenhar(ctx);
  });

  // 4. Atualizar e Desenhar Projéteis (Tiros)
  for (let i = projeteis.length - 1; i >= 0; i--) {
    const p = projeteis[i];
    p.atualizar();
    p.desenhar(ctx);

    // Verifica se o tiro acertou
    if (p.hit) {
      if (p.alvo && p.alvo.vida > 0) {
        let danoFinal = p.dano;

        // Lógica Elemental Simplificada
        const tipoInimigo = p.alvo.tipo;
        const regra = ELEMENTOS[p.tipo];

        if (regra.forteContra === tipoInimigo) {
          danoFinal *= 2; // Dano Crítico!
        }

        p.alvo.vida -= danoFinal;
      }
      // Remove o tiro da lista
      projeteis.splice(i, 1);
    }
  }

  // 5. Atualizar e Desenhar Inimigos
  for (let i = inimigos.length - 1; i >= 0; i--) {
    const mob = inimigos[i];
    mob.atualizar();
    mob.desenhar(ctx);

    // Se morrer
    if (mob.vida <= 0) {
      inimigos.splice(i, 1);
      // Futuro: Adicionar dinheiro aqui
    }
    // Se chegar ao fim do caminho
    else if (mob.waypointIndex >= CAMINHO.length - 1) {
      inimigos.splice(i, 1);
      // Futuro: Perder vida aqui
    }
  }

  requestAnimationFrame(loop);
}

loop();
