/* =========================================================
   SISTEMA · preparação
   Lê js/configuracao.js e js/desafios.js, completa o que faltar com os
   valores padrão e confere tudo antes do jogo começar.

   - Se faltar uma opção na configuração, vale o valor de PADROES.
   - Se um desafio tiver erro, ele fica de fora e a tela de início explica o motivo.

   Usa:     LINGUAGENS, removerRecuo
   Entrega: completarConfiguracao, conferirConfiguracao, prepararDesafios
   ========================================================= */
(function (MysteryBox) {
    'use strict';
    const { LINGUAGENS, removerRecuo } = MysteryBox;

    //==============================================================
    // #region Valores padrão
    //==============================================================
    // Usados quando uma opção some de js/configuracao.js. Não precisa editar aqui.

    const PADROES = {
        site: { titulo: 'Halloween Mystery Box', subtitulo: '', marca: '', logo: null, botaoIniciar: 'Start' },
        rodada: {
            desafiosPorPadrao: 3, moedasPorPadrao: 500, tentativas: 1,
            mostrarRespostaAoErrar: true, mostrarExplicacao: true,
            mensagemDeParticipacao: '🎁 Prêmio de participação!',
            lembrarUltimoNivel: true, permitirTrocarDeNivelNaRodada: true,
        },
        visual: {
            pixelArt: false, animacaoEmPassos: false, realceDeCodigo: true, versoDasCartas: 'colorido',
            mostrarLegenda: true, letrasNasOpcoes: true, embaralharAoIniciar: true, embaralharOpcoes: true, variaveis: {},
        },
        telaDeInicio: { mostrarCena: true, cicloDaCena: 5000 },
        cartas: { colunas: 'automatico', larguraMaxima: 320, proporcao: 3 / 4 },
        fontes: { usarGoogleFonts: true, familias: [], familiasPixelArt: [] },
        animacoes: { virarCarta: 320, abrirDesafio: 260, embaralhar: 650, chuvaDeDoces: 950, trocarTela: 250 },
        acerto: { mensagem: 'Acertou!', emojis: ['🍬', '🍭', '🍫', '🪙'], quantidade: 36, som: 'sintetizado', volume: 0.6, velocidade: 1 },
        jumpscare: {
            ativo: true, mensagem: 'BUUU! Não foi dessa vez.', imagem: null, imagemPixelada: true,
            som: 'sintetizado', volume: 1, velocidade: 1, inicioDoAudio: 0, duracao: 900, escala: 1.4, tremor: 14, flashVermelho: true,
        },
        textos: {
            nivel: 'Nível',
            quantidadeDeDesafios: 'Quantos desafios?',
            embaralhar: 'Embaralhar',
            verResultado: 'Ver resultado',
            rotuloDasMoedas: 'Coins:',
            nomeDasMoedas: 'coins',
            progresso: 'Desafio {atual} de {total}',
            rodadaConcluida: 'Rodada concluída',
            numeroDaLinha: 'Número da linha com o bug',
            verdadeiro: 'Verdadeiro',
            falso: 'Falso',
            verificar: 'Verificar',
            voltarAsCartas: 'Voltar às cartas',
            pedirLinha: 'Digite o número da linha.',
            pedirOpcao: 'Escolha uma opção.',
            resposta: 'Resposta: {resposta}.',
            respostaDaLinha: 'linha {numero}',
            tentativasRestantes: { um: 'Ainda resta 1 tentativa.', varios: 'Ainda restam {quantidade} tentativas.' },
            tituloDoResultado: 'Fim da Mystery Box!',
            acertos: { um: 'acerto', varios: 'acertos' },
            erros: { um: 'erro', varios: 'erros' },
            verCartas: 'Ver cartas',
            novaRodada: 'Nova rodada',
        },
    };

    /** Devolve uma cópia da configuração com cada seção completada pelos valores padrão. */
    function completarConfiguracao(configuracao) {
        const completa = { ...configuracao };
        for (const [secao, padrao] of Object.entries(PADROES)) {
            completa[secao] = { ...padrao, ...(configuracao[secao] ?? {}) };
        }
        completa.niveis = configuracao.niveis ?? [];
        completa.tipos = configuracao.tipos ?? {};
        return completa;
    }

    // #endregion

    //==============================================================
    // #region Conferência da configuração
    //==============================================================

    const FORMATOS = ['linha', 'escolha', 'verdadeiroOuFalso'];

    function conferirConfiguracao(configuracao) {
        const erros = [];
        const { niveis, tipos, visual, cartas, rodada } = configuracao;
        function avisar(texto) {
            erros.push(`Configuração: ${texto}`);
        }

        if (!niveis.length) avisar('crie pelo menos um nível em "niveis".');
        const ids = niveis.map((nivel) => nivel.id);
        const repetidos = ids.filter((id, posicao) => ids.indexOf(id) !== posicao);
        if (repetidos.length) avisar(`o id de nível "${repetidos[0]}" aparece mais de uma vez.`);
        for (const nivel of niveis) {
            if (!LINGUAGENS.includes(nivel.linguagem)) {
                avisar(`o nível ${nivel.nome} usa a linguagem "${nivel.linguagem}", que não existe. Use ${LINGUAGENS.join(', ')}.`);
            }
        }
        if (niveis.length && !ids.includes(configuracao.nivelInicial)) {
            avisar(`nivelInicial "${configuracao.nivelInicial}" não está em "niveis". Usando ${niveis[0].nome}.`);
        }

        for (const [chave, tipo] of Object.entries(tipos)) {
            if (!FORMATOS.includes(tipo.formato)) avisar(`o tipo "${chave}" tem formato "${tipo.formato}". Use ${FORMATOS.join(', ')}.`);
        }

        if (!['colorido', 'igual'].includes(visual.versoDasCartas)) {
            avisar(`visual.versoDasCartas deve ser 'colorido' ou 'igual' (está "${visual.versoDasCartas}"). Usando 'colorido'.`);
        }
        if (cartas.colunas !== 'automatico' && !(Number.isInteger(cartas.colunas) && cartas.colunas >= 1)) {
            avisar(`cartas.colunas deve ser 'automatico' ou um número inteiro (está "${cartas.colunas}"). Usando 'automatico'.`);
        }
        if (!(Number(cartas.proporcao) > 0)) avisar('cartas.proporcao deve ser um número maior que zero, como 3 / 4.');
        if (!(rodada.tentativas >= 1)) avisar('rodada.tentativas deve ser 1 ou mais.');
        return erros;
    }

    // #endregion

    //==============================================================
    // #region Preparação dos desafios
    //==============================================================

    const CAMPOS_DA_VERSAO = ['codigo', 'imagem', 'linguagem', 'pergunta', 'explicacao', 'moedas',
        'linha', 'opcoes', 'correta', 'afirmacao', 'resposta'];

    /** Devolve os desafios prontos para o jogo e a lista de erros dos que ficaram de fora. */
    function prepararDesafios(listaDeDesafios, configuracao) {
        const desafios = [];
        const erros = [];
        listaDeDesafios.forEach((dados, posicao) => {
            const errosDoDesafio = [];
            const desafio = prepararDesafio(dados, `Desafio ${posicao + 1}`, configuracao, errosDoDesafio);
            if (errosDoDesafio.length) erros.push(...errosDoDesafio);
            else desafios.push(desafio);
        });
        return { desafios, erros };
    }

    function prepararDesafio(dados, rotulo, configuracao, erros) {
        const tipo = configuracao.tipos[dados.tipo];
        if (!tipo) {
            erros.push(`${rotulo}: o tipo "${dados.tipo}" não existe. Use ${Object.keys(configuracao.tipos).join(', ')}.`);
            return null;
        }
        if (!FORMATOS.includes(tipo.formato)) {
            erros.push(`${rotulo}: o tipo "${dados.tipo}" tem um formato que não existe.`);
            return null;
        }

        const camposConhecidos = ['tipo', 'moedas', ...configuracao.niveis.map((nivel) => nivel.id)];
        for (const campo of Object.keys(dados)) {
            if (!camposConhecidos.includes(campo)) {
                erros.push(`${rotulo}: "${campo}" não é um nível nem um campo do desafio. Confira se o nome está certo.`);
            }
        }

        const versoes = {};
        for (const nivel of configuracao.niveis) {
            if (!dados[nivel.id]) {
                erros.push(`${rotulo}: falta a versão ${nivel.nome} (escreva ${nivel.id}: { ... }).`);
                continue;
            }
            const moedasPadrao = dados.moedas ?? configuracao.rodada.moedasPorPadrao;
            versoes[nivel.id] = prepararVersao(dados[nivel.id], tipo, nivel, moedasPadrao, `${rotulo} (${nivel.nome})`, configuracao, erros);
        }
        return { tipo, versoes };
    }

    function prepararVersao(dados, tipo, nivel, moedasPadrao, rotulo, configuracao, erros) {
        const { textos } = configuracao;
        const versao = {
            formato: tipo.formato,
            pergunta: dados.pergunta ?? dados.afirmacao ?? tipo.pergunta,
            codigo: dados.codigo ? removerRecuo(dados.codigo) : null,
            imagem: dados.imagem ?? null,
            linguagem: dados.linguagem ?? nivel.linguagem,
            explicacao: dados.explicacao ?? '',
            moedas: Number(dados.moedas ?? moedasPadrao),
            opcoes: [],
            opcoesFixas: false,
            resposta: null,
        };

        for (const campo of Object.keys(dados)) {
            if (!CAMPOS_DA_VERSAO.includes(campo)) erros.push(`${rotulo}: o campo "${campo}" não existe. Confira se o nome está certo (sem acento).`);
        }
        if (!versao.pergunta) erros.push(`${rotulo}: falta a pergunta ou a afirmação.`);
        if (!(versao.moedas >= 0)) erros.push(`${rotulo}: moedas deve ser um número (está "${dados.moedas ?? moedasPadrao}").`);
        if (versao.codigo && !LINGUAGENS.includes(versao.linguagem)) {
            erros.push(`${rotulo}: a linguagem "${versao.linguagem}" não existe. Use ${LINGUAGENS.join(', ')}.`);
        }

        if (tipo.formato === 'linha') {
            versao.resposta = Number(dados.linha);
            const totalDeLinhas = versao.codigo ? versao.codigo.split('\n').length : Infinity;
            if (!versao.codigo && !versao.imagem) erros.push(`${rotulo}: falta o código (ou a imagem do código).`);
            if (!(Number.isInteger(versao.resposta) && versao.resposta >= 1 && versao.resposta <= totalDeLinhas)) {
                erros.push(`${rotulo}: a linha ${dados.linha} não existe no código (ele tem ${totalDeLinhas} linhas).`);
            }
        }

        if (tipo.formato === 'escolha') {
            versao.opcoes = (dados.opcoes ?? []).map(String);
            versao.resposta = String(dados.correta);
            if (versao.opcoes.length < 2) erros.push(`${rotulo}: escreva pelo menos duas opções.`);
            if (new Set(versao.opcoes).size !== versao.opcoes.length) erros.push(`${rotulo}: há opções repetidas.`);
            if (!versao.opcoes.includes(versao.resposta)) {
                erros.push(`${rotulo}: a resposta correta "${dados.correta}" não está escrita igual a nenhuma das opções.`);
            }
        }

        if (tipo.formato === 'verdadeiroOuFalso') {
            versao.opcoes = [textos.verdadeiro, textos.falso];
            versao.opcoesFixas = true;
            versao.resposta = dados.resposta ? textos.verdadeiro : textos.falso;
            if (typeof dados.resposta !== 'boolean') erros.push(`${rotulo}: a resposta deve ser true ou false, sem aspas.`);
        }

        return versao;
    }

    // #endregion

    Object.assign(MysteryBox, { completarConfiguracao, conferirConfiguracao, prepararDesafios });
})(window.MysteryBox);
