/* =====================================================================
   TRUBY STUDIO — Paramètres généraux et couche IA
   - Apparence : mode jour / mode nuit, choisi par l'auteur (ignore le système)
   - IA : Claude (compte claude.ai, capacité « sample »), une autre IA par API
     compatible OpenAI (DeepSeek, ChatGPT, Mistral…), ou IA désactivée
   - Limites d'usage : par session (5 h glissantes) et par semaine (7 jours)
   ===================================================================== */
'use strict';

const Settings = (() => {
  const KEY = 'trubyStudio.settings', THEME_KEY = 'trubyStudio.theme', USAGE_KEY = 'trubyStudio.usage';
  const defaults = () => ({
    theme: 'jour',
    ai: { provider: window.claude ? 'claude' : 'off', tier: 'default', effort: 'moyen', extra: '' },
    api: { preset: 'anthropic', baseUrl: 'https://api.anthropic.com', model: 'claude-opus-5-5', apiKey: '', remember: true },
    limits: { session: 0, week: 0 }
  });
  let cfg = defaults();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    cfg = { ...cfg, ...raw, ai: { ...cfg.ai, ...(raw.ai || {}) }, api: { ...cfg.api, ...(raw.api || {}) }, limits: { ...cfg.limits, ...(raw.limits || {}) } };
    const th = localStorage.getItem(THEME_KEY); if (th) cfg.theme = th;
  } catch (e) {}
  /* hors de claude.ai, le compte claude.ai n'est jamais utilisé : Claude ne se branche que par une clé API */
  if (!window.claude && cfg.ai.provider === 'claude') cfg.ai.provider = 'off';
  function save() {
    try {
      const out = JSON.parse(JSON.stringify(cfg)); if (!cfg.api.remember) out.api.apiKey = '';
      localStorage.setItem(KEY, JSON.stringify(out)); localStorage.setItem(THEME_KEY, cfg.theme);
    } catch (e) {}
  }

  /* ---------- apparence ---------- */
  function applyTheme() {
    const nuit = cfg.theme === 'nuit';
    if (nuit) document.documentElement.setAttribute('data-ambiance', 'nuit'); else document.documentElement.removeAttribute('data-ambiance');
    const b = document.getElementById('btnTheme');
    if (b) { const t = nuit ? 'Mode jour' : 'Mode nuit'; b.title = t; b.setAttribute('aria-label', t); b.classList.toggle('is-nuit', nuit); }
  }
  function toggleTheme() { cfg.theme = cfg.theme === 'nuit' ? 'jour' : 'nuit'; save(); applyTheme(); }

  /* ---------- usage (jetons estimés) ---------- */
  const SESSION_MS = 5 * 3600e3, WEEK_MS = 7 * 24 * 3600e3;
  let usage = [];
  try { usage = JSON.parse(localStorage.getItem(USAGE_KEY) || '[]').filter(u => Date.now() - u.t < WEEK_MS); } catch (e) {}
  const estimate = text => Math.ceil(String(text || '').length / 3.6);
  function record(n) { if (!n) return; usage.push({ t: Date.now(), n: Math.round(n) }); try { localStorage.setItem(USAGE_KEY, JSON.stringify(usage)); } catch (e) {} }
  function used(win) { const now = Date.now(); return usage.filter(u => now - u.t < win).reduce((a, u) => a + u.n, 0); }
  function resetIn(win) { const now = Date.now(); const inWin = usage.filter(u => now - u.t < win); if (!inWin.length) return 0; return Math.max(0, inWin[0].t + win - now); }
  function limitState() {
    const s = used(SESSION_MS), w = used(WEEK_MS), L = cfg.limits;
    const over = (L.session > 0 && s >= L.session) ? 'session' : (L.week > 0 && w >= L.week) ? 'week' : '';
    return { session: s, week: w, over, sessionReset: resetIn(SESSION_MS), weekReset: resetIn(WEEK_MS) };
  }
  const fmtN = n => Math.round(n).toLocaleString('fr-FR');
  function fmtDur(ms) { const tm = Math.ceil(ms / 60e3), h = Math.floor(tm / 60), m = tm % 60; return h >= 24 ? Math.floor(h / 24) + ' j ' + (h % 24) + ' h' : h ? h + ' h' + (m ? ' ' + m + ' min' : '') : m + ' min'; }

  /* ---------- fournisseurs d'IA par API (format compatible OpenAI) ---------- */
  const PRESETS = [
    { id: 'anthropic', name: 'Claude (Anthropic)', base: 'https://api.anthropic.com', model: 'claude-opus-5-5', keys: 'https://console.anthropic.com/settings/keys', kind: 'anthropic' },
    { id: 'deepseek', name: 'DeepSeek', base: 'https://api.deepseek.com/v1', model: 'deepseek-chat', keys: 'https://platform.deepseek.com/api_keys' },
    { id: 'openai', name: 'ChatGPT (OpenAI)', base: 'https://api.openai.com/v1', model: '', keys: 'https://platform.openai.com/api-keys' },
    { id: 'mistral', name: 'Mistral AI', base: 'https://api.mistral.ai/v1', model: 'mistral-large-latest', keys: 'https://console.mistral.ai/api-keys' },
    { id: 'gemini', name: 'Google Gemini', base: 'https://generativelanguage.googleapis.com/v1beta/openai', model: '', keys: 'https://aistudio.google.com/apikey' },
    { id: 'openrouter', name: 'OpenRouter', base: 'https://openrouter.ai/api/v1', model: '', keys: 'https://openrouter.ai/keys' },
    { id: 'groq', name: 'Groq', base: 'https://api.groq.com/openai/v1', model: '', keys: 'https://console.groq.com/keys' },
    { id: 'xai', name: 'Grok (xAI)', base: 'https://api.x.ai/v1', model: '', keys: 'https://console.x.ai' },
    { id: 'ollama', name: 'Ollama (sur mon ordinateur)', base: 'http://localhost:11434/v1', model: '', keys: '' },
    { id: 'custom', name: 'Autre (compatible OpenAI)', base: '', model: '', keys: '' }
  ];
  const preset = () => PRESETS.find(p => p.id === cfg.api.preset) || PRESETS[PRESETS.length - 1];
  const inClaudeAi = () => !!(window.claude && typeof window.claude.use === 'function');
  function providerName() {
    if (cfg.ai.provider === 'off') return 'IA';
    if (cfg.ai.provider === 'api' && preset().id === 'anthropic') return 'Claude';
    if (cfg.ai.provider === 'api') return preset().id === 'custom' ? (cfg.api.model || 'IA') : preset().name.replace(/ \(.*\)$/, '');
    return 'Claude';
  }

  const TIERS = [['quick', 'Rapide'], ['default', 'Équilibré'], ['complex', 'Le plus capable']];
  const EFFORTS = [['faible', 'Faible'], ['moyen', 'Moyen'], ['eleve', 'Élevé']];
  const EFFORT_TXT = {
    faible: "Effort demandé : faible. Réponds vite, brièvement et directement, en quelques phrases.",
    moyen: "Effort demandé : moyen. Réponds de façon claire et concise, en allant à l'essentiel.",
    eleve: "Effort demandé : élevé. Prends le temps d'analyser en profondeur avant de répondre ; sois complet, précis et argumenté."
  };
  const EFFORT_MAX = { faible: 1200, moyen: 3000, eleve: 8000 };

  let sampleP = null;
  const getSample = () => sampleP || (sampleP = (inClaudeAi() ? window.claude.use('sample') : Promise.resolve(null)).catch(() => null));

  const err = (code, message, text) => Object.assign(new Error(message), { code, text });

  /* Un appel IA. turns = [{role:'user'|'assistant', content}] finissant par 'user'. */
  async function run(turns, opts = {}) {
    if (typeof turns === 'string') turns = [{ role: 'user', content: turns }];
    const prov = cfg.ai.provider;
    if (prov === 'off') throw err('off', "L'IA est désactivée. Activez-la dans Paramètres.");
    const ls = limitState();
    if (ls.over) throw err('limit', ls.over === 'session'
      ? `Limite de session atteinte (${fmtN(ls.session)} jetons). Elle se libère dans ${fmtDur(ls.sessionReset)}, ou relevez-la dans Paramètres.`
      : `Limite hebdomadaire atteinte (${fmtN(ls.week)} jetons). Elle se libère dans ${fmtDur(ls.weekReset)}, ou relevez-la dans Paramètres.`);
    const effort = opts.effort || cfg.ai.effort;
    const system = [opts.system || '', EFFORT_TXT[effort], cfg.ai.extra ? "Instructions de l'auteur : " + cfg.ai.extra : ''].filter(Boolean).join('\n\n');
    const inChars = system.length + turns.reduce((a, t) => a + t.content.length, 0);
    if (prov === 'api') return runApi(turns, system, effort, opts, inChars);
    const sample = await getSample();
    if (!sample) throw err('unavailable', "Claude n'est disponible que dans claude.ai, quand Truby Studio est ouvert comme artefact. Ailleurs, choisissez une autre IA dans Paramètres.");
    const input = [{ role: 'user', content: system }, ...turns];
    let got = '';
    try {
      const res = await sample(input, { signal: opts.signal, cache: opts.cache ?? false, modelTier: opts.tier || cfg.ai.tier, onText: u => { got = u.text; opts.onText && opts.onText(u.text); } });
      record(Math.ceil(inChars / 3.6) + estimate(res.text));
      return { text: res.text, truncated: res.truncated, tierApplied: res.modelTierApplied };
    } catch (e) {
      record(Math.ceil(inChars / 3.6) * (got ? 1 : 0) + estimate(got));
      throw err(e && e.code || 'upstream_error', e && e.message || 'Erreur', e && e.text);
    }
  }
  /* Claude par clé API : SDK officiel @anthropic-ai/sdk, chargé seulement quand on en a besoin */
  let sdkP = null;
  function loadSdk() {
    if (window.Anthropic) return Promise.resolve(window.Anthropic);
    return sdkP || (sdkP = new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'vendor/anthropic-sdk.js'; sc.onload = () => window.Anthropic ? res(window.Anthropic) : rej(err('config', 'Module Claude introuvable.')); sc.onerror = () => { sdkP = null; rej(err('network', 'Module Claude introuvable (vendor/anthropic-sdk.js).')); }; document.head.appendChild(sc); }));
  }
  const ANTH_EFFORT = { faible: 'low', moyen: 'medium', eleve: 'high' };
  function anthErr(e) {
    const st = e && e.status;
    if (e && (e.name === 'APIUserAbortError' || e.name === 'AbortError')) return err('cancelled', 'Arrêté');
    if (st === 401 || st === 403) return err('auth', 'Clé API Anthropic refusée. Vérifiez-la dans Paramètres.');
    if (st === 404) return err('http', 'Modèle Claude introuvable : choisissez-en un autre dans Paramètres.');
    if (st === 429) return err('rate_limited', "Limite de l'API Anthropic atteinte. Réessayez plus tard.");
    if (st === 400 && /credit|balance/i.test(e.message || '')) return err('http', "Crédit insuffisant sur votre compte API Anthropic.");
    if (st >= 500) return err('http', 'Service Claude momentanément indisponible. Réessayez plus tard.');
    if (!st) return err('network', netMsg());
    return err('http', 'Erreur ' + st + ' de l\'API Anthropic. ' + String(e.message || '').slice(0, 160));
  }
  async function runAnthropic(turns, system, effort, opts) {
    const a = cfg.api; if (!a.apiKey) throw err('config', 'Collez votre clé API Anthropic dans Paramètres.');
    const Anthropic = await loadSdk();
    const client = new Anthropic({ apiKey: a.apiKey, dangerouslyAllowBrowser: true });
    const model = a.model || 'claude-opus-5-5';
    const base = { model, max_tokens: 16000, system, messages: turns, ...(model.startsWith('claude-haiku') ? {} : { output_config: { effort: ANTH_EFFORT[effort] || 'medium' } }) };
    let text = '';
    const go = async params => {
      text = '';
      const stream = params.betas ? client.beta.messages.stream(params, { signal: opts.signal }) : client.messages.stream(params, { signal: opts.signal });
      stream.on('text', d => { text += d; opts.onText && opts.onText(text); });
      return stream.finalMessage();
    };
    let msg;
    try {
      try { msg = await go({ ...base, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }); }
      catch (e) { if (e && e.status === 400 && /fallback/i.test(e.message || '')) msg = await go(base); else throw e; }
    } catch (e) { const x = anthErr(e); x.text = text; throw x; }
    const u = msg.usage || {}; record((u.input_tokens || 0) + (u.output_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0));
    if (msg.stop_reason === 'refusal') throw err('refused', 'Claude a décliné cette demande.');
    const out = (msg.content || []).filter(b => b.type === 'text').map(b => b.text).join('') || text;
    if (!out.trim()) throw err('empty_completion', "L'IA n'a rien répondu.");
    return { text: out, truncated: msg.stop_reason === 'max_tokens' };
  }
  async function runApi(turns, system, effort, opts, inChars) {
    const a = cfg.api;
    if ((PRESETS.find(p => p.id === a.preset) || {}).kind === 'anthropic') return runAnthropic(turns, system, effort, opts);
    if (!a.baseUrl) throw err('config', "Indiquez l'adresse de l'API dans Paramètres.");
    if (!a.model) throw err('config', 'Choisissez un modèle dans Paramètres (bouton « Tester la connexion »).');
    const headers = { 'Content-Type': 'application/json' }; if (a.apiKey) headers.Authorization = 'Bearer ' + a.apiKey;
    let res;
    try {
      res = await fetch(a.baseUrl.replace(/\/+$/, '') + '/chat/completions', { method: 'POST', headers, signal: opts.signal,
        body: JSON.stringify({ model: a.model, stream: true, max_tokens: opts.maxTokens || EFFORT_MAX[effort], messages: [{ role: 'system', content: system }, ...turns] }) });
    } catch (e) {
      if (opts.signal && opts.signal.aborted) throw err('cancelled', 'Arrêté');
      throw err('network', netMsg());
    }
    if (!res.ok) throw err(res.status === 401 || res.status === 403 ? 'auth' : res.status === 429 ? 'rate_limited' : 'http', await httpMsg(res));
    let text = '', usageTok = 0, truncated = false;
    try {
      const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = '';
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n'); buf = lines.pop();
        for (const line of lines) {
          const l = line.trim(); if (!l.startsWith('data:')) continue;
          const data = l.slice(5).trim(); if (data === '[DONE]') continue;
          let j; try { j = JSON.parse(data); } catch (e) { continue; }
          const ch = j.choices && j.choices[0];
          const d = ch && (ch.delta && ch.delta.content || ch.message && ch.message.content);
          if (d) { text += d; opts.onText && opts.onText(text); }
          if (ch && ch.finish_reason === 'length') truncated = true;
          if (j.usage && j.usage.total_tokens) usageTok = j.usage.total_tokens;
        }
      }
    } catch (e) {
      record(usageTok || Math.ceil(inChars / 3.6) + estimate(text));
      if (opts.signal && opts.signal.aborted) throw err('cancelled', 'Arrêté', text);
      throw err('network', 'La connexion a été interrompue.', text);
    }
    record(usageTok || Math.ceil(inChars / 3.6) + estimate(text));
    if (!text.trim()) throw err('empty_completion', "L'IA n'a rien répondu.");
    return { text, truncated };
  }
  function netMsg() {
    return inClaudeAi()
      ? "Connexion impossible : dans claude.ai, un artefact ne peut pas joindre d'autres services. Pour une autre IA, ouvrez Truby Studio depuis GitHub Pages ou le fichier index.html sur votre ordinateur."
      : "Connexion impossible : vérifiez l'adresse de l'API et votre réseau. Certains fournisseurs refusent les appels depuis un navigateur ; OpenRouter les accepte toujours.";
  }
  async function httpMsg(res) {
    let detail = ''; try { const j = await res.json(); detail = (j.error && (j.error.message || j.error)) || j.message || ''; } catch (e) {}
    const base = res.status === 401 || res.status === 403 ? 'Clé API refusée.' : res.status === 404 ? 'Modèle ou adresse introuvable.' : res.status === 429 ? 'Limite du fournisseur atteinte ou crédit épuisé.' : res.status === 402 ? 'Crédit épuisé chez le fournisseur.' : `Erreur ${res.status} du fournisseur.`;
    return base + (detail ? ' (' + String(detail).slice(0, 200) + ')' : '');
  }
  async function listModels(base, key, presetId) {
    if (presetId === 'anthropic') {
      if (!key) throw err('config', 'Collez d\'abord votre clé API Anthropic.');
      const Anthropic = await loadSdk(); const client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
      try { const ids = []; for await (const m of client.models.list()) ids.push(m.id); return ids; } catch (e) { throw anthErr(e); }
    }
    const headers = {}; if (key) headers.Authorization = 'Bearer ' + key;
    let res; try { res = await fetch(base.replace(/\/+$/, '') + '/models', { headers }); } catch (e) { throw err('network', netMsg()); }
    if (!res.ok) throw err('http', await httpMsg(res));
    const j = await res.json(); return (j.data || j.models || []).map(m => m.id || m.name).filter(Boolean).map(x => String(x).replace(/^models\//, '')).sort();
  }

  /* ---------- fenêtre Paramètres ---------- */
  function usageHTML() {
    const ls = limitState(), L = cfg.limits;
    const bar = (v, max) => max > 0 ? `<div class="u-bar ${v >= max ? 'over' : ''}"><i style="width:${Math.min(100, Math.round(100 * v / max))}%"></i></div>` : '';
    return `<div class="usage"><div><b>Session</b> <span>(5 h glissantes)</span><div class="u-n">${fmtN(ls.session)}${L.session ? ' / ' + fmtN(L.session) : ''} jetons${ls.sessionReset && ls.session ? ' · libération complète dans ' + fmtDur(ls.sessionReset) : ''}</div>${bar(ls.session, L.session)}</div>
      <div><b>Semaine</b> <span>(7 jours glissants)</span><div class="u-n">${fmtN(ls.week)}${L.week ? ' / ' + fmtN(L.week) : ''} jetons</div>${bar(ls.week, L.week)}</div></div>`;
  }
  function open(tab = 'ia') {
    let draft = JSON.parse(JSON.stringify(cfg)); let models = [];
    const body = () => {
      const pr = PRESETS.find(p => p.id === draft.api.preset) || PRESETS[PRESETS.length - 1];
      return `<div class="set-tabs" role="tablist">${[['apparence', 'Apparence'], ['ia', 'Intelligence artificielle'], ['limites', "Limites d'usage"]].map(([k, l]) => `<button role="tab" class="${tab === k ? 'on' : ''}" data-set-tab="${k}" aria-selected="${tab === k}">${l}</button>`).join('')}</div>
      <div class="set-panel" ${tab === 'apparence' ? '' : 'hidden'}>
        <p class="f-help">Le thème ne suit ni le système ni claude.ai : c'est vous qui choisissez.</p>
        <div class="seg"><button class="${draft.theme !== 'nuit' ? 'on' : ''}" data-set-theme="jour">Mode jour (papier crème)</button><button class="${draft.theme === 'nuit' ? 'on' : ''}" data-set-theme="nuit">Mode nuit (anthracite chaud)</button></div>
      </div>
      <div class="set-panel" ${tab === 'ia' ? '' : 'hidden'}>
        <div class="prov-grid">${[...(inClaudeAi() ? [['claude', 'Claude', 'Votre compte claude.ai, sans clé. Uniquement dans claude.ai.']] : []), ['api', 'Une IA par clé API', inClaudeAi() ? 'Claude, ChatGPT, DeepSeek, Mistral… Indisponible dans claude.ai.' : 'Claude, ChatGPT, DeepSeek, Mistral… avec votre propre clé.'], ['off', 'Aucune IA', "L'assistant et les boutons IA sont masqués."]].map(([k, t, d]) => `<button class="prov ${draft.ai.provider === k ? 'on' : ''}" data-set-prov="${k}"><b>${t}</b><span>${d}</span></button>`).join('')}</div>
        <div ${draft.ai.provider === 'claude' ? '' : 'hidden'}>
          <div class="set-row"><label for="setTier">Modèle</label><select class="in" id="setTier">${TIERS.map(([v, l]) => `<option value="${v}" ${draft.ai.tier === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <p class="f-help">claude.ai choisit le modèle exact selon votre abonnement : « Le plus capable » réfléchit plus longtemps et consomme davantage.</p>
        </div>
        <div ${draft.ai.provider === 'api' ? '' : 'hidden'}>
          ${inClaudeAi() ? `<p class="set-warn">Vous êtes dans claude.ai : il bloque toute connexion vers d'autres services, donc une autre IA ne peut pas fonctionner ici. Elle fonctionnera dans la version de Truby Studio hébergée hors de claude.ai (votre propre adresse).</p>` : ''}
          <div class="set-row"><label for="setPreset">Fournisseur</label><select class="in" id="setPreset">${PRESETS.map(p => `<option value="${p.id}" ${p.id === pr.id ? 'selected' : ''}>${p.name}</option>`).join('')}</select></div>
          <div class="set-row"><label for="setKey">Clé API</label><input class="in" id="setKey" type="password" autocomplete="off" value="${App.esc(draft.api.apiKey)}" placeholder="${pr.id === 'ollama' ? 'Aucune clé nécessaire' : 'Collez votre clé ici'}">${pr.keys ? `<a class="set-link" href="${pr.keys}" target="_blank" rel="noopener">Obtenir une clé</a>` : ''}</div>
          <div class="set-row"><label for="setModel">Modèle</label><input class="in" id="setModel" list="setModels" value="${App.esc(draft.api.model)}" placeholder="Cliquez sur « Tester la connexion »"><datalist id="setModels">${models.map(m => `<option value="${App.esc(m)}">`).join('')}</datalist></div>
          <details class="set-adv" ${pr.id === 'custom' ? 'open' : ''}><summary>Adresse de l'API</summary><input class="in" id="setBase" value="${App.esc(draft.api.baseUrl)}" placeholder="https://…/v1"></details>
          <div class="set-test-row"><button class="btn sm" data-set-test ${inClaudeAi() ? 'disabled title="Impossible depuis claude.ai"' : ''}>Tester la connexion</button><span class="set-test" id="setTest"></span></div>
          <label class="check" style="margin-top:8px"><input type="checkbox" id="setRem" ${draft.api.remember ? 'checked' : ''}><span class="t">Mémoriser la clé dans ce navigateur</span></label>
        </div>
        <div ${draft.ai.provider === 'off' ? 'hidden' : ''}>
          <div class="set-row"><label for="setEffort">Effort</label><select class="in" id="setEffort">${EFFORTS.map(([v, l]) => `<option value="${v}" ${draft.ai.effort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="set-row top"><label for="setExtra">Instructions envoyées à chaque requête</label><textarea class="in" id="setExtra" rows="3" placeholder="Ex. : Tutoie-moi. Mon film est un court métrage de 15 minutes.">${App.esc(draft.ai.extra)}</textarea></div>
          <p class="f-help">À chaque requête, l'IA reçoit automatiquement la méthode de Truby, l'état de votre projet et ces instructions.</p>
        </div>
      </div>
      <div class="set-panel" ${tab === 'limites' ? '' : 'hidden'}>
        <p class="f-help">Fixez combien de jetons Truby Studio peut consommer. Une fois la limite atteinte, l'IA ne répond plus jusqu'à ce que la période se libère. 0 = pas de limite. Les jetons sont estimés (environ 1 jeton pour 3 à 4 caractères) quand le service ne les compte pas.</p>
        <div class="set-row"><label for="setLimS">Limite par session (5 h)</label><input class="in" id="setLimS" type="number" min="0" step="1000" value="${draft.limits.session || 0}"></div>
        <div class="set-row"><label for="setLimW">Limite par semaine</label><input class="in" id="setLimW" type="number" min="0" step="10000" value="${draft.limits.week || 0}"></div>
        ${usageHTML()}
        <button class="btn sm ghost" data-set-reset-usage>Remettre les compteurs à zéro</button>
      </div>`;
    };
    const read = back => {
      const v = id => back.querySelector('#' + id);
      if (v('setTier')) draft.ai.tier = v('setTier').value;
      if (v('setEffort')) draft.ai.effort = v('setEffort').value;
      if (v('setExtra')) draft.ai.extra = v('setExtra').value.trim();
      if (v('setKey')) draft.api.apiKey = v('setKey').value.trim();
      if (v('setModel')) draft.api.model = v('setModel').value.trim();
      if (v('setBase')) draft.api.baseUrl = v('setBase').value.trim();
      if (v('setRem')) draft.api.remember = v('setRem').checked;
      if (v('setLimS')) draft.limits.session = Math.max(0, parseInt(v('setLimS').value, 10) || 0);
      if (v('setLimW')) draft.limits.week = Math.max(0, parseInt(v('setLimW').value, 10) || 0);
    };
    App.modal({ title: 'Paramètres', wide: true, html: `<div id="setBody">${body()}</div>`,
      onOpen: back => {
        const host = back.querySelector('#setBody');
        const redraw = () => { host.innerHTML = body(); };
        host.addEventListener('change', e => {
          if (e.target.id === 'setPreset') { read(back); const p = PRESETS.find(x => x.id === e.target.value); draft.api.preset = p.id; draft.api.baseUrl = p.base; draft.api.model = p.model; models = []; redraw(); }
        });
        host.addEventListener('click', async e => {
          const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
          if (d.setTab) { read(back); tab = d.setTab; redraw(); }
          else if (d.setTheme) { draft.theme = d.setTheme; cfg.theme = d.setTheme; save(); applyTheme(); redraw(); }
          else if (d.setProv) { read(back); draft.ai.provider = d.setProv; redraw(); }
          else if (d.setResetUsage !== undefined) { usage = []; try { localStorage.removeItem(USAGE_KEY); } catch (er) {} redraw(); }
          else if (d.setTest !== undefined) {
            read(back); const out = back.querySelector('#setTest'); out.textContent = 'Connexion…'; out.className = 'set-test';
            try {
              models = await listModels(draft.api.baseUrl, draft.api.apiKey, draft.api.preset);
              const pr = PRESETS.find(x => x.id === draft.api.preset);
              if (!draft.api.model || !models.includes(draft.api.model)) draft.api.model = (pr && pr.model && models.includes(pr.model)) ? pr.model : (models[0] || draft.api.model);
              redraw(); const o2 = back.querySelector('#setTest'); o2.textContent = `Connecté : ${models.length} modèle${models.length > 1 ? 's' : ''} disponible${models.length > 1 ? 's' : ''}.`; o2.className = 'set-test ok';
            } catch (er) { out.textContent = er.message; out.className = 'set-test bad'; }
          }
        });
      },
      actions: [{ label: 'Annuler' }, { label: 'Enregistrer', cls: 'primary', run: back => { read(back); cfg = draft; save(); applyTheme(); refreshUI(); App.toast('Paramètres enregistrés'); } }] });
  }
  /* met à jour ce qui dépend du fournisseur d'IA */
  function refreshUI() {
    const b = document.getElementById('btnClaude');
    if (b) { b.hidden = cfg.ai.provider === 'off'; const l = b.querySelector('.lbl'); if (l) l.textContent = providerName(); }
    document.documentElement.classList.toggle('ai-off', cfg.ai.provider === 'off');
    if (window.ClaudePanel && cfg.ai.provider === 'off') { const p = document.getElementById('claudePanel'); if (p) p.hidden = true; }
    if (window.ClaudePanel) ClaudePanel.refresh();
    if (window.App && App.P && App.P()) App.render();
  }

  const SAMPLE_ERR = {
    not_granted: "Pour utiliser l'IA, autorisez Claude pour cette page (menu Autorisations de l'artefact), puis réessayez.",
    sampling_disabled: "Claude n'est pas disponible pour ce compte ou cette organisation.",
    rate_limited: "Limite d'usage atteinte. Réessayez plus tard.",
    session_expired: 'Votre session claude.ai a expiré : reconnectez-vous puis réessayez.',
    refused: "L'IA a décliné cette demande. Reformulez-la.",
    empty_completion: "L'IA n'a rien répondu. Reformulez ou demandez moins à la fois.",
    prompt_too_large: 'Projet ou conversation trop long pour un seul appel : commencez une nouvelle conversation.',
    cancelled: 'Réponse arrêtée.'
  };
  const OWN = ['limit', 'off', 'unavailable', 'network', 'auth', 'http', 'config', 'parse'];
  const errMsg = e => (e && OWN.includes(e.code) ? e.message : SAMPLE_ERR[e && e.code]) || "L'IA est momentanément indisponible. Réessayez plus tard.";

  return {
    errMsg,
    get cfg() { return cfg; }, save, open, applyTheme, toggleTheme, run, limitState, fmtN, fmtDur, providerName, refreshUI, inClaudeAi, TIERS, EFFORTS,
    setTier(v) { cfg.ai.tier = v; save(); }, setEffort(v) { cfg.ai.effort = v; save(); }
  };
})();
window.Settings = Settings;
