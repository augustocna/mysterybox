/* ╔══════════════════════════════════════════════════════════╗
   ║   HALLOWEEN MYSTERY BOX · DESAFIOS                        ║
   ╚══════════════════════════════════════════════════════════╝
   Aqui ficam só os desafios. Níveis, tipos e textos ficam em js/configuracao.js.
   Se um desafio tiver erro, ele fica de fora e a tela de início explica o motivo.

   ── 1. COMO UM DESAFIO É MONTADO ─────────────────────────────

   Cada desafio é um bloco { } da lista, separado do próximo por vírgula.
   Ele diz o tipo, quantas coins vale e traz uma versão para cada nível:

       {
           tipo: 'bug',            um dos tipos de configuracao.tipos
           moedas: 500,            coins para quem acertar (opcional)
           ct2: { ... },           uma versão para CADA nível de configuracao.niveis,
           cy1: { ... },           usando o id do nível como nome
           cy2: { ... },
       },

   Hoje os níveis são ct2, cy1 e cy2, então todo desafio precisa dessas três versões.
   Ao criar um nível novo em configuracao.niveis, acrescente a versão dele em todos
   os desafios; o desafio que ficar sem ela não aparece até ser completado.

   ── 2. O QUE VAI EM CADA VERSÃO ──────────────────────────────

   Ache o bug (tipo: 'bug')
       codigo       o código, entre crases
       linha        número da linha com o bug; a primeira linha do código é a 1

   Qual a saída (tipo: 'saida')
       codigo       o código, entre crases
       opcoes       as respostas que aparecem: ['6', '5', '7']
       correta      a resposta certa, escrita igual a uma das opções: '5'

   Verdadeiro ou falso (tipo: 'verdadeiroOuFalso')
       afirmacao    a frase que a turma vai julgar
       resposta     true para verdadeiro ou false para falso, sem aspas

   Campos opcionais, em qualquer tipo
       explicacao   aparece depois da resposta
       pergunta     troca a pergunta padrão do tipo
       linguagem    cores do código desta versão; sem ela, vale a do nível
                    'python', 'lua', 'cpp' (C++ e Arduino) ou 'web' (HTML, CSS e JS)
       moedas       coins só desta versão
       imagem       mostra uma imagem no lugar do código: 'assets/desafios/bug.png'
       codigo       também vale no verdadeiro ou falso, quando a frase fala de um código

   Os nomes dos campos não têm acento: explicacao, afirmacao, opcoes.

   ── 3. DICAS PARA O CÓDIGO ───────────────────────────────────

   • Escreva o código entre crases (`). Pode deixá-lo recuado para ficar alinhado
     aqui dentro: o site tira o recuo que todas as linhas têm em comum.
   • As linhas vazias logo depois da primeira crase e antes da última são ignoradas.
     As do meio contam na numeração.
   • Aspas simples e duplas podem ser usadas à vontade dentro das crases.
   • Para mostrar uma crase, escreva \`. Para mostrar ${, escreva \${.

   ── 4. MODELO PARA COPIAR ────────────────────────────────────

       {
           tipo: 'saida',
           moedas: 400,
           ct2: {
               codigo: `
                   local doces = 3
                   print(doces * 2)
               `,
               opcoes: ['6', '32', '5'],
               correta: '6',
               explicacao: '3 vezes 2 dá 6.',
           },
           cy1: { ... },
           cy2: { ... },
       },
   ============================================================ */

