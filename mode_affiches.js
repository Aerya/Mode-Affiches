// ==UserScript==
// @name         Mode Affiches Alternatif Responsive avec largeur dynamique
// @version      5.3
// @date         10.07.25
// @description  Affichage en grille responsive avec configuration dynamique de la largeur des affiches et menu interactif
// @author       Aerya
// @match        https://site.extension/*
// @grant        none
// ==/UserScript==


(() => {
  'use strict';

  const CATEGORIES = [
    { key: 'MOVIE', label: 'Films' },
    { key: 'TV', label: 'Séries' },
    { key: 'MANGA', label: 'Mangas' },
    { key: 'ZIK', label: 'Musiques' },
    { key: 'XXX', label: 'XXX' }
  ];

  const STORAGE_KEY = 'afficheModeSections';
  const STORAGE_FULLWIDTH_KEY = 'afficheModeFullWidth';
  const STORAGE_MINWIDTH_KEY = 'afficheMinWidth';

  const getSection = () => new URLSearchParams(window.location.search).get('section') || '';
  const isSectionActive = sec => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').includes(sec);
  const saveConfig = arr => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  const getStoredConfig = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  function createConfigDropdown() {
    const referenceBlock = [...document.querySelectorAll('.d-flex.flex-wrap.justify-content-center.mb-2')]
      .find(div => div.textContent.includes('Mode listing'));

    if (!referenceBlock) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'd-flex flex-wrap justify-content-center mb-2';

    const btnWrapper = document.createElement('div');
    btnWrapper.style.position = 'relative';
    btnWrapper.style.display = 'inline-block';

    const btn = document.createElement('button');
    btn.textContent = '🎞 Mode Affiches';
    btn.className = 'btn btn-outline-secondary my-1';
    btn.type = 'button';

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      position: 'absolute',
      top: 'calc(100% + 6px)',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1c1c1c',
      color: '#fff',
      padding: '10px',
      border: '1px solid #444',
      borderRadius: '6px',
      display: 'none',
      minWidth: '200px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
      zIndex: 10000,
      textAlign: 'left'
    });

    // Sections
    const stored = new Set(getStoredConfig());
    CATEGORIES.forEach(({ key, label }) => {
      const lbl = document.createElement('label');
      lbl.style.display = 'block';

      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.value = key;
      chk.checked = stored.has(key);
      chk.style.marginRight = '6px';

      chk.addEventListener('change', () => {
        chk.checked ? stored.add(key) : stored.delete(key);
        saveConfig(Array.from(stored));
        location.reload();
      });

      lbl.append(chk, label);
      panel.append(lbl);
    });

    panel.append(document.createElement('hr'));

    // Pleine largeur
    const fwLbl = document.createElement('label');
    fwLbl.style.display = 'block';
    const fwChk = document.createElement('input');
    fwChk.type = 'checkbox';
    fwChk.checked = localStorage.getItem(STORAGE_FULLWIDTH_KEY) === 'true';
    fwChk.style.marginRight = '6px';
    fwChk.addEventListener('change', () => {
      localStorage.setItem(STORAGE_FULLWIDTH_KEY, fwChk.checked);
      location.reload();
    });
    fwLbl.append(fwChk, ' Pleine largeur');
    panel.append(fwLbl);

    // Largeur min
    const rangeLbl = document.createElement('label');
    rangeLbl.textContent = 'Largeur min affiche :';
    rangeLbl.style.display = 'block';
    rangeLbl.style.marginTop = '8px';
    panel.append(rangeLbl);

    const rangeInp = document.createElement('input');
    rangeInp.type = 'range';
    rangeInp.min = '80';
    rangeInp.max = '300';
    rangeInp.step = '10';
    rangeInp.value = localStorage.getItem(STORAGE_MINWIDTH_KEY) || '180';
    rangeInp.style.width = '100%';
    panel.append(rangeInp);

    const rangeVal = document.createElement('div');
    rangeVal.textContent = `${rangeInp.value}px`;
    rangeVal.style.textAlign = 'center';
    rangeVal.style.marginBottom = '6px';
    panel.append(rangeVal);

    rangeInp.addEventListener('input', () => {
      localStorage.setItem(STORAGE_MINWIDTH_KEY, rangeInp.value);
      rangeVal.textContent = `${rangeInp.value}px`;
    });
    rangeInp.addEventListener('change', () => location.reload());

    btn.addEventListener('click', e => {
      e.stopPropagation();
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', e => {
      if (!btnWrapper.contains(e.target)) panel.style.display = 'none';
    });

    btnWrapper.append(btn, panel);
    wrapper.appendChild(btnWrapper);
    referenceBlock.insertAdjacentElement('afterend', wrapper);
  }

  window.addEventListener('load', () => {
    let section = getSection();
    if (!section) section = 'MOVIE';
    if (!isSectionActive(section)) return;

    const cards = [...document.querySelectorAll('.card.affichet')];
    if (!cards.length) return;

    createConfigDropdown();

    const gallery = document.createElement('div');
    gallery.id = 'afficheGallery';

    const full = localStorage.getItem(STORAGE_FULLWIDTH_KEY) === 'true';
    const minW = parseInt(localStorage.getItem(STORAGE_MINWIDTH_KEY) || '180');

    Object.assign(gallery.style, {
      display: 'grid',
      gap: '16px',
      padding: '20px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: full ? '100%' : '3440px',
      margin: '0 auto',
      gridTemplateColumns: `repeat(auto-fit,minmax(${minW}px,1fr))`,
      justifyContent: 'center'
    });

    if (full) {
      document.documentElement.style.width = '100vw';
      document.body.style.width = '100vw';
      document.body.style.margin = '0';
    }

    cards.forEach(card => {
      const title = card.querySelector('.card-header')?.innerText?.trim() || 'Sans titre';
      const link = card.querySelector('a')?.href || '#';
      const img = card.querySelector('img.card-img-top')?.src || null;
      if (!img) return;

      const cont = document.createElement('div');
      cont.style.textAlign = 'center';

      const imgEl = document.createElement('img');
      imgEl.src = img;
      imgEl.alt = title;
      Object.assign(imgEl.style, {
        width: '100%',
        borderRadius: '6px',
        boxShadow: '0 0 8px rgba(0,0,0,0.3)',
        transition: 'transform 0.2s'
      });
      imgEl.onmouseover = () => imgEl.style.transform = 'scale(1.05)';
      imgEl.onmouseout = () => imgEl.style.transform = 'scale(1)';

      let clean = title.replace(/[._-]/g, ' ').replace(/\s+/g, ' ').trim();
      if (clean.length > 60) clean = clean.slice(0, 60) + '…';

      const cap = document.createElement('div');
      cap.textContent = clean;
      Object.assign(cap.style, {
        fontSize: '0.85em',
        marginTop: '6px',
        color: '#fff'
      });

      const aEl = document.createElement('a');
      aEl.href = link;
      aEl.append(imgEl, cap);
      cont.appendChild(aEl);
      gallery.appendChild(cont);

      card.style.display = 'none';
      const wrapper = card.closest('.containert.article');
      if (wrapper) wrapper.style.display = 'none';
    });

    document.body.appendChild(gallery);
  });
})();