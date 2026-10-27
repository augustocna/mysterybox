/* =========================================================
   SISTEMA · janela
   A janela que abre quando uma carta é escolhida: mostra o desafio,
   recebe a resposta, confere e mostra o resultado.

   As duas formas de responder (por linha e por escolha) têm os mesmos
   métodos, então a janela usa qualquer uma do mesmo jeito.

   Usa:     buscar, buscarTodos, criarElemento, embaralharLista, formatarMoedas,
            preencherModelo, escreverQuantidade, reiniciarAnimacao, criarBlocoDeCodigo
   Entrega: JanelaDoDesafio
   ========================================================= */
(function (MysteryBox) {
    'use strict';
    const {
        buscar, buscarTodos, criarElemento, embaralharLista, formatarMoedas,
        preencherModelo, escreverQuantidade, reiniciarAnimacao, criarBlocoDeCodigo,
    } = MysteryBox;

    //==============================================================
    // #region Formas de responder
    //==============================================================

    class RespostaPorLinha {
        constructor(versao, textos) {
            this.versao = versao;
            this.textos = textos;
            this.campo = criarElemento('input', {
                class: 'campo__entrada', type: 'number', inputmode: 'numeric', min: 1, step: 1,
                placeholder: '?', autocomplete: 'off', enterkeyhint: 'done',
            });
            this.elemento = criarElemento('label', { class: 'campo' },
                criarElemento('span', { class: 'campo__rotulo' }, textos.numeroDaLinha), this.campo);
        }

        valor() {
            return this.campo.value.trim() === '' ? null : Number(this.campo.value);
        }

        pedidoQuandoVazia() {
            return this.textos.pedirLinha;
        }

        textoDaResposta() {
            return preencherModelo(this.textos.respostaDaLinha, { numero: this.versao.resposta });
        }

        tentarDeNovo() {
            this.campo.select();
        }

        mostrarResultado(valorEscolhido) {
            this.campo.value = valorEscolhido ?? '';
            this.campo.disabled = true;
            this.campo.classList.add(valorEscolhido === this.versao.resposta ? 'campo__entrada--certa' : 'campo__entrada--errada');
        }
    }

    class RespostaPorEscolha {
        constructor(versao, textos, visual) {
            this.versao = versao;
            this.textos = textos;
            this.mostrarLetras = visual.letrasNasOpcoes && !versao.opcoesFixas;
            this.escolhida = null;
            const opcoes = versao.opcoesFixas || !visual.embaralharOpcoes ? versao.opcoes : embaralharLista([...versao.opcoes]);
            this.botoes = opcoes.map((texto, posicao) => this.criarBotao(texto, posicao));
            const classe = versao.opcoesFixas ? 'opcoes opcoes--duas' : 'opcoes opcoes--codigo';
            this.elemento = criarElemento('div', { class: classe, role: 'radiogroup', 'aria-label': 'Opções' }, this.botoes);
        }

        criarBotao(texto, posicao) {
            const letra = this.mostrarLetras ? criarElemento('span', { class: 'opcao__letra', 'aria-hidden': 'true' }, String.fromCharCode(65 + posicao)) : null;
            const botao = criarElemento('button', { class: 'opcao', type: 'button', role: 'radio', 'aria-checked': 'false' },
                letra, criarElemento('span', { class: 'opcao__texto' }, texto));
            botao.dataset.valor = texto;
            botao.addEventListener('click', () => this.escolher(texto));
            return botao;
        }

        escolher(texto) {
            this.escolhida = texto;
            for (const botao of this.botoes) botao.setAttribute('aria-checked', String(botao.dataset.valor === texto));
        }

        valor() {
            return this.escolhida;
        }

        pedidoQuandoVazia() {
            return this.textos.pedirOpcao;
        }

        textoDaResposta() {
            return this.versao.resposta;
        }

        tentarDeNovo() {
            const botaoErrado = this.botoes.find((botao) => botao.dataset.valor === this.escolhida);
            botaoErrado.classList.add('opcao--errada');
            botaoErrado.disabled = true;
            this.escolher(null);
        }

        mostrarResultado(valorEscolhido, revelarCorreta) {
            for (const botao of this.botoes) {
                const valor = botao.dataset.valor;
                botao.disabled = true;
                botao.setAttribute('aria-checked', String(valor === valorEscolhido));
                botao.classList.toggle('opcao--certa', valor === this.versao.resposta && (revelarCorreta || valor === valorEscolhido));
                botao.classList.toggle('opcao--errada', valor === valorEscolhido && valor !== this.versao.resposta);
            }
        }
    }

    // #endregion

    //==============================================================
    // #region Janela do desafio
    //==============================================================

    class JanelaDoDesafio {
        constructor(configuracao, efeitos) {
            this.configuracao = configuracao;
            this.efeitos = efeitos;
            this.elemento = buscar('[data-janela]');
            this.partes = {
                tipo: buscar('[data-janela-tipo]'),
                nivel: buscar('[data-janela-nivel]'),
                moedas: buscar('[data-janela-moedas]'),
                pergunta: buscar('[data-janela-pergunta]'),
                codigo: buscar('[data-janela-codigo]'),
                resposta: buscar('[data-janela-resposta]'),
                botao: buscar('[data-janela-botao]'),
                aviso: buscar('[data-janela-aviso]'),
                formulario: buscar('[data-janela-formulario]'),
            };
            this.ocupada = false;
            this.partes.formulario.addEventListener('submit', (evento) => {
                evento.preventDefault();
                this.aoConfirmar();
            });
            buscar('[data-janela-fechar]').addEventListener('click', () => this.fechar());
            this.elemento.addEventListener('cancel', (evento) => {
                if (this.ocupada) evento.preventDefault();
            });
        }

        /** Abre um desafio novo. Devolve o resultado, ou null se fechar sem responder. */
        jogar(desafio, nivel, ehOUltimo, origem) {
            this.preparar(desafio, nivel, desafio.versoes[nivel.id]);
            this.ehOUltimo = ehOUltimo;
            this.abrir(origem);
            return this.aguardarFechamento();
        }

        /** Abre um desafio já respondido, só para ver. */
        rever(resultado, origem) {
            this.preparar(resultado.desafio, resultado.nivel, resultado.versao);
            this.ehOUltimo = false;
            this.mostrarResultado(resultado);
            this.abrir(origem);
            return this.aguardarFechamento();
        }

        preparar(desafio, nivel, versao) {
            this.desafio = desafio;
            this.nivel = nivel;
            this.versao = versao;
            this.tentativas = 0;
            this.resultado = null;
            this.respondida = false;

            this.elemento.style.setProperty('--tipo', desafio.tipo.cor);
            this.partes.tipo.textContent = `${desafio.tipo.icone} ${desafio.tipo.nome}`;
            this.partes.nivel.textContent = nivel.nome;
            this.partes.moedas.textContent = formatarMoedas(versao.moedas);
            this.partes.pergunta.textContent = versao.pergunta;
            this.partes.pergunta.classList.toggle('pergunta--afirmacao', versao.formato === 'verdadeiroOuFalso');

            const bloco = criarBlocoDeCodigo(versao, this.configuracao.visual.realceDeCodigo);
            this.partes.codigo.replaceChildren(...(bloco ? [bloco] : []));

            const { textos, visual } = this.configuracao;
            this.resposta = versao.formato === 'linha'
                ? new RespostaPorLinha(versao, textos)
                : new RespostaPorEscolha(versao, textos, visual);
            this.partes.resposta.replaceChildren(this.resposta.elemento);
            this.partes.botao.textContent = textos.verificar;
            this.esconderAviso();
        }

        abrir(origem) {
            this.elemento.showModal();
            const janela = this.elemento.getBoundingClientRect();
            const carta = origem.getBoundingClientRect();
            this.elemento.style.setProperty('--origem-x', `${carta.left + carta.width / 2 - janela.left}px`);
            this.elemento.style.setProperty('--origem-y', `${carta.top + carta.height / 2 - janela.top}px`);
            this.partes.formulario.scrollTop = 0;
            this.partes.formulario.focus({ preventScroll: true });
        }

        aguardarFechamento() {
            return new Promise((resolver) => {
                this.elemento.addEventListener('close', () => resolver(this.resultado), { once: true });
            });
        }

        fechar() {
            if (!this.ocupada) this.elemento.close();
        }

        async aoConfirmar() {
            if (this.ocupada) return;
            if (this.respondida) {
                this.fechar();
                return;
            }

            const valor = this.resposta.valor();
            if (valor === null) {
                this.mostrarAviso('alerta', this.resposta.pedidoQuandoVazia());
                reiniciarAnimacao(this.resposta.elemento, 'tremer');
                return;
            }

            this.ocupada = true;
            this.tentativas += 1;
            const acertou = valor === this.versao.resposta;
            const tentativasRestantes = this.configuracao.rodada.tentativas - this.tentativas;

            if (!acertou) await this.efeitos.mostrarJumpscare();

            if (!acertou && tentativasRestantes > 0) {
                const texto = escreverQuantidade(tentativasRestantes, this.configuracao.textos.tentativasRestantes);
                this.mostrarAviso('erro', this.configuracao.jumpscare.mensagem, texto);
                this.resposta.tentarDeNovo();
            } else {
                this.resultado = {
                    desafio: this.desafio,
                    nivel: this.nivel,
                    versao: this.versao,
                    valorEscolhido: valor,
                    acertou,
                    moedas: acertou ? this.versao.moedas : 0,
                };
                this.mostrarResultado(this.resultado);
                if (acertou) this.efeitos.chuvaDeDoces();
            }
            this.ocupada = false;
        }

        mostrarResultado(resultado) {
            const { rodada, acerto, jumpscare, textos } = this.configuracao;
            const revelar = resultado.acertou || rodada.mostrarRespostaAoErrar;
            this.respondida = true;
            this.resposta.mostrarResultado(resultado.valorEscolhido, revelar);
            if (revelar && resultado.versao.formato === 'linha') this.destacarLinha(resultado.versao.resposta);

            const titulo = resultado.acertou
                ? `${acerto.mensagem} +${formatarMoedas(resultado.moedas)} ${textos.nomeDasMoedas}`
                : jumpscare.mensagem;
            const detalhes = [];
            if (!resultado.acertou && revelar) detalhes.push(preencherModelo(textos.resposta, { resposta: this.resposta.textoDaResposta() }));
            if (rodada.mostrarExplicacao && resultado.versao.explicacao) detalhes.push(resultado.versao.explicacao);
            this.mostrarAviso(resultado.acertou ? 'acerto' : 'erro', titulo, detalhes.join(' '));
            this.partes.botao.textContent = this.ehOUltimo ? textos.verResultado : textos.voltarAsCartas;
        }

        destacarLinha(numero) {
            const linha = buscarTodos('.linha-de-codigo', this.partes.codigo)[numero - 1];
            if (linha) linha.classList.add('linha-de-codigo--destaque');
        }

        mostrarAviso(tipo, titulo, texto = '') {
            const aviso = this.partes.aviso;
            aviso.className = `aviso aviso--${tipo}`;
            aviso.replaceChildren(criarElemento('strong', {}, titulo), texto ? criarElemento('p', {}, texto) : null);
            aviso.hidden = false;
        }

        esconderAviso() {
            this.partes.aviso.hidden = true;
            this.partes.aviso.replaceChildren();
        }
    }
    // #endregion

    Object.assign(MysteryBox, { JanelaDoDesafio });
})(window.MysteryBox);
