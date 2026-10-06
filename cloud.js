/* =====================================================================
   TRUBY STUDIO — Sauvegarde sur le compte claude.ai
   Quand l'outil est ouvert comme artefact dans claude.ai, chaque projet est
   aussi enregistré dans l'espace privé de la personne (capacités « db » et
   « user ») : vider le navigateur ne fait plus rien perdre, et on retrouve
   ses projets sur un autre appareil en se connectant à claude.ai.
   Ailleurs (fichier HTML, GitHub Pages), ce module ne fait rien.
   ===================================================================== */
'use strict';

const Cloud = (() => {
  const CHUNK = 180000;              // caractères par document (limite 256 Kio)
  let col = null, ready = false, status = 'off';
  const known = new Map();           // id de projet → { updated, chunks } présents sur le compte
  let queue = Promise.resolve();
  const listeners = [];
  const setStatus = s => { status = s; listeners.forEach(f => f(s)); };

  async function start(onLoaded) {
    if (!(window.claude && typeof window.claude.use === 'function')) return;
    try {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user) return;
      const uid = await user.id(); if (!uid) return;
      col = db.collection('data/users/' + uid);
      setStatus('sync');
      const snap = await col.get();
      const metas = {}, chunks = {};
      snap.docs.forEach(d => { const v = d.data() || {}; if (v.kind === 'meta') metas[d.id] = v; else if (v.kind === 'chunk') chunks[d.id] = v.s || ''; });
      const projects = [];
      for (const [pid, m] of Object.entries(metas)) {
        let json = ''; for (let i = 0; i < (m.chunks || 0); i++) json += chunks[pid + '__c' + i] || '';
        try { const p = JSON.parse(json); if (p && p.id) { projects.push(p); known.set(pid, { updated: m.updated || 0, chunks: m.chunks || 0 }); } } catch (e) { /* projet incomplet : ignoré */ }
      }
      ready = true;
      onLoaded(projects);
      setStatus('ok');
    } catch (e) { setStatus('error'); }
  }

  async function writeProject(p) {
    const json = JSON.stringify(p); const n = Math.max(1, Math.ceil(json.length / CHUNK));
    for (let i = 0; i < n; i++) await col.doc(p.id + '__c' + i).set({ kind: 'chunk', s: json.slice(i * CHUNK, (i + 1) * CHUNK) });
    const prev = known.get(p.id);
    if (prev) for (let i = n; i < prev.chunks; i++) await col.doc(p.id + '__c' + i).delete();
    await col.doc(p.id).set({ kind: 'meta', title: String(p.title || '').slice(0, 200), updated: p.updated || Date.now(), chunks: n });
    known.set(p.id, { updated: p.updated || 0, chunks: n });
  }
  async function removeProject(pid) {
    const prev = known.get(pid); if (!prev) return;
    await col.doc(pid).delete();
    for (let i = 0; i < prev.chunks; i++) await col.doc(pid + '__c' + i).delete();
    known.delete(pid);
  }

  /* compare l'atelier local au compte et envoie les différences, une écriture à la fois */
  function sync(projects) {
    if (!ready) return;
    queue = queue.then(async () => {
      const local = new Set(projects.map(p => p.id));
      const todo = projects.filter(p => { const k = known.get(p.id); return !k || k.updated !== (p.updated || 0); });
      const gone = [...known.keys()].filter(id => !local.has(id));
      if (!todo.length && !gone.length) return;
      setStatus('sync');
      try {
        for (const p of todo) await writeProject(JSON.parse(JSON.stringify(p)));
        for (const id of gone) await removeProject(id);
        setStatus('ok');
      } catch (e) { setStatus(e && e.code === 'quota_exceeded' ? 'full' : 'error'); }
    });
    return queue;
  }

  return { start, sync, get active() { return ready; }, get status() { return status; }, onStatus(f) { listeners.push(f); } };
})();
window.Cloud = Cloud;
