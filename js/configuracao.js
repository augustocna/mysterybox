/* ╔══════════════════════════════════════════════════════════╗
   ║   HALLOWEEN MYSTERY BOX · CONFIGURAÇÃO                   ║
   ╚══════════════════════════════════════════════════════════╝
   Aqui fica tudo o que muda o funcionamento e a aparência do site.

   Onde fica cada coisa
     js/configuracao.js   este arquivo: níveis, regras, visual, sons, textos
     js/desafios.js       os desafios (com o passo a passo para criar novos)
     css/variaveis.css    cores, fontes e tamanhos
     assets/              logo, imagens e sons

   Se você apagar uma opção sem querer, o site usa o valor padrão.
   Se alguma opção estiver com valor errado, a tela de início avisa.

   Seções
    1. Site                 7. Fontes
    2. Níveis               8. Animações
    3. Rodada               9. Acerto
    4. Visual              10. Jumpscare
    5. Cartas              11. Tipos de desafio
    6. Tela de início      12. Textos
   ============================================================ */

const configuracao = {

    //==========================================================
    // #region 1. Site
    //==========================================================
    site: {
        titulo: 'Halloween Mystery Box',
        subtitulo: 'Escolha uma carta, se tiver coragem.',
        logo: 'assets/logo.png',             // null para não usar imagem
        marca: 'CNA Ctrl+Play',              // texto que aparece se o logo não existir
        botaoIniciar: 'Start',
    },

    // #endregion

    //==========================================================
    // #region 2. Níveis
    //==========================================================
    // Cada nível vira um botão no seletor, na ordem desta lista.
    //   id          nome curto usado nos desafios (ct2: { ... }); sem espaço nem acento
    //   nome        texto do botão
    //   detalhe     texto pequeno ao lado do nome ('' para não mostrar)
    //   linguagem   cores do código: 'python', 'lua', 'cpp' (C++ e Arduino) ou 'web' (HTML, CSS e JS)
    // Ao criar um nível, todo desafio em js/desafios.js precisa ganhar uma versão com o id dele.
    niveis: [
        { id: 'ct2', nome: 'CT2', detalhe: '', linguagem: 'lua' },
        { id: 'cy1', nome: 'CY1', detalhe: '', linguagem: 'python' },
        { id: 'cy2', nome: 'CY2', detalhe: '', linguagem: 'web' },
    ],
    nivelInicial: 'ct2',                     // nível marcado ao abrir o site

    // #endregion

    //==========================================================
    // #region 3. Rodada
    //==========================================================
    rodada: {
        desafiosPorPadrao: 1,                // valor inicial de "Quantos desafios?"
        moedasPorPadrao: 500,                // coins do desafio que não informa "moedas"
        tentativas: 1,                       // chances por desafio
        mostrarRespostaAoErrar: true,
        mostrarExplicacao: true,
        mensagemDeParticipacao: '🎁 Prêmio de participação!',   // aparece só se a turma errar todos
        lembrarUltimoNivel: true,            // true: abre no último nível usado; false: sempre no nivelInicial
        permitirTrocarDeNivelNaRodada: true, // false: esconde o seletor de nível na tela das cartas
    },

    // #endregion

    //==========================================================
    // #region 4. Visual
    //==========================================================
    visual: {
        pixelArt: true,                     // bordas em degrau e fonte pixelada
        animacaoEmPassos: false,             // movimento "travadinho" de videogame antigo; false deixa tudo fluido
        realceDeCodigo: true,                // cores no código
        versoDasCartas: 'igual',             // 'colorido': cada carta fechada mostra a cor e o nome do tipo
                                             // 'igual': todas iguais; a cor só aparece ao virar
        mostrarLegenda: true,                // legenda de cores embaixo das cartas (só no modo 'colorido')
        letrasNasOpcoes: true,               // A, B, C ao lado das opções do "Qual a saída?"
        embaralharAoIniciar: true,
        embaralharOpcoes: true,
        variaveis: {                         // troca qualquer variável do css/variaveis.css
            // '--cor-marca': '#E2001A',
            // '--cor-verso-igual': '#8BE04E',
        },
    },

    // #endregion

    //==========================================================
    // #region 5. Cartas
    //==========================================================
    cartas: {
        colunas: 'automatico',               // 'automatico' escolhe o que deixa as cartas maiores; ou um número, como 3
        larguraMaxima: 320,                  // em pixels: evita cartas gigantes no projetor
        proporcao: 3 / 4,                    // largura / altura da carta
    },

    // #endregion

    //==========================================================
    // #region 6. Tela de início
    //==========================================================
    telaDeInicio: {
        mostrarCena: true,                   // fantasma saindo da caixa
        cicloDaCena: 5000,                   // milissegundos de cada repetição (mínimo 1000)
    },

    // #endregion

    //==========================================================
    // #region 7. Fontes
    //==========================================================
    // Vêm do Google Fonts quando há internet. Sem internet, o site usa as do sistema.
    fontes: {
        usarGoogleFonts: true,
        familias: ['Nunito:wght@400;700;800;900', 'Creepster'],
        familiasPixelArt: ['Press Start 2P'],    // só carrega com pixelArt ligado
    },

    // #endregion

    //==========================================================
    // #region 8. Animações
    //==========================================================
    // Milissegundos. Nenhuma passa de 1000, mesmo que o número seja maior.
    animacoes: {
        virarCarta: 320,
        abrirDesafio: 260,
        embaralhar: 650,
        chuvaDeDoces: 950,
        trocarTela: 250,
    },

    // #endregion

    //==========================================================
    // #region 9. Acerto
    //==========================================================
    acerto: {
        mensagem: 'Acertou!',                // seguida de "+500 coins"
        emojis: ['🍬', '🍭', '🍫', '🪙', '🪙', '🎃'],
        quantidade: 36,                      // doces na chuva
        som: 'sintetizado',                  // 'sintetizado', 'assets/acerto.mp3' ou null (sem som)
        volume: 0.6,                         // de 0 a 1
        velocidade: 1,
    },

    // #endregion

    //==========================================================
    // #region 10. Jumpscare
    //==========================================================
    jumpscare: {
        ativo: true,
        mensagem: 'BUUU! Não foi dessa vez.',
        imagem: null,                        // null usa o fantasma em pixel art; ou 'assets/fantasma.png'
        imagemPixelada: true,                // false para foto ou desenho comum
        som: 'assets/grito.mp3',             // 'sintetizado', 'assets/grito.mp3' ou null (sem som)
        volume: 0.25,                         // de 0 a 1
        velocidade: 1,                       // 0.5 mais lento e grave, 1.5 mais rápido e agudo
        inicioDoAudio: 0,                    // segundos a pular no começo do arquivo de som
        duracao: 900,                        // milissegundos, no máximo 1000
        escala: 1.4,                         // tamanho final do fantasma
        tremor: 14,                          // pixels de tremida
        flashVermelho: true,
    },

    // #endregion

    //==========================================================
    // #region 11. Tipos de desafio
    //==========================================================
    // A chave (bug, saida, verdadeiroOuFalso) é o que se escreve em "tipo" nos desafios.
    //   formato    como a turma responde:
    //              'linha'              digita o número de uma linha
    //              'escolha'            escolhe uma das opções
    //              'verdadeiroOuFalso'  escolhe entre verdadeiro e falso
    //   pergunta   texto padrão; cada desafio pode trocar o seu
    // Para criar um tipo novo, copie um bloco, troque a chave e use um dos três formatos.
    tipos: {
        bug: {
            nome: 'Ache o bug',
            icone: '🐛',
            cor: '#8BE04E',
            formato: 'linha',
            pergunta: 'Em qual linha está o bug?',
        },

        saida: {
            nome: 'Qual a saída?',
            icone: '🔮',
            cor: '#B57CFF',
            formato: 'escolha',
            pergunta: 'Qual é a saída deste código?',
        },

        verdadeiroOuFalso: {
            nome: 'Verdadeiro ou falso',
            icone: '🎃',
            cor: '#FF8A1F',
            formato: 'verdadeiroOuFalso',
            pergunta: '',                    // aqui a pergunta é a própria afirmação do desafio
        },
    },

    // #endregion

    //==========================================================
    // #region 12. Textos
    //==========================================================
    // Todos os textos fixos da tela. {chave} é trocado pelo valor na hora.
    textos: {
        // Tela de início
        nivel: 'Nível',
        quantidadeDeDesafios: 'Quantos desafios?',

        // Tela das cartas
        progresso: 'Desafio {atual} de {total}',
        rodadaConcluida: 'Rodada concluída',
        rotuloDasMoedas: 'Coins:',
        nomeDasMoedas: 'coins',
        embaralhar: 'Embaralhar',
        verResultado: 'Ver resultado',

        // Janela do desafio
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

        // Tela de resultado
        tituloDoResultado: 'Fim da Mystery Box!',
        acertos: { um: 'acerto', varios: 'acertos' },
        erros: { um: 'erro', varios: 'erros' },
        verCartas: 'Ver cartas',
        novaRodada: 'Nova rodada',
    },

    // #endregion
};
