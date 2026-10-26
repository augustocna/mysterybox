/* ╔══════════════════════════════════════════════════════════╗
   ║   HALLOWEEN MYSTERY BOX · CONFIGURAÇÃO                   ║
   ╚══════════════════════════════════════════════════════════╝
   Este é o único arquivo que você precisa editar.
   Se algum desafio estiver errado, a tela inicial avisa qual é e por quê.

   COMO ESCREVER UM DESAFIO
   Cada desafio tem um tipo, as moedas e uma versão para cada nível.

   Ache o bug
     { tipo: 'bug', moedas: 500,
       cy1: { codigo: `...`, linha: 3, explicacao: '...' },
       cy2: { ... } }

   Qual a saída
     { tipo: 'saida', moedas: 500,
       cy1: { codigo: `...`, opcoes: ['6', '5', '7'], correta: '5' },
       cy2: { ... } }

   Verdadeiro ou falso
     { tipo: 'verdadeiroOuFalso', moedas: 300,
       cy1: { afirmacao: '...', resposta: true },
       cy2: { ... } }

   Campos opcionais em qualquer versão
     pergunta     troca o texto padrão da pergunta
     imagem       mostra uma imagem no lugar do código: 'assets/desafios/bug.png'
     moedas       moedas só desta versão (senão vale o do desafio)
     explicacao   aparece depois da resposta

   O código pode ser escrito com recuo; o site ajusta sozinho.
   Se o código tiver ${ ou crase, escreva \${ ou \`.
   ============================================================ */

