// ==UserScript==
// @name         Mode Affiches Responsive avec largeur dynamique
// @version      5.0
// @date         10.07.25
// @description  Affichage en grille responsive avec configuration dynamique de la largeur des affiches et menu interactif
// @author       Aerya
// @match        https://site.extension/*
// @grant        none
// ==/UserScript==


(() => {
  'use strict';

  const STORAGE_FULLWIDTH_KEY = 'afficheModeFullWidth';
  const STORAGE_MINWIDTH_KEY = 'afficheMinWidth';

  function createConfigDropdown() {
    const refBtn = document.querySelector('.btn-synopsis, .refus');
    if (!refBtn) return;

    const parent = refBtn.closest('.d-flex') || refBtn.closest('.card-body');
    if (!parent) return;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.marginLeft = '8px';

    const btn = document.createElement('button');
    btn.textContent = 'Mode Affiches';
    btn.className = 'btn btn-outline-secondary';

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      position: 'absolute',
      top: '100%',
      left: '0',
      background: '#1c1c1c',
      color: '#fff',
      padding: '10px',
      border: '1px solid #444',
      borderRadius: '6px',
      display: 'none',
      minWidth: '200px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
      zIndex: 1000
    });

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
      if (!wrapper.contains(e.target)) panel.style.display = 'none';
    });

    wrapper.append(btn, panel);
    parent.append(wrapper);
  }

  window.addEventListener('load', () => {
    createConfigDropdown();

    const cards = [...document.querySelectorAll('.card.affichet')];
    if (!cards.length) return;

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

      // Cache la carte d’origine
      card.style.display = 'none';
      const wrapper = card.closest('.containert.article');
      if (wrapper) wrapper.style.display = 'none';
    });

    document.body.appendChild(gallery);
  });
})();