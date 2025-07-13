// ==UserScript==
// @name         UseNet Enhanced (Overseerr/Jellyseerr TV Fix + Nouvel Onglet)
// @version      8.4.3
// @date         12.07.25
// @description  Galerie d'affiches, Radarr/Sonarr/Overseerr/Jellyseerr, badges TMDB/IMDB, options menu stables
// @author       Aerya
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /* ==================================================================
   * 1.  AUTO‑UPDATE DISCRET MULTI-URL
   * ==================================================================*/
  const LOCAL_VERSION      = '8.4.3';
  const UPDATE_INTERVAL_MS = 12 * 60 * 60 * 1000;
  const UPDATE_LS_KEY      = 'afficheLastUpdateCheck';

  const UPDATE_URLS = [
    `${location.protocol}//tig.${location.hostname}/Aerya/Mode-Affiches/raw/branch/main/mode_affiches.js`,
    'https://raw.githubusercontent.com/Aerya/Mode-Affiches/main/mode_affiches.js'
  ];

  function parseVersion(txt) {
    const m = txt.match(/@version\s+([0-9]+(?:\.[0-9]+)*)/);
    return m ? m[1] : null;
  }
  function isNewer(remote, local) {
    const R = remote.split('.').map(Number);
    const L = local.split('.').map(Number);
    for (let i = 0; i < Math.max(R.length, L.length); i++) {
      const a = R[i] || 0, b = L[i] || 0;
      if (a > b) return true;
      if (a < b) return false;
    }
    return false;
  }

  (function checkUpdateMulti() {
    const last = parseInt(localStorage.getItem(UPDATE_LS_KEY) || '0', 10);
    const now  = Date.now();
    if (now - last < UPDATE_INTERVAL_MS) return;

    localStorage.setItem(UPDATE_LS_KEY, now.toString());

    Promise.all(
      UPDATE_URLS.map(url =>
        fetch(`${url}?_=${now}`)
          .then(r => r.text())
          .then(txt => ({ url, version: parseVersion(txt) }))
          .catch(() => null)
      )
    ).then(results => {
      const valid = results.filter(x => x && x.version && isNewer(x.version, LOCAL_VERSION));
      if (!valid.length) return;
      valid.sort((a, b) => {
        const aV = a.version.split('.').map(Number);
        const bV = b.version.split('.').map(Number);
        for (let i = 0; i < Math.max(aV.length, bV.length); i++) {
          if ((aV[i] || 0) > (bV[i] || 0)) return -1;
          if ((aV[i] || 0) < (bV[i] || 0)) return 1;
        }
        return 0;
      });
      window.open(valid[0].url, '_blank');
    });
  })();

  /* ==================================================================
   * 0.  CONDITIONS D’ACTIVATION
   * ==================================================================*/
  if (!document.getElementById('m0de_afficheS_EnAbled')) return;

  // === Toast notif
  function toast(msg, type = 'info', ms = 3500) {
    let color = type === 'error' ? '#c00' : type === 'success' ? '#15a92e' : '#368efc';
    let bg = type === 'error' ? '#ffd5d5' : type === 'success' ? '#dbffe0' : '#e2eafc';
    let box = document.createElement('div');
    box.textContent = msg;
    box.style = `position:fixed;top:26px;right:24px;z-index:99999;padding:14px 22px;font-size:17px;font-weight:bold;border-radius:9px;background:${bg};color:${color};box-shadow:0 4px 24px #0002;opacity:0.98;`;
    document.body.appendChild(box);
    setTimeout(() => box.remove(), ms);
  }

  // === Persistance config
  const INSTANCES_KEY                = 'afficheUsenetInstances';
  const STORAGE_SECTIONS_KEY         = 'afficheModeSections';
  const STORAGE_MINWIDTH_KEY         = 'afficheMinWidth';
  const STORAGE_FONT_SIZE_KEY        = 'afficheRlzFontSize';
  const STORAGE_SHOW_TMDB_KEY        = 'afficheShowTmdb';
  const STORAGE_RELEASE_NEWTAB_KEY   = 'afficheReleaseNewTab';
  const TMDB_CACHE_KEY               = 'afficheTmdbCache';

  function getInstances() { try { return JSON.parse(localStorage.getItem(INSTANCES_KEY)) || {}; } catch { return {}; } }
  function setInstances(obj) { localStorage.setItem(INSTANCES_KEY, JSON.stringify(obj)); }

  function getSections() {
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem(STORAGE_SECTIONS_KEY)) || []; }
    catch { arr = []; }
    return Array.isArray(arr) ? arr : [];
  }
  function setSections(arr) { localStorage.setItem(STORAGE_SECTIONS_KEY, JSON.stringify(arr)); }

  function minW()   { return parseInt(localStorage.getItem(STORAGE_MINWIDTH_KEY) || '260', 10); }
  function fontSz() { return parseInt(localStorage.getItem(STORAGE_FONT_SIZE_KEY) || '22', 10); }
  function showTmdb() { return localStorage.getItem(STORAGE_SHOW_TMDB_KEY) !== '0'; }
  function openReleasesInNewTab() { return localStorage.getItem(STORAGE_RELEASE_NEWTAB_KEY) === '1'; }

  // === Icons
  function svg4kBadge(svg) {
    return `<span style="position:relative;display:inline-block;width:36px;height:36px;">${svg}
      <span style="position:absolute;bottom:-7px;right:-11px;background:rgba(255,255,255,0.88);color:#1a1a1a;font-weight:900;font-family:sans-serif;font-size:15px;padding:1px 8px 1px 8px;border-radius:16px;border:2px solid #fff;box-shadow:0 1px 6px #0006;line-height:15px;text-shadow:0 1px 2px #fff7;letter-spacing:-1px;">4K</span>
    </span>`;
  }
  function imgIcon(url, alt) {
    return `<span style="background:rgba(255,255,255,0.78);border-radius:10px;padding:2px 2px 2px 2px;display:inline-block;">
      <img src="${url}" alt="${alt}" style="width:36px;height:36px;vertical-align:middle;filter: drop-shadow(0 0 5px #0002);border-radius:8px;background:transparent;border:none;display:block;">
    </span>`;
  }
  function getIcon(type) {
    if(type==='radarr')   return imgIcon("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/radarr.svg", "Radarr");
    if(type==='radarr4k') return svg4kBadge(imgIcon("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/radarr-4k.svg", "Radarr 4K"));
    if(type==='sonarr')   return imgIcon("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/sonarr.svg", "Sonarr");
    if(type==='sonarr4k') return svg4kBadge(imgIcon("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/sonarr-4k.svg", "Sonarr 4K"));
    if(type==='overseerr')   return imgIcon("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/overseerr.svg", "Overseerr");
    if(type==='jellyseerr')  return imgIcon("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/jellyseerr.svg", "Jellyseerr");
    if(type==='tmdb')     return imgIcon("https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/tmdb.svg", "TMDB");
    if(type==='imdb')     return imgIcon("https://www.svgrepo.com/show/349409/imdb.svg", "IMDB");
    return '';
  }

  // === API Info
  const API_INFO = {
    radarr:     { name: "Radarr",    api: "radarr",   add: "movie",  qual: "qualityProfile", root: "rootfolder",  icon: "radarr",   tmdb: true  },
    radarr4k:   { name: "Radarr 4K", api: "radarr4k", add: "movie",  qual: "qualityProfile", root: "rootfolder",  icon: "radarr4k", tmdb: true  },
    sonarr:     { name: "Sonarr",    api: "sonarr",   add: "series", qual: "qualityProfile", root: "rootfolder",  icon: "sonarr",   tmdb: false },
    sonarr4k:   { name: "Sonarr 4K", api: "sonarr4k", add: "series", qual: "qualityProfile", root: "rootfolder",  icon: "sonarr4k", tmdb: false },
    overseerr:  { name: "Overseerr", api: "overseerr", add: "both", icon: "overseerr" },
    jellyseerr: { name: "Jellyseerr", api: "jellyseerr", add: "both", icon: "jellyseerr" }
  };

  // === TMDB fetch/cache (similaire)
  function fetchTmdb(type, id) {
    if (!id) return Promise.resolve(null);
    let cache = {};
    try { cache = JSON.parse(localStorage.getItem(TMDB_CACHE_KEY)) || {}; } catch { cache = {}; }
    const key   = `${type}_${id}`;
    const now   = Date.now();
    if (cache[key] && now - cache[key].fetched < 24 * 60 * 60 * 1000) return Promise.resolve(cache[key].data);
    return fetch(`${location.origin}/proxy_tmdb?type=${type}&id=${id}`)
      .then(r => r.json())
      .then(d => { cache[key] = { data: d, fetched: now }; localStorage.setItem(TMDB_CACHE_KEY, JSON.stringify(cache)); return d; })
      .catch(() => null);
  }

  // === Détection section
  const CATEGORIES = [
    { key: 'HOME',  label: 'Accueil' },
    { key: 'MOVIE', label: 'Films'   },
    { key: 'TV',    label: 'Séries'  }
  ];
  function getSection() {
    const p  = new URLSearchParams(location.search);
    const s  = p.get('section');
    const vm = p.get('vm');
    return (!s && (vm === '1' || !vm)) ? 'HOME' : (s || '').toUpperCase();
  }

  // === Extract date/size
  function extractDateAndSize(card) {
    let date = '', size = '';
    card.querySelectorAll('.badge').forEach(b => {
      const t = b.textContent.trim();
      if (!size && /([0-9]+(?:\.[0-9]+)?)( ?(GB|MB|G|M|Go|Mo))$/i.test(t)) size = t;
      if (!date && /\d{2}\/\d{2}\/\d{2}/.test(t)) date = t.match(/\d{2}\/\d{2}\/\d{2}/)[0];
    });
    return { date, size };
  }

  // === Overlay (profil qualité)
  function showProfileSelector(profiles, cb) {
    document.querySelectorAll('.usenet-qprof-popover').forEach(e=>e.remove());
    let pop = document.createElement('div');
    pop.className = "usenet-qprof-popover";
    pop.style = `position:fixed;z-index:99999;top:70px;right:32px;background:#23233a;color:#ffe388;
      border:2px solid #ffe388;border-radius:12px;box-shadow:0 3px 16px #222a;
      padding:18px 28px;min-width:260px;`;
    pop.innerHTML = `<b>Profil Qualité :</b><br><br>`;
    profiles.forEach(prof => {
      let btn = document.createElement('button');
      btn.textContent = prof.name;
      btn.style = `display:block;width:100%;margin:6px 0;padding:10px 0;font-size:17px;border:none;background:#f9d72c;color:#222;font-weight:bold;border-radius:8px;cursor:pointer;`;
      btn.onclick = () => { pop.remove(); cb(prof.id); };
      pop.appendChild(btn);
    });
    let cancel = document.createElement('button');
    cancel.textContent = "Annuler";
    cancel.style = `display:block;width:100%;margin:14px 0 0 0;padding:10px 0;font-size:15px;border:none;background:#ddd;color:#444;border-radius:8px;cursor:pointer;`;
    cancel.onclick = ()=>pop.remove();
    pop.appendChild(cancel);
    document.body.appendChild(pop);
  }

  // === Affichage
  function transformAffiches() {
    const section  = getSection();
    const conf     = getSections();
    const activate = conf.includes(section);
    if (!CATEGORIES.some(c => c.key === section) || !activate) return;

    const cards      = Array.from(document.querySelectorAll('.containert.article .card.affichet'));
    const containers = document.querySelectorAll('.containert.article');
    if (!cards.length || !containers.length) return;

    const groups = new Map();
    cards.forEach(card => {
      const href = card.querySelector('a[href*="?d=fiche"]')?.getAttribute('href') || '';
      let id = '', type = 'movie';
      let m  = href.match(/movieid=(\d+)/i);
      if (m) { id = m[1]; }
      else if ((m = href.match(/tvid=(\d+)/i))) { id = m[1]; type = 'tv'; }
      else {
        const inp = card.querySelector('input#tmdb_id');
        if (inp) id = inp.value;
      }
      if (!id) return;
      const key = `${type}_${id}`;
      if (!groups.has(key)) groups.set(key, { type, id, cards: [] });
      groups.get(key).cards.push(card);
    });

    const inst = getInstances();
    const hasRadarr    = inst.radarr   && inst.radarr.url && inst.radarr.apiKey;
    const hasRadarr4k  = inst.radarr4k && inst.radarr4k.url && inst.radarr4k.apiKey;
    const hasSonarr    = inst.sonarr   && inst.sonarr.url && inst.sonarr.apiKey;
    const hasSonarr4k  = inst.sonarr4k && inst.sonarr4k.url && inst.sonarr4k.apiKey;
    const hasOverseerr = inst.overseerr && inst.overseerr.url && inst.overseerr.apiKey;
    const hasJellyseerr = inst.jellyseerr && inst.jellyseerr.url && inst.jellyseerr.apiKey;

    const gallery = Object.assign(document.createElement('div'), {
      className: 'd-flex flex-wrap',
      style: 'justify-content:center;margin-top:20px;gap:8px;padding:0 12px;width:100%;margin-left:auto;margin-right:auto;'
    });

    groups.forEach(group => {
      const card0 = group.cards[0];
      const img0  = card0.querySelector('img.card-img-top');
      if (!img0) return;
      const mH = img0.height || 330;
      const cardDiv = Object.assign(document.createElement('div'), { style: `flex:0 0 ${minW()}px;max-width:${minW()}px;position:relative;display:block;` });

      // === Boutons
      let btnIdx = 0;
      const btnGen = (kind, instObj, apiData) => {
        const btn = document.createElement('button');
        btn.innerHTML = getIcon(kind);
        btn.title = `Ajouter à ${apiData.name}`;
        btn.className = "affiche-usenet-btn";
        btn.style = `position:absolute; bottom:12px; right:${12 + btnIdx*(36+6)}px; z-index:22; width:36px; height:36px; background:rgba(255,255,255,0.78); border:2.5px solid #e6e6e6; border-radius:11px; padding:0; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 10px #0002; cursor:pointer; transition:transform 0.11s; opacity:0.98;`;
        btn.onmouseenter = () => btn.style.opacity = "1";
        btn.onmouseleave = () => btn.style.opacity = "0.98";
        btn.onclick = (e) => {
          e.stopPropagation();
          btn.disabled = true;
          // Radarr/Sonarr
          if (kind.startsWith("radarr") || kind.startsWith("sonarr")) {
            toast("Chargement profils/dossiers...", "info", 1500);
            Promise.all([
              fetch(`${instObj.url}/api/v3/${apiData.qual}`, {headers: {'X-Api-Key': instObj.apiKey }}).then(r => r.json()),
              fetch(`${instObj.url}/api/v3/${apiData.root}`, {headers: {'X-Api-Key': instObj.apiKey }}).then(r => r.json())
            ]).then(([profs, roots]) => {
              if (!Array.isArray(profs) || !profs.length) throw new Error('Aucun profil qualité');
              if (!Array.isArray(roots) || !roots.length) throw new Error('Aucun dossier cible trouvé');
              showProfileSelector(profs, function(qpid) {
                const rootFolder = roots.find(r => r.path && !r.unmappedFolders?.length) || roots[0];
                if (!rootFolder || !rootFolder.path) return toast("Aucun dossier cible valide trouvé", "error");
                toast("Ajout en cours...", "info", 1200);
                let body = {};
                if(apiData.add === 'movie') {
                  fetchTmdb('movie', group.id).then(data => {
                    const tmdbId = group.id;
                    const year = data && data.release_date ? (data.release_date+'').substring(0,4) : '';
                    body = {
                      "title": data?.title || '',
                      "qualityProfileId": qpid,
                      "tmdbId": parseInt(tmdbId),
                      "year": year ? parseInt(year) : undefined,
                      "monitored": true,
                      "rootFolderPath": rootFolder.path,
                      "addOptions": { "searchForMovie": true }
                    };
                    fetch(`${instObj.url}/api/v3/movie`, {
                      method: 'POST',
                      headers: {'X-Api-Key': instObj.apiKey, 'Content-Type': 'application/json'},
                      body: JSON.stringify(body)
                    }).then(async resp => {
                      btn.disabled = false;
                      if (resp.status === 201) {
                        toast("✅ Ajouté à " + apiData.name + " !", "success");
                      } else if (resp.status === 400) {
                        let r = await resp.json();
                        if (r && r[0] && r[0].errorMessage && r[0].errorMessage.match(/already exists/i))
                          toast("Déjà présent dans " + apiData.name, "info");
                        else
                          toast("Erreur " + apiData.name + " : " + (r[0]?.errorMessage || resp.statusText), "error");
                      } else {
                        toast("Erreur " + apiData.name + " ("+resp.status+")", "error");
                      }
                    }).catch(e => {
                      btn.disabled = false;
                      toast("Erreur de connexion " + apiData.name, "error");
                    });
                  });
                } else {
                  fetchTmdb('tv', group.id).then(data => {
                    const tvdbId = data?.external_ids?.tvdb_id || data?.tvdb_id;
                    body = {
                      "title": data?.name || '',
                      "qualityProfileId": qpid,
                      "tvdbId": parseInt(tvdbId),
                      "monitored": true,
                      "rootFolderPath": rootFolder.path,
                      "addOptions": { "searchForMissingEpisodes": true }
                    };
                    fetch(`${instObj.url}/api/v3/series`, {
                      method: 'POST',
                      headers: {'X-Api-Key': instObj.apiKey, 'Content-Type': 'application/json'},
                      body: JSON.stringify(body)
                    }).then(async resp => {
                      btn.disabled = false;
                      if (resp.status === 201) {
                        toast("✅ Ajouté à " + apiData.name + " !", "success");
                      } else if (resp.status === 400) {
                        let r = await resp.json();
                        if (r && r[0] && r[0].errorMessage && r[0].errorMessage.match(/already exists/i))
                          toast("Déjà présent dans " + apiData.name, "info");
                        else
                          toast("Erreur " + apiData.name + " : " + (r[0]?.errorMessage || resp.statusText), "error");
                      } else {
                        toast("Erreur " + apiData.name + " ("+resp.status+")", "error");
                      }
                    }).catch(e => {
                      btn.disabled = false;
                      toast("Erreur de connexion " + apiData.name, "error");
                    });
                  });
                }
              });
            }).catch(e=>{
              btn.disabled = false;
              toast("Erreur de récupération profils/dossiers", "error");
            });
          }
          // Overseerr / Jellyseerr
          if (kind === "overseerr" || kind === "jellyseerr") {
            if (group.type === "movie") {
              fetch(`${instObj.url}/api/v1/request`, {
                method: 'POST',
                headers: {
                  'X-Api-Key': instObj.apiKey,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mediaType: "movie", mediaId: parseInt(group.id) })
              }).then(async resp => {
                btn.disabled = false;
                if (resp.status === 201 || resp.status === 202) {
                  toast("✅ Ajouté à " + apiData.name + " !", "success");
                } else {
                  let txt = await resp.text();
                  toast("Erreur " + apiData.name + " : " + txt, "error");
                }
              }).catch(() => {
                btn.disabled = false;
                toast("Erreur de connexion " + apiData.name, "error");
              });
            }
            if (group.type === "tv") {
              fetchTmdb('tv', group.id).then(data => {
                let seasons = [];
                if (data && data.seasons) {
                  seasons = data.seasons
                    .filter(s => s.season_number && s.season_number > 0)
                    .map(s => s.season_number);
                }
                if (!seasons.length) {
                  toast("Erreur : aucune saison trouvée pour cette série.", "error");
                  btn.disabled = false;
                  return;
                }
                fetch(`${instObj.url}/api/v1/request`, {
                  method: 'POST',
                  headers: {
                    'X-Api-Key': instObj.apiKey,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    mediaType: "tv",
                    mediaId: parseInt(group.id),
                    seasons: seasons
                  })
                }).then(async resp => {
                  btn.disabled = false;
                  if (resp.status === 201 || resp.status === 202) {
                    toast("✅ Ajouté à " + apiData.name + " !", "success");
                  } else {
                    let txt = await resp.text();
                    toast("Erreur " + apiData.name + " : " + txt, "error");
                  }
                }).catch(() => {
                  btn.disabled = false;
                  toast("Erreur de connexion " + apiData.name, "error");
                });
              });
            }
          }
        };
        cardDiv.appendChild(btn);
        btnIdx++;
      };

      if (group.type === 'movie') {
        if (hasRadarr)   btnGen('radarr',   inst.radarr,   API_INFO.radarr);
        if (hasRadarr4k) btnGen('radarr4k', inst.radarr4k, API_INFO.radarr4k);
        if (hasOverseerr) btnGen('overseerr', inst.overseerr, API_INFO.overseerr);
        if (hasJellyseerr) btnGen('jellyseerr', inst.jellyseerr, API_INFO.jellyseerr);
      }
      if (group.type === 'tv') {
        if (hasSonarr)   btnGen('sonarr',   inst.sonarr,   API_INFO.sonarr);
        if (hasSonarr4k) btnGen('sonarr4k', inst.sonarr4k, API_INFO.sonarr4k);
        if (hasOverseerr) btnGen('overseerr', inst.overseerr, API_INFO.overseerr);
        if (hasJellyseerr) btnGen('jellyseerr', inst.jellyseerr, API_INFO.jellyseerr);
      }

      // === Badges TMDB/IMDB
      if (showTmdb()) {
        fetchTmdb(group.type, group.id).then(data => {
          if (!data) return;
          const badgeWrap = Object.assign(document.createElement('div'), { style: 'position:absolute;top:7px;left:8px;display:flex;flex-direction:column;gap:3px;z-index:15;pointer-events:none;' });
          function addBadge(icon, score, votes, url, type='tmdb') {
            if (!score || score === '?') return;
            const color = "#111";
            const el = Object.assign(document.createElement(url ? 'a' : 'span'), {
              innerHTML: `
                <span style="background:rgba(255,255,255,0.78);border-radius:9px;display:flex;align-items:center;padding:2px 10px 2px 6px;box-shadow:0 2px 8px #0002;">
                  ${getIcon(type)}
                  <span style="font-size:19px;font-weight:bold;color:${color};text-shadow:0 1px 2px #fff9,0 1px 2px #2221;margin-left:2px;">${score}</span>
                  <span style="font-size:13px;font-weight:bold;color:${color};margin-left:5px;">${votes}</span>
                </span>`,
              style: 'margin-bottom:5px;margin-right:3px;pointer-events:auto;text-decoration:none;'
            });
            if (url) { el.href = url; el.target = '_blank'; el.rel = 'noopener noreferrer'; el.title = 'Voir la fiche'; }
            badgeWrap.appendChild(el);
          }
          addBadge('tmdb',
                   data.vote_average ? Number(data.vote_average).toFixed(1) : '?',
                   data.vote_count ? `  (${data.vote_count})` : '',
                   `https://www.themoviedb.org/${group.type === 'tv' ? 'tv' : 'movie'}/${group.id}`,
                   'tmdb');
          addBadge('imdb',
                   data.note_imdb ? Number(data.note_imdb).toFixed(1) : '?',
                   data.vote_imdb ? `  (${data.vote_imdb})` : '',
                   null,
                   'imdb');
          if (badgeWrap.childElementCount) cardDiv.appendChild(badgeWrap);
        });
      }

      // === Image et overlay
      const imgClone = img0.cloneNode(true);
      imgClone.style.width  = `${minW()}px`;
      imgClone.style.cursor = 'pointer';
      cardDiv.appendChild(imgClone);

      // === Overlay releases
      const tooltip = Object.assign(document.createElement('div'), {
        className: 'affiche-tooltip',
        style: `position:absolute;top:0;left:0;background:rgba(10,10,10,0.98);color:#fff;padding:22px 36px 26px 36px;border-radius:10px;font-size:${fontSz()}px;font-weight:400;width:${Math.min(innerWidth - 40, 1150)}px;max-width:99vw;min-height:${mH}px;z-index:1010;box-shadow:0 0 14px 6px rgba(0,0,0,0.7);white-space:normal;display:none;pointer-events:auto;overflow:hidden;`
      });
      const adjustW = () => {
        tooltip.style.width = Math.min(innerWidth - 40, 1150) + 'px';
        const cardRect = cardDiv.getBoundingClientRect();
        const overlayW = tooltip.offsetWidth || Math.min(innerWidth - 40, 1150);
        let left = cardRect.left;
        if (left + overlayW > window.innerWidth - 20) {
          tooltip.style.left = '';
          tooltip.style.right = '0';
        } else {
          tooltip.style.left = '0';
          tooltip.style.right = '';
        }
      };
      addEventListener('resize', adjustW);

      const typeLabel = group.type === 'tv' ? 'série' : 'film';
      const typeGen   = group.type === 'tv' ? 'la' : 'le';

      tooltip.innerHTML = `<div style="display:flex;align-items:center;justify-content:flex-start;margin-bottom:18px;width:100%;">
        <span style="font-size:${fontSz()}px;font-weight:600;color:#45e3ee;margin-right:24px;display:flex;align-items:center;">
          <span style="font-size:${fontSz() + 2}px;vertical-align:middle;">&#8595;</span>&nbsp;&nbsp;Les dernières releases&nbsp;&nbsp;<span style="font-size:${fontSz() + 2}px;vertical-align:middle;">&#8595;</span>
        </span>
        <a href="${card0.querySelector('a[href*="?d=fiche"]')?.href || '#'}" style="color:#ffd04e;font-size:${fontSz() - 1}px;font-weight:600;text-decoration:none;"${openReleasesInNewTab() ? ' target="_blank"' : ''}>Voir toutes les releases pour ${typeGen} ${typeLabel}</a>
      </div>`;

      // === Details releases
      let html = '';
      group.cards.forEach(sub => {
        const title = sub.querySelector('.card-header')?.textContent.trim() || '';
        const { date, size } = extractDateAndSize(sub);
        let bodyHTML = sub.querySelector('.card-body')?.innerHTML || '';
        let nfoHTML  = '';
        if (bodyHTML) {
          const tmp = document.createElement('div');
          tmp.innerHTML = bodyHTML;
          const spans = tmp.querySelectorAll('span.mx-1');
          for (const s of spans) {
            const a = s.querySelector('a[data-target="#NFO"]');
            if (a) { nfoHTML = s.outerHTML; s.remove(); break; }
          }
          Array.from(tmp.querySelectorAll('span.mx-1')).slice(4).forEach(s => s.remove());
          bodyHTML = Array.from(tmp.childNodes).map(x => x.outerHTML || '').join('');
        }
        html += `<div style="margin-bottom:12px;display:flex;align-items:center;gap:12px;">
          <span style="flex:3 1 70%;font-size:${fontSz()}px;font-weight:400;color:#cde5fc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${title}">${title}</span>
          <span style="margin-left:12px;font-size:${fontSz() - 2}px;font-weight:400;color:#b5dbff;white-space:nowrap;">${size}${size && date ? ' • ' : ''}${date}</span>
          <div style="display:inline-flex;gap:10px;margin-left:12px;align-items:center;">${bodyHTML}${nfoHTML}</div>
        </div>`;
      });
      const wrap = document.createElement('div');
      wrap.className = 'affiche-releases';
      wrap.style.maxHeight = group.cards.length > 10 ? '430px' : 'none';
      wrap.style.overflowY = group.cards.length > 10 ? 'auto' : 'visible';
      wrap.innerHTML = html;
      tooltip.appendChild(wrap);

      setTimeout(() => { tooltip.style.minHeight = ''; tooltip.style.height = ''; tooltip.style.maxHeight = 'none'; }, 10);

      let open = false;
      imgClone.addEventListener('click', e => {
        e.stopPropagation();
        adjustW();
        document.querySelectorAll('.affiche-tooltip').forEach(d => d.style.display = 'none');
        tooltip.style.display = open ? 'none' : 'block';
        open = !open;
      });
      document.addEventListener('click', e => {
        if (!cardDiv.contains(e.target)) {
          tooltip.style.display = 'none';
          open = false;
        }
      });

      cardDiv.appendChild(tooltip);
      gallery.appendChild(cardDiv);
    });

    containers.forEach((c, i) => { c.innerHTML = ''; if (i === 0) c.appendChild(gallery); });
  }

  // === Menu config
  function createMenu() {
    if (document.getElementById('affiche-mode-menu-container')) return;
    const box = Object.assign(document.createElement('div'), {
      id: 'affiche-mode-menu-container',
      style: 'position:fixed;top:12px;right:12px;z-index:19999;background:#18181c;border:1px solid #444;border-radius:8px;padding:12px 18px 16px 18px;font-size:14px;box-shadow:0 2px 12px #000d;color:#fff;min-width:350px;'
    });
    const toggle = Object.assign(document.createElement('button'), {
      textContent: '🎬 Mode Affiches Alternatif',
      style: 'cursor:pointer;font-weight:bold;background:#309d98;color:#fff;border:none;border-radius:5px;padding:6px 12px;margin-bottom:8px;z-index:19999;'
    });
    toggle.addEventListener('click', () => { menu.style.display = menu.style.display === 'none' ? 'block' : 'none'; });
    const menu = Object.assign(document.createElement('div'), { style: 'display:none;margin-top:8px;z-index:20001;' });

    // Instances Usenet
    const usenetWrap = document.createElement('div');
    usenetWrap.style = "margin:12px 0 12px 0; padding:10px 7px 7px 7px; background:#212124; border-radius:7px;";
    usenetWrap.innerHTML = "<b style='color:#ffe388'>Instances :</b>";
    const types = ['radarr','radarr4k','sonarr','sonarr4k','overseerr','jellyseerr'];
    const inst = getInstances();
    types.forEach(t=>{
      const d = document.createElement('div');
      d.style = "margin:7px 0 7px 0;display:flex;align-items:center;";
      d.innerHTML = `<span style="display:inline-block;width:38px;height:38px;vertical-align:middle;margin-right:8px;">${getIcon(t)}</span>
        <input type="text" value="${inst[t]?.name||''}" placeholder="Nom" style="width:80px;margin-right:7px;background:#161618;color:#ffe388;border:1px solid #393;">
        <input type="text" value="${inst[t]?.url||''}" placeholder="URL" style="width:160px;margin-right:7px;background:#161618;color:#ffe388;border:1px solid #393;">
        <input type="text" value="${inst[t]?.apiKey||''}" placeholder="API Key" style="width:102px;background:#161618;color:#ffe388;border:1px solid #393;">`;
      const [name,url,key] = d.querySelectorAll('input');
      name.onchange = ()=>{inst[t]=inst[t]||{};inst[t].name=name.value;};
      url.onchange  = ()=>{inst[t]=inst[t]||{};inst[t].url=url.value;};
      key.onchange  = ()=>{inst[t]=inst[t]||{};inst[t].apiKey=key.value;};
      usenetWrap.appendChild(d);
    });
    let validBtn = document.createElement('button');
    validBtn.textContent = "Sauvegarder";
    validBtn.style = "margin-left:18px;margin-top:10px;background:#18c659;color:#222;font-weight:bold;border:none;border-radius:8px;padding:8px 24px;font-size:15px;cursor:pointer;box-shadow:0 2px 5px #1a7c43a0;";
    validBtn.onclick = () => { setInstances(inst); toast("Configuration instances enregistrée !", "success"); setTimeout(() => location.reload(), 500); };
    usenetWrap.appendChild(validBtn);
    menu.appendChild(usenetWrap);

    // === Sections à activer
    const conf = getSections();
    CATEGORIES.forEach(cat => {
      const wrapper = document.createElement('div');
      const cb = Object.assign(document.createElement('input'), { type: 'checkbox', id: `chk_${cat.key}`, checked: conf.includes(cat.key) });
      cb.addEventListener('change', () => {
        let newConf = getSections();
        if (cb.checked && !newConf.includes(cat.key)) newConf.push(cat.key);
        if (!cb.checked && newConf.includes(cat.key)) newConf = newConf.filter(x => x !== cat.key);
        setSections(newConf);
        location.reload();
      });
      const lab = Object.assign(document.createElement('label'), { textContent: cat.label, htmlFor: cb.id, style: 'margin-left:7px;color:#ffe388;' });
      wrapper.appendChild(cb); wrapper.appendChild(lab); menu.appendChild(wrapper);
    });

    // === TMDB
    const tmdbRow = document.createElement('div'); tmdbRow.style.marginTop = '14px';
    const cbTmdb  = Object.assign(document.createElement('input'), { type: 'checkbox', id: 'chk_tmdb', checked: showTmdb() });
    cbTmdb.addEventListener('change', () => { localStorage.setItem(STORAGE_SHOW_TMDB_KEY, cbTmdb.checked ? '1' : '0'); location.reload(); });
    const labTmdb = Object.assign(document.createElement('label'), { textContent: "Afficher la note TMDB sur l'affiche", htmlFor: cbTmdb.id, style: 'margin-left:7px;color:#ffe388;' });
    tmdbRow.appendChild(cbTmdb); tmdbRow.appendChild(labTmdb); menu.appendChild(tmdbRow);

    // === Taille affiche
    const sizeRow = Object.assign(document.createElement('div'), { textContent: 'Taille des affiches :', style: 'margin-top:14px;margin-bottom:2px;color:#ffe388;' });
    const sliderSize = Object.assign(document.createElement('input'), { type: 'range', min: '200', max: '360', step: '10', value: minW(), style: 'width:180px;vertical-align:middle;' });
    const spanSize   = Object.assign(document.createElement('span'), { textContent: ` ${minW()}px`, style: 'margin-left:8px;color:#ffe388;' });
    sliderSize.addEventListener('input', () => { spanSize.textContent = ` ${sliderSize.value}px`; });
    sliderSize.addEventListener('change', () => { localStorage.setItem(STORAGE_MINWIDTH_KEY, sliderSize.value); location.reload(); });
    menu.appendChild(sizeRow); menu.appendChild(sliderSize); menu.appendChild(spanSize);

    // === Police overlay
    const fontRow = Object.assign(document.createElement('div'), { textContent: 'Taille du texte (overlay) :', style: 'margin-top:16px;margin-bottom:2px;color:#ffe388;' });
    const sliderFont = Object.assign(document.createElement('input'), { type: 'range', min: '14', max: '28', step: '2', value: fontSz(), style: 'width:140px;vertical-align:middle;' });
    const spanFont   = Object.assign(document.createElement('span'), { textContent: ` ${fontSz()}px`, style: 'margin-left:8px;color:#ffe388;' });
    sliderFont.addEventListener('input', () => { spanFont.textContent = ` ${sliderFont.value}px`; document.querySelectorAll('.affiche-tooltip').forEach(d => d.style.fontSize = sliderFont.value + 'px'); });
    sliderFont.addEventListener('change', () => { localStorage.setItem(STORAGE_FONT_SIZE_KEY, sliderFont.value); location.reload(); });
    menu.appendChild(fontRow); menu.appendChild(sliderFont); menu.appendChild(spanFont);

    // === Option nouvel onglet releases
    const newTabRow = document.createElement('div'); newTabRow.style.marginTop = '14px';
    const cbNewTab  = Object.assign(document.createElement('input'), { type: 'checkbox', id: 'chk_newtab', checked: openReleasesInNewTab() });
    cbNewTab.addEventListener('change', () => { localStorage.setItem(STORAGE_RELEASE_NEWTAB_KEY, cbNewTab.checked ? '1' : '0'); location.reload(); });
    const labNewTab = Object.assign(document.createElement('label'), { textContent: "Ouvrir « Voir toutes les releases » dans un nouvel onglet", htmlFor: cbNewTab.id, style: 'margin-left:7px;color:#ffe388;' });
    newTabRow.appendChild(cbNewTab); newTabRow.appendChild(labNewTab); menu.appendChild(newTabRow);

    box.appendChild(toggle); box.appendChild(menu);
    document.body.appendChild(box);

    // Haut de page
    if (!document.getElementById('remonter-haut-btn')) {
      const up = Object.assign(document.createElement('button'), { id: 'remonter-haut-btn', textContent: '↑ Haut de page', style: 'position:fixed;bottom:22px;right:26px;background:#309d98;color:#fff;border:none;border-radius:6px;padding:8px 20px;font-weight:bold;font-size:16px;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,0.14);z-index:99999;' });
      up.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
      document.body.appendChild(up);
    }
  }

  // === Init
  function start() { createMenu(); transformAffiches(); }
  if (document.readyState !== 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);

})();