const configuracao = {

    /* ─────────────── SITE ─────────────── */
    site: {
        titulo: 'Halloween Mystery Box',
        subtitulo: 'Escolha uma carta, se tiver coragem.',
        marca: 'CNA Ctrl+Play',            // texto que aparece se o logo não existir
        logo: 'assets/logo.png',
        botaoIniciar: 'Start',
    },

    /* ─────────────── NÍVEIS ─────────────── */
    niveis: [
        { id: 'ct2', nome: 'CT2', detalhe: '', linguagem: 'Lua, C++'},
        { id: 'cy1', nome: 'CY1', detalhe: '', linguagem: 'python' },
        { id: 'cy2', nome: 'CY2', detalhe: '', linguagem: 'web' },
    ],
    nivelInicial: 'ct2',

    /* ─────────────── RODADA ─────────────── */
    rodada: {
        desafiosPorPadrao: 1,              // valor inicial do seletor na tela de início
        moedasPorPadrao: 500,              // usado quando o desafio não informa moedas
        tentativas: 1,                     // chances por desafio
        mostrarRespostaAoErrar: true,
        mostrarExplicacao: true,
        // Aparece no resultado só quando a turma erra todos os desafios
        mensagemDeParticipacao: '🎁 Vocês ganharam o prêmio de participação!',
    },

    /* ─────────────── VISUAL ─────────────── */
    visual: {
        pixelArt: true,                    // liga ou desliga o estilo pixel art
        realceDeCodigo: true,
        versoDasCartas: 'igual',        // 'colorido': cada carta fechada mostra a cor e o nome do tipo
        // 'igual': todas as cartas fechadas iguais; a cor só aparece ao virar
        embaralharAoIniciar: true,
        embaralharOpcoes: true,
        variaveis: {                       // sobrescreve variáveis do :root do css/estilo.css
            // '--cor-marca': '#E2001A',
            '--colunas': '5',
        },
    },

    /* ─────────────── FONTES ───────────────
       Vêm do Google Fonts quando há internet. Sem internet, o CSS usa as do sistema. */
    fontes: {
        usarGoogleFonts: true,
        familias: ['Nunito:wght@400;700;800;900', 'Creepster'],
        familiasPixelArt: ['Press Start 2P'],
    },

    /* ─────────────── ANIMAÇÕES (milissegundos, no máximo 1000) ─────────────── */
    animacoes: {
        virarCarta: 320,
        abrirDesafio: 260,
        embaralhar: 650,
        chuvaDeDoces: 950,
        trocarTela: 250,
    },

    /* ─────────────── ACERTO ─────────────── */
    acerto: {
        mensagem: 'Acertou!',
        emojis: ['🍬', '🍭', '🍫', '🪙', '🪙', '🎃'],
        quantidade: 36,
        som: 'sintetizado',                // 'sintetizado', 'assets/acerto.mp3' ou null
        volume: 0.6,                       // de 0 a 1
        velocidade: 1,
    },

    /* ─────────────── JUMPSCARE ─────────────── */
    jumpscare: {
        ativo: true,
        mensagem: 'BUUU! Não foi dessa vez.',
        imagem: null,                      // null usa o fantasma em pixel art; ou 'assets/fantasma.png'
        imagemPixelada: true,              // false para foto ou desenho comum
        som: 'sintetizado',                // 'sintetizado', 'assets/grito.mp3' ou null
        volume: 1,                         // de 0 a 1
        velocidade: 1,                     // 0.5 mais lento e grave, 1.5 mais rápido e agudo
        inicioDoAudio: 0,                  // segundos a pular no começo do arquivo
        duracao: 900,                      // milissegundos, no máximo 1000
        escala: 1.4,
        tremor: 14,                        // pixels
        flashVermelho: true,
    },

    /* ─────────────── TIPOS ───────────────
       formato: 'linha' (digita a linha), 'escolha' (opções) ou 'verdadeiroOuFalso' */
    tipos: {
        bug: { 
            nome: 'Ache o bug', 
            icone: '🐛', 
            cor: '#8BE04E', 
            formato: 'linha', 
            pergunta: 'Em qual linha está o bug?' 
        },

        saida: { 
            nome: 'Qual a saída?', 
            icone: '🔮', 
            cor: '#B57CFF', 
            formato: 'escolha', 
            pergunta: 'Qual é a saída deste código?' 
        },

        verdadeiroOuFalso: { 
            nome: 'Verdadeiro ou falso', 
            icone: '🎃', 
            cor: '#FF8A1F', 
            formato: 'verdadeiroOuFalso', 
            pergunta: '' 
        },
    },

    /* ─────────────── DESAFIOS ─────────────── */
    desafios: [
        {
            tipo: 'bug',
            moedas: 500,
            ct2: {
                codigo: 
`
local doces = 10
if doces = 10 then
    print("Dez doces")
else
    print(doces)
end   
`,
                linha: 2,
                explicacao: 'Usou-se operador de atribuicao = ao invés do operador de comparação ==',
            },
            cy1: {
                codigo: 
`
doces = 10
doces /= 2
doces = doces - 3
print("Doces restantes:" doces)
`,
                linha: 3,
                explicacao: 'Falta a vírgula entre o texto e a variável dentro do print.',
            },

            cy2: {
                codigo: 
`
<body>
    <main class="conteiner">
        <h1>Happy Halloween<h1>
        <p>Cuidado com os fantasmas!</p>
    </main>
</body>
`,
                linha: 3,
                explicacao: 'A tag de fechamento precisa de barra: </h1>.',
            },
        },

        {
            tipo: 'bug',
            moedas: 500,
            ct2: {
                codigo: 
`
int fantasma = analogRead(A1);
if(fantasma < 500) {
    digitalWrite(6, HIGH);
}
else {
    digitalWrite(6 LOW);
}
`,
                linha: 6,
                explicacao: 'Faltou a virgula , depois do 6 para separar os dois argumentos da função digitalWrite',
            },
            cy1: {
                codigo: 
`
senha = "boo"
if senha = "boo":
    print("Porta aberta")
else:
    print("Porta fechada")
`,
                linha: 2,
                explicacao: 'Um = guarda um valor. Para comparar, usa-se ==.',
            },
            cy2: {
                codigo: 
`
let travessuras = 0;
function assustar() {
    for (let i = 0; i < 10; i++) {
        travessuras = travessuras + 1;
    }
    alert("Travessuras: " + travessura);
}
`,
                linha: 6,
                explicacao: 'A variável se chama travessuras, com "s" no final.',
            },
        },

        {
            tipo: 'saida',
            moedas: 400,
            ct2: {
                codigo: 
`
local fantasmas = 2
fantasmas = fantasmas * 2
fantasmas -= 7
fantasmas /= 382433
fantasmas = 10
print(fantasmas)
`,
                opcoes: ['3.9998169614023893', '10', '7'],
                correta: '10',
                explicacao: 'Na linha 5 a variável fantasmas passa a guardar o valor 10',
            },
            cy1: {
                codigo: 
`
fantasmas = 2
fantasmas *= 3
fantasmas = fantasmas - 1
print(fantasmas)
`,
                opcoes: ['6', '5', '7'],
                correta: '5',
                explicacao: '2 multiplicado por 3 dá 6, e 6 menos 1 dá 5.',
            },
            cy2: {
                pergunta: 'No código abaixo, o que o alert mostra?',
                codigo: 
`
let doces = 3;
let fantasmas = "3";
doces -= 2
alert(doces + fantasmas);
`,
                opcoes: ['13', '6', 'Erro'],
                correta: '13',
                explicacao: 'Como b é texto, o + junta os dois em vez de somar.',
            },
        },

        {
            tipo: 'saida',
            moedas: 400,
            ct2: {
                codigo: 
`
int portaFantasma = 6;
void setup() {
    pinMode(portaFantasma, OUTPUT);
    Serial.begin(9600);
    Serial.println(portaFantasma);
}
`,
                opcoes: ['6', 'OUTPUT', '9600'],
                correta: '6',
                explicacao: 'Na linha 5 o método Serial.println() imprime o valor da variável portaFantasma, que é 6',
            },
            cy1: {
                codigo: 
`
doces = ['paçoca', 'chocolate', 'jujuba']
doces.sort()
print(doces[1])
`,
                opcoes: ['paçoca', 'chocolate', 'jujuba'],
                correta: 'jujuba',
                explicacao: 'Em Python, o método .sort() organiza a lista em ordem alfabetica e o indice 1 acessa o segundo elemento: jujuba',
            },
            cy2: {
                pergunta: 'O que o alert mostra?',
                codigo: 
`
let doces = 0;
for (let i = 1; i <= 3; i++) {
    doces = doces + i;
}
alert(doces);
`,
                opcoes: ['3', '6', '123'],
                correta: '6',
                explicacao: 'O for soma 1 + 2 + 3.',
            },
        },

        {
            tipo: 'verdadeiroOuFalso',
            moedas: 300,
            ct2: {
                afirmacao: 'Uma variável é um espaço na memória do computador com nome que guarda um valor, como um pote de doces com etiqueta.',
                resposta: true,
                explicacao: 'Em doces = 10, o pote chamado doces guarda o valor 10.',
            },
            cy1: {
                afirmacao: 'Uma variável é um espaço na memória do computador com nome que guarda um valor, como um pote de doces com etiqueta.',
                resposta: true,
                explicacao: 'Em doces = 10, o pote chamado doces guarda o valor 10.',
            },
            cy2: {
                afirmacao: 'No CSS, o ponto (.) seleciona um elemento pelo id. como .campo-de-busca',
                resposta: false,
                explicacao: 'O ponto seleciona uma classe. Para id, usa-se #.',
            },
        },

        {
            tipo: 'verdadeiroOuFalso',
            moedas: 300,
            ct2: {
                afirmacao: 'O comando if serve para realizar um bloco instruções apenas se uma condição for satisfeita.',
                resposta: true,
                explicacao: 'Quem escolhe caminhos é o if. O for repete comandos.',
            },
            cy1: {
                afirmacao: 'O comando if serve para realizar um bloco instruções apenas se uma condição for satisfeita.',
                resposta: true,
                explicacao: 'Quem escolhe caminhos é o if. O for repete comandos.',
            },
            cy2: {
                afirmacao: 'De forma simplificada, O HTML organiza o conteúdo, o CSS cuida da aparência e o JS dá comportamento à página.',
                resposta: true,
                explicacao: 'São as três camadas de uma página web.',
            },
        },
    ],
};
