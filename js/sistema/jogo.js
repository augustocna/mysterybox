/* =========================================================
   SISTEMA · jogo
   Junta tudo e conduz o jogo: tela de início → cartas → desafio → resultado.
   Este é o último arquivo carregado; a última linha dá a partida.

   Usa:     quase tudo dos outros arquivos de js/sistema
   Entrega: (nada; inicia o jogo)
   ========================================================= */
(function (MysteryBox) {
    'use strict';
    const {
        buscar, buscarTodos, criarElemento, mostrarTela, esperar, limitarDuracao, formatarMoedas,
        preencherModelo, escreverQuantidade, lerDaMemoria, gravarNaMemoria,
        completarConfiguracao, conferirConfiguracao, prepararDesafios,
        aplicarTema, preencherLegenda, versoColorido,
        Efeitos, JanelaDoDesafio, Tabuleiro,
    } = MysteryBox;

    const CHAVE_DO_NIVEL = 'mystery-box-nivel';

    //==============================================================
    // #region Rodada
    //==============================================================

    class Rodada {
        constructor() {
            this.iniciar(0);
        }

        iniciar(totalDeDesafios) {
            this.totalDeDesafios = totalDeDesafios;
            this.resultados = [];
        }

        registrar(resultado) {
            this.resultados.push(resultado);
        }

        respondidos() {
            return this.resultados.length;
        }

        terminou() {
            return this.respondidos() >= this.totalDeDesafios;
        }

        acertos() {
            return this.resultados.filter((resultado) => resultado.acertou).length;
        }

        erros() {
            return this.respondidos() - this.acertos();
        }

        moedas() {
            return this.resultados.reduce((soma, resultado) => soma + resultado.moedas, 0);
        }
    }

    // #endregion

    //==============================================================
    // #region Seletor de nível e contador
    //==============================================================

    class SeletorDeNivel {
        constructor(espaco, niveis, aoEscolher) {
            this.botoes = niveis.map((nivel) => {
                const botao = criarElemento('button', { class: 'seletor__opcao', type: 'button', role: 'radio' },
                    criarElemento('strong', {}, nivel.nome), nivel.detalhe ? criarElemento('small', {}, nivel.detalhe) : null);
                botao.dataset.nivel = nivel.id;
                botao.addEventListener('click', () => aoEscolher(nivel));
                return botao;
            });
            espaco.replaceChildren(criarElemento('div', { class: 'seletor', role: 'radiogroup', 'aria-label': 'Nível' }, this.botoes));
        }

        marcar(nivel) {
            for (const botao of this.botoes) botao.setAttribute('aria-checked', String(botao.dataset.nivel === nivel.id));
        }
    }

    class ContadorDeDesafios {
        constructor(maximo, inicial) {
            this.maximo = maximo;
            this.saida = buscar('[data-quantidade]');
            this.botaoMenos = buscar('[data-diminuir]');
            this.botaoMais = buscar('[data-aumentar]');
            this.botaoMenos.addEventListener('click', () => this.definir(this.valor - 1));
            this.botaoMais.addEventListener('click', () => this.definir(this.valor + 1));
            this.definir(inicial);
        }

        definir(valor) {
            this.valor = Math.max(1, Math.min(this.maximo, Number(valor) || 1));
            this.saida.textContent = this.valor;
            this.botaoMenos.disabled = this.valor <= 1;
            this.botaoMais.disabled = this.valor >= this.maximo;
        }
    }

    // #endregion

    //==============================================================
    // #region Jogo
    //==============================================================

    class Jogo {
        constructor(configuracaoOriginal, listaDeDesafios) {
            const configuracao = completarConfiguracao(configuracaoOriginal);
            const { desafios, erros } = prepararDesafios(listaDeDesafios, configuracao);
            this.configuracao = configuracao;

            aplicarTema(configuracao);
            preencherLegenda(configuracao, desafios);
            this.mostrarErros([...conferirConfiguracao(configuracao), ...erros], desafios.length);

            this.rodada = new Rodada();
            this.efeitos = new Efeitos(configuracao);
            this.janela = new JanelaDoDesafio(configuracao, this.efeitos);
            this.tabuleiro = new Tabuleiro(desafios, configuracao, versoColorido(configuracao), (carta) => this.abrirCarta(carta));
            this.contador = new ContadorDeDesafios(Math.max(1, desafios.length), configuracao.rodada.desafiosPorPadrao);
            this.seletores = buscarTodos('[data-seletor-nivel]').map((espaco) =>
                new SeletorDeNivel(espaco, configuracao.niveis, (nivel) => this.escolherNivel(nivel)));
            buscar('.barra [data-seletor-nivel]').hidden = !configuracao.rodada.permitirTrocarDeNivelNaRodada;

            this.escolherNivel(this.nivelDeInicio());
            this.ligarBotoes();
            mostrarTela('inicio');
        }

        nivelDeInicio() {
            const { niveis, nivelInicial, rodada } = this.configuracao;
            const nivelSalvo = rodada.lembrarUltimoNivel ? lerDaMemoria(CHAVE_DO_NIVEL) : null;
            return niveis.find((nivel) => nivel.id === nivelSalvo)
                ?? niveis.find((nivel) => nivel.id === nivelInicial)
                ?? niveis[0];
        }

        ligarBotoes() {
            buscar('[data-iniciar]').addEventListener('click', () => this.iniciarRodada());
            buscar('[data-embaralhar]').addEventListener('click', () => this.embaralhar());
            buscar('[data-ver-resultado]').addEventListener('click', () => this.mostrarResultado(false));
            buscar('[data-rever-cartas]').addEventListener('click', () => mostrarTela('cartas'));
            buscar('[data-nova-rodada]').addEventListener('click', () => mostrarTela('inicio'));
        }

        /** Lista os problemas na tela de início. Sem nenhum desafio válido, o Start fica desligado. */
        mostrarErros(erros, quantidadeValida) {
            const painel = buscar('[data-erros]');
            buscar('[data-iniciar]').disabled = quantidadeValida === 0;
            if (!erros.length) return;
            painel.hidden = false;
            painel.replaceChildren(
                criarElemento('strong', {}, 'Corrija em js/configuracao.js ou js/desafios.js:'),
                criarElemento('ul', {}, erros.map((erro) => criarElemento('li', {}, erro))));
            for (const erro of erros) console.warn(`[Mystery Box] ${erro}`);
        }

        escolherNivel(nivel) {
            if (!nivel) return;
            this.nivel = nivel;
            if (this.configuracao.rodada.lembrarUltimoNivel) gravarNaMemoria(CHAVE_DO_NIVEL, nivel.id);
            for (const seletor of this.seletores) seletor.marcar(nivel);
        }

        async iniciarRodada() {
            this.rodada.iniciar(this.contador.valor);
            this.tabuleiro.limpar();
            this.atualizarPlacar();
            mostrarTela('cartas');
            if (this.configuracao.visual.embaralharAoIniciar) await this.tabuleiro.embaralhar();
        }

        async embaralhar() {
            const botao = buscar('[data-embaralhar]');
            botao.disabled = true;
            await this.tabuleiro.embaralhar();
            botao.disabled = false;
        }

        /** O caminho de uma carta: rever (se já foi jogada) ou virar, jogar e registrar. */
        async abrirCarta(carta) {
            if (this.tabuleiro.ocupado || this.janela.elemento.open) return;

            if (carta.resultado) {
                await this.janela.rever(carta.resultado, carta.elemento);
                return;
            }
            if (this.rodada.terminou()) return;

            carta.virar();
            await esperar(limitarDuracao(this.configuracao.animacoes.virarCarta) * 0.7);
            const ehOUltimo = this.rodada.respondidos() + 1 === this.rodada.totalDeDesafios;
            const resultado = await this.janela.jogar(carta.desafio, this.nivel, ehOUltimo, carta.elemento);

            if (!resultado) {
                carta.desvirar();
                return;
            }
            carta.registrarResultado(resultado);
            this.rodada.registrar(resultado);
            this.atualizarPlacar();
            if (this.rodada.terminou()) this.mostrarResultado(true);
        }

        atualizarPlacar() {
            const { rodada } = this;
            const { textos } = this.configuracao;
            const terminou = rodada.terminou();
            buscar('[data-progresso]').textContent = terminou
                ? textos.rodadaConcluida
                : preencherModelo(textos.progresso, { atual: rodada.respondidos() + 1, total: rodada.totalDeDesafios });
            buscar('[data-moedas]').textContent = formatarMoedas(rodada.moedas());
            buscar('[data-ver-resultado]').hidden = !terminou;
            buscar('[data-tela="cartas"]').classList.toggle('tela-cartas--concluida', terminou);
        }

        mostrarResultado(comemorar) {
            const { rodada } = this;
            const { textos } = this.configuracao;
            buscar('[data-acertos]').textContent = rodada.acertos();
            buscar('[data-acertos-rotulo]').textContent = escreverQuantidade(rodada.acertos(), textos.acertos);
            buscar('[data-erros-total]').textContent = rodada.erros();
            buscar('[data-erros-rotulo]').textContent = escreverQuantidade(rodada.erros(), textos.erros);
            buscar('[data-total-moedas]').textContent = formatarMoedas(rodada.moedas());
            buscar('[data-lista-resultados]').replaceChildren(...rodada.resultados.map((resultado) => this.criarItemDoResultado(resultado)));

            // O prêmio de participação aparece só quando a turma erra todos os desafios.
            const ganhouParticipacao = rodada.acertos() === 0;
            const premio = buscar('[data-premio]');
            premio.textContent = this.configuracao.rodada.mensagemDeParticipacao;
            premio.hidden = !ganhouParticipacao;
            buscar('[data-bloco-moedas]').hidden = ganhouParticipacao;

            mostrarTela('resultado');
            if (comemorar) this.efeitos.chuvaDeDoces();
        }

        criarItemDoResultado(resultado) {
            const { tipo } = resultado.desafio;
            const situacao = resultado.acertou ? `✓ +${formatarMoedas(resultado.moedas)}` : '✗ 0';
            const classe = resultado.acertou ? 'item-do-resultado item-do-resultado--acerto' : 'item-do-resultado item-do-resultado--erro';
            const item = criarElemento('li', { class: classe },
                criarElemento('span', {}, `${tipo.icone} ${tipo.nome} (${resultado.nivel.nome})`),
                criarElemento('strong', {}, situacao));
            item.style.setProperty('--tipo', tipo.cor);
            return item;
        }
    }

    // #endregion

    //==============================================================
    // #region Partida
    //==============================================================
    // Os desafios vêm de js/desafios.js. Se esse arquivo não existir,
    // vale a lista antiga dentro de configuracao.desafios.

    const listaDeDesafios = typeof desafios !== 'undefined' ? desafios : (configuracao.desafios ?? []);
    new Jogo(configuracao, listaDeDesafios);

    // #endregion
})(window.MysteryBox);
