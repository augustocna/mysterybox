/* =========================================================
   SISTEMA · desenhos
   Pixel art feito em código: ícones, o fantasma do susto e a cena
   da tela de início (fantasma saindo da caixa).

   Todo desenho é uma grade de texto: cada letra vira uma cor da paleta
   e '.' fica vazio. Para mudar um desenho, mude as letras em DESENHOS.
   As paletas usam variáveis do CSS, então os desenhos acompanham o tema.

   Usa:     buscarTodos
   Entrega: FANTASMA, criarCenaDaCaixa, preencherIcones
   ========================================================= */
(function (MysteryBox) {
    'use strict';
    const { buscarTodos } = MysteryBox;

    //==============================================================
    // #region Desenhos e paletas
    //==============================================================

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

    // #endregion

    //==============================================================
    // #region Ferramentas de desenho
    //==============================================================

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

    // #endregion

    //==============================================================
    // #region Cena da tela de início
    //==============================================================

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

    // #endregion

    //==============================================================
    // #region Fantasma do susto e ícones
    //==============================================================

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

    Object.assign(MysteryBox, { FANTASMA, criarCenaDaCaixa, preencherIcones });
})(window.MysteryBox);
