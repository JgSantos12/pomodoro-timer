// ==========================================
// SELETORES
// ==========================================

const modalOverlay = document.getElementById('modal-overlay');
const botaoConfig = document.getElementById('configuracoes');
const modal = document.querySelector('.modal');
const modalInput = document.querySelectorAll('.modal-input');
const modalSalvar = document.querySelector('.modal-salvar');

const botaoFoco = document.getElementById('botaoFoco');
const botaoCurta = document.getElementById('botaoCurta');
const botaoLonga = document.getElementById('botaoLonga');

const pomodoroContainer = document.querySelector('.container');
const divTimer = document.querySelector('.div-timer');
const botoesAcao = document.querySelectorAll('.acao');
const elementoTimer = document.querySelector('.timer');

const botaoStart = document.getElementById('comecar');
const botaoPause = document.getElementById('pausar');
const botaoRestart = document.getElementById('reiniciar');

const inputFoco = document.getElementById('inputFoco');
const inputCurta = document.getElementById('inputCurta');
const inputLonga = document.getElementById('inputLonga');

// ==========================================
// ESTADO DO APP
// ==========================================

// Tempos em minutos — podem ser alterados pelo modal de configurações
let temposFoco = 25;
let temposCurta = 5;
let temposLonga = 30;

// Modo atual — usado pelo resetar pra saber qual tempo restaurar
let modoAtual = 'foco';
let ciclosFoco = 0;

let tempoRestante = temposFoco * 60;
let intervalo = null;

// ==========================================
// MODAL
// ==========================================

function abrirModal() {
    // Preenche os inputs com os valores atuais antes de abrir
    inputFoco.value = temposFoco;
    inputCurta.value = temposCurta;
    inputLonga.value = temposLonga;
    modalOverlay.style.display = 'flex';
}

function fecharModal() {
    modalOverlay.style.display = 'none';
}

botaoConfig.addEventListener('click', abrirModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) fecharModal();
});

// Salvar configurações
modalSalvar.addEventListener('click', () => {
    // Lê os valores dos inputs e converte pra número inteiro
    const novoFoco = parseInt(inputFoco.value);
    const novoCurta = parseInt(inputCurta.value);
    const novaLonga = parseInt(inputLonga.value);

    // Valida — se algum valor for inválido ou zero, não salva
    if (!novoFoco || !novoCurta || !novaLonga) {
        alert('Por favor, insira valores válidos!');
        return;
    }

    temposFoco = novoFoco;
    temposCurta = novoCurta;
    temposLonga = novaLonga;

    // Reseta o timer pro modo atual com o novo tempo
    resetarTimer();
    fecharModal();
});

// ==========================================
// CORES POR MODO
// ==========================================

// Em vez de repetir o mesmo bloco de código 3 vezes,
// criamos uma função que recebe as cores e aplica em tudo
function aplicarCores(corContainer, corTimer, corAtiva, varContainer, varTimer, varAtiva) {
    pomodoroContainer.style.backgroundColor = corContainer;
    divTimer.style.backgroundColor = corTimer;
    divTimer.style.border = `5px solid ${corAtiva}`;
    modal.style.backgroundColor = corContainer;

    modalInput.forEach(input => {
        input.style.backgroundColor = corAtiva;
    });

    modalSalvar.style.backgroundColor = corAtiva;

    botoesAcao.forEach(botao => {
        botao.style.backgroundColor = corTimer;

        // Remove eventos antigos antes de adicionar novos
        // pra não acumular múltiplos listeners
        botao.onmouseenter = () => botao.style.backgroundColor = corAtiva;
        botao.onmouseleave = () => botao.style.backgroundColor = corTimer;
    });

    modalSalvar.onmouseenter = () => modalSalvar.style.backgroundColor = corTimer;
    modalSalvar.onmouseleave = () => modalSalvar.style.backgroundColor = corAtiva;
}

const botoesModo = [botaoFoco, botaoCurta, botaoLonga];

function marcarBotaoAtivo(botaoAtivo, corAtiva) {
    botoesModo.forEach(botao => {
        botao.style.backgroundColor = ''; // reseta todos
    });
    botaoAtivo.style.backgroundColor = corAtiva;
}

// ==========================================
// MODOS
// ==========================================

function modoFoco() {
    modoAtual = 'foco';
    aplicarCores(
        'var(--cor-container-foco)',
        'var(--cor-foco)',
        'var(--foco-ativo)'
    );
    marcarBotaoAtivo(botaoFoco, 'var(--foco-ativo)');
    resetarTimer();
}

function modoCurta() {
    modoAtual = 'curta';
    aplicarCores(
        'var(--cor-container-pausa-curta)',
        'var(--cor-pausa-curta)',
        'var(--curta-ativa)'
    );
    marcarBotaoAtivo(botaoCurta, 'var(--curta-ativa)');
    resetarTimer();
}

function modoLonga() {
    modoAtual = 'longa';
    aplicarCores(
        'var(--cor-container-pausa-longa)',
        'var(--cor-pausa-longa)',
        'var(--longa-ativa)'
    );
    marcarBotaoAtivo(botaoLonga, 'var(--longa-ativa)');
    resetarTimer();
}

botaoFoco.addEventListener('click', modoFoco);
botaoCurta.addEventListener('click', modoCurta);
botaoLonga.addEventListener('click', modoLonga);

// ==========================================
// TIMER
// ==========================================

function atualizarTela() {
    const minutos = Math.floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;
    elementoTimer.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function iniciarTimer() {
    // Se já tem um intervalo rodando, não cria outro
    if (intervalo !== null) return;

    botaoStart.style.display = 'none';

    intervalo = setInterval(() => {
        tempoRestante--;
        atualizarTela();

        if (tempoRestante <= 0) {
            clearInterval(intervalo);
            intervalo = null;
            tocarSom();
            trocarModoAutomatico();
        }
    }, 1000);
}

function pausarTimer() {
    clearInterval(intervalo);
    intervalo = null;
    botaoStart.textContent = 'Retomar';
    botaoStart.style.display = 'block';
}

function resetarTimer() {
    // Para o timer
    clearInterval(intervalo);
    intervalo = null;

    // Restaura o tempo do modo atual — resolve o problema do resetar dinâmico
    if (modoAtual === 'foco') tempoRestante = temposFoco * 60;
    else if (modoAtual === 'curta') tempoRestante = temposCurta * 60;
    else if (modoAtual === 'longa') tempoRestante = temposLonga * 60;

    // Reseta o botão começar
    botaoStart.textContent = 'Começar';
    botaoStart.style.display = 'block';

    atualizarTela();
}

// Troca de modo automática quando o tempo acaba
function trocarModoAutomatico() {
    if (modoAtual === 'foco') {
        ciclosFoco++;
        if (ciclosFoco === 4){
            ciclosFoco = 0;
            modoLonga();
        } else {
            modoCurta();
        }
    } else {
        modoFoco();
    }
}

botaoStart.addEventListener('click', iniciarTimer);
botaoPause.addEventListener('click', pausarTimer);
botaoRestart.addEventListener('click', resetarTimer);

// ==========================================
// SOM
// ==========================================

function tocarSom() {
    // Cria um som simples com a Web Audio API — sem precisar de arquivo externo
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 1.5);
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

// Adiciona IDs nos inputs do modal no HTML se ainda não tiver:
// <input id="inputFoco" ...>
// <input id="inputCurta" ...>
// <input id="inputLonga" ...>

modoFoco(); // começa no modo foco por padrão