const desafios = [

    //==========================================================
    // #region Desafio 1 · Ache o bug
    //==========================================================
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
            explicacao: 'Foi usado o = (que guarda um valor) no lugar do == (que compara).',
        },

        cy1: {
            codigo: 
                `
                doces = 10
                doces /= 2
                doces = doces - 3
                print("Doces restantes:" doces)
                `,
            linha: 4,
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

    // #endregion

    //==========================================================
    // #region Desafio 2 · Ache o bug
    //==========================================================
    {
        tipo: 'bug',
        moedas: 500,

        ct2: {
            linguagem: 'cpp',
            codigo: 
                `
                int fantasma = analogRead(A1);
                if (fantasma < 500) {
                    digitalWrite(6, HIGH);
                }
                else {
                    digitalWrite(6 LOW);
                }
                `,
            linha: 6,
            explicacao: 'Faltou a vírgula depois do 6 para separar os dois valores do digitalWrite.',
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

    // #endregion

    //==========================================================
    // #region Desafio 3 · Qual a saída?
    //==========================================================
    {
        tipo: 'saida',
        moedas: 400,

        ct2: {
            codigo: 
                `
                local fantasmas = 2
                fantasmas = fantasmas * 2
                fantasmas = fantasmas - 7
                fantasmas = fantasmas / 382
                fantasmas = 10
                print(fantasmas)
                `,
            opcoes: ['3.98168', '10', '7'],
            correta: '10',
            explicacao: 'Na linha 5, a variável fantasmas passa a guardar o valor 10, e as contas de antes se perdem.',
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
                doces -= 2;
                alert(doces + fantasmas);
                `,
            opcoes: ['13', '6', 'Erro'],
            correta: '13',
            explicacao: 'Como fantasmas é texto, o + junta os dois em vez de somar: 1 e "3" viram "13".',
        },
    },

    // #endregion

    //==========================================================
    // #region Desafio 4 · Qual a saída?
    //==========================================================
    {
        tipo: 'saida',
        moedas: 400,

        ct2: {
            linguagem: 'cpp',
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
            explicacao: 'Na linha 5, Serial.println() mostra o valor da variável portaFantasma, que é 6.',
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
            explicacao: 'O .sort() coloca a lista em ordem alfabética (chocolate, jujuba, paçoca) e o índice 1 é o segundo item: jujuba.',
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

    // #endregion

    //==========================================================
    // #region Desafio 5 · Verdadeiro ou falso
    //==========================================================
    {
        tipo: 'verdadeiroOuFalso',
        moedas: 300,

        ct2: {
            afirmacao: 'Uma variável é um espaço na memória do computador, com um nome, que guarda um valor, como um pote de doces com etiqueta.',
            resposta: true,
            explicacao: 'Em local doces = 10, o pote chamado doces guarda o valor 10.',
        },

        cy1: {
            afirmacao: 'Uma variável é um espaço na memória do computador, com um nome, que guarda um valor, como um pote de doces com etiqueta.',
            resposta: true,
            explicacao: 'Em doces = 10, o pote chamado doces guarda o valor 10.',
        },

        cy2: {
            afirmacao: 'No CSS, o ponto (.) seleciona um elemento pelo id, como em .campo-de-busca.',
            resposta: false,
            explicacao: 'O ponto seleciona uma classe. Para id, usa-se #.',
        },
    },

    // #endregion

    //==========================================================
    // #region Desafio 6 · Verdadeiro ou falso
    //==========================================================
    {
        tipo: 'verdadeiroOuFalso',
        moedas: 300,

        ct2: {
            afirmacao: 'O comando if serve para executar um bloco de instruções apenas se uma condição for satisfeita.',
            resposta: true,
            explicacao: 'O if testa a condição: se ela for verdadeira, o bloco roda; se não, é pulado.',
        },

        cy1: {
            afirmacao: 'O comando if serve para executar um bloco de instruções apenas se uma condição for satisfeita.',
            resposta: true,
            explicacao: 'O if testa a condição: se ela for verdadeira, o bloco roda; se não, é pulado.',
        },

        cy2: {
            afirmacao: 'De forma simplificada, o HTML organiza o conteúdo, o CSS cuida da aparência e o JS dá comportamento à página.',
            resposta: true,
            explicacao: 'São as três camadas de uma página web.',
        },
    },

    // #endregion

];
