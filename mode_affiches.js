// ==UserScript==
// @name         Mode Affiches Responsive avec largeur dynamique
// @version      4.4
// @description  Affichage en grille responsive avec configuration dynamique de la largeur des affiches et menu interactif
// @author       Aerya
// @match        https://site.extension/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const CATEGORIES = [
    { key: 'MOVIE', label: 'Films' },
    { key: 'TV',    label: 'Séries' },
    { key: 'MANGA', label: 'Mangas' },
    { key: 'ZIK',   label: 'Musiques' },
    { key: 'XXX',   label: 'XXX' }
  ];
  const STORAGE_KEY = 'afficheModeSections';
  const STORAGE_FULLWIDTH_KEY = 'afficheModeFullWidth';
  const STORAGE_MINWIDTH_KEY = 'afficheMinWidth';

  const getSection = () => new URLSearchParams(window.location.search).get('section') || '';
  const isSectionActive = sec => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').includes(sec);
  const saveConfig = arr => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  const getStoredConfig = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  function createConfigDropdown() {
    const synopsisBtn = document.querySelector('.open-all');
    if (!synopsisBtn) return;
    const parent = synopsisBtn.closest('.d-flex');
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

    const stored = new Set(getStoredConfig());
    CATEGORIES.forEach(({key,label}) => {
      const lbl = document.createElement('label');
      lbl.style.display = 'block';
      const chk = document.createElement('input');
      chk.type = 'checkbox'; chk.value = key; chk.checked = stored.has(key);
      chk.style.marginRight = '6px';
      chk.addEventListener('change', () => {
        chk.checked ? stored.add(key) : stored.delete(key);
        saveConfig(Array.from(stored)); location.reload();
      });
      lbl.append(chk, label);
      panel.append(lbl);
    });
    panel.append(document.createElement('hr'));

    const fwLbl = document.createElement('label'); fwLbl.style.display = 'block';
    const fwChk = document.createElement('input'); fwChk.type = 'checkbox';
    fwChk.checked = localStorage.getItem(STORAGE_FULLWIDTH_KEY)==='true';
    fwChk.style.marginRight = '6px';
    fwChk.addEventListener('change', () => { localStorage.setItem(STORAGE_FULLWIDTH_KEY, fwChk.checked); location.reload(); });
    fwLbl.append(fwChk, ' Pleine largeur'); panel.append(fwLbl);
    const rangeLbl = document.createElement('label'); rangeLbl.textContent = 'Largeur min affiche :';
    rangeLbl.style.display = 'block'; rangeLbl.style.marginTop = '8px'; panel.append(rangeLbl);
    const rangeInp = document.createElement('input');
    rangeInp.type = 'range'; rangeInp.min='80'; rangeInp.max='300'; rangeInp.step='10';
    rangeInp.value = localStorage.getItem(STORAGE_MINWIDTH_KEY) || '180';
    rangeInp.style.width = '100%'; panel.append(rangeInp);
    const rangeVal = document.createElement('div'); rangeVal.textContent = `${rangeInp.value}px`;
    rangeVal.style.textAlign = 'center'; rangeVal.style.marginBottom = '6px'; panel.append(rangeVal);
    rangeInp.addEventListener('input', () => { localStorage.setItem(STORAGE_MINWIDTH_KEY,rangeInp.value); rangeVal.textContent = `${rangeInp.value}px`; });
    rangeInp.addEventListener('change', () => location.reload());

    btn.addEventListener('click', e => {
      e.stopPropagation();
      panel.style.display = panel.style.display==='none' ? 'block' : 'none';
    });

    document.addEventListener('click', e => {
      if (!wrapper.contains(e.target)) panel.style.display='none';
    });

    wrapper.append(btn, panel);
    parent.append(wrapper);
  }

  window.addEventListener('load', () => {
    createConfigDropdown();
    const section = getSection(); if (!isSectionActive(section)) return;

    const rows = [...document.querySelectorAll('tr.parent')];
    if (!rows.length) return;
    const pagination = document.querySelector('#pagination')||document.querySelector('table');
    if (!pagination) return;

    const gallery = document.createElement('div'); gallery.id='afficheGallery';
    const full = localStorage.getItem(STORAGE_FULLWIDTH_KEY)==='true';
    const minW = parseInt(localStorage.getItem(STORAGE_MINWIDTH_KEY)||'180');
    Object.assign(gallery.style,{ display:'grid',gap:'16px',padding:'20px',boxSizing:'border-box',
      width:'100%',maxWidth:full?'100%':'1600px',margin:'0 auto',
      gridTemplateColumns:`repeat(auto-fit,minmax(${minW}px,1fr))`,justifyContent:'center'
    });
    if(full){document.documentElement.style.width='100vw';document.body.style.width='100vw';document.body.style.margin='0';}

    document.querySelectorAll('tr').forEach(tr=>{
      if(tr.textContent.includes('CATEGORIE')&&tr.textContent.includes('Release')) tr.style.display='none';
    });

    rows.forEach(row=>{
      const id=row.id;
      const aTag=row.querySelector('.catrow2 a');
      const title=aTag?.innerText||'Sans titre';
      const link=aTag?.href||'#';
      let imgSrc=null;
      try{
        const sp=row.querySelector('span[onmouseover]');
        if(sp){
          const mo=sp.getAttribute('onmouseover')||'';
          let m=mo.match(/screenshotHover\('([^']+)'/);
          if(!m) m=mo.match(/src='([^']+)'/);
          imgSrc=m?m[1]:null;
        }
      }catch{}
      if(!imgSrc) return;
      const cont=document.createElement('div'); cont.style.textAlign='center';
      const img=document.createElement('img'); img.src=imgSrc; img.alt=title;
      Object.assign(img.style,{width:'100%',borderRadius:'6px',boxShadow:'0 0 8px rgba(0,0,0,0.3)',transition:'transform 0.2s'});
      img.onmouseover=()=>img.style.transform='scale(1.05)'; img.onmouseout=()=>img.style.transform='scale(1)';

      let clean=title.replace(/[._-]/g,' ').replace(/\s+/g,' ').trim();
      if(['MOVIE','MANGA'].includes(getSection())){
        const y=clean.match(/(19|20)\d{2}/); if(y) clean=clean.slice(0,clean.indexOf(y[0])+4);
      } else if(getSection()==='TV'){
        const e=clean.match(/S\d{2}E\d{2}/i); if(e) clean=clean.slice(0,clean.indexOf(e[0])+6);
      }
      if(clean.length>60) clean=clean.slice(0,60)+'…';

      const cap=document.createElement('div'); cap.textContent=clean;
      Object.assign(cap.style,{fontSize:'0.85em',marginTop:'6px',color:'#fff'});
      const aEl=document.createElement('a'); aEl.href=link; aEl.append(img,cap);
      cont.appendChild(aEl); gallery.appendChild(cont);
      row.style.display='none';
      const child=document.querySelector(`tr.child-${id}`); if(child) child.style.display='none';
    });

    document.body.appendChild(gallery);

  });
})();