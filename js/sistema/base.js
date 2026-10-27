/* =========================================================
   SISTEMA · base
   Cria o espaço de nomes MysteryBox, onde cada arquivo do sistema
   guarda o que oferece aos outros, e as funções de apoio usadas por todos.

   Convenções de todos os arquivos de js/sistema
   - Cada arquivo é uma função que recebe MysteryBox, pega o que precisa
     no começo e entrega o que oferece no fim, com Object.assign.
   - Funções soltas são declaradas com "function".
   - Tudo que guarda estado é uma classe, só com métodos comuns.
   - Funções de seta aparecem apenas como callback (eventos, map, forEach).
   - O JavaScript encontra os elementos da página pelos atributos data-*.
   - Cada seção é um #region: o VS Code dobra e mostra o nome no minimapa.

   Entrega: buscar, buscarTodos, criarElemento, limitarDuracao, esperar,
            sortearEntre, sortearItem, embaralharLista, escaparHtml,
            removerRecuo, formatarMoedas, preencherModelo, escreverQuantidade,
            camelParaHifen, lerVariavelCss, lerDaMemoria, gravarNaMemoria,
            mostrarTela, reiniciarAnimacao
   ========================================================= */
window.MysteryBox = {};

(function (MysteryBox) {
    'use strict';

    //==============================================================
    // #region Página
    //==============================================================

    function buscar(seletor, raiz = document) {
        return raiz.querySelector(seletor);
    }

    function buscarTodos(seletor, raiz = document) {
        return [...raiz.querySelectorAll(seletor)];
    }

    /** criarElemento('button', { class: 'botao' }, 'Texto') */
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

    function mostrarTela(nome) {
        for (const tela of buscarTodos('[data-tela]')) tela.hidden = tela.dataset.tela !== nome;
    }

    /** Tira e põe a classe de novo, para a animação tocar outra vez. */
    function reiniciarAnimacao(elemento, classe) {
        elemento.classList.remove(classe);
        void elemento.offsetWidth;
        elemento.classList.add(classe);
    }

    function lerVariavelCss(nome) {
        return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
    }

    // #endregion

    //==============================================================
    // #region Tempo e sorteio
    //==============================================================

    /** Nenhuma animação passa de 1 segundo. */
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

    // #endregion

    //==============================================================
    // #region Texto
    //==============================================================

    function escaparHtml(texto) {
        const substitutos = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return texto.replace(/[&<>"']/g, (caractere) => substitutos[caractere]);
    }

    /** Tira as linhas vazias das pontas e o recuo que todas as linhas têm em comum. */
    function removerRecuo(texto) {
        const linhas = String(texto).replace(/\r/g, '').replace(/\t/g, '    ').split('\n');
        while (linhas.length && !linhas[0].trim()) linhas.shift();
        while (linhas.length && !linhas[linhas.length - 1].trim()) linhas.pop();
        const recuos = linhas.filter((linha) => linha.trim()).map((linha) => linha.match(/^ */)[0].length);
        const menorRecuo = Math.min(...recuos);
        return linhas.map((linha) => linha.slice(menorRecuo).trimEnd()).join('\n');
    }

    function formatarMoedas(valor) {
        return Number(valor).toLocaleString('pt-BR');
    }

    /** preencherModelo('Desafio {atual} de {total}', { atual: 1, total: 3 }) → 'Desafio 1 de 3' */
    function preencherModelo(modelo, valores = {}) {
        return String(modelo).replace(/\{(\w+)\}/g, (trecho, chave) => (chave in valores ? valores[chave] : trecho));
    }

    /** escreverQuantidade(2, { um: '{quantidade} erro', varios: '{quantidade} erros' }) → '2 erros' */
    function escreverQuantidade(quantidade, formas) {
        return preencherModelo(quantidade === 1 ? formas.um : formas.varios, { quantidade });
    }

    function camelParaHifen(texto) {
        return texto.replace(/[A-Z]/g, (letra) => `-${letra.toLowerCase()}`);
    }

    // #endregion

    //==============================================================
    // #region Memória do navegador
    //==============================================================

    function lerDaMemoria(chave) {
        try { return localStorage.getItem(chave); } catch { return null; }
    }

    function gravarNaMemoria(chave, valor) {
        try { localStorage.setItem(chave, valor); } catch { /* navegador sem armazenamento */ }
    }

    // #endregion

    Object.assign(MysteryBox, {
        buscar, buscarTodos, criarElemento, mostrarTela, reiniciarAnimacao, lerVariavelCss,
        limitarDuracao, esperar, sortearEntre, sortearItem, embaralharLista,
        escaparHtml, removerRecuo, formatarMoedas, preencherModelo, escreverQuantidade, camelParaHifen,
        lerDaMemoria, gravarNaMemoria,
    });
})(window.MysteryBox);
