/* =========================================================
   HALLOWEEN MYSTERY BOX · aplicação
   Conteúdo, cores e sons ficam em js/configuracao.js.

   Convenções deste arquivo
   - Funções soltas são declaradas com "function".
   - Tudo que guarda estado é uma classe, só com métodos comuns.
   - Funções de seta aparecem apenas como callback (eventos, map, forEach).
   - O JavaScript encontra os elementos da página pelos atributos data-*.
   - Cada seção é um #region: o VS Code dobra e mostra o nome no minimapa.

   Sumário
    1. Utilitários           7. Respostas
    2. Pixel art e ícones    8. Janela do desafio
    3. Código                9. Cartas e tabuleiro
    4. Preparação           10. Rodada
    5. Tema                 11. Seletores
    6. Sons e efeitos       12. Jogo
   ========================================================= */
(function () {
    'use strict';

    //==============================================================
    // #region 1. Utilitários
    //==============================================================

    function buscar(seletor, raiz = document) {
        return raiz.querySelector(seletor);
    }

    function buscarTodos(seletor, raiz = document) {
        return [...raiz.querySelectorAll(seletor)];
    }

    function criarElemento(etiqueta, atributos = {}, ...filhos) {
        const elemento = document.createElement(etiqueta);
        for (const [nome, valor] of Object.entries(atributos)) {
            if (valor === null || valor === undefined || valor === false) continue;
            if (nome === 'class') elemento.className = valor;
            else elemento.setAttribute(nome, valor === true ? '' : valor);
        }
        elemento.append(...filhos.flat().filter((filho) => filho !== null && filho !== undefined && filho !== false));
        return elemento;
    }

    function limitarDuracao(milissegundos) {
        return Math.max(0, Math.min(1000, Number(milissegundos) || 0));
    }

    function esperar(milissegundos) {
        return new Promise((resolver) => setTimeout(resolver, milissegundos));
    }

    function sortearEntre(minimo, maximo) {
        return minimo + Math.random() * (maximo - minimo);
    }

    function sortearItem(lista) {
        return lista[Math.floor(Math.random() * lista.length)];
    }

    function embaralharLista(lista) {
        for (let posicao = lista.length - 1; posicao > 0; posicao--) {
            const outraPosicao = Math.floor(Math.random() * (posicao + 1));
            [lista[posicao], lista[outraPosicao]] = [lista[outraPosicao], lista[posicao]];
        }
        return lista;
    }

    function escaparHtml(texto) {
        const substitutos = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return texto.replace(/[&<>"']/g, (caractere) => substitutos[caractere]);
    }

    function removerRecuo(texto) {
        const linhas = String(texto).replace(/\r/g, '').replace(/\t/g, '    ').split('\n');
        while (linhas.length && !linhas[0].trim()) linhas.shift();
        while (linhas.length && !linhas[linhas.length - 1].trim()) linhas.pop();
        const recuos = linhas.filter((linha) => linha.trim()).map((linha) => linha.match(/^ */)[0].length);
        const menorRecuo = Math.min(...recuos);
        return linhas.map((linha) => linha.slice(menorRecuo)).join('\n');
    }

    function formatarMoedas(valor) {
        return Number(valor).toLocaleString('pt-BR');
    }

    function escreverQuantidade(quantidade, singular, plural) {
        return quantidade === 1 ? singular : plural;
    }

    function camelParaHifen(texto) {
        return texto.replace(/[A-Z]/g, (letra) => `-${letra.toLowerCase()}`);
    }

    function lerDaMemoria(chave) {
        try { return localStorage.getItem(chave); } catch { return null; }
    }

    function gravarNaMemoria(chave, valor) {
        try { localStorage.setItem(chave, valor); } catch { /* navegador sem armazenamento */ }
    }

    function mostrarTela(nome) {
        for (const tela of buscarTodos('[data-tela]')) tela.hidden = tela.dataset.tela !== nome;
    }

    function reiniciarAnimacao(elemento, classe) {
        elemento.classList.remove(classe);
        void elemento.offsetWidth;
        elemento.classList.add(classe);
    }

    // #endregion

    //==============================================================
    // #region 2. Pixel art e ícones
    //==============================================================
    // Todo desenho é uma grade de texto: cada letra vira uma cor da paleta e '.' fica vazio.
    // As paletas usam variáveis do CSS, então os desenhos acompanham o tema.

    const DESENHOS = {
        fantasma: [
            '......XXXX......',
            '....XXXXXXXX....',
            '...XXXXXXXXXX...',
            '..XXXXXXXXXXXX..',
            '..XXOOXXXXOOXX..',
            '.XXOOOOXXOOOOXX.',
            '.XXORROXXORROXX.',
            '.XXXOOXXXXOOXXX.',
            '.XXXXXXXXXXXXXX.',
            '.XXXXXOOOOXXXXX.',
            '.XXXXOOOOOOXXXX.',
            '.XXXXOOOOOOXXXX.',
            '.XXXXXOOOOXXXXX.',
            '.XXXXXXXXXXXXXX.',
            '.XX..XXX..XXX.XX',
            '.X....X....X...X',
        ],
        morcego: [
            'O.....O.O.....O',
            'OO....OOO....OO',
            'OOO..ORORO..OOO',
            'OOOOOOOOOOOOOOO',
            '.OOOOOOOOOOOOO.',
            '..OOO.OOO.OOO..',
            '...O...O...O...',
        ],
        moeda: [
            '..OOOO..',
            '.OYYYYO.',
            'OYLYYYSO',
            'OYLYYYSO',
            'OYYYYYSO',
            'OYYYYSSO',
            '.OSSSSO.',
            '..OOOO..',
        ],
        fechar: [
            'XX...XX',
            'XXX.XXX',
            '.XXXXX.',
            '..XXX..',
            '.XXXXX.',
            'XXX.XXX',
            'XX...XX',
        ],
    };

    const PALETAS = {
        // a imagem do susto vira arquivo (data URI), que não lê variáveis do CSS
        fantasmaDoSusto: { X: '#F4EEE3', O: '#150E22', R: '#E2001A' },
        cena: {
            X: 'var(--cor-texto)', O: 'var(--cor-fundo)', R: 'var(--cor-marca)',
            C: 'var(--cor-abobora)', S: 'var(--cor-abobora-escura)', L: 'var(--cor-lua)', I: 'var(--cor-codigo-fundo)',
        },
        moeda: { O: 'var(--cor-moeda-borda)', Y: 'var(--cor-moeda)', L: 'var(--cor-lua)', S: 'var(--cor-moeda-sombra)' },
        fechar: { X: 'currentColor' },
    };

    function medirGrade(grade) {
        return { largura: Math.max(...grade.map((linha) => linha.length)), altura: grade.length };
    }

    /** Junta pixels vizinhos da mesma cor num retângulo só, para o SVG ficar leve. */
    function desenharRetangulos(grade, paleta) {
        let retangulos = '';
        grade.forEach((linha, y) => {
            let x = 0;
            while (x < linha.length) {
                let largura = 1;
                while (linha[x + largura] === linha[x]) largura++;
                const cor = paleta[linha[x]];
                if (cor) retangulos += `<rect x="${x}" y="${y}" width="${largura}" height="1" style="fill:${cor}"/>`;
                x += largura;
            }
        });
        return retangulos;
    }

    function criarSvgPixelArt(grade, paleta) {
        const { largura, altura } = medirGrade(grade);
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} ${altura}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${desenharRetangulos(grade, paleta)}</svg>`;
    }

    function criarImagemPixelArt(grade, paleta) {
        return `data:image/svg+xml,${encodeURIComponent(criarSvgPixelArt(grade, paleta))}`;
    }

    /** Cria uma grade chamando pintar(x, y) para cada pixel. */
    function criarGrade(largura, altura, pintar) {
        return Array.from({ length: altura }, (_, y) =>
            Array.from({ length: largura }, (_, x) => pintar(x, y)).join(''));
    }

    /** Copia o desenho por cima da grade a partir de (coluna, linha). O '.' do desenho não apaga nada. */
    function carimbar(grade, desenho, coluna, linha) {
        return grade.map((texto, y) => {
            const trecho = desenho[y - linha];
            if (!trecho) return texto;
            return [...texto].map((pixel, x) => {
                const novo = trecho[x - coluna];
                return novo && novo !== '.' ? novo : pixel;
            }).join('');
        });
    }

    /** Retângulo com contorno: 'O' na borda, preenchimento decidido por miolo(x, y). */
    function desenharCaixote(largura, altura, miolo) {
        return criarGrade(largura, altura, (x, y) => {
            const naBorda = x === 0 || y === 0 || x === largura - 1 || y === altura - 1;
            return naBorda ? 'O' : miolo(x, y);
        });
    }

    function desenharGrupo(classe, grade, x, y) {
        return `<g class="${classe}"><g transform="translate(${x} ${y})">${desenharRetangulos(grade, PALETAS.cena)}</g></g>`;
    }

    /**
     * Tela inicial: caixa com morcego e o fantasma saindo de dentro.
     * Camadas, de trás para frente: boca da caixa, tampa, fantasma e frente da caixa.
     * As posições saem do tamanho dos desenhos, então trocar um desenho não quebra a cena.
     */
    function criarCenaDaCaixa() {
        const { fantasma, morcego } = DESENHOS;
        const tamanhoDoFantasma = medirGrade(fantasma);
        const tamanhoDoMorcego = medirGrade(morcego);

        const larguraDaCaixa = tamanhoDoMorcego.largura + 12;   // ímpar + par = morcego centralizado
        const alturaDaFrente = tamanhoDoMorcego.altura + 8;
        const larguraDaCena = larguraDaCaixa + 2;               // a tampa sobra um pixel de cada lado
        const topoDaFrente = tamanhoDoFantasma.altura + 6;      // espaço para o fantasma sair inteiro
        const alturaDaCena = topoDaFrente + alturaDaFrente;

        const frente = carimbar(
            desenharCaixote(larguraDaCaixa, alturaDaFrente, (x, y) => {
                if (y === 1) return 'L';
                return y >= alturaDaFrente - 4 ? 'S' : 'C';
            }),
            morcego,
            (larguraDaCaixa - tamanhoDoMorcego.largura) / 2,
            Math.floor((alturaDaFrente - tamanhoDoMorcego.altura) / 2),
        );
        const boca = desenharCaixote(larguraDaCaixa, 3, () => 'I');
        const tampa = desenharCaixote(larguraDaCena, 4, (x, y) => (y === 1 ? 'L' : 'C'));
        const fantasmaX = Math.floor((larguraDaCena - tamanhoDoFantasma.largura) / 2);
        const fantasmaY = topoDaFrente - tamanhoDoFantasma.altura + 2;   // a cauda fica atrás da frente

        return `<svg viewBox="0 0 ${larguraDaCena} ${alturaDaCena}" shape-rendering="crispEdges" style="--subida: ${tamanhoDoFantasma.altura}px" aria-hidden="true" focusable="false">
            <defs><clipPath id="recorte-da-caixa"><rect width="${larguraDaCena}" height="${alturaDaCena}"/></clipPath></defs>
            <g class="cena-caixa__tudo">
                ${desenharGrupo('cena-caixa__boca', boca, 1, topoDaFrente - 3)}
                ${desenharGrupo('cena-caixa__tampa', tampa, 0, topoDaFrente - 4)}
                <g clip-path="url(#recorte-da-caixa)">${desenharGrupo('cena-caixa__fantasma', fantasma, fantasmaX, fantasmaY)}</g>
                ${desenharGrupo('cena-caixa__frente', frente, 1, topoDaFrente)}
            </g>
        </svg>`;
    }

    const FANTASMA = criarImagemPixelArt(DESENHOS.fantasma, PALETAS.fantasmaDoSusto);

    const ICONES = {
        moeda: criarSvgPixelArt(DESENHOS.moeda, PALETAS.moeda),
        fechar: criarSvgPixelArt(DESENHOS.fechar, PALETAS.fechar),
    };

    /** Preenche todo elemento com data-icone="nome" usando o desenho de ICONES. */
    function preencherIcones(raiz = document) {
        for (const elemento of buscarTodos('[data-icone]', raiz)) {
            elemento.innerHTML = ICONES[elemento.dataset.icone] ?? '';
        }
    }

    // #endregion

    //==============================================================
    // #region 3. Código
    //==============================================================

    const REGRAS_DE_REALCE = {
        python: /(?<comentario>#.*)|(?<texto>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<numero>\b\d+(?:\.\d+)?\b)|(?<palavra>[A-Za-z_]\w*)/g,
        lua: /(?<comentario>--.*)|(?<texto>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<numero>\b\d+(?:\.\d+)?\b)|(?<palavra>[A-Za-z_]\w*)/g,
        cpp: /(?<comentario>\/\/.*|\/\*.*?\*\/)|(?<texto>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<numero>\b\d+(?:\.\d+)?\b)|(?<palavra>[A-Za-z_]\w*)/g,
        web: /(?<comentario>\/\/.*|\/\*.*?\*\/|<!--.*?-->)|(?<texto>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[^`]*`)|(?<etiqueta><\/?[A-Za-z][\w-]*|\/?>)|(?<numero>\b\d+(?:\.\d+)?)|(?<palavra>[A-Za-z_$][\w$-]*)/g,
    };

    const PALAVRAS_RESERVADAS = new Set([
        // Python
        'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'def', 'return', 'import', 'from',
        'print', 'range', 'len', 'input', 'int', 'str', 'True', 'False', 'None',
        // Lua
        'local', 'then', 'do', 'end', 'elseif', 'repeat', 'until', 'nil',
        // C++ e Arduino
        'void', 'float', 'char', 'bool', 'Serial', 'OUTPUT', 'INPUT', 'HIGH', 'LOW',
        'pinMode', 'digitalWrite', 'digitalRead', 'analogRead', 'analogWrite', 'delay',
        // JavaScript
        'let', 'const', 'var', 'function', 'true', 'false', 'null', 'undefined', 'new', 'alert', 'console', 'document',
    ]);

    function realcarLinha(linha, linguagem) {
        const regra = REGRAS_DE_REALCE[linguagem] ?? REGRAS_DE_REALCE.web;
        let html = '';
        let fimDoUltimo = 0;
        for (const encontrado of linha.matchAll(regra)) {
            const grupos = encontrado.groups;
            const trecho = encontrado[0];
            let classe = null;
            if (grupos.comentario) classe = 'comentario';
            else if (grupos.texto) classe = 'texto';
            else if (grupos.etiqueta) classe = 'etiqueta';
            else if (grupos.numero) classe = 'numero';
            else if (PALAVRAS_RESERVADAS.has(trecho)) classe = 'palavra';
            html += escaparHtml(linha.slice(fimDoUltimo, encontrado.index));
            html += classe ? `<span class="realce-${classe}">${escaparHtml(trecho)}</span>` : escaparHtml(trecho);
            fimDoUltimo = encontrado.index + trecho.length;
        }
        return html + escaparHtml(linha.slice(fimDoUltimo));
    }

    function criarBlocoDeCodigo(versao, realcar) {
        if (versao.imagem) {
            return criarElemento('figure', { class: 'codigo codigo--imagem' },
                criarElemento('img', { src: versao.imagem, alt: 'Código do desafio' }));
        }
        if (!versao.codigo) return null;
        const bloco = criarElemento('pre', { class: 'codigo', tabindex: '0', 'aria-label': 'Código do desafio' });
        bloco.innerHTML = versao.codigo.split('\n').map((linha) => {
            const conteudo = realcar ? realcarLinha(linha, versao.linguagem) : escaparHtml(linha);
            return `<span class="linha-de-codigo"><span>${conteudo || ' '}</span></span>`;
        }).join('');
        return bloco;
    }

    // #endregion

    //==============================================================
    // #region 4. Preparação dos desafios
    //==============================================================

    const FORMATOS = ['linha', 'escolha', 'verdadeiroOuFalso'];

    function prepararDesafios(configuracao) {
        const desafios = [];
        const erros = [];
        configuracao.desafios.forEach((dados, posicao) => {
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
            erros.push(`${rotulo}: o tipo "${dados.tipo}" não existe em "tipos".`);
            return null;
        }
        if (!FORMATOS.includes(tipo.formato)) {
            erros.push(`Tipo "${dados.tipo}": o formato "${tipo.formato}" não existe. Use ${FORMATOS.join(', ')}.`);
            return null;
        }
        const versoes = {};
        for (const nivel of configuracao.niveis) {
            if (!dados[nivel.id]) {
                erros.push(`${rotulo}: falta a versão ${nivel.nome}.`);
                continue;
            }
            const moedasPadrao = dados.moedas ?? configuracao.rodada.moedasPorPadrao;
            versoes[nivel.id] = prepararVersao(dados[nivel.id], tipo, nivel, moedasPadrao, `${rotulo} (${nivel.nome})`, erros);
        }
        return { tipo, versoes };
    }

    function prepararVersao(dados, tipo, nivel, moedasPadrao, rotulo, erros) {
        const versao = {
            formato: tipo.formato,
            pergunta: dados.pergunta ?? dados.afirmacao ?? tipo.pergunta,
            codigo: dados.codigo ? removerRecuo(dados.codigo) : null,
            imagem: dados.imagem ?? null,
            linguagem: dados.linguagem ?? nivel.linguagem,
            explicacao: dados.explicacao ?? '',
            moedas: Number(dados.moedas ?? moedasPadrao) || 0,
            opcoes: [],
            opcoesFixas: false,
            resposta: null,
        };

        if (!versao.pergunta) erros.push(`${rotulo}: falta a pergunta ou a afirmação.`);
        if (versao.codigo && !REGRAS_DE_REALCE[versao.linguagem]) {
            erros.push(`${rotulo}: a linguagem "${versao.linguagem}" não existe. Use ${Object.keys(REGRAS_DE_REALCE).join(', ')}.`);
        }

        if (tipo.formato === 'linha') {
            versao.resposta = Number(dados.linha);
            const totalDeLinhas = versao.codigo ? versao.codigo.split('\n').length : Infinity;
            if (!(versao.resposta >= 1 && versao.resposta <= totalDeLinhas)) {
                erros.push(`${rotulo}: a linha ${dados.linha} não existe no código.`);
            }
        }

        if (tipo.formato === 'escolha') {
            versao.opcoes = (dados.opcoes ?? []).map(String);
            versao.resposta = String(dados.correta);
            if (versao.opcoes.length < 2) erros.push(`${rotulo}: escreva pelo menos duas opções.`);
            if (!versao.opcoes.includes(versao.resposta)) {
                erros.push(`${rotulo}: a resposta correta "${dados.correta}" não está entre as opções.`);
            }
        }

        if (tipo.formato === 'verdadeiroOuFalso') {
            versao.opcoes = ['Verdadeiro', 'Falso'];
            versao.opcoesFixas = true;
            versao.resposta = dados.resposta ? 'Verdadeiro' : 'Falso';
            if (typeof dados.resposta !== 'boolean') erros.push(`${rotulo}: a resposta deve ser true ou false.`);
        }

        return versao;
    }

    // #endregion

    //==============================================================
    // #region 5. Tema
    //==============================================================

    function aplicarTema(configuracao) {
        const raiz = document.documentElement;
        const { site, visual, fontes, animacoes } = configuracao;

        raiz.classList.toggle('pixel-art', Boolean(visual.pixelArt));
        raiz.classList.toggle('verso-igual', !versoColorido(configuracao));
        for (const [variavel, valor] of Object.entries(visual.variaveis ?? {})) raiz.style.setProperty(variavel, valor);
        for (const [nome, duracao] of Object.entries(animacoes)) {
            raiz.style.setProperty(`--duracao-${camelParaHifen(nome)}`, `${limitarDuracao(duracao)}ms`);
        }

        document.title = site.titulo;
        for (const elemento of buscarTodos('[data-titulo]')) elemento.textContent = site.titulo;
        for (const elemento of buscarTodos('[data-subtitulo]')) elemento.textContent = site.subtitulo;
        for (const elemento of buscarTodos('[data-cena-caixa]')) elemento.innerHTML = criarCenaDaCaixa();
        preencherIcones();
        buscar('[data-iniciar]').textContent = site.botaoIniciar;
        for (const espaco of buscarTodos('[data-marca]')) preencherMarca(espaco, site);

        const familias = [...fontes.familias, ...(visual.pixelArt ? fontes.familiasPixelArt : [])];
        if (fontes.usarGoogleFonts && familias.length) {
            const parametros = familias.map((familia) => `family=${familia.replace(/ /g, '+')}`).join('&');
            document.head.append(criarElemento('link', { rel: 'stylesheet', href: `https://fonts.googleapis.com/css2?${parametros}&display=swap` }));
        }
    }

    function versoColorido(configuracao) {
        return configuracao.visual.versoDasCartas !== 'igual';
    }

    function conferirConfiguracaoGeral(configuracao) {
        const erros = [];
        if (!['colorido', 'igual'].includes(configuracao.visual.versoDasCartas)) {
            erros.push(`visual.versoDasCartas deve ser 'colorido' ou 'igual' (está "${configuracao.visual.versoDasCartas}"). Usando 'colorido'.`);
        }
        return erros;
    }

    function preencherMarca(espaco, site) {
        const texto = criarElemento('span', { class: 'marca__texto' }, site.marca);
        if (!site.logo) {
            espaco.replaceChildren(texto);
            return;
        }
        const logo = criarElemento('img', { class: 'marca__logo', src: site.logo, alt: site.marca });
        logo.addEventListener('error', () => logo.replaceWith(texto), { once: true });
        espaco.replaceChildren(logo);
    }

    function preencherLegenda(configuracao, desafios) {
        const legenda = buscar('[data-legenda]');
        if (!versoColorido(configuracao)) {
            legenda.hidden = true;
            return;
        }
        const tiposUsados = [...new Set(desafios.map((desafio) => desafio.tipo))];
        legenda.replaceChildren(...tiposUsados.map((tipo) => {
            const item = criarElemento('span', { class: 'legenda__item' }, criarElemento('i', { 'aria-hidden': 'true' }), tipo.nome);
            item.style.setProperty('--tipo', tipo.cor);
            return item;
        }));
    }

    // #endregion

    //==============================================================
    // #region 6. Sons e efeitos
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

    //==============================================================
    // #region 7. Respostas
    //==============================================================
    // As duas classes têm os mesmos métodos, então a janela usa qualquer uma igual.

    class RespostaPorLinha {
        constructor(versao) {
            this.versao = versao;
            this.campo = criarElemento('input', {
                class: 'campo__entrada', type: 'number', inputmode: 'numeric', min: 1, step: 1,
                placeholder: '?', autocomplete: 'off', enterkeyhint: 'done',
            });
            this.elemento = criarElemento('label', { class: 'campo' },
                criarElemento('span', { class: 'campo__rotulo' }, 'Número da linha com o bug'), this.campo);
        }

        valor() {
            return this.campo.value.trim() === '' ? null : Number(this.campo.value);
        }

        pedidoQuandoVazia() {
            return 'Digite o número da linha.';
        }

        textoDaResposta() {
            return `linha ${this.versao.resposta}`;
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
        constructor(versao, embaralharOpcoes) {
            this.versao = versao;
            this.escolhida = null;
            const opcoes = versao.opcoesFixas || !embaralharOpcoes ? versao.opcoes : embaralharLista([...versao.opcoes]);
            this.botoes = opcoes.map((texto, posicao) => this.criarBotao(texto, posicao));
            const classe = versao.opcoesFixas ? 'opcoes opcoes--duas' : 'opcoes opcoes--codigo';
            this.elemento = criarElemento('div', { class: classe, role: 'radiogroup', 'aria-label': 'Opções' }, this.botoes);
        }

        criarBotao(texto, posicao) {
            const letra = this.versao.opcoesFixas ? null : criarElemento('span', { class: 'opcao__letra', 'aria-hidden': 'true' }, String.fromCharCode(65 + posicao));
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
            return 'Escolha uma opção.';
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
    // #region 8. Janela do desafio
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

            this.resposta = versao.formato === 'linha'
                ? new RespostaPorLinha(versao)
                : new RespostaPorEscolha(versao, this.configuracao.visual.embaralharOpcoes);
            this.partes.resposta.replaceChildren(this.resposta.elemento);
            this.partes.botao.textContent = 'Verificar';
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
                const texto = tentativasRestantes === 1 ? 'Ainda resta 1 tentativa.' : `Ainda restam ${tentativasRestantes} tentativas.`;
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
            const { rodada, acerto, jumpscare } = this.configuracao;
            const revelar = resultado.acertou || rodada.mostrarRespostaAoErrar;
            this.respondida = true;
            this.resposta.mostrarResultado(resultado.valorEscolhido, revelar);
            if (revelar && resultado.versao.formato === 'linha') this.destacarLinha(resultado.versao.resposta);

            const titulo = resultado.acertou ? `${acerto.mensagem} +${formatarMoedas(resultado.moedas)} coins` : jumpscare.mensagem;
            const detalhes = [];
            if (!resultado.acertou && revelar) detalhes.push(`Resposta: ${this.resposta.textoDaResposta()}.`);
            if (rodada.mostrarExplicacao && resultado.versao.explicacao) detalhes.push(resultado.versao.explicacao);
            this.mostrarAviso(resultado.acertou ? 'acerto' : 'erro', titulo, detalhes.join(' '));
            this.partes.botao.textContent = this.ehOUltimo ? 'Ver resultado' : 'Voltar às cartas';
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

    //==============================================================
    // #region 9. Cartas e tabuleiro
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

    class Tabuleiro {
        constructor(desafios, configuracao, aoEscolherCarta) {
            this.configuracao = configuracao;
            this.elemento = buscar('[data-tabuleiro]');
            this.ocupado = false;
            this.cartas = desafios.map((desafio) => new Carta(desafio, versoColorido(configuracao)));
            for (const carta of this.cartas) carta.elemento.addEventListener('click', () => aoEscolherCarta(carta));
            this.elemento.style.setProperty('--quantidade', this.cartas.length);
            this.elemento.append(...this.cartas.map((carta) => carta.elemento));
            this.area = this.elemento.parentElement;
            new ResizeObserver(() => this.ajustarTamanho()).observe(this.area);
        }

        limpar() {
            for (const carta of this.cartas) carta.limpar();
        }

        ajustarTamanho() {
            const estiloDaArea = getComputedStyle(this.area);
            const largura = this.area.clientWidth - parseFloat(estiloDaArea.paddingLeft) - parseFloat(estiloDaArea.paddingRight);
            const altura = this.area.clientHeight - parseFloat(estiloDaArea.paddingTop) - parseFloat(estiloDaArea.paddingBottom);
            if (largura <= 0 || altura <= 0) return;   // tela escondida

            const vao = parseFloat(getComputedStyle(this.elemento).columnGap) || 0;
            const quantidade = this.cartas.length;
            const proporcaoDaCarta = 3 / 4;          // largura ÷ altura
            const larguraMaxima = 320;               // opcional: evita cartas gigantes no projetor
            let melhor = { colunas: 1, larguraDaCarta: 0 };

            for (let colunas = 1; colunas <= quantidade; colunas++) {
                const linhas = Math.ceil(quantidade / colunas);
                const limitePelaLargura = (largura - (colunas - 1) * vao) / colunas;
                const limitePelaAltura = ((altura - (linhas - 1) * vao) / linhas) * proporcaoDaCarta;
                const larguraDaCarta = Math.min(limitePelaLargura, limitePelaAltura, larguraMaxima);
                if (larguraDaCarta > melhor.larguraDaCarta) melhor = { colunas, larguraDaCarta };
            }

            this.elemento.style.setProperty('--colunas', melhor.colunas);
            this.elemento.style.setProperty('--largura-da-carta', `${Math.floor(melhor.larguraDaCarta)}px`);
        }

        async embaralhar() {
            if (this.ocupado) return;
            this.ocupado = true;

            const posicoesAntes = new Map(this.cartas.map((carta) => [carta, carta.elemento.getBoundingClientRect()]));
            embaralharLista(this.cartas);
            this.elemento.append(...this.cartas.map((carta) => carta.elemento));

            const area = this.elemento.getBoundingClientRect();
            const centroX = area.left + area.width / 2;
            const centroY = area.top + area.height / 2;
            const suavizacao = this.configuracao.visual.pixelArt ? 'steps(10, end)' : 'cubic-bezier(.5, 0, .2, 1)';
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

    //==============================================================
    // #region 10. Rodada
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
    // #region 11. Seletores
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
    // #region 12. Jogo
    //==============================================================

    class Jogo {
        constructor(configuracao) {
            this.configuracao = configuracao;
            const { desafios, erros } = prepararDesafios(configuracao);

            aplicarTema(configuracao);
            preencherLegenda(configuracao, desafios);
            this.mostrarErrosDeConfiguracao([...conferirConfiguracaoGeral(configuracao), ...erros], desafios.length);

            this.rodada = new Rodada();
            this.efeitos = new Efeitos(configuracao);
            this.janela = new JanelaDoDesafio(configuracao, this.efeitos);
            this.tabuleiro = new Tabuleiro(desafios, configuracao, (carta) => this.abrirCarta(carta));
            this.contador = new ContadorDeDesafios(Math.max(1, desafios.length), configuracao.rodada.desafiosPorPadrao);
            this.seletores = buscarTodos('[data-seletor-nivel]').map((espaco) =>
                new SeletorDeNivel(espaco, configuracao.niveis, (nivel) => this.escolherNivel(nivel)));

            const nivelSalvo = lerDaMemoria('mystery-box-nivel') ?? configuracao.nivelInicial;
            this.escolherNivel(configuracao.niveis.find((nivel) => nivel.id === nivelSalvo) ?? configuracao.niveis[0]);
            this.ligarBotoes();
            mostrarTela('inicio');
        }

        ligarBotoes() {
            buscar('[data-iniciar]').addEventListener('click', () => this.iniciarRodada());
            buscar('[data-embaralhar]').addEventListener('click', () => this.embaralhar());
            buscar('[data-ver-resultado]').addEventListener('click', () => this.mostrarResultado(false));
            buscar('[data-rever-cartas]').addEventListener('click', () => mostrarTela('cartas'));
            buscar('[data-nova-rodada]').addEventListener('click', () => mostrarTela('inicio'));
        }

        mostrarErrosDeConfiguracao(erros, quantidadeValida) {
            const painel = buscar('[data-erros]');
            buscar('[data-iniciar]').disabled = quantidadeValida === 0;
            if (!erros.length) return;
            painel.hidden = false;
            painel.replaceChildren(
                criarElemento('strong', {}, 'Corrija em js/configuracao.js:'),
                criarElemento('ul', {}, erros.map((erro) => criarElemento('li', {}, erro))));
            for (const erro of erros) console.warn(`[Mystery Box] ${erro}`);
        }

        escolherNivel(nivel) {
            this.nivel = nivel;
            gravarNaMemoria('mystery-box-nivel', nivel.id);
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
            const rodada = this.rodada;
            const terminou = rodada.terminou();
            buscar('[data-progresso]').textContent = terminou
                ? 'Rodada concluída'
                : `Desafio ${rodada.respondidos() + 1} de ${rodada.totalDeDesafios}`;
            buscar('[data-moedas]').textContent = formatarMoedas(rodada.moedas());
            buscar('[data-ver-resultado]').hidden = !terminou;
            buscar('[data-tela="cartas"]').classList.toggle('tela-cartas--concluida', terminou);
        }

        mostrarResultado(comemorar) {
            const rodada = this.rodada;
            buscar('[data-acertos]').textContent = rodada.acertos();
            buscar('[data-acertos-rotulo]').textContent = escreverQuantidade(rodada.acertos(), 'acerto', 'acertos');
            buscar('[data-erros-total]').textContent = rodada.erros();
            buscar('[data-erros-rotulo]').textContent = escreverQuantidade(rodada.erros(), 'erro', 'erros');
            buscar('[data-total-moedas]').textContent = formatarMoedas(rodada.moedas());
            buscar('[data-lista-resultados]').replaceChildren(...rodada.resultados.map((resultado) => this.criarItemDoResultado(resultado)));

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
            const item = criarElemento('li', { class: resultado.acertou ? 'item-do-resultado item-do-resultado--acerto' : 'item-do-resultado item-do-resultado--erro' },
                criarElemento('span', {}, `${tipo.icone} ${tipo.nome} (${resultado.nivel.nome})`),
                criarElemento('strong', {}, situacao));
            item.style.setProperty('--tipo', tipo.cor);
            return item;
        }
    }

    // #endregion

    new Jogo(configuracao);
})();
