// ==UserScript==
// @name         UseNet Enhanced
// @version      6.23.2
// @date         11.07.25
// @description  Userscript pour transformer la liste de releases sur un indexeur privé en **galerie d'affiches responsive**, avec overlay d’info avancé et configuration dynamique.
// @author       Aerya | https://upandclear.org
// @match        https://lesite.domaine/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function __AERYA__() {
    return "Script original conçu pour Aerya";
  }
  window.__AERYA__ = __AERYA__;

  const CATEGORIES = [
    { key: 'HOME', label: 'Accueil' },
    { key: 'MOVIE', label: 'Films' },
    { key: 'TV', label: 'Séries' }
  ];

  const STORAGE_KEY = 'afficheModeSections';
  const STORAGE_MINWIDTH_KEY = 'afficheMinWidth';

  const getSection = () => {
    const url = new URL(window.location.href);
    const section = url.searchParams.get('section');
    const vm = url.searchParams.get('vm');
    if (!section && (vm === '1' || !vm)) return 'HOME';
    return section?.toUpperCase() || '';
  };

  function getStoredConfig() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveConfig(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }
  function getMinWidth() {
    return parseInt(localStorage.getItem(STORAGE_MINWIDTH_KEY) || '260');
  }
  function setMinWidth(val) {
    localStorage.setItem(STORAGE_MINWIDTH_KEY, val);
  }

  function extractDateAndSize(card) {
    let date = '';
    let size = '';
    let badges = card.querySelectorAll('.badge');
    badges.forEach(badge => {
      const txt = badge.textContent.trim();
      if (!size && /([0-9]+(\.[0-9]+)?)( ?(GB|MB|G|M|Go|Mo))$/i.test(txt)) size = txt;
      if (!date && /\d{2}\/\d{2}\/\d{2}/.test(txt)) date = txt.match(/\d{2}\/\d{2}\/\d{2}/)?.[0] || '';
    });
    return { date, size };
  }

  function transformAffiches() {
    const section = getSection();
    const config = getStoredConfig();
    const minwidth = getMinWidth();
    const show = config.includes(section);

    if (!CATEGORIES.some(c => c.key === section)) return;
    if (!show) return;

    const cards = Array.from(document.querySelectorAll('.containert.article .card.affichet'));
    const containers = document.querySelectorAll('.containert.article');
    if (!cards.length || !containers.length) return;

    // Group by film/serie ID (movieid/tvid)
    const grouped = new Map();
    cards.forEach(card => {
      const link = card.querySelector('a[href*="?d=fiche"]');
      const href = link?.getAttribute('href') || '';
      const match = href.match(/(movieid|tvid)=(\d+)/i);
      const idKey = match ? match[0] : null;
      if (!idKey) return;
      if (!grouped.has(idKey)) grouped.set(idKey, []);
      grouped.get(idKey).push(card);
    });

    // Création de la galerie
    const gallery = document.createElement('div');
    gallery.className = 'd-flex flex-wrap';
    gallery.style.justifyContent = 'center';
    gallery.style.marginTop = '20px';
    gallery.style.gap = '8px';
    gallery.style.padding = '0 12px';
    gallery.style.width = '100%';
    gallery.style.marginLeft = 'auto';
    gallery.style.marginRight = 'auto';

    grouped.forEach((cardGroup, groupKey) => {
      const card = cardGroup[0];
      const img = card.querySelector('img.card-img-top');
      const minHeight = img?.height || 330;
      if (!img) return;

      const containerCard = document.createElement('div');
      containerCard.style.flex = `0 0 ${minwidth}px`;
      containerCard.style.maxWidth = `${minwidth}px`;
      containerCard.style.position = 'relative';
      containerCard.style.display = 'block';

      const cloneImg = img.cloneNode(true);
      cloneImg.style.width = `${minwidth}px`;
      cloneImg.style.cursor = 'pointer';
      containerCard.appendChild(cloneImg);

      // Overlay (masqué par défaut), largeur EXTRA-LARGE
      const tooltip = document.createElement('div');
      tooltip.className = 'affiche-tooltip';
      tooltip.style.position = 'absolute';
      tooltip.style.top = '0';
      tooltip.style.left = '0';
      tooltip.style.background = 'rgba(10,10,10,0.98)';
      tooltip.style.color = '#fff';
      tooltip.style.padding = '22px 36px 26px 36px';
      tooltip.style.borderRadius = '10px';
      tooltip.style.fontSize = '23px';
      tooltip.style.fontWeight = '400';
      tooltip.style.width = '1150px';
      tooltip.style.maxWidth = '99vw';
      tooltip.style.minHeight = `${minHeight}px`;
      tooltip.style.zIndex = '10000';
      tooltip.style.boxShadow = '0 0 14px 6px rgba(0,0,0,0.7)';
      tooltip.style.whiteSpace = 'normal';
      tooltip.style.display = 'none';
      tooltip.style.pointerEvents = 'auto';

      let tooltipHTML = `
        <div style="margin-bottom:16px;display:flex;align-items:center;gap:14px;">
          <span style="font-size:26px;vertical-align:middle;">&#8595;</span>
          <span style="font-size:22px;font-weight:700;color:#7be2d6;">Les dernières releases</span>
          <span style="font-size:26px;vertical-align:middle;">&#8595;</span>
          <span style="font-size:20px;font-weight:400;color:#aaa; margin-left:36px;">
            | <a href="${card.querySelector('a[href*="?d=fiche"]')?.href || '#'}" style="color:#43a5be;text-decoration:none;font-weight:700;">Voir toutes les releases pour le ${getSection() === 'MOVIE' ? 'film' : 'série'}</a>
          </span>
        </div>
      `;
      cardGroup.forEach((subcard, idx) => {
        const cardHeader = subcard.querySelector('.card-header');
        const cardBody = subcard.querySelector('.card-body');
        const title = cardHeader?.textContent.trim() || '';

        const { date, size } = extractDateAndSize(subcard);

        let cardBodyHTML = cardBody ? cardBody.innerHTML : '';
        if (cardBody && cardBodyHTML) {
          let tmp = document.createElement('div');
          tmp.innerHTML = cardBodyHTML;
          let spans = tmp.querySelectorAll('span.mx-1');
          for (let i = 5; i < spans.length; i++) spans[i].remove();
          cardBodyHTML = tmp.innerHTML;
        }

        tooltipHTML += `<div style="margin-bottom:12px;display:flex;align-items:center;gap:10px;">`;

        // Nom release
        tooltipHTML += `<span style="flex:3 1 70%;font-size:22px;font-weight:400;color:#d0e5f9;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${title}">${title}</span>`;

        // Date et taille
        tooltipHTML += `<span style="margin-left:12px;font-size:20px;font-weight:400;color:#b5dbff;white-space:nowrap;">${size ? size : ''}${size && date ? ' • ' : ''}${date ? date : ''}</span>`;

        // Icônes natives
        tooltipHTML += `<div style="display:inline-flex;gap:8px;margin-left:16px;vertical-align:middle;align-items:center;">${cardBodyHTML}</div>`;

        tooltipHTML += `</div>`;
      });
      tooltip.innerHTML = tooltipHTML;

      // Toggle overlay au clic sur affiche
      let isOpen = false;
      cloneImg.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.affiche-tooltip').forEach(div => div.style.display = 'none');
        tooltip.style.display = isOpen ? 'none' : 'block';
        isOpen = !isOpen;
      });
      document.addEventListener('click', (e) => {
        if (!containerCard.contains(e.target)) {
          tooltip.style.display = 'none';
          isOpen = false;
        }
      });

      containerCard.appendChild(tooltip);
      gallery.appendChild(containerCard);
    });

    containers.forEach((container, idx) => {
      container.innerHTML = '';
      if (idx === 0) container.appendChild(gallery);
    });
  }

  // Bouton remonter en haut
  function createScrollTopButton() {
    const btn = document.createElement('button');
    btn.textContent = '↑ Haut de page';
    btn.title = 'Remonter';
    btn.style.position = 'fixed';
    btn.style.right = '24px';
    btn.style.bottom = '28px';
    btn.style.zIndex = '99999';
    btn.style.padding = '9px 18px';
    btn.style.background = 'rgba(48,157,152,0.94)';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.fontWeight = 'bold';
    btn.style.fontSize = '18px';
    btn.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
    btn.style.cursor = 'pointer';
    btn.style.opacity = '0.8';
    btn.style.transition = 'opacity 0.2s';
    btn.style.display = 'none';

    btn.addEventListener('mouseenter', () => btn.style.opacity = '1');
    btn.addEventListener('mouseleave', () => btn.style.opacity = '0.8');
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    window.addEventListener('scroll', () => {
      btn.style.display = (window.scrollY > 200) ? 'block' : 'none';
    });

    document.body.appendChild(btn);
  }

  function createConfigDropdown() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '12px';
    container.style.right = '12px';
    container.style.zIndex = '9999';
    container.style.background = '#f5f5f5';
    container.style.border = '1px solid #ccc';
    container.style.borderRadius = '6px';
    container.style.padding = '10px 14px';
    container.style.fontSize = '14px';
    container.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    container.style.color = '#000';

    const toggle = document.createElement('button');
    toggle.textContent = '🎬 Mode Affiches Alternatif';
    toggle.style.cursor = 'pointer';
    toggle.style.fontWeight = 'bold';
    toggle.style.background = '#309d98';
    toggle.style.color = '#fff';
    toggle.style.border = 'none';
    toggle.style.borderRadius = '5px';
    toggle.style.padding = '6px 12px';
    toggle.style.marginBottom = '8px';
    toggle.addEventListener('click', () => {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    const menu = document.createElement('div');
    menu.style.display = 'none';
    menu.style.marginTop = '8px';

    // Choix sections
    const config = getStoredConfig();
    CATEGORIES.forEach(cat => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `chk_${cat.key}`;
      checkbox.checked = config.includes(cat.key);
      checkbox.addEventListener('change', () => {
        const newConf = getStoredConfig();
        if (checkbox.checked) newConf.push(cat.key);
        else newConf.splice(newConf.indexOf(cat.key), 1);
        saveConfig(newConf);
        window.location.reload();
      });
      const label = document.createElement('label');
      label.textContent = cat.label;
      label.setAttribute('for', checkbox.id);
      label.style.marginLeft = '4px';
      const wrapper = document.createElement('div');
      wrapper.appendChild(checkbox);
      wrapper.appendChild(label);
      menu.appendChild(wrapper);
    });

    // Slider taille vignettes
    const sizeRow = document.createElement('div');
    sizeRow.style.marginTop = '14px';
    sizeRow.style.marginBottom = '2px';
    sizeRow.textContent = 'Taille des affiches :';
    menu.appendChild(sizeRow);

    const sizeSlider = document.createElement('input');
    sizeSlider.type = 'range';
    sizeSlider.min = '200';
    sizeSlider.max = '360';
    sizeSlider.step = '10';
    sizeSlider.value = getMinWidth();
    sizeSlider.style.width = '180px';
    sizeSlider.style.verticalAlign = 'middle';

    const sizeVal = document.createElement('span');
    sizeVal.textContent = ` ${getMinWidth()}px`;
    sizeVal.style.marginLeft = '8px';

    sizeSlider.addEventListener('input', () => {
      sizeVal.textContent = ` ${sizeSlider.value}px`;
    });
    sizeSlider.addEventListener('change', () => {
      setMinWidth(sizeSlider.value);
      window.location.reload();
    });

    menu.appendChild(sizeSlider);
    menu.appendChild(sizeVal);

    container.appendChild(toggle);
    container.appendChild(menu);
    document.body.appendChild(container);
  }

  function start() {
    createConfigDropdown();
    transformAffiches();
    createScrollTopButton();
  }

  if (document.readyState !== 'loading') {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start);
  }
})();
