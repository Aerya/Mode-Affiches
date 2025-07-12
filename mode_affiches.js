// ==UserScript==
// @name         UseNet Enhanced
// @version      6.26
// @date         12.07.25
// @description  Userscript pour transformer la liste de releases sur un indexeur privé en galerie d'affiches responsive
// @author       Aerya | https://upandclear.org
// @match        https://lesite.domaine/*
// @updateURL    https://raw.githubusercontent.com/Aerya/Mode-Affiches/main/mode_affiches.js
// @downloadURL  https://raw.githubusercontent.com/Aerya/Mode-Affiches/main/mode_affiches.js
// @grant        none
// ==/UserScript==





(function () {
  'use strict';

  const TMDB_API_KEY = '1234'; // Mettez votre clé ici !
  const TMDB_CACHE_TTL = 24 * 60 * 60 * 1000; // 1 jour

  const CATEGORIES = [
    { key: 'HOME', label: 'Accueil' },
    { key: 'MOVIE', label: 'Films' },
    { key: 'TV', label: 'Séries' }
  ];

  const STORAGE_KEY = 'afficheModeSections';
  const STORAGE_MINWIDTH_KEY = 'afficheMinWidth';
  const STORAGE_FONT_SIZE_KEY = 'afficheRlzFontSize';
  const STORAGE_SHOW_TMDB_KEY = 'afficheShowTmdb';
  const TMDB_CACHE_KEY = 'afficheTmdbCache';

  function getStoredConfig() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; }
  }
  function saveConfig(arr) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
  function getMinWidth() { return parseInt(localStorage.getItem(STORAGE_MINWIDTH_KEY) || '260'); }
  function setMinWidth(val) { localStorage.setItem(STORAGE_MINWIDTH_KEY, val); }
  function getFontSize() { return parseInt(localStorage.getItem(STORAGE_FONT_SIZE_KEY) || '22'); }
  function setFontSize(val) { localStorage.setItem(STORAGE_FONT_SIZE_KEY, val); }
  function getShowTmdb() { return localStorage.getItem(STORAGE_SHOW_TMDB_KEY) === '1'; }
  function setShowTmdb(val) { localStorage.setItem(STORAGE_SHOW_TMDB_KEY, val ? '1' : '0'); }
  function getTmdbCache() {
    try { return JSON.parse(localStorage.getItem(TMDB_CACHE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveTmdbCache(cache) { localStorage.setItem(TMDB_CACHE_KEY, JSON.stringify(cache)); }

  function fetchTmdb(type, tmdbId) {
    if (!TMDB_API_KEY || !tmdbId) return Promise.resolve(null);
    const cache = getTmdbCache();
    const key = `${type}_${tmdbId}`;
    const now = Date.now();
    if (cache[key] && now - cache[key].fetched < TMDB_CACHE_TTL) {
      return Promise.resolve(cache[key].data);
    }
    let url = '';
    if (type === 'movie') url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr-FR`;
    else if (type === 'tv') url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr-FR`;
    return fetch(url)
      .then(r => r.json())
      .then(data => {
        cache[key] = { data, fetched: now };
        saveTmdbCache(cache);
        return data;
      }).catch(() => null);
  }

  function extractDateAndSize(card) {
    let date = '', size = '';
    card.querySelectorAll('.badge').forEach(badge => {
      const txt = badge.textContent.trim();
      if (!size && /([0-9]+(\.[0-9]+)?)( ?(GB|MB|G|M|Go|Mo))$/i.test(txt)) size = txt;
      if (!date && /\d{2}\/\d{2}\/\d{2}/.test(txt)) date = txt.match(/\d{2}\/\d{2}\/\d{2}/)?.[0] || '';
    });
    return { date, size };
  }

  function getSection() {
    const url = new URL(window.location.href);
    const section = url.searchParams.get('section');
    const vm = url.searchParams.get('vm');
    if (!section && (vm === '1' || !vm)) return 'HOME';
    return section?.toUpperCase() || '';
  }

  function transformAffiches() {
    const section = getSection();
    const config = getStoredConfig();
    const minwidth = getMinWidth();
    const rlzFontSize = getFontSize();
    const showTmdb = getShowTmdb();
    const show = config.includes(section);
    if (!CATEGORIES.some(c => c.key === section)) return;
    if (!show) return;

    const cards = Array.from(document.querySelectorAll('.containert.article .card.affichet'));
    const containers = document.querySelectorAll('.containert.article');
    if (!cards.length || !containers.length) return;

    // Group releases pour film/série
    const grouped = new Map();
    cards.forEach(card => {
      const link = card.querySelector('a[href*="?d=fiche"]');
      const href = link?.getAttribute('href') || '';
      let tmdbId = '';
      let movieType = 'movie';
      let match = href.match(/movieid=(\d+)/i);
      if (match) {
        tmdbId = match[1];
        movieType = 'movie';
      } else {
        match = href.match(/tvid=(\d+)/i);
        if (match) {
          tmdbId = match[1];
          movieType = 'tv';
        }
      }
      if (!tmdbId) {
        const inp = card.querySelector('input#tmdb_id');
        if (inp) tmdbId = inp.value;
      }
      const idKey = movieType + '_' + tmdbId;
      if (!tmdbId) return;
      if (!grouped.has(idKey)) grouped.set(idKey, { cards: [], tmdbId, movieType });
      grouped.get(idKey).cards.push(card);
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

    grouped.forEach((group, groupKey) => {
      const card = group.cards[0];
      const img = card.querySelector('img.card-img-top');
      const minHeight = img?.height || 330;
      if (!img) return;

      // Affiche = vignette
      const containerCard = document.createElement('div');
      containerCard.style.flex = `0 0 ${minwidth}px`;
      containerCard.style.maxWidth = `${minwidth}px`;
      containerCard.style.position = 'relative';
      containerCard.style.display = 'block';

      // Badge note TMDB (optionnel)
      if (showTmdb) {
        fetchTmdb(group.movieType, group.tmdbId).then(data => {
          if (!data) return;
          const vote = data.vote_average ? Number(data.vote_average).toFixed(1) : '?';
          const votes = data.vote_count ? ` (${data.vote_count})` : '';
          // Mini-icône SVG TMDB
          const tmdbSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="18" height="18" style="vertical-align:middle;margin-right:4px;"><rect width="32" height="32" rx="6" fill="#01d277"/><text x="16" y="21" text-anchor="middle" font-size="13" font-family="Arial" fill="#fff" font-weight="bold">T</text></svg>`;
          const badge = document.createElement('span');
          badge.innerHTML = `${tmdbSvg} <span style="font-size:17px;font-weight:600;">${vote}</span><span style="font-size:12px;color:#ffd04e;">${votes}</span>`;
          badge.title = "Note TMDB";
          badge.style.position = 'absolute';
          badge.style.top = '8px';
          badge.style.left = '10px';
          badge.style.background = '#032541de';
          badge.style.color = '#ffd04e';
          badge.style.borderRadius = '8px';
          badge.style.padding = '2px 7px 2px 3px';
          badge.style.fontSize = '15px';
          badge.style.boxShadow = '0 2px 8px #222c';
          badge.style.zIndex = 15;
          badge.style.display = 'flex';
          badge.style.alignItems = 'center';
          badge.style.userSelect = 'none';
          containerCard.appendChild(badge);
        });
      }

      // Clone affiche
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
      if (group.movieType === 'tv') { typeLabel = 'série'; typeGender = 'la'; }
      tooltip.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:flex-start;margin-bottom:18px;width:100%;">
          <span style="font-size:${rlzFontSize}px; font-weight:600; color:#45e3ee; margin-right:24px;display:flex;align-items:center;">
            <span style="font-size:${rlzFontSize + 2}px;vertical-align:middle;">&#8595;</span>
            Les dernières releases
            <span style="font-size:${rlzFontSize + 2}px;vertical-align:middle;">&#8595;</span>
          </span>
          <span style="flex:0 0 36px; margin:0 20px; display:flex;justify-content:center;align-items:center; color:#aaa;font-size:${rlzFontSize - 1}px;font-weight:400;"> </span>
          <a href="${card.querySelector('a[href*=\"?d=fiche\"]')?.href || '#'}"
             style="color:#ffd04e; font-size:${rlzFontSize - 1}px; font-weight:600; text-decoration:none;">
            Voir toutes les releases pour ${typeGender} ${typeLabel}
          </a>
        </div>
      `;

      let tooltipHTML = '';
      group.cards.forEach((subcard, idx) => {
        const cardHeader = subcard.querySelector('.card-header');
        const cardBody = subcard.querySelector('.card-body');
        const title = cardHeader?.textContent.trim() || '';
        const { date, size } = extractDateAndSize(subcard);

        let cardBodyHTML = cardBody ? cardBody.innerHTML : '';
        let nfoHTML = '';
        if (cardBody && cardBodyHTML) {
          let tmp = document.createElement('div');
          tmp.innerHTML = cardBodyHTML;
          let spans = tmp.querySelectorAll('span.mx-1');
          for (let i = 0; i < spans.length; i++) {
            let a = spans[i].querySelector('a[data-target=\"#NFO\"]');
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
          // Pour que tous les écarts soient identiques entre icônes
          for (let i = 4; i < spans.length; i++) spans[i].remove();
          spans.forEach((s, idx) => { if (idx === 0) s.style.marginRight = '6px'; else s.style.marginRight = '8px'; });
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

      setTimeout(() => { tooltip.style.minHeight = ''; tooltip.style.height = ''; tooltip.style.maxHeight = 'none'; }, 10);

      // Overlay "always fits on screen"
      let isOpen = false;
      cloneImg.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.affiche-tooltip').forEach(div => div.style.display = 'none');
        tooltip.style.display = 'block';
        // Position
        const rect = containerCard.getBoundingClientRect();
        const oRect = tooltip.getBoundingClientRect();
        let left = 0;
        if (rect.left + oRect.width > window.innerWidth) {
          left = window.innerWidth - oRect.width - 8; // 8px margin
          if (left < 0) left = 0;
        } else {
          left = rect.left;
        }
        tooltip.style.left = (left - rect.left) + 'px';
        isOpen = true;
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

  function createConfigDropdown() {
    const container = document.createElement('div');
    container.id = 'affiche-mode-menu-container';
    container.style.position = 'fixed';
    container.style.top = '12px';
    container.style.right = '12px';
    container.style.zIndex = '19999';
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
    toggle.style.zIndex = '19999';
    toggle.addEventListener('click', () => {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    const menu = document.createElement('div');
    menu.style.display = 'none';
    menu.style.marginTop = '8px';
    menu.style.zIndex = '20001';

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

    // Option badge TMDB
    const tmdbOptRow = document.createElement('div');
    tmdbOptRow.style.marginTop = '16px';
    const tmdbCheckbox = document.createElement('input');
    tmdbCheckbox.type = 'checkbox';
    tmdbCheckbox.id = 'affiche-tmdb-opt';
    tmdbCheckbox.checked = getShowTmdb();
    tmdbCheckbox.addEventListener('change', () => {
      setShowTmdb(tmdbCheckbox.checked);
      window.location.reload();
    });
    const tmdbLabel = document.createElement('label');
    tmdbLabel.textContent = " Afficher la note TMDB sur l'affiche";
    tmdbLabel.setAttribute('for', 'affiche-tmdb-opt');
    tmdbLabel.style.marginLeft = '5px';
    tmdbOptRow.appendChild(tmdbCheckbox);
    tmdbOptRow.appendChild(tmdbLabel);
    menu.appendChild(tmdbOptRow);

    container.appendChild(toggle);
    container.appendChild(menu);

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

    if (!document.getElementById('affiche-mode-menu-container'))
      document.body.appendChild(container);
  }

  function start() {
    createConfigDropdown();
    transformAffiches();
  }
  if (document.readyState !== 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
})();
