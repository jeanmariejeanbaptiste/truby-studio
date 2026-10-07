/* =====================================================================
   TRUBY STUDIO — Accès réservé et sauvegarde Google Drive (version en ligne)
   Hors de claude.ai, l'outil ne s'ouvre qu'après « Continuer avec Google »
   avec un compte autorisé. Les projets sont alors enregistrés dans l'espace
   privé de l'application sur le Google Drive de la personne (appDataFolder :
   l'outil ne voit aucun autre fichier du Drive).
   Dans claude.ai, rien de tout cela : la page reste privée au compte claude.ai.
   ===================================================================== */
'use strict';

const Gate = (() => {
  const CFG = window.TRUBY_CONFIG || {};
  const SCOPE = 'openid email https://www.googleapis.com/auth/drive.appdata';
  const HINT_KEY = 'trubyStudio.gHint';
  let tokenClient = null, token = null, tokenExp = 0, email = '', pending = null, driveOk = true;

  const sha256 = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join('');
  function loadGis() {
    return new Promise((res, rej) => {
      if (window.google && google.accounts && google.accounts.oauth2) return res();
      const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = () => res(); s.onerror = () => rej(new Error('Impossible de joindre Google.'));
      document.head.appendChild(s);
    });
  }
  function screen(html) {
    let el = document.getElementById('gate');
    if (!el) { el = document.createElement('div'); el.id = 'gate'; document.body.appendChild(el); }
    el.innerHTML = `<div class="g-card"><div class="w-eyebrow">Atelier d'écriture · d'après John Truby</div><h1 class="w-title">Truby Studio</h1>${html}</div>`;
    return el;
  }
  /* demande un jeton (fenêtre Google) ; à appeler depuis un clic */
  function requestToken(prompt) {
    return new Promise((res, rej) => {
      pending = { res, rej };
      try { tokenClient.requestAccessToken({ prompt, login_hint: localStorage.getItem(HINT_KEY) || undefined }); } catch (e) { pending = null; rej(e); }
    });
  }
  async function signIn() {
    const t = await requestToken('');
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + t } });
    const info = r.ok ? await r.json() : {};
    const mail = String(info.email || '').trim().toLowerCase();
    const allowed = CFG.allowedEmailHashes || [];
    if (!mail || (allowed.length && !allowed.includes(await sha256(mail)))) {
      try { google.accounts.oauth2.revoke(t, () => {}); } catch (e) {}
      token = null; throw Object.assign(new Error('Ce compte Google n\'a pas accès à Truby Studio.'), { denied: true });
    }
    email = mail; try { localStorage.setItem(HINT_KEY, mail); } catch (e) {}
    return t;
  }

  /* point d'entrée : résout quand l'accès est accordé (ou tout de suite dans claude.ai) */
  function run() {
    if (window.claude || location.protocol === 'file:') return Promise.resolve(false); // claude.ai (privé) ou fichier ouvert sur son propre ordinateur
    document.documentElement.classList.add('gated');
    return new Promise(resolve => {
      if (!CFG.googleClientId) { screen('<p class="g-msg">Accès réservé. La connexion n\'est pas encore configurée.</p>'); return; }
      const show = (msg = '') => {
        const el = screen(`<p class="g-msg">Accès réservé. Connectez-vous pour retrouver vos projets.</p><button class="btn primary g-btn" id="gBtn">Continuer avec Google</button>${msg ? `<p class="g-err">${msg}</p>` : ''}<p class="g-note">Vos projets sont enregistrés dans votre Google Drive, dans un espace réservé à Truby Studio.</p>`);
        el.querySelector('#gBtn').onclick = async () => {
          try { await loadGis(); init(); await signIn(); document.getElementById('gate').remove(); document.documentElement.classList.remove('gated'); resolve(true); }
          catch (e) { show(e && e.denied ? e.message : (e && e.message) || 'Connexion impossible. Réessayez.'); }
        };
      };
      show();
    });
  }
  function init() {
    if (tokenClient) return;
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CFG.googleClientId, scope: SCOPE,
      callback: r => { const p = pending; pending = null; if (!p) return; if (r.error) return p.rej(new Error('Connexion refusée.')); token = r.access_token; tokenExp = Date.now() + (r.expires_in - 60) * 1000; driveOk = !google.accounts.oauth2.hasGrantedAllScopes || google.accounts.oauth2.hasGrantedAllScopes(r, 'https://www.googleapis.com/auth/drive.appdata'); p.res(token); },
      error_callback: e => { const p = pending; pending = null; if (p) p.rej(new Error(e && e.type === 'popup_closed' ? 'Fenêtre de connexion fermée.' : 'Connexion impossible. Réessayez.')); }
    });
  }
  const valid = () => token && Date.now() < tokenExp;

  /* ---------- Google Drive (appDataFolder) ---------- */
  const FILE = 'truby-projects.json';
  let fileId = null, ready = false, known = new Set(), queue = Promise.resolve(), status = 'off';
  const listeners = [];
  const setStatus = s => { status = s; listeners.forEach(f => f(s)); };
  async function api(url, opt = {}) {
    if (!valid()) { setStatus('expired'); throw Object.assign(new Error('expired'), { expired: true }); }
    const r = await fetch(url, { ...opt, headers: { ...(opt.headers || {}), Authorization: 'Bearer ' + token } });
    if (r.status === 401) { token = null; setStatus('expired'); throw Object.assign(new Error('expired'), { expired: true }); }
    if (!r.ok) throw new Error('Drive ' + r.status);
    return r;
  }
  async function readRemote() {
    if (!fileId) {
      const r = await api('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name)&q=' + encodeURIComponent(`name='${FILE}'`));
      const j = await r.json(); fileId = (j.files && j.files[0] && j.files[0].id) || null;
    }
    if (!fileId) return [];
    const r = await api(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
    try { const j = await r.json(); return Array.isArray(j.projects) ? j.projects : []; } catch (e) { return []; }
  }
  async function writeRemote(projects) {
    const body = JSON.stringify({ format: 'truby-studio-drive', savedAt: Date.now(), projects });
    if (fileId) { await api(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body }); return; }
    const boundary = 'truby' + Date.now();
    const multipart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: FILE, parents: ['appDataFolder'] })}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
    const r = await api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', { method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + boundary }, body: multipart });
    fileId = (await r.json()).id;
  }
  async function start(onLoaded) {
    if (window.claude || !valid()) return;
    if (!driveOk) { setStatus('nodrive'); return; }
    try {
      setStatus('sync');
      const remote = await readRemote();
      remote.forEach(p => known.add(p.id));
      ready = true; onLoaded(remote); setStatus('ok');
    } catch (e) { setStatus(e.expired ? 'expired' : 'error'); }
  }
  /* fusionne avec le Drive (un autre appareil a pu écrire) puis enregistre */
  function sync(local) {
    if (!ready) return;
    queue = queue.then(async () => {
      setStatus('sync');
      try {
        const localIds = new Set(local.map(p => p.id));
        const deleted = new Set([...known].filter(id => !localIds.has(id)));
        const remote = await readRemote();
        const byId = new Map();
        remote.forEach(p => { if (!deleted.has(p.id)) byId.set(p.id, p); });
        local.forEach(p => { const r = byId.get(p.id); if (!r || (p.updated || 0) >= (r.updated || 0)) byId.set(p.id, p); });
        const merged = [...byId.values()];
        await writeRemote(merged);
        known = new Set(merged.map(p => p.id));
        setStatus('ok');
        return merged.filter(p => !localIds.has(p.id));
      } catch (e) { setStatus(e.expired ? 'expired' : 'error'); return []; }
    });
    return queue;
  }
  async function reconnect() { try { await loadGis(); init(); await requestToken('consent'); if (!driveOk) { setStatus('nodrive'); return false; } setStatus('ok'); return true; } catch (e) { return false; } }

  return { run, start, sync, reconnect, get active() { return ready; }, get status() { return status; }, get email() { return email; }, onStatus(f) { listeners.push(f); } };
})();
window.Gate = Gate;
