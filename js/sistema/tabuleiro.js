/* =========================================================
   SISTEMA · tabuleiro
   As cartas na tela: montagem, virar, marcar acerto ou erro,
   tamanho que se adapta ao espaço e a animação de embaralhar.

   Usa:     buscar, formatarMoedas, embaralharLista, sortearEntre, limitarDuracao, lerVariavelCss
   Entrega: Tabuleiro
   ========================================================= */
(function (MysteryBox) {
    'use strict';
    const { buscar, formatarMoedas, embaralharLista, sortearEntre, limitarDuracao, lerVariavelCss } = MysteryBox;

    //==============================================================
    // #region Carta
    //==============================================================

    class Carta {
        constructor(desafio, versoColorido) {
            this.desafio = desafio;
            this.resultado = null;
            this.versoColorido = versoColorido;
            this.elemento = buscar('#modelo-carta').content.firstElementChild.cloneNode(true);
            this.elemento.style.setProperty('--tipo', desafio.tipo.cor);
            buscar('[data-carta-nome-verso]', this.elemento).textContent = versoColorido ? `${desafio.tipo.icone} ${desafio.tipo.nome}` : '';
            buscar('[data-carta-icone]', this.elemento).textContent = desafio.tipo.icone;
            buscar('[data-carta-nome-frente]', this.elemento).textContent = desafio.tipo.nome;
            this.selo = buscar('[data-carta-selo]', this.elemento);
            this.limpar();
        }

        virar() {
            this.elemento.classList.add('carta--virada');
        }

        desvirar() {
            this.elemento.classList.remove('carta--virada');
        }

        registrarResultado(resultado) {
            this.resultado = resultado;
            this.virar();
            this.elemento.classList.add(resultado.acertou ? 'carta--acerto' : 'carta--erro');
            this.selo.textContent = resultado.acertou ? `✓ +${formatarMoedas(resultado.moedas)}` : '✗ 0';
            this.elemento.setAttribute('aria-label', `Rever: ${this.desafio.tipo.nome}, ${resultado.acertou ? 'acerto' : 'erro'}`);
        }

        limpar() {
            this.resultado = null;
            this.desvirar();
            this.elemento.classList.remove('carta--acerto', 'carta--erro');
            this.selo.textContent = '';
            this.elemento.setAttribute('aria-label', this.versoColorido ? `Abrir carta: ${this.desafio.tipo.nome}` : 'Abrir carta surpresa');
        }
    }

    // #endregion

    //==============================================================
    // #region Tabuleiro
    //==============================================================

    class Tabuleiro {
        constructor(desafios, configuracao, versoColorido, aoEscolherCarta) {
            this.configuracao = configuracao;
            this.elemento = buscar('[data-tabuleiro]');
            this.area = this.elemento.parentElement;
            this.ocupado = false;
            this.cartas = desafios.map((desafio) => new Carta(desafio, versoColorido));
            for (const carta of this.cartas) carta.elemento.addEventListener('click', () => aoEscolherCarta(carta));
            this.elemento.append(...this.cartas.map((carta) => carta.elemento));
            new ResizeObserver(() => this.ajustarTamanho()).observe(this.area);
        }

        limpar() {
            for (const carta of this.cartas) carta.limpar();
        }

        /**
         * Escolhe quantas colunas deixam a carta maior no espaço livre e passa
         * o resultado ao CSS em --colunas e --largura-da-carta.
         * Com configuracao.cartas.colunas = número, só calcula o tamanho.
         */
        ajustarTamanho() {
            const estiloDaArea = getComputedStyle(this.area);
            const largura = this.area.clientWidth - parseFloat(estiloDaArea.paddingLeft) - parseFloat(estiloDaArea.paddingRight);
            const altura = this.area.clientHeight - parseFloat(estiloDaArea.paddingTop) - parseFloat(estiloDaArea.paddingBottom);
            if (largura <= 0 || altura <= 0) return;   // tela escondida

            const { colunas: colunasEscolhidas, larguraMaxima, proporcao } = this.configuracao.cartas;
            const vao = parseFloat(getComputedStyle(this.elemento).columnGap) || 0;
            const quantidade = Math.max(1, this.cartas.length);
            const opcoesDeColunas = Number.isInteger(colunasEscolhidas)
                ? [Math.min(colunasEscolhidas, quantidade)]
                : Array.from({ length: quantidade }, (_, posicao) => posicao + 1);

            let melhor = { colunas: 1, larguraDaCarta: 0 };
            for (const colunas of opcoesDeColunas) {
                const linhas = Math.ceil(quantidade / colunas);
                const limitePelaLargura = (largura - (colunas - 1) * vao) / colunas;
                const limitePelaAltura = ((altura - (linhas - 1) * vao) / linhas) * proporcao;
                const larguraDaCarta = Math.min(limitePelaLargura, limitePelaAltura, larguraMaxima);
                if (larguraDaCarta > melhor.larguraDaCarta) melhor = { colunas, larguraDaCarta };
            }

            this.elemento.style.setProperty('--colunas', melhor.colunas);
            this.elemento.style.setProperty('--largura-da-carta', `${Math.floor(melhor.larguraDaCarta)}px`);
        }

        /** Troca as cartas de lugar: cada uma passa pelo centro e vai para a nova posição. */
        async embaralhar() {
            if (this.ocupado) return;
            this.ocupado = true;

            const posicoesAntes = new Map(this.cartas.map((carta) => [carta, carta.elemento.getBoundingClientRect()]));
            embaralharLista(this.cartas);
            this.elemento.append(...this.cartas.map((carta) => carta.elemento));

            const area = this.elemento.getBoundingClientRect();
            const centroX = area.left + area.width / 2;
            const centroY = area.top + area.height / 2;
            const suavizacao = lerVariavelCss('--suavizacao-do-embaralhar') || 'ease';
            const duracao = limitarDuracao(this.configuracao.animacoes.embaralhar);

            const animacoes = this.cartas.map((carta) => {
                const antes = posicoesAntes.get(carta);
                const depois = carta.elemento.getBoundingClientRect();
                const meioX = centroX - depois.left - depois.width / 2;
                const meioY = centroY - depois.top - depois.height / 2;
                return carta.elemento.animate([
                    { transform: `translate(${antes.left - depois.left}px, ${antes.top - depois.top}px)` },
                    { transform: `translate(${meioX}px, ${meioY}px) rotate(${sortearEntre(-14, 14)}deg) scale(.85)`, offset: 0.45 },
                    { transform: 'none' },
                ], { duration: duracao, easing: suavizacao }).finished.catch(() => null);
            });
            await Promise.all(animacoes);
            this.ocupado = false;
        }
    }

    // #endregion

    Object.assign(MysteryBox, { Tabuleiro });
})(window.MysteryBox);
