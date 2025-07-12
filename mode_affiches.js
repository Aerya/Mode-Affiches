// ==UserScript==
// @name         UseNet Enhanced
// @version      6.25
// @date         12.07.25
// @description  Userscript pour transformer la liste de releases sur un indexeur privé en galerie d'affiches responsive
// @author       Aerya | https://upandclear.org
// @match        https://unfr.pw/*
// @updateURL    https://raw.githubusercontent.com/Aerya/Mode-Affiches/main/mode_affiches.js
// @downloadURL  https://raw.githubusercontent.com/Aerya/Mode-Affiches/main/mode_affiches.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const CATEGORIES = [
    { key: 'HOME', label: 'Accueil' },
    { key: 'MOVIE', label: 'Films' },
    { key: 'TV', label: 'Séries' }
  ];

  const STORAGE_KEY = 'afficheModeSections';
  const STORAGE_MINWIDTH_KEY = 'afficheMinWidth';
  const STORAGE_FONT_SIZE_KEY = 'afficheRlzFontSize';

  const getSection = () => {
    const url = new URL(window.location.href);
    const section = url.searchParams.get('section');
    const vm = url.searchParams.get('vm');
    if (!section && (vm === '1' || !vm)) return 'HOME';
    return section?.toUpperCase() || '';
  };

  function getStoredConfig() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; }
  }
  function saveConfig(arr) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
  function getMinWidth() { return parseInt(localStorage.getItem(STORAGE_MINWIDTH_KEY) || '260'); }
  function setMinWidth(val) { localStorage.setItem(STORAGE_MINWIDTH_KEY, val); }
  function getFontSize() { return parseInt(localStorage.getItem(STORAGE_FONT_SIZE_KEY) || '22'); }
  function setFontSize(val) { localStorage.setItem(STORAGE_FONT_SIZE_KEY, val); }

  function extractDateAndSize(card) {
    let date = '', size = '';
    card.querySelectorAll('.badge').forEach(badge => {
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
    const rlzFontSize = getFontSize();
    const show = config.includes(section);
    if (!CATEGORIES.some(c => c.key === section)) return;
    if (!show) return;

    const cards = Array.from(document.querySelectorAll('.containert.article .card.affichet'));
    const containers = document.querySelectorAll('.containert.article');
    if (!cards.length || !containers.length) return;

    // Group releases par film/série
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

    // Création galerie
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

      // Affiche = vignette
      const cloneImg = img.cloneNode(true);
      cloneImg.style.width = `${minwidth}px`;
      cloneImg.style.cursor = 'pointer';
      containerCard.appendChild(cloneImg);

      // Overlay
      const tooltip = document.createElement('div');
      tooltip.className = 'affiche-tooltip';
      tooltip.style.position = 'absolute';
      tooltip.style.top = '0';
      tooltip.style.left = '0';
      tooltip.style.background = 'rgba(10,10,10,0.98)';
      tooltip.style.color = '#fff';
      tooltip.style.padding = '22px 36px 26px 36px';
      tooltip.style.borderRadius = '10px';
      tooltip.style.fontSize = rlzFontSize + 'px';
      tooltip.style.fontWeight = '400';
      tooltip.style.width = '1150px';
      tooltip.style.maxWidth = '99vw';
      tooltip.style.minHeight = `${minHeight}px`;
      tooltip.style.zIndex = '1010';
      tooltip.style.boxShadow = '0 0 14px 6px rgba(0,0,0,0.7)';
      tooltip.style.whiteSpace = 'normal';
      tooltip.style.display = 'none';
      tooltip.style.pointerEvents = 'auto';

      // Header overlay
      let typeLabel = 'film', typeGender = 'le';
      if (/tvid/i.test(groupKey)) { typeLabel = 'série'; typeGender = 'la'; }
      tooltip.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:flex-start;margin-bottom:18px;width:100%;">
          <span style="font-size:${rlzFontSize}px; font-weight:600; color:#45e3ee; margin-right:24px;display:flex;align-items:center;">
            <span style="font-size:${rlzFontSize + 2}px;vertical-align:middle;">&#8595;</span>
            Les dernières releases
            <span style="font-size:${rlzFontSize + 2}px;vertical-align:middle;">&#8595;</span>
          </span>
          <span style="flex:0 0 36px; margin:0 34px; display:flex;justify-content:center;align-items:center; color:#aaa;font-size:${rlzFontSize - 1}px;font-weight:400;">
          </span>
          <a href="${card.querySelector('a[href*="?d=fiche"]')?.href || '#'}"
             style="color:#ffd04e; font-size:${rlzFontSize - 1}px; font-weight:600; text-decoration:none;">
            Voir toutes les releases pour ${typeGender} ${typeLabel}
          </a>
        </div>
      `;

      // Overlay RLZs
      let tooltipHTML = '';
      cardGroup.forEach((subcard, idx) => {
        const cardHeader = subcard.querySelector('.card-header');
        const cardBody = subcard.querySelector('.card-body');
        const title = cardHeader?.textContent.trim() || '';
        const { date, size } = extractDateAndSize(subcard);

        // Icônes natives
        let cardBodyHTML = cardBody ? cardBody.innerHTML : '';
        let nfoHTML = '';
        if (cardBody && cardBodyHTML) {
          let tmp = document.createElement('div');
          tmp.innerHTML = cardBodyHTML;
          let spans = tmp.querySelectorAll('span.mx-1');
          // NFO = dernière icône
          for (let i = 0; i < spans.length; i++) {
            let a = spans[i].querySelector('a[data-target="#NFO"]');
            if (a) {
              a.addEventListener('click', function (e) {
                e.stopPropagation();
                document.querySelectorAll('.affiche-tooltip').forEach(div => div.style.display = 'none');
              });
              nfoHTML = spans[i].outerHTML;
              spans[i].remove();
              break;
            }
          }
          for (let i = 4; i < spans.length; i++) spans[i].remove();
          cardBodyHTML = Array.from(tmp.childNodes).map(x => x.outerHTML).join('');
        }

        tooltipHTML += `
          <div style="margin-bottom:12px;display:flex;align-items:center;gap:10px;">
            <span style="flex:3 1 70%;font-size:${rlzFontSize}px;font-weight:400;color:#cde5fc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${title}">
              ${title}
            </span>
            <span style="margin-left:12px;font-size:${rlzFontSize-2}px;font-weight:400;color:#b5dbff;white-space:nowrap;">
              ${size ? size : ''}${size && date ? ' • ' : ''}${date ? date : ''}
            </span>
            <div style="display:inline-flex;gap:8px;margin-left:16px;vertical-align:middle;align-items:center;">
              ${cardBodyHTML}
              ${nfoHTML}
            </div>
          </div>
        `;
      });

      tooltip.innerHTML += tooltipHTML;

      // Hauteur overlay dynamique
      setTimeout(() => { tooltip.style.minHeight = ''; tooltip.style.height = ''; tooltip.style.maxHeight = 'none'; }, 10);

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

  // MENU CONFIGURATION + bouton remonter haut
  function createConfigDropdown() {
    if (!document.body) { setTimeout(createConfigDropdown, 100); return; }
    if (document.getElementById('remonter-haut-btn')) return;

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
    toggle.setAttribute('aria-label', 'Mode Affiches Alternatif');
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

    // Slider taille police overlay
    const fontRow = document.createElement('div');
    fontRow.style.marginTop = '16px';
    fontRow.style.marginBottom = '2px';
    fontRow.textContent = 'Taille du texte (overlay) :';
    menu.appendChild(fontRow);

    const fontSlider = document.createElement('input');
    fontSlider.type = 'range';
    fontSlider.min = '14';
    fontSlider.max = '28';
    fontSlider.step = '2';
    fontSlider.value = getFontSize();
    fontSlider.style.width = '140px';
    fontSlider.style.verticalAlign = 'middle';

    const fontVal = document.createElement('span');
    fontVal.textContent = ` ${getFontSize()}px`;
    fontVal.style.marginLeft = '8px';

    fontSlider.addEventListener('input', () => {
      fontVal.textContent = ` ${fontSlider.value}px`;
      document.querySelectorAll('.affiche-tooltip').forEach(div => {
        div.style.fontSize = fontSlider.value + 'px';
      });
    });
    fontSlider.addEventListener('change', () => {
      setFontSize(fontSlider.value);
      window.location.reload();
    });
    menu.appendChild(fontSlider);
    menu.appendChild(fontVal);

    container.appendChild(toggle);
    container.appendChild(menu);
    document.body.appendChild(container);

    // Remonter haut de page
    if (!document.getElementById('remonter-haut-btn')) {
      const upBtn = document.createElement('button');
      upBtn.id = 'remonter-haut-btn';
      upBtn.textContent = '↑ Haut de page';
      upBtn.style.position = 'fixed';
      upBtn.style.bottom = '22px';
      upBtn.style.right = '26px';
      upBtn.style.background = '#309d98';
      upBtn.style.color = '#fff';
      upBtn.style.border = 'none';
      upBtn.style.borderRadius = '6px';
      upBtn.style.padding = '8px 20px';
      upBtn.style.fontWeight = 'bold';
      upBtn.style.fontSize = '16px';
      upBtn.style.cursor = 'pointer';
      upBtn.style.boxShadow = '0 3px 12px rgba(0,0,0,0.14)';
      upBtn.style.zIndex = '99999';
      upBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      document.body.appendChild(upBtn);
    }
  }

  function start() {
    createConfigDropdown();
    transformAffiches();
  }

  if (document.readyState !== 'loading') start();
  else window.addEventListener('DOMContentLoaded', start);

  window.addEventListener('load', () => {
    setTimeout(() => {
      if (!document.querySelector('button[aria-label="Mode Affiches Alternatif"]')) {
        start();
      }
    }, 500);
  });

})();
