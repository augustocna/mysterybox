/* =========================================================
   SISTEMA · efeitos
   Sons e efeitos de acerto e erro: a chuva de doces e o jumpscare.
   Se o arquivo de som não existir ou não tocar, o navegador gera o som sozinho.

   Usa:     buscar, criarElemento, limitarDuracao, esperar, sortearEntre, sortearItem, FANTASMA
   Entrega: Efeitos
   ========================================================= */
(function (MysteryBox) {
    'use strict';
    const { buscar, criarElemento, limitarDuracao, esperar, sortearEntre, sortearItem, FANTASMA } = MysteryBox;

    //==============================================================
    // #region Sons sintetizados
    //==============================================================

    function sintetizarGrito(contexto, volume, velocidade) {
        const inicio = contexto.currentTime;
        const duracao = 0.9 / velocidade;
        const pico = Math.max(0.0001, 0.22 * volume);

        const saida = contexto.createGain();
        saida.gain.setValueAtTime(0.0001, inicio);
        saida.gain.exponentialRampToValueAtTime(pico, inicio + 0.03);
        saida.gain.setValueAtTime(pico, inicio + duracao * 0.55);
        saida.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
        saida.connect(contexto.destination);

        const vibrato = contexto.createOscillator();
        const forcaDoVibrato = contexto.createGain();
        vibrato.frequency.value = 26;
        forcaDoVibrato.gain.value = 90 * velocidade;
        vibrato.connect(forcaDoVibrato);

        for (const desafinacao of [-18, 0, 22]) {
            const oscilador = contexto.createOscillator();
            oscilador.type = 'sawtooth';
            oscilador.detune.value = desafinacao;
            oscilador.frequency.setValueAtTime(620 * velocidade, inicio);
            oscilador.frequency.exponentialRampToValueAtTime(1350 * velocidade, inicio + duracao * 0.2);
            oscilador.frequency.exponentialRampToValueAtTime(320 * velocidade, inicio + duracao);
            forcaDoVibrato.connect(oscilador.frequency);
            oscilador.connect(saida);
            oscilador.start(inicio);
            oscilador.stop(inicio + duracao);
        }

        const memoria = contexto.createBuffer(1, Math.ceil(contexto.sampleRate * duracao), contexto.sampleRate);
        const amostras = memoria.getChannelData(0);
        for (let posicao = 0; posicao < amostras.length; posicao++) amostras[posicao] = Math.random() * 2 - 1;
        const ruido = contexto.createBufferSource();
        const filtro = contexto.createBiquadFilter();
        const volumeDoRuido = contexto.createGain();
        ruido.buffer = memoria;
        filtro.type = 'bandpass';
        filtro.frequency.value = 2200;
        volumeDoRuido.gain.value = 0.5;
        ruido.connect(filtro).connect(volumeDoRuido).connect(saida);

        vibrato.start(inicio);
        vibrato.stop(inicio + duracao);
        ruido.start(inicio);
    }

    function sintetizarAcerto(contexto, volume, velocidade) {
        const inicio = contexto.currentTime;
        const passo = 0.07 / velocidade;
        [523.25, 659.25, 783.99, 1046.5].forEach((frequencia, posicao) => {
            const oscilador = contexto.createOscillator();
            const ganho = contexto.createGain();
            const momento = inicio + posicao * passo;
            oscilador.type = 'square';
            oscilador.frequency.value = frequencia * velocidade;
            ganho.gain.setValueAtTime(0.0001, momento);
            ganho.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.15 * volume), momento + 0.01);
            ganho.gain.exponentialRampToValueAtTime(0.0001, momento + passo * 2.5);
            oscilador.connect(ganho).connect(contexto.destination);
            oscilador.start(momento);
            oscilador.stop(momento + passo * 3);
        });
    }

    // #endregion

    //==============================================================
    // #region Som (arquivo ou sintetizado)
    //==============================================================

    let contextoDeAudio = null;

    function obterContextoDeAudio() {
        const ContextoDeAudio = window.AudioContext || window.webkitAudioContext;
        if (!ContextoDeAudio) return null;
        contextoDeAudio = contextoDeAudio ?? new ContextoDeAudio();
        if (contextoDeAudio.state === 'suspended') contextoDeAudio.resume();
        return contextoDeAudio;
    }

    class Som {
        constructor(opcoes, sintetizador) {
            this.fonte = opcoes.som;
            this.volume = opcoes.volume ?? 1;
            this.velocidade = opcoes.velocidade ?? 1;
            this.inicio = opcoes.inicioDoAudio ?? 0;
            this.sintetizador = sintetizador;
            this.audio = null;
            if (this.fonte && this.fonte !== 'sintetizado') {
                this.audio = new Audio(this.fonte);
                this.audio.preload = 'auto';
                this.audio.addEventListener('error', () => { this.audio = null; });
            }
        }

        tocar() {
            if (!this.fonte) return;
            if (!this.audio) {
                this.sintetizar();
                return;
            }
            this.audio.pause();
            this.audio.currentTime = this.inicio;
            this.audio.volume = Math.min(1, Math.max(0, this.volume));
            this.audio.playbackRate = this.velocidade;
            this.audio.preservesPitch = false;
            this.audio.play().catch(() => this.sintetizar());
        }

        sintetizar() {
            const contexto = obterContextoDeAudio();
            if (contexto) this.sintetizador(contexto, this.volume, this.velocidade);
        }
    }

    // #endregion

    //==============================================================
    // #region Efeitos na tela
    //==============================================================

    class Efeitos {
        constructor(configuracao) {
            this.acerto = configuracao.acerto;
            this.jumpscare = configuracao.jumpscare;
            this.duracaoDosDoces = limitarDuracao(configuracao.animacoes.chuvaDeDoces);
            this.somDeAcerto = new Som(this.acerto, sintetizarAcerto);
            this.somDeSusto = new Som(this.jumpscare, sintetizarGrito);
            this.imagemDoSusto = this.jumpscare.imagem || FANTASMA;
            new Image().src = this.imagemDoSusto;
        }

        camada() {
            const janela = buscar('[data-janela]');
            return janela.open ? janela : document.body;
        }

        chuvaDeDoces() {
            const pecas = [];
            for (let contagem = 0; contagem < this.acerto.quantidade; contagem++) {
                const atraso = sortearEntre(0, this.duracaoDosDoces * 0.15);
                const peca = criarElemento('span', { class: 'doce', 'aria-hidden': 'true' }, sortearItem(this.acerto.emojis));
                peca.style.setProperty('--destino-x', `${sortearEntre(-48, 48)}vw`);
                peca.style.setProperty('--destino-y', `${sortearEntre(-50, -12)}vh`);
                peca.style.setProperty('--giro', `${sortearEntre(-540, 540)}deg`);
                peca.style.setProperty('--tamanho', `${sortearEntre(1.2, 2.8)}rem`);
                peca.style.setProperty('--duracao', `${this.duracaoDosDoces - atraso}ms`);
                peca.style.setProperty('--atraso', `${atraso}ms`);
                pecas.push(peca);
            }
            this.camada().append(...pecas);
            this.somDeAcerto.tocar();
            setTimeout(() => pecas.forEach((peca) => peca.remove()), this.duracaoDosDoces + 50);
        }

        async mostrarJumpscare() {
            if (!this.jumpscare.ativo) return;
            const duracao = limitarDuracao(this.jumpscare.duracao);
            const classe = this.jumpscare.imagemPixelada ? 'susto__imagem susto__imagem--pixelada' : 'susto__imagem';
            const imagem = criarElemento('img', { src: this.imagemDoSusto, alt: '', class: classe });
            imagem.addEventListener('error', () => { imagem.src = FANTASMA; imagem.classList.add('susto__imagem--pixelada'); }, { once: true });
            const fundo = criarElemento('div', { class: this.jumpscare.flashVermelho ? 'susto susto--flash' : 'susto', 'aria-hidden': 'true' }, imagem);
            fundo.style.setProperty('--duracao', `${duracao}ms`);
            fundo.style.setProperty('--tremor', `${this.jumpscare.tremor}px`);
            fundo.style.setProperty('--escala', this.jumpscare.escala);
            this.camada().append(fundo);
            this.somDeSusto.tocar();
            await esperar(duracao);
            fundo.remove();
        }
    }
    // #endregion

    Object.assign(MysteryBox, { Efeitos });
})(window.MysteryBox);
