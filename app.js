/* =====================================================================
   TRUBY STUDIO — application principale
   ===================================================================== */
'use strict';

const App = (() => {
  const T = window.TRUBY;
  const LS_KEY = 'trubyStudio.v1';
  const FILE_FORMAT = 'truby-studio-project';
  const SECTION_IDS = T.SECTIONS.map(s => s.id);

  let db = { projects: [], currentId: null };
  const ui = { keysOpen: {}, view: 'home', charId: null, charView: 'fiches', weaveView: 'liste', selScene: null, openScene: {}, allowed: {}, fileHandles: {}, filFilter: {} };

  /* ---------------- utilitaires ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const debounce = (fn, ms) => { let t; const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; d.flush = (...a) => { clearTimeout(t); fn(...a); }; d.cancel = () => clearTimeout(t); return d; };
  const filled = v => v != null && (Array.isArray(v) ? v.some(x => x && filled(x.text)) : typeof v === 'boolean' ? v : String(v).replace(/<[^>]*>/g, '').trim() !== '');
  const rankText = arr => (arr || []).filter(x => filled(x.text)).map(x => '- ' + String(x.text).trim() + (x.stars ? ' ' + '★'.repeat(x.stars) : '')).join('\n');
  const P = () => db.projects.find(p => p.id === db.currentId) || null;
  const capWords = s => s.replace(/(^|[\s\-'’])(\p{Ll})/gu, (m, a, b) => a + b.toLocaleUpperCase('fr'));
  const fmtDate = t => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const ICON = {
    copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>',
    chev: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><path d="M10.4 3.1l3.1-.1.5 2.4 1.9 1 2.2-1.1 2.1 2.3-1.2 2.1.5 2.1 2.3.8-.1 3.1-2.4.5-1 1.9 1.1 2.2-2.3 2.1-2.1-1.2-2.1.6-.8 2.2-3.1-.1-.5-2.3-1.9-1-2.2 1.1-2.1-2.3 1.2-2.1-.6-2.1-2.2-.8.1-3.1 2.3-.5 1-1.9-1.1-2.2 2.3-2.1 2.1 1.2 2.1-.6z"/><path d="M12.1 9.2c1.6 0 2.9 1.4 2.8 3-.1 1.5-1.4 2.8-3 2.7-1.5-.1-2.8-1.4-2.7-3 .1-1.6 1.4-2.8 2.9-2.7z"/></svg>',
    sortv: '<svg viewBox="0 0 24 24"><path d="M15.2 19.6c.1-4.9 0-10 .1-15.1M11.3 8.4c1.3-1.3 2.6-2.6 3.9-3.9 1.3 1.2 2.6 2.5 3.8 3.8M8.8 4.6c-.1 4.9 0 10-.1 15M4.9 15.6c1.3 1.3 2.6 2.6 3.8 3.9 1.3-1.3 2.6-2.5 3.9-3.8"/></svg>',
    hand: '<svg viewBox="0 0 24 24"><path d="M8.2 12.6V5.4c0-.9.7-1.5 1.4-1.5.8 0 1.4.6 1.4 1.5v5.9M11 10.9V4.1c0-.9.6-1.5 1.4-1.5s1.4.7 1.4 1.5v6.8M13.8 11V5.3c0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4v6.3M16.6 11.6V8.2c0-.8.6-1.4 1.4-1.4.8 0 1.3.6 1.3 1.4v5.6c0 4.2-2.9 7.4-6.9 7.4-2.6 0-4.4-1.2-5.8-3.4l-2.5-4.1c-.4-.7-.2-1.5.5-1.9.6-.4 1.4-.2 1.9.4l1.7 2.3"/></svg>',
    spark: '<svg viewBox="0 0 24 24"><path d="M12 3.2c.6 3.4 2.1 5.4 5.6 6.4-3.4.9-5 2.9-5.7 6.6-.6-3.6-2.2-5.6-5.7-6.5 3.5-1 5.2-3 5.8-6.5zM18.6 15.2c.3 1.5.9 2.3 2.3 2.7-1.4.4-2 1.2-2.4 2.8-.3-1.6-.9-2.4-2.3-2.8 1.4-.4 2.1-1.2 2.4-2.7z"/></svg>',
    info: '<svg viewBox="0 0 24 24"><path d="M12.1 3.2c4.9-.1 8.8 3.8 8.7 8.8-.1 4.8-4 8.7-8.9 8.6-4.8-.1-8.6-4-8.5-8.8.1-4.8 3.9-8.5 8.7-8.6z"/><path d="M12 10.6c.1 2 0 4.1.1 6.1M11.9 7.4l.1.2" stroke-width="2"/></svg>',
    eraser: '<svg viewBox="0 0 24 24"><path d="M14.6 4.3l5.2 5.1-8.9 9.2-5.4-.1-2.3-2.4c-.6-.6-.6-1.6 0-2.2z"/><path d="M9.1 9.9l5.3 5.2M10.9 18.5h9.4"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    grip: '<svg viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/></svg>',
    dup: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    merge: '<svg viewBox="0 0 24 24"><path d="M7 4v6a5 5 0 0 0 5 5h0a5 5 0 0 1 5 5M17 4v6"/></svg>',
    more: '<svg viewBox="0 0 24 24"><path d="M4 9h16M4 15h16"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
    file: '<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>',
    open: '<svg viewBox="0 0 24 24"><path d="M3 7h6l2 2h10v10H3z"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  /* ---------------- chemins de données ---------------- */
  function getP(obj, path) {
    let o = obj;
    for (const k of path.split('.')) {
      if (o == null) return undefined;
      o = Array.isArray(o) ? o.find(x => x.id === k) : o[k];
    }
    return o;
  }
  function setP(obj, path, val) {
    const ks = path.split('.');
    let o = obj;
    for (let i = 0; i < ks.length - 1; i++) {
      const k = ks[i];
      let n = Array.isArray(o) ? o.find(x => x.id === k) : o[k];
      if (n == null) { if (Array.isArray(o)) return false; n = {}; o[k] = n; }
      o = n;
    }
    if (Array.isArray(o)) return false;
    o[ks[ks.length - 1]] = val;
    return true;
  }

  /* ---------------- modèle ---------------- */
  function newProject(title = 'Sans titre', author = '') {
    return {
      id: uid(), title, author, created: Date.now(), updated: Date.now(), version: 1,
      progress: {}, premisse: { check: {}, souhaitsL: [], premissesL: [] }, rankSort: {},
      structure: { mode: '', order: 'chrono', barred: {}, data: {}, evenements: '' },
      characters: [], persoGlobal: { heroChecks: {}, coins: {} },
      debat: { actions: [], variations: {} }, univers: { nat: {} },
      symboles: { objets: [], persos: {} }, intrigue: { reveals: [], checks: {} },
      fils: [{ id: uid(), name: 'Intrigue principale', color: T.FIL_COLORS[0] }],
      scenes: [], prelude: [],
      script: { titlePage: true, title: title, author: author, contact: '', draft: '', numbered: true, font: 'Courier Prime', size: 12, lh: 1, mt: 2.5, mb: 2.5, ml: 3.5, mr: 2.5, char: 6, paren: 4.5, parenR: 4, dial: 3, dialR: 2.5, sep: ' – ', pageNumbers: true, memo: true, spell: true }
    };
  }
  function migrate(p) {
    const base = newProject(p.title, p.author);
    for (const k of Object.keys(base)) if (p[k] === undefined) p[k] = base[k];
    p.script = Object.assign({}, base.script, p.script || {});
    p.structure = Object.assign({}, base.structure, p.structure || {});
    ['premisse', 'persoGlobal', 'debat', 'univers', 'symboles', 'intrigue'].forEach(k => { p[k] = Object.assign({}, base[k], p[k] || {}); });
    if (!p.fils || !p.fils.length) p.fils = base.fils;
    if (!p.rankSort || typeof p.rankSort !== 'object') p.rankSort = {};
    [['souhaits', 'souhaitsL'], ['listePremisses', 'premissesL']].forEach(([o, n]) => {
      const pr = p.premisse; if (!Array.isArray(pr[n])) pr[n] = [];
      if (typeof pr[o] === 'string') { if (!pr[n].length) pr[n] = pr[o].split('\n').map(x => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean).map(text => ({ id: uid(), text, stars: 0 })); delete pr[o]; }
    });
    p.scenes.forEach(s => { s.persos = s.persos || []; s.build = s.build || {}; });
    /* anciens modes (7, 22, 22s, 7p) → choix unique 7 ou 22 */
    const st = p.structure; st.barred = st.barred || {}; st.data = st.data || {};
    if (st.on) {
      const on = st.on;
      if (st.mode === '22s') { st.mode = '22'; Object.keys(on).forEach(id => { if (on[id] === false && !T.MANDATORY22.includes(id)) st.barred[id] = true; }); }
      else if (st.mode === '7p') {
        const extra = T.STEPS.filter(x => !x.key && on[x.id] === true);
        if (extra.length) { st.mode = '22'; T.STEPS.forEach(x => { if (!x.key && on[x.id] !== true && !T.MANDATORY22.includes(x.id)) st.barred[x.id] = true; }); } else st.mode = '7';
      }
      if (st.mode === '7' && !Object.values(st.data).some(o => o && Object.values(o).some(filled))) st.mode = '';
      delete st.on;
    }
    if (!['', '7', '22'].includes(st.mode)) st.mode = '';
    return p;
  }
  function newScene(o = {}) { return Object.assign({ id: uid(), ie: 'INT.', lieu: '', moment: 'JOUR', action: '', step: '', fil: P()?.fils[0]?.id || '', persos: [], notes: '', build: {} }, o); }

  /* ---------------- persistance locale ---------------- */
  let storageOk = true;
  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) { const d = JSON.parse(raw); if (d && Array.isArray(d.projects)) db = d; }
    } catch (e) { storageOk = false; }
    db.projects.forEach(migrate);
  }
  const saveLocal = debounce(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(db)); storageOk = true; if (!(window.Cloud && Cloud.active) && !(window.Gate && Gate.active)) setSaveState('Enregistré dans le navigateur'); }
    catch (e) { storageOk = false; if (!window.Cloud || !Cloud.active) setSaveState('⚠ Stockage local indisponible — enregistrez le fichier projet'); }
    autoSaveFile(); cloudSyncLater();
  }, 400);
  const cloudSyncLater = debounce(() => {
    if (window.Cloud && Cloud.active) Cloud.sync(db.projects);
    if (window.Gate && Gate.active) Gate.sync(db.projects).then(extra => { if (extra && extra.length) { extra.forEach(p => db.projects.push(migrate(p))); try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch (e) {} if (ui.view === 'home') render(); } });
  }, 2000);
  const DRIVE_TXT = { sync: 'Synchronisation avec Google Drive…', ok: 'Enregistré dans votre Google Drive', error: '⚠ Sauvegarde Google Drive impossible — enregistrez le fichier projet', expired: '⚠ Session Google expirée — cliquez ici pour vous reconnecter', nodrive: '⚠ Accès Drive non autorisé — cliquez ici et cochez la case Google Drive' };
  const CLOUD_TXT = { sync: 'Synchronisation avec claude.ai…', ok: 'Enregistré sur votre compte claude.ai', error: '⚠ Sauvegarde claude.ai impossible — enregistrez le fichier projet', full: '⚠ Espace claude.ai plein — enregistrez le fichier projet' };
  function startCloud() {
    if (window.Gate && !window.claude) {
      Gate.onStatus(st => { if (DRIVE_TXT[st]) setSaveState(DRIVE_TXT[st]); const el = $('#saveState'); if (el) el.classList.toggle('clickable', st === 'expired' || st === 'nodrive'); });
      $('#saveState').addEventListener('click', async () => { const was = Gate.status; if ((was === 'expired' || was === 'nodrive') && await Gate.reconnect()) { if (was === 'nodrive') startCloudDrive(); else cloudSyncLater(); } });
      startCloudDrive();
    }
    if (window.Cloud) startClaudeCloud();
  }
  function startCloudDrive() {
    Gate.start(remote => {
      remote.forEach(rp => { const i = db.projects.findIndex(x => x.id === rp.id); if (i < 0) db.projects.push(migrate(rp)); else if ((rp.updated || 0) > (db.projects[i].updated || 0)) db.projects[i] = migrate(rp); });
      try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch (e) {}
      render(); Gate.sync(db.projects);
    });
  }
  function startClaudeCloud() {
    Cloud.onStatus(st => { if (CLOUD_TXT[st]) setSaveState(CLOUD_TXT[st]); });
    Cloud.start(remote => {
      let changed = false;
      remote.forEach(rp => {
        const i = db.projects.findIndex(x => x.id === rp.id);
        if (i < 0) { db.projects.push(migrate(rp)); changed = true; }
        else if ((rp.updated || 0) > (db.projects[i].updated || 0)) { db.projects[i] = migrate(rp); changed = true; }
      });
      if (changed) { try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch (e) {} render(); }
      Cloud.sync(db.projects);
    });
  }
  function setSaveState(t) { const el = $('#saveState'); if (el) el.textContent = t; }

  /* ---------------- historique global (Annuler / Rétablir) ---------------- */
  const hist = { stack: [], i: -1 };
  const snap = () => JSON.stringify({ projects: db.projects, currentId: db.currentId });
  function pushHistory() {
    const s = snap();
    if (hist.stack[hist.i] === s) return;
    hist.stack = hist.stack.slice(0, hist.i + 1);
    hist.stack.push(s);
    if (hist.stack.length > 200) hist.stack.shift();
    hist.i = hist.stack.length - 1;
    updateUndo();
  }
  const pushHistoryLater = debounce(pushHistory, 700);
  function updateUndo() {
    const u = $('#btnUndo'), r = $('#btnRedo');
    if (u) u.disabled = hist.i <= 0;
    if (r) r.disabled = hist.i >= hist.stack.length - 1;
  }
  function restore(s) {
    const d = JSON.parse(s);
    db.projects = d.projects; db.currentId = d.currentId;
    if (!P() && ui.view !== 'home') ui.view = 'home';
    saveLocal(); render(); updateUndo();
  }
  function undo() {
    if (window.Editor && ui.view === 'scenario') Editor.flush(true);
    pushHistoryLater.flush();
    if (hist.i <= 0) return toast('Rien à annuler');
    hist.i--; restore(hist.stack[hist.i]); toast('Action annulée', { redo: true });
  }
  function redo() {
    pushHistoryLater.cancel();
    if (hist.i >= hist.stack.length - 1) return toast('Rien à rétablir');
    hist.i++; restore(hist.stack[hist.i]); toast('Action rétablie');
  }
  /* changement de contenu (frappe) */
  function touched() {
    const p = P(); if (p) p.updated = Date.now();
    setSaveState('Modification…');
    saveLocal(); pushHistoryLater(); refreshMetersLater();
  }
  /* changement structurel (immédiat dans l'historique) */
  function commit(rerender = true) {
    const p = P(); if (p) p.updated = Date.now();
    pushHistoryLater.cancel(); pushHistory(); saveLocal();
    if (rerender) render();
  }

  /* ---------------- fichier projet (.truby) ---------------- */
  function projectFileBlob(p) {
    return new Blob([JSON.stringify({ format: FILE_FORMAT, version: 1, app: 'Truby Studio', savedAt: new Date().toISOString(), project: p }, null, 1)], { type: 'application/json' });
  }
  const safeName = s => (s || 'projet').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'projet';
  async function saveProjectFile(p = P(), saveAs = false) {
    if (!p) return;
    const blob = projectFileBlob(p);
    if (window.showSaveFilePicker && !window.claude) {
      try {
        let h = ui.fileHandles[p.id];
        if (!h || saveAs) {
          h = await window.showSaveFilePicker({ suggestedName: safeName(p.title) + '.truby', types: [{ description: 'Projet Truby Studio', accept: { 'application/json': ['.truby'] } }] });
          ui.fileHandles[p.id] = h;
        }
        const w = await h.createWritable(); await w.write(blob); await w.close();
        setSaveState('Enregistré · fichier ' + h.name);
        toast('Fichier projet enregistré : ' + h.name + ' (enregistrement automatique activé)');
        return;
      } catch (e) { if (e.name === 'AbortError') return; }
    }
    if (await download(blob, safeName(p.title) + '.truby')) toast('Fichier projet enregistré');
  }
  const autoSaveFile = debounce(async () => {
    const p = P(); if (!p) return; const h = ui.fileHandles[p.id]; if (!h) return;
    try { const w = await h.createWritable(); await w.write(projectFileBlob(p)); await w.close(); setSaveState('Enregistré · navigateur + ' + h.name); } catch (e) { /* permission retirée */ }
  }, 1500);
  let dlP = null;
  const ALLOWED_EXT = ['gif', 'png', 'jpg', 'jpeg', 'webp', 'mp4', 'webm', 'txt', 'json', 'md', 'docx', 'pptx', 'epub', 'csv', 'ttf', 'html', 'svg', 'pdf', 'xlsx', 'zip'];
  async function download(blob, name) {
    if (window.claude && typeof window.claude.use === 'function') {
      const dl = await (dlP || (dlP = window.claude.use('downloads').catch(() => null)));
      if (dl) {
        const ext = (name.split('.').pop() || '').toLowerCase();
        const fname = ALLOWED_EXT.includes(ext) ? name : name + (ext === 'truby' ? '.json' : '.txt');
        try { await dl.save({ filename: fname, data: blob }); return true; }
        catch (e) {
          const c = e && e.code;
          if (c === 'declined') return false;
          toast(c === 'rate_limited' ? 'Une fenêtre d\'enregistrement est déjà ouverte.' : c === 'too_large' ? 'Fichier trop volumineux pour être enregistré ici.' : 'Enregistrement de fichier impossible dans cette vue.', { alert: true });
          return false;
        }
      }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    return true;
  }
  async function openProjectFile(file, handle) {
    let data;
    try { data = JSON.parse(await file.text()); } catch (e) { return modalMsg('Fichier illisible', "Ce fichier n'est pas un projet Truby Studio valide."); }
    if (!data || data.format !== FILE_FORMAT || !data.project || !data.project.id) return modalMsg('Fichier non reconnu', "Seuls les fichiers projet créés par Truby Studio (.truby) peuvent être ouverts ici. Pour le Markdown ou le HTML, utilisez l'export.");
    const p = migrate(data.project);
    const existing = db.projects.find(x => x.id === p.id);
    const finish = proj => { db.currentId = proj.id; if (handle) ui.fileHandles[proj.id] = handle; ui.view = firstOpenSection(proj); commit(); toast('Projet « ' + proj.title + ' » ouvert'); };
    if (existing) {
      modal({ title: 'Ce projet existe déjà', html: `<p>« ${esc(existing.title)} » est déjà dans votre atelier (modifié le ${fmtDate(existing.updated)}). Le fichier date du ${fmtDate(p.updated)}.</p>`,
        actions: [{ label: 'Annuler' }, { label: 'Ouvrir comme copie', run: () => { p.id = uid(); p.title += ' (copie)'; db.projects.unshift(p); finish(p); } },
          { label: 'Remplacer par le fichier', cls: 'primary', run: () => { db.projects[db.projects.indexOf(existing)] = p; finish(p); } }] });
    } else { db.projects.unshift(p); finish(p); }
  }
  async function pickProjectFile() {
    if (window.showOpenFilePicker && !window.claude) {
      try { const [h] = await window.showOpenFilePicker({ types: [{ description: 'Projet Truby Studio', accept: { 'application/json': ['.truby', '.json'] } }] }); return openProjectFile(await h.getFile(), h); }
      catch (e) { if (e.name === 'AbortError') return; }
    }
    $('#fileInput').click();
  }

  /* ---------------- modales et toasts ---------------- */
  function modal({ title, html = '', actions = [{ label: 'Fermer' }], wide = false, onOpen }) {
    const root = $('#modalRoot');
    const back = document.createElement('div'); back.className = 'modal-back';
    back.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h2>${esc(title)}</h2><div class="m-body">${html}</div><div class="m-actions"></div></div>`;
    const close = () => { back.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    actions.forEach(a => {
      const b = document.createElement('button'); b.className = 'btn ' + (a.cls || ''); b.textContent = a.label;
      b.onclick = () => { const r = a.run ? a.run(back) : null; if (r !== false) close(); };
      $('.m-actions', back).appendChild(b);
    });
    back.addEventListener('mousedown', e => { if (e.target === back) close(); });
    document.addEventListener('keydown', onKey);
    root.appendChild(back);
    if (onOpen) onOpen(back, close);
    const f = $('input,textarea,select', back) || $('.m-actions .primary', back) || $('.m-actions button', back); if (f) f.focus();
    return close;
  }
  const modalMsg = (title, text) => modal({ title, html: `<p>${esc(text)}</p>` });
  function confirmBox(title, text, okLabel = 'Confirmer', danger = false) {
    return new Promise(res => modal({ title, html: `<p>${esc(text)}</p>`, actions: [{ label: 'Annuler', run: () => res(false) }, { label: okLabel, cls: danger ? 'primary' : 'primary', run: () => res(true) }] }));
  }
  /* notifications : seulement quand une action est impossible (les autres sont silencieuses) */
  function toast(msg, opt = {}) {
    if (!opt.alert) return;
    const el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = `<span>${esc(msg)}</span>`;
    if (opt.undo) { const b = document.createElement('button'); b.textContent = 'Annuler'; b.onclick = () => { undo(); el.remove(); }; el.appendChild(b); }
    if (opt.redo) { const b = document.createElement('button'); b.textContent = 'Rétablir'; b.onclick = () => { redo(); el.remove(); }; el.appendChild(b); }
    $('#toastRoot').appendChild(el);
    setTimeout(() => el.remove(), opt.undo ? 7000 : 3200);
  }
  async function copyText(text, label = 'Texte copié') {
    try { await navigator.clipboard.writeText(text); toast(label); return true; }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
      ta.remove(); if (!ok) toast('Copie impossible : sélectionnez le texte et faites Ctrl+C', { alert: true }); return ok;
    }
  }

  /* ---------------- progression ---------------- */
  /* structure : soit 7 étapes, soit 22 étapes (les deux partagent structure.data, mêmes identifiants) */
  const allSteps = p => p.structure.mode === '7' ? T.STEPS7 : p.structure.mode === '22' ? T.STEPS : [];
  const isBarred = (p, id) => p.structure.mode === '22' && !!(p.structure.barred || {})[id] && !T.MANDATORY22.includes(id);
  const structOn = (p, st) => allSteps(p).some(x => x.id === st.id) && !isBarred(p, st.id);
  const activeSteps = p => allSteps(p).filter(x => !isBarred(p, x.id));
  const stepDef = (p, id) => allSteps(p).find(x => x.id === id) || null;
  const stepLabel = (p, id) => { const s = stepDef(p, id); return s ? `${s.n}. ${s.title}` : ''; };
  function groupPaths(groups, base) {
    const out = [];
    const obj = getP(P(), base) || {};
    groups.forEach(g => (g.fields || []).forEach(f => { if (!f.showIf || f.showIf(obj)) out.push(base + '.' + f.k); }));
    return out;
  }
  function sectionPct(p, id) {
    let paths = [];
    if (id === 'premisse') paths = groupPaths(T.PREMISSE, 'premisse');
    else if (id === 'structure') activeSteps(p).forEach(s => s.f.forEach(f => { if (!['entrainement', 'intrigueSecondaire', 'doubleRetournement', 'revelationThematique', 'dilemme', 'desirAllie'].includes(f.k)) paths.push('structure.data.' + s.id + '.' + f.k); }));
    else if (id === 'personnages') {
      if (p.characters.length < 2) return Math.min(30, p.characters.length * 15);
      p.characters.forEach(c => ['faiblessePsy', 'faiblesseMorale', 'besoinPsy', 'besoinMoral', 'desir', 'valeurs'].forEach(k => paths.push('characters.' + c.id + '.' + k)));
      paths.push('persoGlobal.problemeMoral');
    }
    else if (id === 'debat') paths = groupPaths(T.DEBAT, 'debat');
    else if (id === 'univers') paths = groupPaths(T.UNIVERS, 'univers');
    else if (id === 'symboles') paths = groupPaths(T.SYMBOLES, 'symboles');
    else if (id === 'intrigue') paths = groupPaths(T.INTRIGUE, 'intrigue');
    else if (id === 'tissage') return p.scenes.length ? Math.round(100 * p.scenes.filter(s => filled(s.action)).length / p.scenes.length * Math.min(1, p.scenes.length / 10)) : 0;
    else if (id === 'scenario') return p.scenes.length ? Math.round(100 * p.scenes.filter(s => (s.blocks || []).some(b => b.t === 'dialogue' && filled(b.h))).length / p.scenes.length) : 0;
    else return 0;
    if (!paths.length) return 0;
    return Math.round(100 * paths.filter(x => filled(getP(p, x))).length / paths.length);
  }
  const firstOpenSection = p => SECTION_IDS.find(id => id !== 'export' && !p.progress[id]) || 'scenario';
  const refreshMetersLater = debounce(() => { renderSidebar(); updateMissingCount(); const m = $('.validate-bar .meter'); if (m && P()) { const v = sectionPct(P(), ui.view); m.querySelector('i').style.width = v + '%'; m.querySelector('span').textContent = v + ' % rempli'; } }, 500);

  /* ---------------- navigation guidée ---------------- */
  function go(id, force = false) {
    if (window.Editor && ui.view === 'scenario' && id !== 'scenario') Editor.flush(true);
    const p = P();
    if (id === 'home' || !p) { ui.view = 'home'; return render(); }
    ui.view = id; document.body.classList.remove('nav-open');
    render(); $('#main').scrollTop = 0;
  }
  function validateSection(id) {
    const p = P(); p.progress[id] = true;
    const idx = SECTION_IDS.indexOf(id);
    commit(false);
    const next = SECTION_IDS[idx + 1];
    toast('Étape « ' + T.SECTIONS[idx].short + ' » validée');
    if (next) go(next, true); else render();
  }

  /* ---------------- rendu général ---------------- */
  function render() {
    const p = P();
    $('#tbTitle').textContent = p ? p.title : 'Mes projets';
    document.title = p ? p.title + ' · Truby Studio' : 'Truby Studio';
    renderSidebar();
    const main = $('#main');
    main.className = 'main' + (ui.view === 'scenario' && p ? ' full' : '');
    document.body.classList.toggle('is-home', !p || ui.view === 'home');
    if (!p || ui.view === 'home') { main.innerHTML = renderHome(); afterRender(main); startHomeAnim(main); return; }
    const r = { premisse: renderPremisse, structure: renderStructure, personnages: renderPersonnages, debat: renderDebat, univers: renderUnivers, symboles: renderSymboles, intrigue: renderIntrigue, tissage: renderTissage, export: renderExport }[ui.view];
    if (ui.view === 'scenario') { Editor.render(main); return; }
    main.innerHTML = r ? r(p) : '';
    afterRender(main);
  }
  function afterRender(root) {
    $$('.rk-list', root).forEach(l => sortable(l, '.rk-row', '.rk-grip', ids => { const p = P(); const path = l.dataset.rkList; const arr = getP(p, path); const map = new Map(arr.map(x => [x.id, x])); const next = ids.map(i => map.get(i)).filter(Boolean); arr.splice(0, arr.length, ...next); delete p.rankSort[path]; commit(); }));
    requestAnimationFrame(() => { $$('textarea.in, textarea.act, table.cmp textarea, .row textarea', root).forEach(autosize); updateMissingCount(); });
  }
  function autosize(el) { el.style.height = 'auto'; el.style.height = (el.scrollHeight + 2) + 'px'; }

  function renderSidebar() {
    const sb = $('#sidebar'); const p = P();
    if (!p) {
      sb.innerHTML = `<div class="sb-label">Le processus de Truby</div>` + T.SECTIONS.map(s => `<div class="step" style="cursor:default"><span class="num">${s.n}</span><span class="lbl">${esc(s.short)}</span></div>`).join('') +
        `<div class="sb-foot">Créez ou ouvrez un projet pour commencer. L'outil vous guide étape par étape, dans l'ordre de « L'Anatomie du scénario ».</div>` + `<button class="step sb-settings" data-open-settings><span class="num">${ICON.gear}</span><span class="lbl">Paramètres</span></button>`;
      return;
    }
    const done = SECTION_IDS.filter(id => id !== 'export' && p.progress[id]).length;
    const curIdx = SECTION_IDS.indexOf(ui.view);
    const lastDone = Math.max(-1, ...SECTION_IDS.map((x, i) => p.progress[x] ? i : -1));
    sb.innerHTML = `<div class="sb-project"><div class="t">${esc(p.title)}</div><div class="m">${done} étape${done > 1 ? 's' : ''} validée${done > 1 ? 's' : ''} sur 9</div><div class="sb-progress"><i style="width:${Math.round(done / 9 * 100)}%"></i></div></div>
      <div class="sb-label">Processus d'écriture</div>` +
      T.SECTIONS.map((s, i) => {
        const pct = s.id === 'export' ? '' : sectionPct(p, s.id);
        const skipped = s.id !== 'export' && !p.progress[s.id] && (i < curIdx || i < lastDone);
        return `<button class="step ${ui.view === s.id ? 'on' : ''} ${p.progress[s.id] ? 'done' : ''} ${skipped ? 'skipped' : ''}" data-go="${s.id}" title="${esc(skipped ? s.title + ' — étape sautée, pas encore validée' : s.title)}">
          <span class="num">${p.progress[s.id] ? '✓' : s.n}</span><span class="lbl">${esc(s.id === 'structure' && p.structure.mode ? 'Structure · ' + p.structure.mode + ' étapes' : s.short)}</span>
          ${skipped ? '<span class="skip-mark" aria-label="étape sautée"></span>' : ''}<span class="pct">${pct === '' ? '' : pct + ' %'}</span></button>`;
      }).join('') +
      `<button class="step sb-settings" data-open-settings><span class="num">${ICON.gear}</span><span class="lbl">Paramètres</span></button><div class="sb-foot">Ctrl+Z / Ctrl+Y : annuler / rétablir · Ctrl+S : enregistrer le fichier .truby</div>`;
  }

  /* ---------------- composants de champs ---------------- */
  const REF_LABEL = { premisse: 'Prémisse', structure: 'Structure', characters: 'Personnages', persoGlobal: 'Personnages', debat: 'Débat moral', univers: 'Univers du récit', symboles: 'Symboles', intrigue: 'Intrigue' };
  function examplesHTML(ex) {
    if (!ex || !ex.length) return '';
    return `<button class="ex-toggle" data-ex aria-expanded="false">${ICON.chev}Exemples de Truby (${ex.length})</button>
      <ul class="examples" hidden>${ex.map(([w, t]) => `<li><b>${esc(w)}</b><i>${esc(t)}</i></li>`).join('')}</ul>`;
  }
  function fieldHTML(f, base, extra = {}) {
    const p = P(); const path = base + '.' + f.k;
    const v = getP(p, path) ?? '';
    const tag = f.cls === 'psy' ? '<span class="tag psy">Psychologique</span>' : f.cls === 'mor' ? '<span class="tag mor">Moral</span>' : '';
    let input;
    if (f.t === 'rank') return rankHTML(f, path, Array.isArray(v) ? v : []);
    if (f.t === 'select') input = `<select class="in" data-path="${path}" ${f.rerender ? 'data-rerender' : ''}>${f.opts.map(o => `<option value="${esc(o)}" ${o === v ? 'selected' : ''}>${esc(o || '— choisir —')}</option>`).join('')}</select>`;
    else if (f.t === 'line') input = `<input class="in" data-path="${path}" value="${esc(v)}" placeholder="${esc(f.ph || '')}">`;
    else input = `<textarea class="in ${f.big ? 'big' : ''}" data-path="${path}" rows="${f.rows || 2}" placeholder="${esc(f.ph || 'Écrivez ici…')}">${esc(v)}</textarea>`;
    let ref = '';
    if (f.ref) { const rv = getP(p, f.ref); if (filled(rv) && String(rv).trim() !== String(v).trim()) ref = `<div class="ref"><span><b>Déjà noté (${esc(REF_LABEL[f.ref.split('.')[0]] || '')}) :</b> ${esc(String(rv).slice(0, 400))}</span><button data-take="${f.ref}" data-to="${path}">Reprendre</button></div>`; }
    return `<div class="field ${f.cls || ''} ${f.wide || extra.wide ? 'wide' : ''} ${f.main ? 'f-main' : ''}">
      <div class="f-top"><div class="f-label">${tag}${esc(f.l)}</div><div class="f-tools">${f.ai === 'overlap' ? '<button class="pm-ai" data-ai-overlap title="Faire étudier vos deux listes par l\'IA">IA</button>' : ''}<button class="ic clr" data-clear="${path}" title="Effacer la case">${ICON.eraser}</button><button class="ic" data-copy="${path}" title="Copier le texte">${ICON.copy}</button></div></div>
      ${f.h ? `<div class="f-help">${esc(f.h)}</div>` : ''}${input}${f.meter ? meterHTML(v, path) + rateHTML(v) : ''}${f.ai === 'overlap' ? overlapHTML() : ''}${ref}${examplesHTML(f.ex)}</div>`;
  }
  /* indicateur d'efficacité de la prémisse : courte et en une seule phrase (Truby) */
  function premiseScore(v) {
    const t = String(v || '').trim(); if (!t) return null;
    const words = t.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
    const sentences = Math.max(1, t.split(/[.!?…]+(?:\s+|$)/).filter(x => x.trim()).length);
    let score = words <= 22 ? 0 : Math.min(1, (words - 22) / 18);
    score = Math.min(1, score + (sentences - 1) * 0.4);
    const label = score < 0.34 ? 'Efficace : courte, en une phrase' : score < 0.67 ? "Commence à s'allonger : resserrez" : 'Peu efficace : trop longue';
    return { words, sentences, score, label: label + (sentences > 1 ? ` · ${sentences} phrases au lieu d'une` : '') };
  }
  function meterHTML(v, path) {
    const r = premiseScore(v);
    const hue = r ? Math.round(120 * (1 - r.score)) : 0;
    return `<div class="pmeter ${r ? '' : 'pm-empty'}" data-meter-for="${path}" style="--h:${hue}"><div class="pm-bar"><i style="width:${r ? Math.max(8, Math.round(100 * (1 - r.score * 0.85))) : 0}%"></i></div><span class="pm-l">${r ? esc(r.label) : 'Écrivez votre prémisse en une seule phrase, courte.'}</span><span class="pm-n">${r ? r.words + ' mot' + (r.words > 1 ? 's' : '') : ''}</span><button class="pm-ai" data-ai-rate title="Faire noter la prémisse par l'IA (note sur 10)">IA</button></div>`;
  }
  /* note de la prémisse par l'IA (sur 10) : un appel court, sur demande */
  function rateHTML(v) {
    const r = ui.rate; if (!r) return '<div class="pm-rate" id="pmRate"></div>';
    if (r.busy) return '<div class="pm-rate" id="pmRate"><span class="pm-busy">Lecture de la prémisse…</span></div>';
    if (r.error) return `<div class="pm-rate err" id="pmRate">${esc(r.error)}</div>`;
    const stale = String(v || '').trim() !== r.text;
    return `<div class="pm-rate ${stale ? 'stale' : ''}" id="pmRate"><span class="pm-note" style="--h:${Math.round(12 * r.note)}">${r.note}<small>/10</small></span><span class="pm-avis">${esc(r.avis)}${r.conseil ? `<br><i>${esc(r.conseil)}</i>` : ''}${stale ? '<br><small>Note de la version précédente : cliquez sur « IA » pour noter à nouveau.</small>' : ''}</span><button class="ic" data-rate-close title="Masquer la note">${ICON.x}</button></div>`;
  }
  /* l'IA étudie les deux listes et propose les éléments qui se recoupent */
  function overlapHTML() {
    const r = ui.overlap; if (!r) return '<div class="ai-out" id="aiOverlap"></div>';
    if (r.busy) return '<div class="ai-out" id="aiOverlap"><span class="pm-busy">Lecture de vos deux listes…</span></div>';
    if (r.error) return `<div class="ai-out err" id="aiOverlap">${esc(r.error)}</div>`;
    return `<div class="ai-out" id="aiOverlap"><div class="ai-body"><ul>${r.elements.map(x => `<li>${esc(x)}</li>`).join('')}</ul>${r.commentaire ? `<p>${esc(r.commentaire)}</p>` : ''}<button class="btn sm" data-overlap-insert>${ICON.plus}Ajouter à la case</button></div><button class="ic" data-overlap-close title="Masquer">${ICON.x}</button></div>`;
  }
  async function studyOverlap() {
    const p = P(); const fmt = arr => (arr || []).filter(x => filled(x.text)).map(x => '- ' + String(x.text).trim() + (x.stars ? ` (${x.stars}/5)` : '')).join('\n');
    const a = fmt(p.premisse.souhaitsL), b = fmt(p.premisse.premissesL);
    if (!a && !b) return toast('Remplissez d\'abord la liste de souhaits ou de prémisses', { alert: true });
    const paint = () => { const el = $('#aiOverlap'); if (el) el.outerHTML = overlapHTML(); };
    ui.overlap = { busy: true }; paint();
    const system = "Méthode de John Truby (« L'Anatomie du scénario ») : en étudiant ensemble la liste de souhaits et la liste de prémisses d'un auteur, on repère les éléments qui reviennent (types de personnages, ton, genres, thèmes, périodes, situations) ; c'est, dans sa forme la plus brute, sa vision des choses. Les notes sur 5 indiquent ce que l'auteur préfère. Réponds UNIQUEMENT avec un objet JSON : {\"elements\": [\"3 à 6 éléments qui se recoupent, chacun en quelques mots\"], \"commentaire\": \"deux phrases maximum en français : ce que cela dit de la vision de l'auteur et une piste pour la prémisse\"}.";
    try {
      const res = await Settings.run([{ role: 'user', content: `Liste de souhaits :\n${a || '(vide)'}\n\nListe de prémisses :\n${b || '(vide)'}` }], { system, tier: 'quick', effort: 'faible', maxTokens: 400, cache: true });
      const m = res.text.match(/\{[\s\S]*\}/); const j = m ? JSON.parse(m[0]) : null;
      const els = j && Array.isArray(j.elements) ? j.elements.map(String).filter(Boolean).slice(0, 8) : [];
      if (!els.length) throw Object.assign(new Error('Réponse illisible : réessayez.'), { code: 'parse' });
      ui.overlap = { elements: els, commentaire: String(j.commentaire || '') };
    } catch (e) { ui.overlap = { error: Settings.errMsg(e) }; }
    paint();
  }
  async function ratePremise() {
    const v = String(getP(P(), 'premisse.premisse') || '').trim();
    if (!v) return toast('Écrivez d\'abord votre prémisse', { alert: true });
    const paint = () => { const el = $('#pmRate'); if (el) el.outerHTML = rateHTML(getP(P(), 'premisse.premisse')); };
    ui.rate = { busy: true }; paint();
    const system = "Tu évalues une prémisse de film selon John Truby (« L'Anatomie du scénario »). Critères : une seule phrase courte ; un événement déclencheur ; une indication sur le personnage principal ; une indication sur le dénouement ; un conflit et un désir clairs ; un potentiel de transformation du héros ; originalité. Réponds UNIQUEMENT avec un objet JSON : {\"note\": entier de 0 à 10, \"avis\": \"une phrase en français\", \"conseil\": \"une phrase en français pour l'améliorer\"}.";
    try {
      const res = await Settings.run([{ role: 'user', content: 'Prémisse : « ' + v + ' »' }], { system, tier: 'quick', effort: 'faible', maxTokens: 300, cache: true });
      const m = res.text.match(/\{[\s\S]*\}/); const j = m ? JSON.parse(m[0]) : null;
      const note = j ? Math.max(0, Math.min(10, Math.round(Number(j.note)))) : NaN;
      if (!j || !Number.isFinite(note)) throw Object.assign(new Error('Réponse illisible : réessayez.'), { code: 'parse' });
      ui.rate = { text: v, note, avis: String(j.avis || ''), conseil: String(j.conseil || '') };
    } catch (e) { ui.rate = { error: Settings.errMsg(e) }; }
    paint();
  }
  function updateMeter(path, v) { const m = $(`.pmeter[data-meter-for="${path}"]`); if (m) m.outerHTML = meterHTML(v, path); }
  /* listes classées : une ligne par élément, glisser-déposer, étoiles, corbeille */
  /* ordre affiché : manuel (ordre enregistré) ou par note, sans toucher à l'ordre manuel */
  const rankMode = path => (P().rankSort || {})[path] || 'manual';
  function rankOrdered(path, arr) {
    const mode = rankMode(path); if (mode === 'manual') return arr.slice();
    const idx = new Map(arr.map((x, i) => [x.id, i])); const dir = mode === 'asc' ? 1 : -1;
    return arr.slice().sort((a, b) => dir * ((a.stars || 0) - (b.stars || 0)) || idx.get(a.id) - idx.get(b.id));
  }
  /* glissement haut / bas des lignes qui changent de place (technique FLIP) */
  function animateRank(path, change) {
    const sel = `.rk-list[data-rk-list="${path}"] .rk-row`;
    const before = new Map($$(sel).map(r => [r.dataset.id, r.getBoundingClientRect().top]));
    change();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    $$(sel).forEach(r => {
      const old = before.get(r.dataset.id); if (old == null) return;
      const dy = old - r.getBoundingClientRect().top; if (!dy) return;
      r.style.transition = 'none'; r.style.transform = `translateY(${dy}px)`;
      requestAnimationFrame(() => requestAnimationFrame(() => { r.style.transition = 'transform .42s cubic-bezier(.2,.8,.25,1)'; r.style.transform = ''; r.addEventListener('transitionend', () => { r.style.transition = ''; }, { once: true }); }));
    });
  }
  function rankHTML(f, path, arr) {
    const mode = rankMode(path);
    const row = it => `<div class="rk-row" data-id="${it.id}"><button class="rk-grip" title="Glisser pour classer" aria-label="Déplacer">${ICON.grip}</button>
      <textarea class="in rk-text" rows="1" data-path="${path}.${it.id}.text" placeholder="${esc(f.ph || '')}" data-rk="${path}">${esc(it.text || '')}</textarea>
      <span class="rk-stars" role="group" aria-label="Note">${[1, 2, 3, 4, 5].map(n => `<button class="${(it.stars || 0) >= n ? 'on' : ''}" data-star="${path}" data-id="${it.id}" data-n="${n}" title="${n} étoile${n > 1 ? 's' : ''}" aria-label="${n} étoile${n > 1 ? 's' : ''}">★</button>`).join('')}</span>
      <button class="ic" data-rk-del="${path}" data-id="${it.id}" title="Supprimer">${ICON.trash}</button></div>`;
    return `<div class="field rank wide">
      <div class="f-top"><div class="f-label">${esc(f.l)} <span class="rk-count">${arr.filter(x => filled(x.text)).length || ''}</span></div><div class="f-tools"><span class="rk-sorts" role="group" aria-label="Ordre de la liste"><button class="ic rk-sortbtn ${mode !== 'manual' ? 'on' : ''} ${mode === 'asc' ? 'asc' : ''}" data-rk-sort="${path}" title="${mode === 'desc' ? 'Tri par note : du meilleur au pire (cliquer pour inverser)' : mode === 'asc' ? 'Tri par note : du pire au meilleur (cliquer pour inverser)' : 'Trier par note, du meilleur au pire'}" aria-pressed="${mode !== 'manual'}">${ICON.sortv}${mode !== 'manual' ? `<small>${mode === 'desc' ? '5→1' : '1→5'}</small>` : ''}</button><button class="ic rk-manual ${mode === 'manual' ? 'on' : ''}" data-rk-manual="${path}" title="Tri manuel (glisser-déposer)" aria-pressed="${mode === 'manual'}">${ICON.hand}</button></span><button class="ic clr" data-clear="${path}" title="Vider la liste">${ICON.eraser}</button><button class="ic" data-copy="${path}" title="Copier la liste">${ICON.copy}</button></div></div>
      ${f.h ? `<div class="f-help">${esc(f.h)}</div>` : ''}
      <div class="rk-list ${mode !== 'manual' ? 'auto' : ''}" data-rk-list="${path}">${rankOrdered(path, arr).map(row).join('')}</div>
      <button class="btn sm rk-add" data-rk-add="${path}">${ICON.plus}${esc((f.ph || 'Ajouter').replace('…', ''))}</button></div>`;
  }
  function rankAdd(path, after, text = '') {
    let arr = getP(P(), path); if (!Array.isArray(arr)) { arr = []; setP(P(), path, arr); }
    const it = { id: uid(), text, stars: 0 };
    const i = after ? arr.findIndex(x => x.id === after) : -1;
    arr.splice(i >= 0 ? i + 1 : arr.length, 0, it); commit();
    requestAnimationFrame(() => $(`.rk-row[data-id="${it.id}"] .rk-text`)?.focus());
  }
  function groupsHTML(groups, base, hooks = {}) {
    return groups.map(g => {
      let inner = '';
      const obj = getP(P(), base) || {};
      if (g.fields) inner += `<div class="fields ${g.cols === 3 ? 'cols3' : g.cols === 2 ? 'cols2' : ''}">${g.fields.filter(f => !f.showIf || f.showIf(obj)).map(f => fieldHTML(f, base)).join('')}</div>`;
      if (g.list) inner = listHTML(base + '.' + g.list, g.itemFields);
      if (hooks.pre && hooks.pre(g)) inner = hooks.pre(g) + inner;
      if (hooks.custom && hooks.custom(g)) inner = hooks.custom(g);
      return `<section class="group ${g.tone ? 'tone-' + g.tone : ''}">${g.eyebrow ? `<div class="g-eyebrow">${esc(g.eyebrow)}</div>` : ''}<h2>${esc(g.group)}</h2>${g.note ? `<p class="note">${esc(g.note)}</p>` : ''}${inner}${g.ex ? examplesHTML(g.ex) : ''}</section>`;
    }).join('');
  }
  function listHTML(path, itemFields) {
    const arr = getP(P(), path) || [];
    return `<div class="rows">${arr.length ? arr.map(it => `<div class="row" style="grid-template-columns:repeat(${itemFields.length},minmax(0,1fr)) auto">${itemFields.map(f => `<label>${esc(f.l)}<textarea class="in" rows="1" data-path="${path}.${it.id}.${f.k}">${esc(it[f.k] || '')}</textarea></label>`).join('')}<button class="ic" data-list-del="${path}" data-id="${it.id}" title="Supprimer">${ICON.trash}</button></div>`).join('') : `<div class="empty">Aucun élément pour l'instant.</div>`}</div>
      <button class="btn sm" style="margin-top:8px" data-list-add="${path}" data-keys="${itemFields.map(f => f.k).join(',')}">${ICON.plus}Ajouter</button>`;
  }
  function sectionHead(id, extra = '', titleHTML = '') {
    const s = T.SECTIONS.find(x => x.id === id); const open = !!ui.keysOpen[id];
    const info = s.keys.length ? `<button class="ic info ${open ? 'on' : ''}" data-keys-toggle="${id}" title="${open ? 'Masquer les points clefs' : 'Points clefs de Truby'}" aria-expanded="${open}">${ICON.info}</button>` : '';
    return `<div class="sec-head"><div><div class="eyebrow">Étape ${s.n}${s.ch ? ' · ' + esc(s.ch) : ''}</div><h1>${titleHTML || esc(s.title)}${info}</h1>${s.intro ? `<p class="sec-intro">${esc(s.intro)}</p>` : ''}</div><div class="sec-actions"><button class="btn sm" data-copy-section="${id}">${ICON.copy}Copier la section</button>${extra}</div></div>
      ${s.keys.length ? `<div class="keys" id="keys-${id}" ${open ? '' : 'hidden'}>${s.keys.map(k => `<div class="keybox"><b>Point clef</b>${esc(k)}</div>`).join('')}</div>` : ''}`;
  }
  /* ---- cases vides de la section affichée (hors IA) ---- */
  function findMissing() {
    const out = [];
    $$('#main .section .field').forEach(f => {
      if (f.closest('.stepcard.barred')) return;
      let empty;
      if (f.classList.contains('rank')) empty = !$$('.rk-text', f).some(t => t.value.trim());
      else { const c = $('textarea[data-path], input[data-path]:not([type=checkbox]), select[data-path]', f); if (!c) return; empty = !String(c.value || '').trim(); }
      if (!empty) return;
      const lbl = ($('.f-label', f) || {}).textContent || 'Case';
      const ctx = f.closest('.stepcard') ? $('.sc-t h3', f.closest('.stepcard')).textContent : (f.closest('.group') && $('h2', f.closest('.group')) ? $('h2', f.closest('.group')).textContent : '');
      out.push({ f, label: lbl.replace(/^(Psychologique|Moral)/, '').trim(), ctx });
    });
    return out;
  }
  function updateMissingCount() {
    const b = $('.miss-btn'); if (!b) return; const n = findMissing().length;
    b.textContent = n ? `${n} case${n > 1 ? 's' : ''} vide${n > 1 ? 's' : ''}` : 'Toutes les cases sont remplies';
    b.classList.toggle('all-ok', !n);
    const box = $('#missingBox'); if (box && !box.hidden) showMissing(false);
  }
  function showMissing(scroll = true) {
    const box = $('#missingBox'); if (!box) return; const list = findMissing();
    $$('#main .field.is-missing').forEach(f => f.classList.remove('is-missing'));
    list.forEach(m => m.f.classList.add('is-missing'));
    box.hidden = false;
    box.innerHTML = list.length ? `<div class="mb-head"><b>${list.length} case${list.length > 1 ? 's' : ''} encore vide${list.length > 1 ? 's' : ''}</b><span>Elles sont entourées en pointillés rouges. Cliquez pour y aller.</span><button class="ic" data-missing-close title="Masquer">${ICON.x}</button></div><div class="mb-list">${list.map((m, i) => `<button class="mb-item" data-missing-go="${i}">${m.ctx ? `<small>${esc(m.ctx)}</small>` : ''}${esc(m.label)}</button>`).join('')}</div>`
      : `<div class="mb-head ok"><b>Toutes les cases de la section sont remplies.</b><button class="ic" data-missing-close title="Masquer">${ICON.x}</button></div>`;
    box._list = list;
    if (scroll) box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  /* ---- analyse de la section par l'IA ---- */
  function sectionAiHTML(id) {
    const r = ui.secAi && ui.secAi.id === id ? ui.secAi : null; if (!r) return '<div class="ai-out sec-ai-out" id="secAi"></div>';
    if (r.busy) return '<div class="ai-out sec-ai-out" id="secAi"><span class="pm-busy">L\'IA relit la section…</span></div>';
    if (r.error) return `<div class="ai-out sec-ai-out err" id="secAi">${esc(r.error)}</div>`;
    const go = r.verdict === 'suite';
    return `<div class="ai-out sec-ai-out ${go ? 'go' : 'fix'}" id="secAi"><div class="ai-body"><div class="verdict">${go ? 'Vous pouvez passer à la suite' : 'À corriger avant de passer à la suite'}</div><p>${esc(r.commentaire)}</p>${r.corriger.length ? `<ul>${r.corriger.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${r.vides.length ? `<p class="vides">Cases vides : ${r.vides.map(esc).join(' · ')}</p>` : ''}</div><button class="ic" data-secai-close title="Masquer">${ICON.x}</button></div>`;
  }
  async function analyzeSection(id) {
    const p = P(); const paint = () => { const el = $('#secAi'); if (el) el.outerHTML = sectionAiHTML(id); };
    const vides = findMissing().map(m => (m.ctx ? m.ctx + ' › ' : '') + m.label);
    ui.secAi = { id, busy: true }; paint();
    const sec = T.SECTIONS.find(x => x.id === id);
    const system = `Tu es un lecteur exigeant formé à la méthode de John Truby (« L'Anatomie du scénario »). Tu relis la section « ${sec.title} » du dossier d'un auteur. Juge la qualité selon Truby (prémisse en une phrase avec événement déclencheur, personnage principal et dénouement ; principe directeur ; meilleur personnage ; conflit central « qui combat qui pour quoi » ; action principale unique ; F × A = T ; choix moral ; check-list des prémisses). Sois concret et bienveillant, cite ses mots. Réponds UNIQUEMENT avec un objet JSON : {"verdict": "suite" ou "corriger", "commentaire": "3 phrases maximum en français", "a_corriger": ["0 à 4 points précis à revoir"]}.`;
    const content = Exporter.sectionMD(p, id) + (vides.length ? `\n\nCases laissées vides : ${vides.join(' ; ')}` : '\n\nToutes les cases sont remplies.');
    try {
      const res = await Settings.run([{ role: 'user', content }], { system, tier: 'default', effort: 'moyen', maxTokens: 900, cache: true });
      const m = res.text.match(/\{[\s\S]*\}/); const j = m ? JSON.parse(m[0]) : null;
      if (!j || !j.commentaire) throw Object.assign(new Error('Réponse illisible : réessayez.'), { code: 'parse' });
      ui.secAi = { id, verdict: j.verdict === 'suite' ? 'suite' : 'corriger', commentaire: String(j.commentaire), corriger: (Array.isArray(j.a_corriger) ? j.a_corriger : []).map(String).slice(0, 5), vides: findMissing().map(m => m.label) };
    } catch (e) { ui.secAi = { id, error: Settings.errMsg(e) }; }
    paint();
  }
  function validateBar(id) {
    const p = P(); const pct = sectionPct(p, id); const s = T.SECTIONS.find(x => x.id === id); const next = T.SECTIONS[T.SECTIONS.indexOf(s) + 1];
    const ai = id === 'premisse' && Settings.cfg.ai.provider !== 'off';
    return `${ai ? `<div class="sec-ai"><button class="btn" data-ai-section="${id}">${ICON.spark}Analyser la section par l'IA</button><span class="f-help">L'IA relit toute la section, signale les cases vides et vous dit s'il vaut mieux corriger ou passer à la suite.</span></div>${sectionAiHTML(id)}` : ''}
      <div class="missing-box" id="missingBox" hidden></div>
      <div class="validate-bar"><div class="meter"><div class="bar"><i style="width:${pct}%"></i></div><span>${pct} % rempli</span><button class="btn sm ghost miss-btn" data-check-empty title="Montrer les cases encore vides de cette section">Cases vides</button></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${p.progress[id] ? `<span class="tag key" style="align-self:center">Étape validée</span><button class="btn" data-unvalidate="${id}">Rouvrir l'étape</button>${next ? `<button class="btn primary" data-go="${next.id}">Continuer : ${esc(next.short)} ${ICON.arrow}</button>` : ''}` :
        `<button class="btn ok" data-validate="${id}">${ICON.check}Valider « ${esc(s.short)} »${next ? ' et passer à « ' + esc(next.short) + ' »' : ''}</button>`}</div></div>`;
  }

  /* ---------------- Accueil / projets ---------------- */
  function renderHome() {
    const list = db.projects.slice().sort((a, b) => b.updated - a.updated);
    const steps = ['Faiblesses et besoin', 'Désir', 'Adversaire', 'Plan', 'Confrontation finale', 'Prise de conscience', 'Nouvel équilibre'];
    return `<div class="welcome">
      <header class="w-hero">
        <div class="w-eyebrow">Atelier d'écriture · d'après « L'Anatomie du scénario » de John Truby</div>
        <h1 class="w-title">Truby Studio</h1>
        <p class="w-lead">De la prémisse au scénario final, une étape après l'autre.</p>
      </header>
      <figure class="w-arc" aria-hidden="true">
        <svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet">
          <path class="w-arc-base" d="M30 200 C 120 210, 190 250, 280 236 S 430 150, 520 172 S 640 250, 720 196 S 860 60, 970 70"/>
          <path class="w-arc-ink" id="wArcPath" d="M30 200 C 120 210, 190 250, 280 236 S 430 150, 520 172 S 640 250, 720 196 S 860 60, 970 70"/>
          <g id="wArcDots">${steps.map((t, i) => `<g class="w-dot" style="--i:${i}"><circle r="6"/><text>${esc(t)}</text></g>`).join('')}</g>
        </svg>
        <figcaption>Les sept étapes clefs de la structure narrative</figcaption>
      </figure>
      <div class="w-type"><span class="w-film" id="wFilm"></span><span class="w-premise"><span id="wTyped"></span><i class="w-caret"></i></span></div>
      <div class="w-actions">
        <button class="btn primary w-main" data-new>${ICON.plus}Commencer une histoire</button>
        <button class="btn" data-open-file>${ICON.open}Ouvrir un fichier</button>
        <button class="btn ghost" data-sample>Découvrir l'exemple « Casablanca »</button>
      </div>
      ${storageOk ? '' : '<p class="w-warn">Le stockage du navigateur est indisponible : enregistrez régulièrement le fichier projet.</p>'}
      ${list.length ? `<section class="w-projects"><h2>Reprendre l'écriture</h2><div class="projects">${list.map(p => {
        const done = SECTION_IDS.filter(id => id !== 'export' && p.progress[id]).length;
        return `<div class="pcard" data-openp="${p.id}" tabindex="0" role="button"><h3>${esc(p.title)}</h3><p>${esc(p.premisse.premisse || 'Pas encore de prémisse.')}</p>
        <div class="pm"><span>${done}/9 étapes · ${p.scenes.length} scène${p.scenes.length > 1 ? 's' : ''} · ${fmtDate(p.updated)}</span><span class="acts">
        <button class="ic" data-prename="${p.id}" title="Renommer">${ICON.edit}</button><button class="ic" data-pdup="${p.id}" title="Dupliquer">${ICON.dup}</button><button class="ic" data-pfile="${p.id}" title="Enregistrer le fichier projet">${ICON.file}</button><button class="ic" data-pdel="${p.id}" title="Supprimer">${ICON.trash}</button></span></div></div>`;
      }).join('')}</div></section>` : ''}
      <footer class="w-foot">Glissez un fichier .truby n'importe où pour l'ouvrir · <button class="w-link" data-open-settings>Paramètres</button></footer>
    </div>`;
  }
  /* animations de l'accueil : l'arc du récit se dessine, les prémisses de Truby s'écrivent à la machine */
  let homeTimer = null;
  function startHomeAnim(root) {
    clearTimeout(homeTimer);
    const path = $('#wArcPath', root); if (!path) return;
    const len = path.getTotalLength(); path.style.setProperty('--len', len);
    const at = [0.03, 0.2, 0.37, 0.52, 0.66, 0.83, 0.985];
    $$('.w-dot', root).forEach((g, i) => {
      const pt = path.getPointAtLength(len * at[i]); g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      const tx = $('text', g); const above = [true, false, true, false, false, true, true][i]; tx.setAttribute('y', above ? -16 : 30); if (i === 5) tx.setAttribute('x', -14); tx.setAttribute('text-anchor', i === 0 ? 'start' : i >= 5 ? 'end' : 'middle');
    });
    const ex = ((T.PREMISSE.find(g => g.fields.some(f => f.k === 'premisse')) || { fields: [] }).fields.find(f => f.k === 'premisse') || {}).ex || [];
    const film = $('#wFilm', root), out = $('#wTyped', root); if (!ex.length || !out) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let k = 0, n = 0, phase = 'type';
    const tick = () => {
      if (!out.isConnected) return;
      const [title, text] = ex[k % ex.length];
      if (still) { film.textContent = title; out.textContent = text; k++; homeTimer = setTimeout(tick, 7000); return; }
      if (phase === 'type') { film.textContent = title; n++; out.textContent = text.slice(0, n); if (n >= text.length) { phase = 'hold'; homeTimer = setTimeout(tick, 3200); return; } homeTimer = setTimeout(tick, 32 + Math.random() * 40); return; }
      if (phase === 'hold') { phase = 'erase'; }
      if (phase === 'erase') { n = Math.max(0, n - 4); out.textContent = text.slice(0, n); if (!n) { phase = 'type'; k++; homeTimer = setTimeout(tick, 500); return; } homeTimer = setTimeout(tick, 14); }
    };
    tick();
  }
  function newProjectDialog() {
    modal({ title: 'Nouveau projet', html: `<label>Titre<input class="in" id="npTitle" placeholder="Titre de travail"></label><label>Auteur<input class="in" id="npAuthor" placeholder="Votre nom"></label>`,
      actions: [{ label: 'Annuler' }, { label: 'Créer le projet', cls: 'primary', run: back => {
        const p = newProject($('#npTitle', back).value.trim() || 'Sans titre', $('#npAuthor', back).value.trim());
        db.projects.unshift(p); db.currentId = p.id; ui.view = 'premisse'; commit();
      } }],
      onOpen: back => $('#npTitle', back).addEventListener('keydown', e => { if (e.key === 'Enter') $('.m-actions .primary', back).click(); }) });
  }
  function openProject(id) { db.currentId = id; const p = P(); ui.view = firstOpenSection(p); render(); saveLocal(); }

  /* ---------------- 1. Prémisse ---------------- */
  function renderPremisse(p) {
    return `<div class="section">${sectionHead('premisse')}${groupsHTML(T.PREMISSE, 'premisse')}
      <section class="group"><h2>Check-list des prémisses</h2><p class="note">Appliquez cette check-list à toute prémisse : elle vous dira si elle est inexploitable, ou comment l'améliorer.</p>
      <div class="checks">${T.CHECKLIST_PREMISSE.map(([k, t, s]) => `<label class="check ${p.premisse.check[k] ? 'on' : ''}"><input type="checkbox" data-path="premisse.check.${k}" ${p.premisse.check[k] ? 'checked' : ''}><span><span class="t">${esc(t)}</span>${s ? `<br><span class="s">${esc(s)}</span>` : ''}</span></label>`).join('')}</div></section>
      ${validateBar('premisse')}</div>`;
  }

  /* ---------------- 2. Structure (7 OU 22) ---------------- */
  const LOCK = ICON.lock;
  function structChoiceCard(k, chosen) {
    const S = T.STRUCTURES[k]; const list = k === '7' ? T.STEPS7 : T.STEPS;
    const locked = chosen && chosen !== k;
    return `<div class="struct-card ${chosen === k ? 'on' : ''} ${locked ? 'locked' : ''}">
      <div class="struct-top"><b>${esc(S.title)}</b>${chosen === k ? `<span class="tag key">${LOCK} Structure choisie</span>` : locked ? `<span class="tag opt">${LOCK} Verrouillée</span>` : ''}</div>
      <p class="struct-use">${esc(S.use)}</p>
      <ol class="struct-list ${k === '22' ? 'two' : ''}">${list.map(x => `<li class="${k === '22' && T.MANDATORY22.includes(x.id) ? 'must' : ''}">${esc(x.title)}</li>`).join('')}</ol>
      ${!chosen ? `<button class="btn primary" data-choose-mode="${k}">Choisir la ${esc(S.short.replace('étapes', 'étapes'))}</button>` : ''}</div>`;
  }
  function renderStructure(p) {
    const st = p.structure; const m = st.mode;
    if (!m) return `<div class="section">${sectionHead('structure', '', 'La structure narrative : <span class="n7">7</span> étapes ou <span class="n22">22</span> étapes')}
      <section class="group"><h2>Choisissez votre structure : c'est l'une ou l'autre</h2><p class="note">Une histoire se construit soit en <b>7 étapes</b>, soit en <b>22 étapes</b>. Ce choix engage tout l'outil : les étapes proposées ici, le rattachement des scènes du tissage, Claude et les exports suivront la structure choisie. La structure non choisie sera ensuite verrouillée.</p>
      <div class="struct-choice">${structChoiceCard('7', '')}${structChoiceCard('22', '')}</div>
      <p class="note" style="margin-top:10px">Dans la structure en 22 étapes, les étapes marquées d'un point sont obligatoires ; les autres pourront être barrées si elles ne sont pas nécessaires à votre histoire. Dans la structure en 7 étapes, aucune étape ne peut être barrée.</p></section></div>`;
    const S = T.STRUCTURES[m];
    let steps = allSteps(p).slice();
    if (st.order === 'truby') {
      const pri = m === '7' ? T.KEY_ORDER_TRUBY : ['cadre', 'priseConscience', 'decisionMorale', 'equilibre'];
      steps.sort((a, b) => { const ia = pri.indexOf(a.id), ib = pri.indexOf(b.id); if (ia >= 0 || ib >= 0) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); return a.n - b.n; });
    }
    const nOn = activeSteps(p).length, nBar = allSteps(p).length - nOn;
    const title = m === '7' ? 'La structure narrative : Les <span class="n7">7</span> étapes clés' : 'La structure narrative : Les <span class="n22">22</span> étapes approfondies';
    return `<div class="section struct-${m}">${sectionHead('structure', '', title)}
      <div class="struct-banner"><div><span class="tag key">${LOCK} ${esc(S.title)}</span><b>${esc(S.full)}</b><span>${m === '22' ? `${nOn} étape${nOn > 1 ? 's' : ''} retenue${nOn > 1 ? 's' : ''}${nBar ? ` · ${nBar} barrée${nBar > 1 ? 's' : ''}` : ''}. Barrez les étapes non nécessaires (sauf 3, 5, 7, 10, 19, 20 et 22).` : 'Les sept étapes sont toutes indispensables : aucune ne peut être barrée.'} La structure en ${m === '7' ? '22' : '7'} étapes est verrouillée.</span></div>
      <button class="btn sm" data-change-mode>${LOCK} Changer de structure…</button></div>
      <div class="order-switch"><span>Ordre de travail :</span><span class="seg"><button class="${st.order !== 'truby' ? 'on' : ''}" data-order="chrono">Chronologique</button><button class="${st.order === 'truby' ? 'on' : ''}" data-order="truby">Conseillé par Truby (commencer par la fin)</button></span></div>
      <section class="group events-list"><h2>Exercice d'écriture n° 2 — Événements</h2><p class="note">Décrivez quelques événements de l'histoire, chacun en une seule phrase (au minimum cinq, idéalement dix ou quinze), puis mettez-les dans l'ordre. Les sept étapes sont impliquées par l'idée même de l'histoire.</p>
      <div class="fields">${fieldHTML({ k: 'evenements', l: 'Événements (un par ligne)', t: 'area', rows: 5 }, 'structure')}</div>
      <button class="btn sm" style="margin-top:8px" data-events-to-scenes>Envoyer ces événements vers le tissage des scènes</button></section>
      ${steps.map(s => stepCardHTML(p, s)).join('')}
      ${validateBar('structure')}</div>`;
  }
  function stepCardHTML(p, s) {
    const m = p.structure.mode; const barred = isBarred(p, s.id);
    const must = m === '22' && T.MANDATORY22.includes(s.id);
    const tag = m === '7' ? `<span class="tag key">Étape ${s.n} sur 7</span>` : must ? `<span class="tag key">Étape ${s.n} · non barrable</span>` : `<span class="tag opt">Étape ${s.n} sur 22</span>`;
    const base = 'structure.data.' + s.id;
    let body = '';
    if (!barred) {
      const cols = s.grid || s.grid2 ? 'cols2' : (s.f.length >= 4 ? 'cols2' : '');
      body = `<div class="sc-body">${s.tech ? `<div class="tech"><b>Technique :</b> ${esc(s.tech)}</div>` : ''}${s.grid ? `<p class="f-help" style="margin-top:0">${esc(NEED_HELP_TXT)}</p>` : ''}<div class="fields ${cols}">${s.f.map(f => fieldHTML(f, base)).join('')}</div>${examplesHTML(s.ex)}</div>`;
    }
    const bar = m === '22' && !must ? `<button class="btn sm" data-bar="${s.id}">${barred ? 'Rétablir l\'étape' : 'Barrer l\'étape'}</button>` : '';
    return `<article class="stepcard ${must || m === '7' ? 'key' : ''} ${barred ? 'off barred' : ''}" id="step-${s.id}"><div class="sc-head"><span class="sc-n">${s.n}</span><div class="sc-t">${tag}<h3>${esc(s.title)}</h3>${barred ? '<p>Étape barrée : elle n\'apparaît plus dans le tissage, chez Claude ni dans les exports. Vos réponses sont conservées.</p>' : `<p>${esc(s.d)}</p>`}</div>${bar}</div>${body}</article>`;
  }
  function chooseMode(k) {
    const S = T.STRUCTURES[k];
    modal({ title: 'Choisir la ' + S.title.toLowerCase() + ' ?', html: `<p>${esc(S.use)}</p><p><b>Ce choix vous engage.</b> Tout l'outil suivra désormais la ${esc(S.title.toLowerCase())} : les étapes à remplir, le rattachement des scènes, Claude et les exports. La structure en ${k === '7' ? '22' : '7'} étapes sera verrouillée.</p>`,
      actions: [{ label: 'Annuler' }, { label: 'Choisir la ' + S.short, cls: 'primary', run: () => { P().structure.mode = k; commit(); } }] });
  }
  function changeMode() {
    const p = P(); const cur = p.structure.mode; const k = cur === '7' ? '22' : '7'; const S = T.STRUCTURES[k];
    const lost = k === '7' ? p.scenes.filter(sc => sc.step && !T.STEPS7.some(x => x.id === sc.step)).length : 0;
    modal({ title: 'Changer de structure ?', html: `<p>Vous avez choisi la <b>${esc(T.STRUCTURES[cur].title.toLowerCase())}</b>. Choisir une structure engage tout le projet : en changer est une décision lourde.</p>
      <ul><li>Les étapes proposées deviendront celles de la <b>${esc(S.title.toLowerCase())}</b>, avec leur nomenclature propre.</li><li>Vos réponses sont conservées : les étapes communes (faiblesse et besoin, désir, adversaire, plan, confrontation finale, prise de conscience, nouvel équilibre) gardent leur contenu.</li>${k === '7' ? `<li>${lost ? `<b>${lost} scène${lost > 1 ? 's' : ''}</b> du tissage rattachée${lost > 1 ? 's' : ''} à une étape absente des 7 perdra son étape.` : 'Aucune scène du tissage ne perdra son étape.'}</li>` : '<li>Les nouvelles étapes seront à remplir ; vous pourrez barrer celles qui ne sont pas nécessaires.</li>'}<li>Claude et les exports suivront la nouvelle structure.</li></ul>`,
      actions: [{ label: 'Garder ma structure' }, { label: k === '7' ? 'Passer aux 7 étapes clés' : 'Passer aux 22 étapes approfondies', cls: 'primary', run: () => { const pr = P(); pr.structure.mode = k; if (k === '7') pr.scenes.forEach(sc => { if (sc.step && !T.STEPS7.some(x => x.id === sc.step)) sc.step = ''; }); commit(); } }] });
  }
  const NEED_HELP_TXT = "Une faiblesse ou un besoin psychologique n'affecte que le héros ; une faiblesse ou un besoin moral affecte aussi les autres. Pour qu'il y ait besoin moral, il faut que le personnage blesse au moins une personne au début de l'histoire. Dotez votre héros des deux.";

  /* ---------------- 3. Personnages ---------------- */
  const AV_COLORS = ['#3b6fd8', '#c2410c', '#15803d', '#9333ea', '#b45309', '#0e7490', '#be123c', '#4d7c0f', '#475569'];
  function renderPersonnages(p) {
    const views = [['fiches', 'Fiches'], ['grille', 'Grille comparative'], ['coins', 'Opposition à quatre coins'], ['heros', 'Problème moral et héros']];
    if (!ui.charId || !p.characters.find(c => c.id === ui.charId)) ui.charId = p.characters[0]?.id || null;
    let body = '';
    if (ui.charView === 'fiches') body = charTabsHTML(p) + (ui.charId ? charCardHTML(p, p.characters.find(c => c.id === ui.charId)) : `<div class="empty" style="margin-top:14px">Commencez par le héros, puis l'adversaire principal : c'est la relation la plus importante de toute l'histoire.</div>`);
    else if (ui.charView === 'grille') body = compareHTML(p);
    else if (ui.charView === 'coins') body = cornersHTML(p);
    else body = heroGlobalHTML(p);
    return `<div class="section">${sectionHead('personnages')}
      <div class="chars-toolbar"><button class="btn primary" data-char-add>${ICON.plus}Ajouter un personnage</button><span class="seg">${views.map(([k, l]) => `<button class="${ui.charView === k ? 'on' : ''}" data-charview="${k}">${l}</button>`).join('')}</span></div>
      ${body}${validateBar('personnages')}</div>`;
  }
  function charTabsHTML(p) {
    return `<div class="char-tabs">${p.characters.map((c, i) => `<button class="char-tab ${c.id === ui.charId ? 'on' : ''}" data-char="${c.id}"><span class="av" style="background:${AV_COLORS[i % AV_COLORS.length]}">${esc((c.name || '?').trim().charAt(0).toUpperCase() || '?')}</span>${esc(c.name || 'Sans nom')}<small>${esc(c.role || '')}</small></button>`).join('')}</div>`;
  }
  function charCardHTML(p, c) {
    const base = 'characters.' + c.id;
    const arch = T.ARCHETYPES.find(a => a[0] === c.archetype) || T.ARCHETYPES[0];
    const isHero = c.role === 'Héros';
    const wbField = (k, cls, label, refK) => {
      const f = { k, l: label, t: 'area', cls, rows: 3, ref: isHero ? 'structure.data.faiblesse.' + refK : null,
        ex: (T.STEPS.find(s => s.id === 'faiblesse').ex || []) };
      return fieldHTML(f, base).replace('class="field', 'class="field');
    };
    return `<div class="charcard">
      <div class="char-head">
        <label>Nom<input class="in char-name" data-path="${base}.name" data-cap value="${esc(c.name || '')}" placeholder="Nom du personnage"></label>
        <label>Fonction dans l'histoire<select class="in" data-path="${base}.role">${T.ROLES.map(r => `<option ${r === c.role ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select></label>
        <label>Archétype<select class="in" data-path="${base}.archetype">${T.ARCHETYPES.map(a => `<option value="${a[0]}" ${a[0] === (c.archetype || '') ? 'selected' : ''}>${esc(a[1])}</option>`).join('')}</select></label>
        <div style="display:flex;gap:4px"><button class="ic" data-copy-char="${c.id}" title="Copier la fiche">${ICON.copy}</button><button class="ic" data-char-del="${c.id}" title="Supprimer ce personnage">${ICON.trash}</button></div>
      </div>
      <div class="arche-info">${T.ROLE_HELP[c.role] ? '<b>' + esc(c.role) + ' :</b> ' + esc(T.ROLE_HELP[c.role]) + ' ' : ''}${arch[2] ? `<b>${esc(arch[1])} —</b> force : ${esc(arch[2])} Faiblesses inhérentes : ${esc(arch[3])} <i>Spécifiez l'archétype pour qu'il ne devienne pas un stéréotype.</i>` : ''}</div>
      <div class="wb-grid">
        <div class="rh blank"></div><div class="hd psy">Psychologique<small>n'affecte que le personnage lui-même</small></div><div class="hd mor">Moral<small>blesse au moins une autre personne</small></div>
        <div class="rh">Faiblesses</div>${wbField('faiblessePsy', 'psy', 'Faiblesses psychologiques', 'faiblessePsy')}${wbField('faiblesseMorale', 'mor', 'Faiblesses morales', 'faiblesseMorale')}
        <div class="rh">Besoin</div>${wbField('besoinPsy', 'psy', 'Besoin psychologique', 'besoinPsy')}${wbField('besoinMoral', 'mor', 'Besoin moral', 'besoinMoral')}
      </div>
      <div class="fields cols2" style="margin-top:14px">${T.CHAR_FIELDS.map(f => fieldHTML(Object.assign({ t: 'area' }, f, isHero && f.k === 'desir' ? { ref: 'structure.data.desir.desir' } : {}), base)).join('')}</div></div>`;
  }
  function compareHTML(p) {
    if (!p.characters.length) return `<div class="empty" style="margin-top:14px">Ajoutez des personnages pour les comparer.</div>`;
    const cols = [['role', 'Fonction', ''], ['faiblessePsy', 'Faiblesses psychologiques', 'psy'], ['faiblesseMorale', 'Faiblesses morales', 'mor'], ['besoinPsy', 'Besoin psychologique', 'psy'], ['besoinMoral', 'Besoin moral', 'mor'], ['desir', 'Désir', ''], ['valeurs', 'Valeurs', ''], ['pouvoir', 'Pouvoir, statut, compétences', ''], ['approche', 'Approche du problème moral central', '']];
    return `<p class="note" style="margin-top:14px;color:var(--fg-2)">Comparez tous vos personnages entre eux, en commençant par le héros et son adversaire principal. Chacun doit présenter une approche différente du problème moral central.</p>
      <div class="cmp-wrap"><table class="cmp"><thead><tr><th>Personnage</th>${cols.map(c => `<th class="${c[2]}">${esc(c[1])}</th>`).join('')}</tr></thead><tbody>
      ${p.characters.map(c => `<tr><td class="name">${esc(c.name || 'Sans nom')}</td>${cols.map(([k]) => k === 'role' ? `<td style="padding:8px 10px">${esc(c.role || '')}</td>` : `<td><textarea data-path="characters.${c.id}.${k}" rows="2">${esc(c[k] || '')}</textarea></td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function cornersHTML(p) {
    const co = p.persoGlobal.coins || {};
    const pos = [['tl', 'Héros'], ['tr', 'Adversaire principal'], ['bl', 'Deuxième adversaire'], ['br', 'Troisième adversaire']];
    const corner = ([k, lbl]) => {
      const c = p.characters.find(x => x.id === co[k]);
      const arch = c ? (T.ARCHETYPES.find(a => a[0] === c.archetype) || T.ARCHETYPES[0])[1] : '';
      return `<div class="corner"><span class="cl">${lbl}</span><select class="in" data-path="persoGlobal.coins.${k}"><option value="">— choisir —</option>${p.characters.map(x => `<option value="${x.id}" ${x.id === co[k] ? 'selected' : ''}>${esc(x.name || 'Sans nom')}</option>`).join('')}</select>
        ${c ? `<div class="f-help">Archétype : ${esc(arch)}</div><textarea class="in" rows="2" data-path="characters.${c.id}.valeurs" placeholder="Valeurs de ${esc(c.name)}">${esc(c.valeurs || '')}</textarea><textarea class="in" rows="2" data-path="characters.${c.id}.attaque" placeholder="Comment attaque-t-il la faiblesse du héros ?">${esc(c.attaque || '')}</textarea>` : ''}</div>`;
    };
    return `<section class="group"><h2>L'opposition à quatre coins</h2><p class="note">Placez le héros et son principal adversaire en haut, au moins deux autres adversaires en bas. Poussez chacun dans son coin : rendez-les aussi différents que possible, surtout par leurs valeurs. Chaque personnage doit être en conflit avec le héros, mais aussi avec tous les autres.</p>
      <div class="corners">${pos.map(corner).join('')}</div>${examplesHTML([['Un tramway nommé Désir', 'Blanche [artiste] · Stanley [guerrier-roi] / Stella [mère] · Mitch [aucun]'], ['Hamlet', 'Hamlet [rebelle-prince] · Roi Claudius [roi] / Reine Gertrude [reine] · Polonius [mentor]'], ['La Cerisaie', "Mme Ranevsky (amour véritable, beauté, passé) · Lopakhine (argent, statut, avenir) / Varia (travail, famille) · Trofimov (vérité, apprentissage, compassion)"]])}</section>`;
  }
  function heroGlobalHTML(p) {
    const hc = p.persoGlobal.heroChecks || {};
    return `<section class="group"><h2>Problème moral central et transformation du héros</h2><div class="fields">${T.PERSO_GLOBAL.map(f => fieldHTML(f, 'persoGlobal')).join('')}</div></section>
      <section class="group"><h2>Caractéristiques d'un bon héros</h2><div class="checks">${T.HERO_CHECKS.map(([k, t, s]) => `<label class="check ${hc[k] ? 'on' : ''}"><input type="checkbox" data-path="persoGlobal.heroChecks.${k}" ${hc[k] ? 'checked' : ''}><span><span class="t">${esc(t)}</span>${s ? `<br><span class="s">${esc(s)}</span>` : ''}</span></label>`).join('')}</div></section>`;
  }

  /* ---------------- 4. Débat moral ---------------- */
  function renderDebat(p) {
    const variations = `<section class="group"><h2>Les personnages comme variations sur un même thème</h2><p class="note">En commençant par le héros et le principal adversaire, expliquez comment chaque personnage affronte le problème moral central de façon différente.</p>
      ${p.characters.length ? `<div class="fields cols2">${p.characters.map(c => fieldHTML({ k: c.id, l: (c.name || 'Sans nom') + (c.role ? ' — ' + c.role : ''), t: 'area', ref: 'characters.' + c.id + '.approche' }, 'debat.variations')).join('')}</div>` : '<div class="empty">Ajoutez des personnages à l\'étape 3.</div>'}
      ${examplesHTML([['Casablanca — Rick', "Pendant la plus grande partie de l'histoire, Rick ne se soucie que de lui-même."], ['Casablanca — Laszlo', 'Prêt à sacrifier n\'importe quoi, y compris son amour, pour mener le combat contre le fascisme.'], ['Casablanca — Renault', 'Un véritable opportuniste qui ne s\'intéresse qu\'à lui-même et à l\'argent.']])}</section>`;
    const gs = T.DEBAT.slice();
    return `<div class="section">${sectionHead('debat')}${groupsHTML(gs.slice(0, 1), 'debat')}${variations}${groupsHTML(gs.slice(1), 'debat')}${validateBar('debat')}</div>`;
  }

  /* ---------------- 5. Univers ---------------- */
  function renderUnivers(p) {
    const nat = p.univers.nat || {};
    const natHTML = `<div class="natural">${T.NATURAL.map(([k, t, s]) => `<label class="check ${nat[k] ? 'on' : ''}"><input type="checkbox" data-path="univers.nat.${k}" ${nat[k] ? 'checked' : ''}><span><span class="t">${esc(t)}</span><br><span class="s">${esc(s)}</span></span></label>`).join('')}</div>`;
    return `<div class="section">${sectionHead('univers')}${groupsHTML(T.UNIVERS, 'univers', { pre: g => g.natural ? natHTML : '' })}${validateBar('univers')}</div>`;
  }

  /* ---------------- 6. Symboles ---------------- */
  function renderSymboles(p) {
    const persos = p.characters.length ? `<p class="note">Rattachez à chaque personnage un symbole (divin, animal, mécanique, nom symbolique…) qui représente une caractéristique essentielle ou son contraire. Essayez une opposition de symboles au sein du personnage.</p><div class="fields cols2">${p.characters.map(c => `<div class="field"><div class="f-top"><div class="f-label">${esc(c.name || 'Sans nom')}</div><div class="f-tools"><button class="ic" data-copy="symboles.persos.${c.id}.symbole" title="Copier">${ICON.copy}</button></div></div>
      <select class="in" style="margin:6px 0" data-path="symboles.persos.${c.id}.type">${T.SYMBOL_TYPES.map(o => `<option ${o === (p.symboles.persos[c.id] || {}).type ? 'selected' : ''} value="${esc(o)}">${esc(o || '— type de symbole —')}</option>`).join('')}</select>
      <textarea class="in" rows="2" data-path="symboles.persos.${c.id}.symbole" placeholder="Symbole et ce qu'il révèle">${esc((p.symboles.persos[c.id] || {}).symbole || '')}</textarea></div>`).join('')}</div>${examplesHTML([['Le Parrain', 'Dieu et le diable : un homme-dieu vengeur.'], ['Un tramway nommé Désir', 'Stanley : cochon, taureau, singe, loup. Blanche : papillon de nuit, oiseau.'], ['Dickens', 'Ebenezer Scrooge, Uriah Heep, Tiny Tim (noms symboliques).']])}` : '<div class="empty">Ajoutez des personnages à l\'étape 3.</div>';
    return `<div class="section">${sectionHead('symboles')}${groupsHTML(T.SYMBOLES, 'symboles', { custom: g => g.persos ? persos : '' })}${validateBar('symboles')}</div>`;
  }

  /* ---------------- 7. Intrigue ---------------- */
  function renderIntrigue(p) {
    const auto = p.structure.mode === '22' ? ['rev1', 'rev2', 'revPublic', 'rev3'].map(id => { const s = T.STEPS.find(x => x.id === id); const v = (p.structure.data[id] || {}).revelation; return { s, v, on: structOn(p, s) }; }) : [];
    const reveals = `<p class="note">Intrigue = séquence de conflits + séquence de rebondissements-révélations. Isolez les rebondissements et vérifiez qu'ils vont crescendo.${p.structure.mode === '7' ? ' Votre histoire suit la structure en 7 étapes : notez ci-dessous ses rebondissements-révélations.' : ''}</p>
      <div class="rows">${auto.map(a => `<div class="row" style="grid-template-columns:minmax(0,1fr) auto"><div><span class="tag ${a.on ? 'key' : 'opt'}">Étape ${a.s.n}</span><b>${esc(a.s.title)}</b><div class="f-help" style="margin:4px 0 0">${a.v ? esc(a.v) : '<i>Non renseigné' + (a.on ? '' : ' (étape barrée)') + '</i>'}</div></div><button class="btn sm" data-goto-step="${a.s.id}">Ouvrir</button></div>`).join('')}</div>
      <h3 style="margin:16px 0 6px;font-size:15px">Rebondissements-révélations supplémentaires</h3>${listHTML('intrigue.reveals', [{ k: 'revelation', l: 'Rebondissement-révélation' }, { k: 'decision', l: 'Décision' }, { k: 'desir', l: 'Désir et motivations modifiés' }])}
      <div class="checks" style="margin-top:12px">${T.REVEAL_CHECKS.map(([k, t]) => `<label class="check ${p.intrigue.checks[k] ? 'on' : ''}"><input type="checkbox" data-path="intrigue.checks.${k}" ${p.intrigue.checks[k] ? 'checked' : ''}><span class="t">${esc(t)}</span></label>`).join('')}</div>`;
    return `<div class="section">${sectionHead('intrigue')}${groupsHTML(T.INTRIGUE, 'intrigue', { custom: g => g.reveals ? reveals : '' })}${validateBar('intrigue')}</div>`;
  }

  /* ---------------- 8. Tissage des scènes ---------------- */
  const stepOptions = (p, cur) => { const act = activeSteps(p); const extra = cur && !act.some(s => s.id === cur) ? `<option value="${esc(cur)}" selected disabled>${esc(stepLabel(p, cur) || 'Étape hors structure')} (barrée)</option>` : '';
    return `<option value="">${p.structure.mode ? '— étape —' : '— choisissez d\'abord une structure —'}</option>` + extra + act.map(s => `<option value="${s.id}" ${s.id === cur ? 'selected' : ''}>${s.n}. ${esc(s.title)}</option>`).join(''); };
  function headingOf(s, sep = ' – ') { return [s.ie, (s.lieu || '').trim()].filter(Boolean).join(' ') + (s.moment ? sep + s.moment : ''); }
  function renderTissage(p) {
    const filOf = id => p.fils.find(f => f.id === id) || p.fils[0];
    const visible = s => !ui.filFilter[s.fil];
    const list = ui.weaveView === 'liste' ? `<div class="scenes" id="sceneList">${p.scenes.map((s, i) => visible(s) ? sceneRowHTML(p, s, i, filOf(s.fil)) : '').join('') || `<div class="empty">Aucune scène. Écrivez l'action essentielle d'une scène dans le champ ci-dessus et appuyez sur Entrée. Un long métrage compte en moyenne quarante à soixante-dix scènes.</div>`}</div>`
      : `<div class="weave-board">${p.fils.map(f => `<div class="weave-col"><h4><i style="width:10px;height:10px;border-radius:50%;background:${f.color}"></i>${esc(f.name)}</h4>${p.scenes.map((s, i) => s.fil === f.id ? `<div class="minicard" style="--fil:${f.color}" data-board-scene="${s.id}"><b>${i + 1}. ${esc(headingOf(s) || 'Scène')}</b>${esc(s.action)}</div>` : '').join('')}</div>`).join('')}</div>`;
    return `<div class="section">${sectionHead('tissage')}
      <div class="weave-bar">
        <div class="quick-add"><input class="in" id="quickScene" placeholder="Nouvelle scène : l'action essentielle en une phrase (Entrée)… ex. « Michael sauve le Don d'une tentative d'assassinat à l'hôpital. »"><button class="btn primary" data-scene-add>${ICON.plus}Ajouter</button></div>
        <span class="seg"><button class="${ui.weaveView === 'liste' ? 'on' : ''}" data-weaveview="liste">Liste</button><button class="${ui.weaveView === 'fils' ? 'on' : ''}" data-weaveview="fils">Par intrigue</button></span>
      </div>
      <div class="filchips" style="margin-top:10px">${p.fils.map((f, i) => `<button class="filchip ${ui.filFilter[f.id] ? 'off' : ''}" data-fil-toggle="${f.id}" title="Afficher / masquer"><i style="background:${f.color}"></i>${i + 1}. ${esc(f.name)}</button>`).join('')}<button class="filchip" data-fil-add>${ICON.plus}Intrigue secondaire</button><button class="filchip" data-fil-manage>Renommer…</button></div>
      <p class="f-help" style="margin-top:8px">Glissez la poignée ⋮⋮ pour réordonner (souris ou tactile), ou Alt+↑ / Alt+↓ sur une scène. ${p.scenes.length} scène${p.scenes.length > 1 ? 's' : ''}.</p>
      ${list}
      ${examplesHTML([['Le Parrain (version finale)', "La version finale alterne la ligne de Sonny et celle de Michael en Sicile : l'histoire ne s'arrête pas, et les deux lignes convergent vers l'apparente défaite (mort de Sonny, puis d'Apollonia)."], ['Urgences — « La Valse-Hésitation »', "Cinq fils d'intrigue, tous variations sur la vérité et le mensonge, juxtaposés pour créer un choc de compréhension."]])}
      ${validateBar('tissage')}</div>`;
  }
  function sceneRowHTML(p, s, i, fil) {
    const open = ui.openScene[s.id];
    const b = 'scenes.' + s.id;
    return `<div class="scene ${ui.selScene === s.id ? 'sel' : ''}" data-scene-id="${s.id}" style="--fil:${fil ? fil.color : ''}" tabindex="-1">
      <button class="handle" title="Glisser pour déplacer" aria-label="Déplacer la scène ${i + 1}">${ICON.grip}</button>
      <div class="no">${i + 1}.</div>
      <div style="min-width:0">
        <div class="hd"><select data-path="${b}.ie">${['INT.', 'EXT.', 'INT./EXT.', ''].map(o => `<option ${o === s.ie ? 'selected' : ''} value="${o}">${o || '—'}</option>`).join('')}</select>
          <input class="lieu" data-path="${b}.lieu" value="${esc(s.lieu)}" placeholder="LIEU">
          <input data-path="${b}.moment" value="${esc(s.moment)}" list="momentsList" style="width:130px" placeholder="MOMENT"></div>
        <textarea class="act" rows="1" data-path="${b}.action" placeholder="Action essentielle de la scène, en une phrase">${esc(s.action)}</textarea>
        <div class="meta"><select data-path="${b}.step" title="Étape structurelle">${stepOptions(p, s.step)}</select>
          <select data-path="${b}.fil" title="Fil d'intrigue">${p.fils.map(f => `<option value="${f.id}" ${f.id === s.fil ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}</select>
          <span class="persos-chips">${p.characters.map(c => `<button class="pchip ${s.persos.includes(c.id) ? 'on' : ''}" data-scene-perso="${s.id}" data-c="${c.id}">${esc(c.name || '?')}</button>`).join('')}</span></div>
      </div>
      <div class="tools"><button class="ic" data-scene-open="${s.id}" title="Construction de la scène (ch. 10)" aria-expanded="${!!open}">${ICON.more}</button><button class="ic" data-scene-dup="${s.id}" title="Dupliquer">${ICON.dup}</button><button class="ic" data-scene-merge="${s.id}" title="Fusionner avec la scène suivante">${ICON.merge}</button><button class="ic" data-scene-del="${s.id}" title="Supprimer">${ICON.trash}</button></div>
      ${open ? `<div class="detail">${T.SCENE_BUILD.map(f => `<label>${esc(f.l)}<textarea class="in" rows="1" data-path="${b}.build.${f.k}">${esc(s.build[f.k] || '')}</textarea></label>`).join('')}<label style="grid-column:1/-1">Notes<textarea class="in" rows="2" data-path="${b}.notes">${esc(s.notes || '')}</textarea></label></div>` : ''}
    </div>`;
  }
  function parseHeading(text) {
    const t = text.replace(/^\s*\d+\s*[.)]\s*/, '').trim();
    const m = t.match(/^(INT\.?\s*\/\s*EXT\.?|EXT\.?\s*\/\s*INT\.?|INT\.?|EXT\.?|I\/E\.?)\s*(.*)$/i);
    let ie = '', rest = t;
    if (m) { ie = m[1].toUpperCase().replace(/\s/g, ''); if (!ie.endsWith('.')) ie += '.'; if (/^(INT\.?\/EXT|EXT\.?\/INT|I\/E)/.test(ie)) ie = 'INT./EXT.'; rest = m[2]; }
    const lead = rest.match(/^[-–—]\s*([^-–—]+)$/); if (lead) return { ie, lieu: '', moment: lead[1].trim().toUpperCase() };
    const mm = rest.match(/^(.*?)\s+[-–—]\s+([^-–—]+)$/);
    return mm ? { ie, lieu: mm[1].trim(), moment: mm[2].trim().toUpperCase() } : { ie, lieu: rest.replace(/\s*[-–—]\s*$/, '').trim(), moment: '' };
  }
  function addScene(text, afterId) {
    const p = P(); let o = { action: text };
    if (/^\s*(INT|EXT)/i.test(text)) { const h = parseHeading(text); o = { ie: h.ie, lieu: h.lieu, moment: h.moment || 'JOUR', action: '' }; }
    const s = newScene(o);
    const idx = afterId ? p.scenes.findIndex(x => x.id === afterId) + 1 : p.scenes.length;
    p.scenes.splice(idx || p.scenes.length, 0, s); ui.selScene = s.id;
    return s;
  }

  /* ---------------- tri par glisser-déposer (souris + tactile) ---------------- */
  function sortable(container, itemSel, handleSel, onDone) {
    container.addEventListener('pointerdown', e => {
      const h = e.target.closest(handleSel); if (!h || !container.contains(h)) return;
      const item = h.closest(itemSel); if (!item) return;
      e.preventDefault();
      item.classList.add('dragging');
      const scroller = container.closest('.main, .ed-nav') || document.scrollingElement;
      let lastY = e.clientY, raf;
      const move = ev => {
        lastY = ev.clientY;
        const sibs = [...container.querySelectorAll(itemSel)].filter(x => x !== item);
        for (const s of sibs) {
          const r = s.getBoundingClientRect();
          if (lastY > r.top && lastY < r.bottom) {
            if (lastY < r.top + r.height / 2) { if (item.nextElementSibling !== s) s.before(item); }
            else if (s.nextElementSibling !== item) s.after(item);
            break;
          }
        }
      };
      const auto = () => {
        const r = scroller.getBoundingClientRect();
        if (lastY < r.top + 50) scroller.scrollTop -= 12; else if (lastY > r.bottom - 50) scroller.scrollTop += 12;
        raf = requestAnimationFrame(auto);
      };
      raf = requestAnimationFrame(auto);
      const up = () => {
        cancelAnimationFrame(raf);
        item.classList.remove('dragging');
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
        onDone([...container.querySelectorAll(itemSel)].map(x => x.dataset.sceneId || x.dataset.id));
      };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    });
  }
  function reorderScenes(ids) {
    const p = P(); const map = new Map(p.scenes.map(s => [s.id, s]));
    const ordered = ids.map(id => map.get(id)).filter(Boolean);
    const rest = p.scenes.filter(s => !ids.includes(s.id)); // scènes masquées par un filtre : conservées à leur place relative en fin
    if (rest.length) {
      // réinsère les scènes filtrées selon leur position d'origine
      const out = []; let k = 0;
      p.scenes.forEach(s => { if (ids.includes(s.id)) out.push(ordered[k++]); else out.push(s); });
      p.scenes = out;
    } else p.scenes = ordered;
    commit();
  }

  /* ---------------- 10. Export ---------------- */
  function renderExport(p) {
    return `<div class="section">${sectionHead('export')}${Exporter.panelHTML(p)}</div>`;
  }
  function exportDialog() { if (!P()) return toast('Ouvrez d\'abord un projet', { alert: true }); modal({ title: 'Exporter', html: Exporter.panelHTML(P()), wide: true }); }

  /* ---------------- copie de sections ---------------- */
  function sectionText(id) { return Exporter.sectionMD(P(), id); }

  /* ---------------- événements ---------------- */
  function bind() {
    const main = $('#main');
    document.addEventListener('click', onClick);
    main.addEventListener('input', onInput);
    main.addEventListener('change', onChange);
    main.addEventListener('keydown', onMainKey);
    $('#btnHome').onclick = () => go('home');
    $('#btnUndo').onclick = undo; $('#btnRedo').onclick = redo;
    $('#btnSave').onclick = () => P() ? saveProjectFile() : pickProjectFile();
    $('#btnExport').onclick = exportDialog;
    $('#btnClaude').onclick = () => ClaudePanel.toggle();
    $('#btnTheme').onclick = () => Settings.toggleTheme();
    $('#btnSettings').onclick = () => Settings.open('ia');
    $('#fileInput').addEventListener('change', e => { const f = e.target.files[0]; if (f) openProjectFile(f); e.target.value = ''; });
    document.addEventListener('keydown', e => {
      const mod = e.ctrlKey || e.metaKey; if (!mod) return;
      const t = e.target; const inText = t.matches && (t.matches('input, textarea, select') || t.isContentEditable);
      const k = e.key.toLowerCase();
      if (k === 's') { e.preventDefault(); if (window.Editor && ui.view === 'scenario') Editor.flush(true); P() ? saveProjectFile(P(), e.shiftKey) : pickProjectFile(); }
      else if (k === 'o') { e.preventDefault(); pickProjectFile(); }
      else if (!inText && k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (!inText && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    });
    // glisser-déposer d'un fichier .truby
    let dragDepth = 0;
    window.addEventListener('dragenter', e => { if ([...(e.dataTransfer?.types || [])].includes('Files')) { dragDepth++; document.body.classList.add('dragover'); } });
    window.addEventListener('dragleave', () => { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) document.body.classList.remove('dragover'); });
    window.addEventListener('dragover', e => { if ([...(e.dataTransfer?.types || [])].includes('Files')) e.preventDefault(); });
    window.addEventListener('drop', e => { const f = e.dataTransfer?.files?.[0]; if (!f) return; e.preventDefault(); dragDepth = 0; document.body.classList.remove('dragover'); openProjectFile(f); });
    window.addEventListener('beforeunload', () => { if (window.Editor && ui.view === 'scenario') Editor.flush(true); try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch (e) {} });
  }
  /* les faiblesses, besoins et désir notés dans la structure préremplissent la fiche du héros */
  const HERO_SYNC = { 'structure.data.faiblesse.faiblessePsy': 'faiblessePsy', 'structure.data.faiblesse.faiblesseMorale': 'faiblesseMorale', 'structure.data.faiblesse.besoinPsy': 'besoinPsy', 'structure.data.faiblesse.besoinMoral': 'besoinMoral', 'structure.data.desir.desir': 'desir' };
  const heroOf = p => p.characters.find(c => c.role === 'Héros');
  function syncHero(p, k, v, old) {
    const h = heroOf(p); if (!h) return;
    if (!filled(h[k]) || String(h[k]).trim() === String(old || '').trim()) h[k] = v;
  }
  function fillHeroFromStructure(p, c) {
    if (!c || c.role !== 'Héros') return;
    Object.entries(HERO_SYNC).forEach(([path, k]) => { const v = getP(p, path); if (filled(v) && !filled(c[k])) c[k] = v; });
  }
  function onInput(e) {
    const el = e.target; const path = el.dataset.path; if (!path || !P()) return;
    if (el.type === 'checkbox') return;
    if (el.tagName === 'TEXTAREA') autosize(el);
    let v = el.value;
    if (el.hasAttribute('data-cap')) { const c = capWords(v); if (c !== v) { const s = el.selectionStart, en = el.selectionEnd; el.value = c; el.setSelectionRange(s, en); v = c; } }
    const old = getP(P(), path);
    setP(P(), path, v); touched();
    if (HERO_SYNC[path]) syncHero(P(), HERO_SYNC[path], v, old);
    if (path === 'premisse.premisse') updateMeter(path, v);
    if (el.dataset.rk) { const c = el.closest('.rank')?.querySelector('.rk-count'); if (c) { const n = getP(P(), el.dataset.rk).filter(x => filled(x.text)).length; c.textContent = n || ''; } }
    if (path.endsWith('.name') && path.startsWith('characters.')) { const tab = $(`.char-tab[data-char="${path.split('.')[1]}"]`); if (tab) { tab.childNodes[1].textContent = v || 'Sans nom'; tab.querySelector('.av').textContent = (v || '?').charAt(0).toUpperCase(); } }
    if (path === 'title') $('#tbTitle').textContent = v;
  }
  function onChange(e) {
    const el = e.target; const path = el.dataset.path; if (!P()) return;
    if (!path) return;
    if (el.type === 'checkbox') { setP(P(), path, el.checked); el.closest('.check')?.classList.toggle('on', el.checked); touched(); return; }
    if (el.tagName === 'SELECT') {
      setP(P(), path, el.value);
      if (/^characters\.[^.]+\.role$/.test(path)) fillHeroFromStructure(P(), P().characters.find(c => c.id === path.split('.')[1]));
      if (el.hasAttribute('data-rerender')) return commit();
      if (/^characters\.[^.]+\.(role|archetype)$/.test(path) || path.startsWith('persoGlobal.coins') || /^scenes\.[^.]+\.fil$/.test(path)) commit(); else touched();
    }
  }
  function onMainKey(e) {
    if (e.target.dataset && e.target.dataset.rk) {
      const el = e.target, path = el.dataset.rk, id = el.closest('.rk-row').dataset.id;
      if (e.key === 'Enter') { e.preventDefault(); return rankAdd(path, id); }
      if (e.key === 'Backspace' && !el.value) { e.preventDefault(); const arr = getP(P(), path); const i = arr.findIndex(x => x.id === id); const prev = arr[i - 1]; arr.splice(i, 1); commit(); return requestAnimationFrame(() => { const t = prev && $(`.rk-row[data-id="${prev.id}"] .rk-text`); if (t) { t.focus(); t.setSelectionRange(t.value.length, t.value.length); } }); }
      if ((e.key === 'ArrowDown' && el.selectionEnd < el.value.length) || (e.key === 'ArrowUp' && el.selectionStart > 0)) return;
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !e.altKey) { const rows = $$('.rk-text', el.closest('.rk-list')); const j = rows.indexOf(el) + (e.key === 'ArrowDown' ? 1 : -1); if (rows[j]) { e.preventDefault(); rows[j].focus(); } return; }
    }
    if (e.target.id === 'quickScene' && e.key === 'Enter') { e.preventDefault(); const v = e.target.value.trim(); if (!v) return; addScene(v, null); commit(); requestAnimationFrame(() => { const q = $('#quickScene'); q && q.focus(); const l = $('#sceneList'); if (l) l.lastElementChild?.scrollIntoView({ block: 'nearest' }); }); return; }
    const sc = e.target.closest && e.target.closest('.scene');
    if (sc && e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault(); const p = P(); const i = p.scenes.findIndex(s => s.id === sc.dataset.sceneId); const j = i + (e.key === 'ArrowUp' ? -1 : 1);
      if (j < 0 || j >= p.scenes.length) return; const [s] = p.scenes.splice(i, 1); p.scenes.splice(j, 0, s); ui.selScene = s.id; commit();
      requestAnimationFrame(() => $(`.scene[data-scene-id="${s.id}"] .act`)?.focus());
    }
  }
  async function onClick(e) {
    const t = e.target.closest('button, [data-openp], .check, .minicard'); if (!t) return;
    const d = t.dataset; const p = P();
    if (d.exp) return Exporter.onClick(t);
    if (d.go) { if (t.closest('.modal-back')) t.closest('.modal-back').remove(); return go(d.go); }
    if ('new' in d) return newProjectDialog();
    if ('openFile' in d) return pickProjectFile();
    if ('sample' in d) { const s = Sample.make(newProject); db.projects.unshift(s); db.currentId = s.id; ui.view = 'premisse'; commit(); return toast('Exemple chargé : vous pouvez le modifier librement'); }
    if (d.openp && !e.target.closest('.acts')) return openProject(d.openp);
    if (d.prename) { const pr = db.projects.find(x => x.id === d.prename); return modal({ title: 'Renommer le projet', html: `<label>Titre<input class="in" id="rnT" value="${esc(pr.title)}"></label><label>Auteur<input class="in" id="rnA" value="${esc(pr.author || '')}"></label>`, actions: [{ label: 'Annuler' }, { label: 'Renommer', cls: 'primary', run: b => { pr.title = $('#rnT', b).value.trim() || pr.title; pr.author = $('#rnA', b).value.trim(); pr.script.title = pr.script.title || pr.title; commit(); } }] }); }
    if (d.pdup) { const src = db.projects.find(x => x.id === d.pdup); const c = JSON.parse(JSON.stringify(src)); c.id = uid(); c.title += ' (copie)'; c.updated = Date.now(); db.projects.unshift(c); commit(); return toast('Projet dupliqué'); }
    if (d.pfile) return saveProjectFile(db.projects.find(x => x.id === d.pfile));
    if (d.pdel) { const pr = db.projects.find(x => x.id === d.pdel); const ok = await confirmBox('Supprimer le projet ?', `« ${pr.title} » sera retiré de votre atelier. Vous pourrez l'annuler immédiatement (bouton Annuler ou Ctrl+Z).`, 'Supprimer'); if (!ok) return; db.projects = db.projects.filter(x => x.id !== pr.id); if (db.currentId === pr.id) db.currentId = null; commit(); return toast('Projet supprimé', { undo: true }); }
    if ('ex' in d) { const ul = t.nextElementSibling; const open = t.getAttribute('aria-expanded') === 'true'; t.setAttribute('aria-expanded', String(!open)); ul.hidden = open; return; }
    if (d.copy) { const v = getP(p, d.copy); return copyText(Array.isArray(v) ? rankText(v) : filled(v) ? String(v) : '', filled(v) ? 'Texte copié' : 'Champ vide'); }
    if (d.copySection) return copyText(sectionText(d.copySection), 'Section copiée (Markdown)');
    if (d.copyChar) return copyText(Exporter.characterMD(p, p.characters.find(c => c.id === d.copyChar)), 'Fiche copiée');
    if (d.take) { const v = getP(p, d.take); setP(p, d.to, v); commit(); return toast('Texte repris'); }
    if (d.validate) return validateSection(d.validate);
    if (d.unvalidate) { p.progress[d.unvalidate] = false; return commit(); }
    if (d.chooseMode) return chooseMode(d.chooseMode);
    if ('changeMode' in d) return changeMode();
    if (d.bar) { const b = p.structure.barred; if (T.MANDATORY22.includes(d.bar)) return; if (b[d.bar]) delete b[d.bar]; else b[d.bar] = true; return commit(); }
    if (d.order) { p.structure.order = d.order; return commit(); }
    if (d.gotoStep) { ui.allowed[p.id + 'structure'] = true; ui.view = 'structure'; render(); return requestAnimationFrame(() => $('#step-' + d.gotoStep)?.scrollIntoView({ block: 'start' })); }
    if ('eventsToScenes' in d) { const lines = (p.structure.evenements || '').split('\n').map(x => x.replace(/^[-•*\d.)\s]+/, '').trim()).filter(Boolean); if (!lines.length) return toast('Écrivez d\'abord des événements, un par ligne', { alert: true }); lines.forEach(l => addScene(l)); commit(false); return toast(lines.length + ' scène(s) ajoutée(s) au tissage'); }
    if ('openSettings' in d) { document.body.classList.remove('nav-open'); return Settings.open('ia'); }
    if ('aiRate' in d) return ratePremise();
    if (d.aiSection) return analyzeSection(d.aiSection);
    if ('secaiClose' in d) { const id = ui.secAi && ui.secAi.id; ui.secAi = null; const el = $('#secAi'); if (el) el.outerHTML = sectionAiHTML(id); return; }
    if ('checkEmpty' in d) return showMissing();
    if ('missingClose' in d) { const box = $('#missingBox'); if (box) box.hidden = true; $$('#main .field.is-missing').forEach(f => f.classList.remove('is-missing')); return; }
    if (d.missingGo !== undefined) { const box = $('#missingBox'); const m = box && box._list && box._list[+d.missingGo]; if (!m || !m.f.isConnected) return showMissing(); m.f.scrollIntoView({ block: 'center', behavior: 'smooth' }); const c = $('textarea, input, select', m.f); const add = $('[data-rk-add]', m.f); setTimeout(() => { if (c) c.focus({ preventScroll: true }); else if (add) add.click(); }, 300); return; }
    if ('aiOverlap' in d) return studyOverlap();
    if ('overlapClose' in d) { ui.overlap = null; const el = $('#aiOverlap'); if (el) el.outerHTML = overlapHTML(); return; }
    if ('overlapInsert' in d) { const r = ui.overlap; if (!r || !r.elements) return; const cur = String(p.premisse.recoupements || '').trim(); p.premisse.recoupements = (cur ? cur + '\n' : '') + r.elements.map(x => '- ' + x).join('\n'); ui.overlap = null; return commit(); }
    if ('rateClose' in d) { ui.rate = null; const el = $('#pmRate'); if (el) el.outerHTML = rateHTML(''); return; }
    if (d.keysToggle) { const id = d.keysToggle; ui.keysOpen[id] = !ui.keysOpen[id]; const k = $('#keys-' + id); if (k) k.hidden = !ui.keysOpen[id]; t.classList.toggle('on', ui.keysOpen[id]); t.setAttribute('aria-expanded', ui.keysOpen[id]); t.title = ui.keysOpen[id] ? 'Masquer les points clefs' : 'Points clefs de Truby'; return; }
    if (d.clear) { const v = getP(p, d.clear); if (!filled(v)) return toast('La case est déjà vide'); if (Array.isArray(v)) v.splice(0, v.length); else setP(p, d.clear, typeof v === 'boolean' ? false : ''); commit(); return toast('Case effacée', { undo: true }); }
    if (d.rkAdd) return rankAdd(d.rkAdd);
    if (d.rkDel) { const arr = getP(p, d.rkDel); const i = arr.findIndex(x => x.id === d.id); if (i < 0) return; arr.splice(i, 1); commit(); return toast('Élément supprimé', { undo: true }); }
    if (d.star) { const it = getP(p, d.star).find(x => x.id === d.id); if (!it) return; const n = +d.n; const k = d.star; animateRank(k, () => { it.stars = it.stars === n ? n - 1 : n; commit(); }); return; }
    if (d.rkSort) { const k = d.rkSort; const cur = rankMode(k); animateRank(k, () => { p.rankSort[k] = cur === 'desc' ? 'asc' : 'desc'; commit(); }); return; }
    if (d.rkManual) { const k = d.rkManual; if (rankMode(k) === 'manual') return; animateRank(k, () => { delete p.rankSort[k]; commit(); }); return; }
    if (d.listAdd) { const arr = getP(p, d.listAdd); const it = { id: uid() }; d.keys.split(',').forEach(k => it[k] = ''); arr.push(it); return commit(); }
    if (d.listDel) { const arr = getP(p, d.listDel); const i = arr.findIndex(x => x.id === d.id); arr.splice(i, 1); commit(); return toast('Élément supprimé', { undo: true }); }
    // personnages
    if ('charAdd' in d) { const c = { id: uid(), name: '', role: p.characters.length === 0 ? 'Héros' : p.characters.length === 1 ? 'Adversaire principal' : 'Allié', archetype: '' }; fillHeroFromStructure(p, c); p.characters.push(c); ui.charId = c.id; ui.charView = 'fiches'; commit(); return requestAnimationFrame(() => $('.char-name')?.focus()); }
    if (d.char) { ui.charId = d.char; return render(); }
    if (d.charview) { ui.charView = d.charview; return render(); }
    if (d.charDel) { const c = p.characters.find(x => x.id === d.charDel); const ok = await confirmBox('Supprimer ce personnage ?', `« ${c.name || 'Sans nom'} » sera supprimé (annulable).`, 'Supprimer'); if (!ok) return; p.characters = p.characters.filter(x => x.id !== c.id); p.scenes.forEach(s => s.persos = s.persos.filter(x => x !== c.id)); commit(); return toast('Personnage supprimé', { undo: true }); }
    // tissage
    if ('sceneAdd' in d) { const q = $('#quickScene'); addScene(q.value.trim(), null); commit(); return requestAnimationFrame(() => $('#quickScene')?.focus()); }
    if (d.weaveview) { ui.weaveView = d.weaveview; return render(); }
    if (d.filToggle) { ui.filFilter[d.filToggle] = !ui.filFilter[d.filToggle]; return render(); }
    if ('filAdd' in d) { p.fils.push({ id: uid(), name: 'Intrigue secondaire ' + p.fils.length, color: T.FIL_COLORS[p.fils.length % T.FIL_COLORS.length] }); return commit(); }
    if ('filManage' in d) return modal({ title: 'Fils d\'intrigue', html: p.fils.map(f => `<label>Fil<input class="in" data-fil-name="${f.id}" value="${esc(f.name)}"></label>`).join(''), actions: [{ label: 'Annuler' }, { label: 'Enregistrer', cls: 'primary', run: b => { $$('[data-fil-name]', b).forEach(i => { const f = p.fils.find(x => x.id === i.dataset.filName); if (f) f.name = i.value.trim() || f.name; }); commit(); } }] });
    if (d.boardScene) { ui.weaveView = 'liste'; ui.selScene = d.boardScene; render(); return requestAnimationFrame(() => $(`.scene[data-scene-id="${d.boardScene}"]`)?.scrollIntoView({ block: 'center' })); }
    if (d.scenePerso) { const s = p.scenes.find(x => x.id === d.scenePerso); s.persos = s.persos.includes(d.c) ? s.persos.filter(x => x !== d.c) : [...s.persos, d.c]; t.classList.toggle('on'); return commit(false); }
    if (d.sceneOpen) { ui.openScene[d.sceneOpen] = !ui.openScene[d.sceneOpen]; return render(); }
    if (d.sceneDup) { const i = p.scenes.findIndex(x => x.id === d.sceneDup); const c = JSON.parse(JSON.stringify(p.scenes[i])); c.id = uid(); p.scenes.splice(i + 1, 0, c); return commit(); }
    if (d.sceneMerge) { const i = p.scenes.findIndex(x => x.id === d.sceneMerge); const a = p.scenes[i], b = p.scenes[i + 1]; if (!b) return toast('Pas de scène suivante'); a.action = [a.action, b.action].filter(Boolean).join(' '); a.blocks = [...(a.blocks || []), ...(b.blocks || [])]; a.persos = [...new Set([...a.persos, ...b.persos])]; p.scenes.splice(i + 1, 1); commit(); return toast('Scènes fusionnées', { undo: true }); }
    if (d.sceneDel) { p.scenes = p.scenes.filter(x => x.id !== d.sceneDel); commit(); return toast('Scène supprimée', { undo: true }); }
    if (t.classList.contains('scene')) { ui.selScene = t.dataset.sceneId; }
  }

  /* ---------------- démarrage ---------------- */
  function start() {
    load();
    const mt = document.createElement('button'); mt.className = 'tb-btn menu-toggle'; mt.title = 'Étapes'; mt.innerHTML = ICON.menu; mt.onclick = () => document.body.classList.toggle('nav-open');
    $('.tb-left').prepend(mt);
    $('#btnExport').innerHTML = $('#btnExport').innerHTML.replace('Exporter', '<span class="lbl">Exporter</span>');
    $('#btnClaude').innerHTML = $('#btnClaude').innerHTML.replace('Claude', '<span class="lbl">Claude</span>');
    Settings.applyTheme(); Settings.refreshUI(); startCloud();
    const dl = document.createElement('datalist'); dl.id = 'momentsList'; dl.innerHTML = T.MOMENTS.map(m => `<option value="${m}">`).join(''); document.body.appendChild(dl);
    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) {}
    bind();
    if (db.currentId && P()) ui.view = firstOpenSection(P()); else ui.view = 'home';
    pushHistory(); render();
    // le tri des scènes est attaché une fois au conteneur principal
    sortable($('#main'), '.scene', '.scene .handle', ids => reorderScenes(ids));
    setSaveState(storageOk ? 'Enregistré dans le navigateur' : '⚠ Stockage local indisponible');
  }

  return { start, P, ui, $, $$, esc, uid, getP, setP, filled, debounce, touched, commit, render, go, toast, modal, confirmBox, copyText, download, autosize, sortable, structOn, activeSteps, stepDef, stepLabel, headingOf, parseHeading, newScene, addScene, saveProjectFile, safeName, ICON, capWords, sectionPct, examplesHTML, get db() { return db; } };
})();
