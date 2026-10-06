/* =====================================================================
   TRUBY STUDIO — Panneau de l'assistant IA
   Claude (compte claude.ai) ou une autre IA par API, selon les Paramètres.
   L'IA lit le projet et propose des modifications que l'auteur valide.
   ===================================================================== */
'use strict';

const ClaudePanel = (() => {
  const A = App; const T = window.TRUBY; const esc = A.esc;
  const chats = {}; // par projet : { turns: [{role, content}], view: [{role, text, proposals}] }
  let busy = false, ctl = null, live = null;
  const NAME = () => Settings.providerName();
  const chat = () => { const p = A.P(); const id = p ? p.id : '_'; return chats[id] || (chats[id] = { turns: [], view: [] }); };

  /* ---------- format des propositions ---------- */
  const FENCE = '```propositions';
  const FORMAT = `Format de réponse :
Réponds en texte simple (pas de titres Markdown lourds), en français. Si tu proposes des changements concrets au projet, termine ta réponse par UN SEUL bloc de code dont la première ligne est exactement ${FENCE} et qui contient un objet JSON valide, puis \`\`\`. N'inclus le bloc que s'il y a au moins une proposition. Toutes les clés sont facultatives :
{
  "modifications": [{"chemin": "chemin exact de la liste, ex. premisse.principe ou characters.<id>.besoinMoral", "valeur": "nouveau texte complet du champ", "raison": "pourquoi, en une phrase, avec les termes de Truby"}],
  "personnages": [{"nom": "", "fonction": "une de : ${T.ROLES.join(' | ')}", "faiblessePsy": "", "faiblesseMorale": "", "besoinPsy": "", "besoinMoral": "", "desir": "", "valeurs": ""}],
  "scenes": [{"ie": "INT. | EXT. | INT./EXT.", "lieu": "", "moment": "", "action": "l'action essentielle en une phrase", "etape": "identifiant d'étape de la structure choisie, ou chaîne vide", "apres_scene": 0}],
  "ecrire_scene": {"scene_id": "identifiant d'une scène existante", "blocs": [{"type": "action | character | paren | dialogue | transition | shot", "texte": ""}]}
}
apres_scene = numéro de la scène après laquelle insérer (0 = au début, -1 = à la fin).`;
  function splitAnswer(text) {
    const i = text.indexOf(FENCE);
    if (i < 0) { const k = text.lastIndexOf('```'); return { prose: k >= 0 && FENCE.startsWith(text.slice(k).trim()) ? text.slice(0, k) : text, json: null }; }
    const rest = text.slice(i + FENCE.length); const end = rest.indexOf('```');
    return { prose: (text.slice(0, i) + (end >= 0 ? rest.slice(end + 3) : '')).trim(), json: end >= 0 ? rest.slice(0, end) : null };
  }
  function toProposals(raw) {
    let o; try { o = JSON.parse(raw); } catch (e) { return null; }
    if (!o || typeof o !== 'object') return null;
    const out = []; const str = v => (v == null ? '' : String(v));
    (Array.isArray(o.modifications) ? o.modifications : []).forEach(m => { if (m && m.chemin) out.push({ kind: 'set', path: str(m.chemin), value: str(m.valeur), why: str(m.raison), label: labelFor(str(m.chemin)), preview: str(m.valeur) }); });
    (Array.isArray(o.personnages) ? o.personnages : []).forEach(c => { if (!c || !c.nom) return; const d = { nom: str(c.nom), fonction: T.ROLES.includes(c.fonction) ? c.fonction : 'Autre' }; ['faiblessePsy', 'faiblesseMorale', 'besoinPsy', 'besoinMoral', 'desir', 'valeurs'].forEach(k => d[k] = str(c[k]));
      out.push({ kind: 'char', data: d, label: 'Nouveau personnage : ' + d.nom + ' (' + d.fonction + ')', preview: [d.desir && 'Désir : ' + d.desir, d.faiblesseMorale && 'Faiblesse morale : ' + d.faiblesseMorale, d.besoinMoral && 'Besoin moral : ' + d.besoinMoral].filter(Boolean).join('\n') }); });
    (Array.isArray(o.scenes) ? o.scenes : []).forEach(x => { if (!x || !x.action) return; const d = { ie: ['INT.', 'EXT.', 'INT./EXT.'].includes(x.ie) ? x.ie : 'INT.', lieu: str(x.lieu), moment: str(x.moment), action: str(x.action), etape: str(x.etape), apres_scene: Number.isFinite(+x.apres_scene) ? +x.apres_scene : -1 };
      out.push({ kind: 'scene', data: d, label: `Nouvelle scène : ${d.ie} ${d.lieu} – ${d.moment}`, preview: d.action }); });
    const w = o.ecrire_scene; if (w && w.scene_id && Array.isArray(w.blocs)) { const TY = ['action', 'character', 'paren', 'dialogue', 'transition', 'shot']; const d = { scene_id: str(w.scene_id), blocs: w.blocs.filter(b => b && TY.includes(b.type)).map(b => ({ type: b.type, texte: str(b.texte) })) }; const i = A.P().scenes.findIndex(x => x.id === d.scene_id);
      if (i >= 0) out.push({ kind: 'script', data: d, label: `Texte de la scène ${i + 1}`, preview: d.blocs.map(b => (b.type === 'character' ? '\n' + b.texte.toUpperCase() : b.type === 'dialogue' ? '    ' + b.texte : b.texte)).join('\n') }); }
    return out;
  }

  function pathCatalog(p) {
    const out = [];
    const add = (groups, base) => groups.forEach(g => (g.fields || []).forEach(f => out.push(`${base}.${f.k} — ${f.l}${f.t === 'rank' ? ' (liste : une entrée par ligne)' : ''}`)));
    add(T.PREMISSE, 'premisse');
    A.activeSteps(p).forEach(s => s.f.forEach(f => out.push(`structure.data.${s.id}.${f.k} — étape ${s.n} ${s.title} : ${f.l}`)));
    if (A.activeSteps(p).length) out.push(`(identifiants d'étape utilisables pour « etape » d'une scène : ${A.activeSteps(p).map(s => s.id + ' = ' + s.n + '. ' + s.title).join(' ; ')})`);
    out.push('structure.evenements — Événements (un par ligne)');
    p.characters.forEach(c => ['name', 'faiblessePsy', 'faiblesseMorale', 'besoinPsy', 'besoinMoral', ...T.CHAR_FIELDS.map(f => f.k)].forEach(k => out.push(`characters.${c.id}.${k} — ${c.name || 'Sans nom'} : ${k}`)));
    T.PERSO_GLOBAL.forEach(f => out.push(`persoGlobal.${f.k} — ${f.l}`));
    add(T.DEBAT, 'debat'); p.characters.forEach(c => out.push(`debat.variations.${c.id} — variation sur le thème : ${c.name}`));
    add(T.UNIVERS, 'univers'); add(T.SYMBOLES, 'symboles'); p.characters.forEach(c => out.push(`symboles.persos.${c.id}.symbole — symbole de ${c.name}`));
    add(T.INTRIGUE, 'intrigue');
    p.scenes.forEach((s, i) => ['action', 'lieu', 'moment', 'notes', ...T.SCENE_BUILD.map(f => 'build.' + f.k)].forEach(k => out.push(`scenes.${s.id}.${k} — scène ${i + 1} : ${k}`)));
    return out.join('\n');
  }
  function systemPrompt() {
    return `Tu es l'assistant d'écriture intégré à Truby Studio, un atelier qui applique strictement la méthode de John Truby (« L'Anatomie du scénario », traduction française).
Règles :
- Réponds en français, avec les termes exacts de Truby : prémisse, principe directeur, la structure en 7 étapes (faiblesses et besoin, désir, adversaire, plan du héros, confrontation finale, prise de conscience, nouvel équilibre) ou la structure en 22 étapes, besoin psychologique / besoin moral, faiblesse psychologique / faiblesse morale, problème moral central, réseau de personnages, opposition à quatre coins, débat moral, ligne thématique, univers du récit, réseau de symboles, rebondissements-révélations, tissage des scènes, dialogues symphoniques. N'utilise jamais d'équivalents approximatifs (par ex. « confrontation finale », pas « bataille »).
- Rappelle-toi la distinction : une faiblesse ou un besoin psychologique n'affecte que le héros ; une faiblesse ou un besoin moral blesse au moins une autre personne.
- Tu lis l'état actuel du projet fourni dans chaque message. Sois précis et concret, cite les éléments existants de l'auteur, signale les incohérences entre étapes (par ex. un adversaire qui ne vise pas le même objectif que le héros, un faux choix moral, un désir sans point d'arrivée précis).
- Pour proposer des modifications du projet, utilise le bloc « propositions » décrit plus bas : il n'applique rien lui-même, l'auteur valide chaque proposition d'un clic sur « Appliquer ». N'affirme jamais qu'une modification est faite. Utilise uniquement les chemins de la liste fournie ; pour un champ qui n'est pas listé, propose le texte dans ta réponse.
- Une histoire suit soit la structure en 7 étapes (formes courtes : court métrage, nouvelle, sitcom), soit la structure en 22 étapes : c'est l'une ou l'autre. Respecte strictement la structure choisie par l'auteur (indiquée dans l'état du projet), sa numérotation et sa nomenclature exacte ; ne propose jamais d'étape de l'autre structure ni une étape barrée. Si aucune structure n'est choisie, aide l'auteur à choisir sans remplir d'étapes.
- L'auteur reste maître de son histoire : propose, explique avec la méthode, ne réécris pas tout sans qu'on te le demande.`;
  }
  function stateBlock(p) {
    const ids = `Identifiants des personnages : ${p.characters.map(c => `${c.name || 'Sans nom'} = ${c.id}`).join(' ; ') || 'aucun'}\nIdentifiants des scènes : ${p.scenes.map((s, i) => `${i + 1} = ${s.id}`).join(' ; ') || 'aucune'}\nStructure choisie : ${p.structure.mode ? T.STRUCTURES[p.structure.mode].title : 'aucune (7 ou 22 étapes à choisir)'}. Étapes validées : ${Object.keys(p.progress).filter(k => p.progress[k]).join(', ') || 'aucune'}. Section ouverte : ${A.ui.view}.`;
    return `<etat_du_projet>\n${Exporter.dossierMD(p)}\n\n${ids}\n\nChemins modifiables :\n${pathCatalog(p)}\n</etat_du_projet>`;
  }

  /* ---------- panneau ---------- */
  const panel = () => document.getElementById('claudePanel');
  function open() { if (Settings.cfg.ai.provider === 'off') return Settings.open('ia'); panel().hidden = false; renderPanel(); }
  function toggle() { if (panel().hidden) open(); else panel().hidden = true; }
  function refresh() { if (!panel().hidden) renderPanel(); }
  function unavailableMsg() {
    const prov = Settings.cfg.ai.provider;
    if (prov === 'off') return "L'IA est désactivée. Activez-la dans Paramètres.";
    if (prov === 'claude' && !Settings.inClaudeAi()) return "Claude n'est disponible que dans claude.ai, quand Truby Studio est ouvert comme artefact. Ici, choisissez une autre IA dans Paramètres ; le reste de l'outil fonctionne normalement.";
    return '';
  }
  function controlsHTML() {
    const c = Settings.cfg; const opt = (list, cur) => list.map(([v, l]) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${l}</option>`).join('');
    const ls = Settings.limitState(); const L = c.limits;
    const lim = (L.session || L.week) ? `<span class="cp-usage ${ls.over ? 'over' : ''}" title="Jetons consommés (estimation)">${L.session ? 'Session ' + Settings.fmtN(ls.session) + ' / ' + Settings.fmtN(L.session) : ''}${L.session && L.week ? ' · ' : ''}${L.week ? 'Semaine ' + Settings.fmtN(ls.week) + ' / ' + Settings.fmtN(L.week) : ''}</span>` : '';
    return `<div class="cp-ctrl">${c.ai.provider === 'claude' ? `<label>Modèle <select id="cpTier">${opt(Settings.TIERS, c.ai.tier)}</select></label>` : `<span class="cp-model" title="Modèle choisi dans Paramètres">${esc(c.api.model || 'modèle à choisir')}</span>`}<label>Effort <select id="cpEffort">${opt(Settings.EFFORTS, c.ai.effort)}</select></label>${lim}</div>`;
  }
  function renderPanel() {
    const el = panel(); const c = chat(); const p = A.P();
    const draft = el.querySelector('#cpIn') ? el.querySelector('#cpIn').value : '';
    const off = unavailableMsg(); const name = NAME();
    el.innerHTML = `<div class="cp-head"><h3>${esc(name)}</h3><button class="btn sm ghost" data-cl="new" title="Nouvelle conversation" ${busy ? 'disabled' : ''}>Nouvelle</button><button class="ic" data-cl="settings" title="Paramètres de l'IA">${A.ICON.gear}</button><button class="ic" data-cl="close" title="Fermer">${A.ICON.x}</button></div>
      <div class="cp-msgs" id="cpMsgs">${off ? `<div class="msg err">${esc(off)}</div>` : !c.view.length ? `<div class="msg assistant">${esc(name)} lit votre projet, l'analyse selon la méthode de Truby et vous propose des modifications : rien ne change tant que vous n'avez pas cliqué sur « Appliquer ».${Settings.cfg.ai.provider === 'claude' ? ' Il utilise votre compte claude.ai (aucune clé API) ; au premier message, claude.ai vous demandera d\'autoriser cette page.' : ''}</div>` : ''}
      ${!p ? '<div class="msg assistant">Ouvrez un projet pour que l\'IA puisse le lire.</div>' : ''}
      ${c.view.map(viewHTML).join('')}${busy ? `<div class="msg assistant" id="cpLive">${esc(live && splitAnswer(live.text).prose || name + ' réfléchit…')}</div>` : ''}</div>
      ${off ? `<div class="cp-input"><button class="btn primary" data-cl="settings">Ouvrir les paramètres</button></div>` : `<div class="cp-quick">${[['Analyse ma prémisse avec la check-list de Truby', 'Prémisse'], ['Vérifie la cohérence des étapes de ma structure et dis-moi ce qui manque', 'Structure'], ["Mon adversaire principal est-il nécessaire ? Attaque-t-il la faiblesse majeure du héros et vise-t-il le même objectif ?", 'Adversaire'], ['Propose une séquence de rebondissements-révélations qui va crescendo', 'Rebondissements'], ['Relis la scène courante du scénario : construction (triangle inversé) et dialogues symphoniques', 'Relire la scène']].map(([q, l]) => `<button data-cl-q="${esc(q)}" ${busy ? 'disabled' : ''}>${esc(l)}</button>`).join('')}</div>
      ${controlsHTML()}
      <div class="cp-input"><textarea id="cpIn" placeholder="Demandez à ${esc(name)}… (Entrée pour envoyer, Maj+Entrée pour une ligne)" ${busy ? 'disabled' : ''}>${esc(draft)}</textarea>${busy ? '<button class="btn" data-cl="stop">Arrêter</button>' : '<button class="btn primary" data-cl="send">Envoyer</button>'}</div>`}`;
    const m = el.querySelector('#cpMsgs'); m.scrollTop = m.scrollHeight;
    const tier = el.querySelector('#cpTier'); if (tier) tier.onchange = () => Settings.setTier(tier.value);
    const eff = el.querySelector('#cpEffort'); if (eff) eff.onchange = () => Settings.setEffort(eff.value);
    const ta = el.querySelector('#cpIn'); if (!ta) return;
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(ta.value); } });
    ta.addEventListener('input', () => A.autosize(ta));
  }
  function viewHTML(v, vi) {
    if (v.role === 'user') return `<div class="msg user">${esc(v.text)}</div>`;
    if (v.role === 'error') return `<div class="msg err">${esc(v.text)}</div>`;
    if (v.role === 'note') return `<div class="msg note">${esc(v.text)}</div>`;
    let h = v.text ? `<div class="msg assistant">${esc(v.text)}</div>` : '';
    (v.proposals || []).forEach((pr, pi) => { h += `<div class="proposal ${pr.done ? 'done' : ''}"><div class="path">${esc(pr.label)}</div><div class="val">${esc(pr.preview)}</div>${pr.why ? `<div class="why">${esc(pr.why)}</div>` : ''}<div>${pr.done ? `<span class="tag key">${pr.done === 'ok' ? 'Appliqué' : 'Ignoré'}</span>` : `<button class="btn sm primary" data-cl-apply="${vi}:${pi}">Appliquer</button> <button class="btn sm ghost" data-cl-skip="${vi}:${pi}">Ignorer</button>`}</div></div>`; });
    return h;
  }  function labelFor(path) {
    const p = A.P(); const parts = path.split('.');
    if (parts[0] === 'characters') { const c = p.characters.find(x => x.id === parts[1]); return `${c ? c.name : 'Personnage'} › ${parts.slice(2).join('.')}`; }
    if (parts[0] === 'scenes') { const i = p.scenes.findIndex(x => x.id === parts[1]); return `Scène ${i + 1} › ${parts.slice(2).join('.')}`; }
    if (parts[0] === 'structure' && parts[1] === 'data') { const s = A.stepDef(p, parts[2]) || T.STEPS.find(x => x.id === parts[2]); const f = s && s.f.find(x => x.k === parts[3]); return `Structure › ${s ? s.n + '. ' + s.title : parts[2]}${f ? ' › ' + f.l : ''}`; }
    const G = { premisse: [T.PREMISSE, 'Prémisse'], debat: [T.DEBAT, 'Débat moral'], univers: [T.UNIVERS, 'Univers du récit'], symboles: [T.SYMBOLES, 'Réseau de symboles'], intrigue: [T.INTRIGUE, 'Intrigue'], persoGlobal: [[{ fields: T.PERSO_GLOBAL }], 'Personnages'] }[parts[0]];
    if (G && parts.length === 2) { const f = G[0].flatMap(g => g.fields || []).find(x => x.k === parts[1]); if (f) return `${G[1]} › ${f.l}`; }
    return path;
  }
  function apply(pr) {
    const p = A.P(); if (!p) return false;
    if (window.Editor && A.ui.view === 'scenario') Editor.flush(true);
    if (pr.kind === 'set') { if (!/^(premisse|structure|characters|persoGlobal|debat|univers|symboles|intrigue|scenes)\./.test(pr.path)) return false; let v = pr.value; if (/^characters\.[^.]+\.name$/.test(pr.path)) v = A.capWords(v); if (Array.isArray(A.getP(p, pr.path))) v = String(v).split('\n').map(x => x.replace(/^[-•*]\s*/, '').replace(/\s*★+$/, '').trim()).filter(Boolean).map(text => ({ id: A.uid(), text, stars: 0 })); return A.setP(p, pr.path, v); }
    if (pr.kind === 'char') { const c = pr.data; p.characters.push({ id: A.uid(), name: A.capWords(c.nom), role: c.fonction, archetype: '', faiblessePsy: c.faiblessePsy, faiblesseMorale: c.faiblesseMorale, besoinPsy: c.besoinPsy, besoinMoral: c.besoinMoral, desir: c.desir, valeurs: c.valeurs }); return true; }
    if (pr.kind === 'scene') { const s = pr.data; const sc = A.newScene({ ie: s.ie, lieu: s.lieu, moment: s.moment, action: s.action, step: A.structOn(p, { id: s.etape }) ? s.etape : '' }); const at = s.apres_scene < 0 || s.apres_scene > p.scenes.length ? p.scenes.length : s.apres_scene; p.scenes.splice(at, 0, sc); return true; }
    if (pr.kind === 'script') { const s = p.scenes.find(x => x.id === pr.data.scene_id); if (!s) return false; s.blocks = pr.data.blocs.map(b => ({ t: b.type, h: esc(b.texte) })); return true; }
    return false;
  }


  /* ---------- appel à l'IA (Settings.run : Claude ou API) ---------- */
  function buildInput(p, c) {
    const system = `${systemPrompt()}\n\n${FORMAT}\n\n${stateBlock(p)}`;
    let turns = c.turns.slice(-24);
    const size = () => system.length + turns.reduce((n, t) => n + t.content.length, 0);
    while (turns.length > 1 && size() > 200000) turns = turns.slice(2);
    if (turns[0] && turns[0].role !== 'user') turns = turns.slice(1);
    return { system, turns };
  }
  async function send(text) {
    text = (text || '').trim(); if (!text || busy) return;
    const p = A.P(); if (!p) return A.toast('Ouvrez d\'abord un projet');
    if (unavailableMsg()) return renderPanel();
    const ta = document.getElementById('cpIn'); if (ta) ta.value = '';
    if (window.Editor && A.ui.view === 'scenario') Editor.flush(true);
    const c = chat();
    c.view.push({ role: 'user', text });
    c.turns.push({ role: 'user', content: text });
    busy = true; ctl = new AbortController(); live = { text: '' }; renderPanel();
    const { system: sys, turns } = buildInput(p, c);
    try {
      const res = await Settings.run(turns, { system: sys, signal: ctl.signal, onText: t => { live.text = t; paintLive(); } });
      const { prose, json } = splitAnswer(res.text);
      const proposals = json ? toProposals(json) : [];
      c.turns.push({ role: 'assistant', content: res.text });
      c.view.push({ role: 'assistant', text: prose, proposals: proposals || [] });
      if (json && proposals === null) c.view.push({ role: 'error', text: 'Les propositions étaient illisibles. Demandez-les à nouveau.' });
      if (res.truncated) c.view.push({ role: 'error', text: 'Réponse interrompue (trop longue). Demandez une suite plus ciblée, ou augmentez l\'effort.' });
      if (res.tierApplied && res.tierApplied !== Settings.cfg.ai.tier) c.view.push({ role: 'note', text: 'Votre abonnement a utilisé le modèle « ' + (Settings.TIERS.find(x => x[0] === res.tierApplied) || [, res.tierApplied])[1] + ' ».' });
    } catch (e) {
      const code = e && e.code;
      const kept = e && e.text ? splitAnswer(e.text).prose : '';
      if (kept && code !== 'refused') { c.view.push({ role: 'assistant', text: kept + (code === 'cancelled' ? '\n\n[réponse arrêtée]' : ''), proposals: [] }); c.turns.push({ role: 'assistant', content: kept }); }
      if (code === 'cancelled') { if (!kept) c.view.push({ role: 'error', text: 'Réponse arrêtée.' }); }
      else c.view.push({ role: 'error', text: Settings.errMsg(e) });
    }
    busy = false; ctl = null; live = null; renderPanel();
  }
  function paintLive() {
    const el = document.getElementById('cpLive'); if (!el || !live) return;
    const t = splitAnswer(live.text).prose; el.textContent = t || NAME() + ' réfléchit…';
    const m = document.getElementById('cpMsgs'); if (m && m.scrollHeight - m.scrollTop - m.clientHeight < 80) m.scrollTop = m.scrollHeight;
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-cl], [data-cl-q], [data-cl-apply], [data-cl-skip]'); if (!b) return;
    const c = chat();
    if (b.dataset.clQ) return send(b.dataset.clQ);
    if (b.dataset.clApply || b.dataset.clSkip) {
      const [vi, pi] = (b.dataset.clApply || b.dataset.clSkip).split(':').map(Number); const pr = c.view[vi].proposals[pi];
      if (b.dataset.clApply) { if (apply(pr)) { pr.done = 'ok'; A.commit(); A.toast('Modification appliquée', { undo: true }); } else A.toast('Impossible d\'appliquer : chemin inconnu'); }
      else pr.done = 'skip';
      return renderPanel();
    }
    const k = b.dataset.cl;
    if (k === 'close') panel().hidden = true;
    else if (k === 'stop') { if (ctl) ctl.abort(); }
    else if (k === 'settings') Settings.open('ia');
    else if (k === 'new') { if (busy) return; const p = A.P(); delete chats[p ? p.id : '_']; renderPanel(); }
    else if (k === 'send') send(document.getElementById('cpIn').value);
  });

  return { open, toggle, refresh };
})();
window.ClaudePanel = ClaudePanel;
