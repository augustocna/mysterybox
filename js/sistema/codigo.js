/* =========================================================
   SISTEMA · código
   Mostra o código dos desafios com linhas numeradas e cores.

   Para ensinar uma linguagem nova: crie uma regra em REGRAS_DE_REALCE
   (copie a mais parecida) e acrescente as palavras dela em PALAVRAS_RESERVADAS.
   O nome da regra é o que se escreve em "linguagem" no nível ou no desafio.

   Usa:     criarElemento, escaparHtml
   Entrega: LINGUAGENS, criarBlocoDeCodigo
   ========================================================= */
(function (MysteryBox) {
    'use strict';
    const { criarElemento, escaparHtml } = MysteryBox;

    //==============================================================
    // #region Regras de cor
    //==============================================================
    // Cada regra separa a linha em pedaços: comentário, texto, etiqueta, número ou palavra.

    const REGRAS_DE_REALCE = {
        python: /(?<comentario>#.*)|(?<texto>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<numero>\b\d+(?:\.\d+)?\b)|(?<palavra>[A-Za-z_]\w*)/g,
        lua: /(?<comentario>--.*)|(?<texto>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<numero>\b\d+(?:\.\d+)?\b)|(?<palavra>[A-Za-z_]\w*)/g,
        cpp: /(?<comentario>\/\/.*|\/\*.*?\*\/)|(?<texto>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<numero>\b\d+(?:\.\d+)?\b)|(?<palavra>[A-Za-z_]\w*)/g,
        web: /(?<comentario>\/\/.*|\/\*.*?\*\/|<!--.*?-->)|(?<texto>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[^`]*`)|(?<etiqueta><\/?[A-Za-z][\w-]*|\/?>)|(?<numero>\b\d+(?:\.\d+)?)|(?<palavra>[A-Za-z_$][\w$-]*)/g,
    };

    const LINGUAGENS = Object.keys(REGRAS_DE_REALCE);

    const PALAVRAS_RESERVADAS = new Set([
        // Python
        'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'def', 'return', 'import', 'from',
        'print', 'range', 'len', 'input', 'int', 'str', 'True', 'False', 'None',
        // Lua e Roblox
        'local', 'then', 'do', 'end', 'elseif', 'repeat', 'until', 'nil',
        'game', 'workspace', 'script', 'wait', 'task', 'Instance',
        // C++ e Arduino
        'void', 'float', 'char', 'bool', 'long', 'byte', 'Serial', 'OUTPUT', 'INPUT', 'HIGH', 'LOW',
        'pinMode', 'digitalWrite', 'digitalRead', 'analogRead', 'analogWrite', 'delay', 'millis',
        // JavaScript
        'let', 'const', 'var', 'function', 'true', 'false', 'null', 'undefined', 'new', 'alert', 'console', 'document',
    ]);

    // #endregion

    //==============================================================
    // #region Bloco de código
    //==============================================================

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

    /** Devolve o código da versão como <pre> numerado, a imagem dele, ou null se não houver. */
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

    Object.assign(MysteryBox, { LINGUAGENS, criarBlocoDeCodigo });
})(window.MysteryBox);
