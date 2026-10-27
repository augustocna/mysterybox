/* =========================================================
   SISTEMA · tema
   Aplica na página o visual e os textos da configuração:
   modos (pixel art, animação em passos, verso das cartas), variáveis do CSS,
   durações, textos fixos, marca, cena da tela de início, ícones, fontes e legenda.

   Usa:     buscar, buscarTodos, criarElemento, limitarDuracao, camelParaHifen,
            criarCenaDaCaixa, preencherIcones
   Entrega: aplicarTema, preencherLegenda, versoColorido
   ========================================================= */
(function (MysteryBox) {
    'use strict';
    const { buscar, buscarTodos, criarElemento, limitarDuracao, camelParaHifen, criarCenaDaCaixa, preencherIcones } = MysteryBox;

    //==============================================================
    // #region Tema
    //==============================================================

    function versoColorido(configuracao) {
        return configuracao.visual.versoDasCartas !== 'igual';
    }

    function aplicarTema(configuracao) {
        aplicarModos(configuracao);
        aplicarVariaveis(configuracao);
        aplicarTextos(configuracao);
        aplicarTelaDeInicio(configuracao);
        preencherIcones();
        for (const espaco of buscarTodos('[data-marca]')) preencherMarca(espaco, configuracao.site);
        carregarFontes(configuracao);
    }

    /** Classes no <html> que ligam os modos visuais do css/variaveis.css. */
    function aplicarModos(configuracao) {
        const raiz = document.documentElement;
        const { visual } = configuracao;
        raiz.classList.toggle('pixel-art', Boolean(visual.pixelArt));
        raiz.classList.toggle('animacao-em-passos', Boolean(visual.animacaoEmPassos));
        raiz.classList.toggle('verso-igual', !versoColorido(configuracao));
    }

    /** Durações, proporção da carta e as variáveis livres de configuracao.visual.variaveis. */
    function aplicarVariaveis(configuracao) {
        const raiz = document.documentElement;
        for (const [nome, duracao] of Object.entries(configuracao.animacoes)) {
            raiz.style.setProperty(`--duracao-${camelParaHifen(nome)}`, `${limitarDuracao(duracao)}ms`);
        }
        raiz.style.setProperty('--duracao-cena', `${Math.max(1000, Number(configuracao.telaDeInicio.cicloDaCena) || 5000)}ms`);
        raiz.style.setProperty('--proporcao-da-carta', configuracao.cartas.proporcao);
        for (const [variavel, valor] of Object.entries(configuracao.visual.variaveis)) raiz.style.setProperty(variavel, valor);
    }

    /** Preenche todo elemento com data-texto="chave" usando configuracao.textos. */
    function aplicarTextos(configuracao) {
        const { site, textos } = configuracao;
        document.title = site.titulo;
        for (const elemento of buscarTodos('[data-titulo]')) elemento.textContent = site.titulo;
        for (const elemento of buscarTodos('[data-subtitulo]')) elemento.textContent = site.subtitulo;
        buscar('[data-iniciar]').textContent = site.botaoIniciar;
        for (const elemento of buscarTodos('[data-texto]')) {
            const texto = textos[elemento.dataset.texto];
            if (typeof texto === 'string') elemento.textContent = texto;
        }
    }

    function aplicarTelaDeInicio(configuracao) {
        for (const elemento of buscarTodos('[data-cena-caixa]')) {
            elemento.hidden = !configuracao.telaDeInicio.mostrarCena;
            if (!elemento.hidden) elemento.innerHTML = criarCenaDaCaixa();
        }
    }

    function preencherMarca(espaco, site) {
        const texto = criarElemento('span', { class: 'marca__texto' }, site.marca);
        if (!site.logo) {
            espaco.replaceChildren(site.marca ? texto : '');
            return;
        }
        const logo = criarElemento('img', { class: 'marca__logo', src: site.logo, alt: site.marca });
        logo.addEventListener('error', () => logo.replaceWith(texto), { once: true });
        espaco.replaceChildren(logo);
    }

    /** Fontes do Google Fonts. Sem internet, o pedido falha em silêncio e o CSS usa as do sistema. */
    function carregarFontes(configuracao) {
        const { fontes, visual } = configuracao;
        const familias = [...fontes.familias, ...(visual.pixelArt ? fontes.familiasPixelArt : [])];
        if (!fontes.usarGoogleFonts || !familias.length) return;
        const parametros = familias.map((familia) => `family=${familia.replace(/ /g, '+')}`).join('&');
        document.head.append(criarElemento('link', { rel: 'stylesheet', href: `https://fonts.googleapis.com/css2?${parametros}&display=swap` }));
    }

    // #endregion

    //==============================================================
    // #region Legenda
    //==============================================================

    function preencherLegenda(configuracao, desafios) {
        const legenda = buscar('[data-legenda]');
        if (!versoColorido(configuracao) || !configuracao.visual.mostrarLegenda) {
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

    Object.assign(MysteryBox, { aplicarTema, preencherLegenda, versoColorido });
})(window.MysteryBox);
