/* =====================================================================
   TRUBY STUDIO — Éditeur de scénario (inspiré de Microsoft Word)
   Le texte est synchronisé dans les deux sens avec le tissage des scènes :
   chaque intitulé de scène correspond à une scène du tissage.
   ===================================================================== */
'use strict';

const Editor = (() => {
  const T = window.TRUBY;
  const A = App;
  const st = { tab: 'accueil', view: 'page', zoom: 100, nav: true, ribbon: true, find: false, curScene: null };
  let root, script, sugg;
  const TYPES = T.SCRIPT_TYPES.map(x => x.t);
  const LABEL = Object.fromEntries(T.SCRIPT_TYPES.map(x => [x.t, x.l]));
  const PH = { scene: 'INT. LIEU – JOUR', action: 'Action…', character: 'PERSONNAGE', paren: '(didascalie)', dialogue: 'Dialogue…', transition: 'COUPE FRANCHE :', shot: 'GROS PLAN', note: 'Note pour vous (non exportée)' };
  const TAB_CYCLE = ['action', 'character', 'paren', 'dialogue', 'transition', 'scene', 'shot', 'note'];
  const NEXT = { scene: 'action', action: 'action', character: 'dialogue', paren: 'dialogue', dialogue: 'action', transition: 'scene', shot: 'action', note: 'action' };
  const TRANSITIONS = ['COUPE FRANCHE :', 'FONDU ENCHAÎNÉ :', 'FONDU AU NOIR.', 'ENCHAÎNÉ :', 'COUPE SUR :', 'RETOUR AU PRÉSENT :'];

  const esc = A.esc;
  const typeOf = p => (p.className.match(/sp-(\w+)/) || [])[1] || 'action';
  const sanitize = html => {
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    const walk = n => {
      [...n.childNodes].forEach(c => {
        if (c.nodeType === 1) {
          const tag = c.tagName.toLowerCase();
          if (['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'br'].includes(tag)) { [...c.attributes].forEach(a => c.removeAttribute(a.name)); walk(c); }
          else { walk(c); c.replaceWith(...c.childNodes); }
        } else if (c.nodeType !== 3) c.remove();
      });
    };
    walk(tmp);
    return tmp.innerHTML.replace(/<br>$/, '');
  };
  const textOf = h => { const d = document.createElement('div'); d.innerHTML = (h || '').replace(/<br\s*\/?>/g, '\n'); return d.textContent; };

  /* ---------------- rendu ---------------- */
  function scriptHTML(p) {
    const memo = p.script.memo;
    const blockP = b => `<p class="sp sp-${b.t}" data-ph="${esc(PH[b.t] || '')}">${b.h || '<br>'}</p>`;
    let html = (p.prelude || []).map(blockP).join('');
    p.scenes.forEach(s => {
      if (s.blocks === undefined) s.blocks = s.action ? [{ t: 'action', h: esc(s.action) }] : [];
      html += `<p class="sp sp-scene" data-scene="${s.id}" data-ph="${esc(PH.scene)}"${memo && s.action ? ` data-memo="${esc(s.action)}"` : ''}>${esc(A.headingOf(s, p.script.sep).trim()) || '<br>'}</p>`;
      html += s.blocks.map(blockP).join('');
    });
    return html || `<p class="sp sp-scene" data-ph="${esc(PH.scene)}"><br></p>`;
  }
  function applyVars(el, sc) {
    const v = { '--sp-font': `"${sc.font}", "Courier New", Courier, monospace`, '--sp-size': sc.size + 'pt', '--sp-lh': sc.lh, '--sp-mt': sc.mt + 'cm', '--sp-mb': sc.mb + 'cm', '--sp-ml': sc.ml + 'cm', '--sp-mr': sc.mr + 'cm', '--sp-char': sc.char + 'cm', '--sp-paren': sc.paren + 'cm', '--sp-paren-r': sc.parenR + 'cm', '--sp-dial': sc.dial + 'cm', '--sp-dial-r': sc.dialR + 'cm' };
    Object.entries(v).forEach(([k, val]) => el.style.setProperty(k, val));
  }

  function render(main) {
    const p = A.P();
    root = main;
    main.innerHTML = `<div class="ed">
      <div class="ed-tabs" role="tablist">${[['accueil', 'Accueil'], ['insertion', 'Insertion'], ['page', 'Mise en page'], ['revision', 'Révision'], ['affichage', 'Affichage']].map(([k, l]) => `<button role="tab" aria-selected="${st.tab === k}" class="${st.tab === k ? 'on' : ''}" data-edtab="${k}">${l}</button>`).join('')}</div>
      <div class="ribbon ${st.ribbon ? '' : 'collapsed'}" role="toolbar" aria-label="Ruban">${ribbonHTML(p)}</div>
      <div class="findbar" ${st.find ? '' : 'hidden'}><input id="fbFind" placeholder="Rechercher"><input id="fbRepl" placeholder="Remplacer par"><button class="btn sm" data-ed="findNext">Suivant</button><button class="btn sm" data-ed="replaceAll">Tout remplacer</button><span id="fbInfo" class="f-help" style="margin:0"></span><button class="ic" data-ed="findClose" title="Fermer">${A.ICON.x}</button></div>
      <div class="ed-body">
        <nav class="ed-nav" ${st.nav ? '' : 'hidden'} aria-label="Navigation des scènes"><h4>Scènes (glisser pour réordonner)</h4><div id="navList"></div></nav>
        <div class="ed-scroll" id="edScroll"><div class="ed-zoom" id="edZoom"></div></div>
      </div>
      <div class="ed-status"><span id="stPage">Page 1 sur 1</span><span id="stWords">0 mot</span><span id="stScenes"></span><span>Français (France)</span><span class="sp"></span>
        <button data-ed="focus" title="Focus">${svg('M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5')}Focus</button>
        <button data-ed="view" data-v="page" class="${st.view === 'page' ? 'on' : ''}" title="Mode Page">${svg('M6 3h12v18H6z')}</button>
        <button data-ed="view" data-v="lecture" class="${st.view === 'lecture' ? 'on' : ''}" title="Aperçu des pages (lecture)">${svg('M3 5h8v14H3zM13 5h8v14h-8z')}</button>
        <button data-ed="view" data-v="plan" class="${st.view === 'plan' ? 'on' : ''}" title="Plan">${svg('M4 6h16M8 12h12M8 18h12')}</button>
        <button data-ed="zoom" data-z="-10" title="Zoom arrière">−</button><input type="range" id="zoomRange" min="50" max="200" step="10" value="${st.zoom}" aria-label="Zoom"><button data-ed="zoom" data-z="10" title="Zoom avant">+</button><span id="zoomPct">${st.zoom} %</span></div>
    </div>`;
    sugg = document.createElement('div'); sugg.className = 'suggest'; sugg.hidden = true; main.appendChild(sugg);
    renderPaper(p); renderNav(p); bindEditor();
  }
  const svg = d => `<svg viewBox="0 0 24 24"><path d="${d}"/></svg>`;

  function renderPaper(p) {
    const z = A.$('#edZoom', root); const sc = p.script;
    z.style.transform = `scale(${st.zoom / 100})`;
    z.style.marginBottom = st.zoom > 100 ? `${(st.zoom - 100) * 12}px` : '0';
    script = null;
    if (st.view === 'plan') {
      z.innerHTML = `<div class="sheet" style="min-height:0;padding:1.5cm 2cm;font-family:var(--font-ui)"><h2 style="font-family:var(--font-serif);margin:0 0 12px">Plan du scénario</h2>${p.scenes.map((s, i) => {
        const words = (s.blocks || []).map(b => textOf(b.h)).join(' ').split(/\s+/).filter(Boolean).length;
        const step = A.structOn(p, { id: s.step }) ? A.stepDef(p, s.step) : null;
        return `<div style="padding:8px 0;border-bottom:1px solid #e5e7eb;cursor:pointer" data-plan-scene="${s.id}"><b style="font-family:var(--font-script)">${i + 1}. ${esc(A.headingOf(s, sc.sep).toUpperCase())}</b>${step ? ` <span class="tag key">${step.n}. ${esc(step.title)}</span>` : ''}<div style="font-size:13px;color:#4b5563">${esc(s.action || '')}</div><div style="font-size:11.5px;color:#9ca3af">${words} mots</div></div>`;
      }).join('') || '<p>Aucune scène.</p>'}</div>`;
      return updateStatus();
    }
    if (st.view === 'lecture') { z.innerHTML = '<div id="pagesHost" class="preview-pages"></div>'; buildPreview(p, A.$('#pagesHost', root)); return; }
    const title = sc.titlePage ? `<div class="sheet"><div class="titlepage"><div><div class="tt" contenteditable="true" data-tp="title" data-ph="TITRE">${esc(sc.title || '')}</div><div style="margin-top:1.2em">écrit par</div><div contenteditable="true" data-tp="author" data-ph="Auteur">${esc(sc.author || '')}</div><div style="margin-top:2em;font-size:.9em" contenteditable="true" data-tp="draft" data-ph="Version, date">${esc(sc.draft || '')}</div></div><div class="tbot" contenteditable="true" data-tp="contact" data-ph="Contact (adresse, e-mail, téléphone)">${esc(sc.contact || '')}</div></div></div>` : '';
    z.innerHTML = `${title}<div class="sheet" id="mainSheet"><div class="script ${sc.numbered ? 'numbered' : ''} ${sc.memo ? 'show-memo' : ''}" id="script" contenteditable="true" spellcheck="${sc.spell}" lang="fr" role="textbox" aria-multiline="true" aria-label="Scénario">${scriptHTML(p)}</div></div>`;
    script = A.$('#script', root);
    applyVars(script, sc); applyVars(z, sc);
    A.$$('p', script).forEach(updPh);
    requestAnimationFrame(() => { marks(); updateStatus(); });
  }
  function updPh(p) { if (!p || p.tagName !== 'P') return; p.classList.toggle('ph', p.textContent === ''); if (!p.dataset.ph) p.dataset.ph = PH[typeOf(p)] || ''; }

  function renderNav(p) {
    const list = A.$('#navList', root); if (!list) return;
    const filOf = id => p.fils.find(f => f.id === id) || p.fils[0];
    list.innerHTML = p.scenes.map((s, i) => `<div class="navscene" data-id="${s.id}" style="--fil:${filOf(s.fil)?.color || 'transparent'}" title="${esc(s.action || '')}"><button class="handle" aria-label="Déplacer">${A.ICON.grip}</button><span class="nn">${i + 1}.</span><span class="nt">${esc(A.headingOf(s, p.script.sep) || 'Scène sans intitulé')}</span></div>`).join('') || '<div class="f-help" style="padding:6px">Les scènes du tissage apparaîtront ici.</div>';
  }

  /* ---------------- ruban ---------------- */
  function ribbonHTML(p) {
    const sc = p.script; const rb = (cmd, inner, title, extra = '') => `<button class="rb" data-ed="${cmd}" title="${esc(title)}" ${extra}>${inner}</button>`;
    const big = (cmd, ic, label, title, extra = '') => `<button class="rb big" data-ed="${cmd}" title="${esc(title)}" ${extra}>${svg(ic)}${label}</button>`;
    if (st.tab === 'accueil') return `
      <div class="rg">${big('paste', 'M9 4h6v3H9zM7 6H5v15h14V6h-2', 'Coller', 'Coller (Ctrl+V)')}<div class="rg col" style="border:0;padding:0">${rb('cut', svg('M6 6l12 12M6 18L18 6'), 'Couper (Ctrl+X)')}${rb('copy', svg('M8 8h12v12H8zM4 16V4h12'), 'Copier (Ctrl+C)')}</div></div>
      <div class="rg col"><div class="line">${rb('bold', '<b>G</b>', 'Gras (Ctrl+B)')}${rb('italic', '<i>I</i>', 'Italique (Ctrl+I)')}${rb('underline', '<u>S</u>', 'Souligné (Ctrl+U)')}${rb('strikeThrough', '<s>abc</s>', 'Barré')}</div><div class="line">${rb('removeFormat', svg('M6 4h12M10 4l-4 16M14 4l2 8M4 20l16-16'), 'Effacer la mise en forme')}${rb('upper', 'Aa', 'Mettre en majuscules')}</div></div>
      <div class="rg"><div class="styles-gal">${T.SCRIPT_TYPES.map(x => `<button class="sty" data-ed="type" data-t="${x.t}" title="${esc(x.l)} (Ctrl+${x.key})"><span class="pv" style="${x.t === 'scene' ? 'font-weight:700;' : ''}${['scene', 'character', 'transition', 'shot'].includes(x.t) ? 'text-transform:uppercase;' : ''}${x.t === 'character' ? 'text-align:center;' : ''}${x.t === 'transition' ? 'text-align:right;' : ''}${x.t === 'dialogue' ? 'padding-left:10px;' : ''}">${esc({ scene: 'INT. CAFÉ – NUIT', action: 'Marc entre.', character: 'MARC', paren: '(bas)', dialogue: 'Tu es en retard.', transition: 'COUPE :', shot: 'GROS PLAN', note: 'à revoir' }[x.t])}</span><span class="nm">${esc(x.l)}</span></button>`).join('')}</div></div>
      <div class="rg col">${rb('find', svg('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4') + ' Rechercher', 'Rechercher (Ctrl+F)')}${rb('find', svg('M4 7h12M4 12h9M4 17h7M17 14l3 3-3 3') + ' Remplacer', 'Remplacer (Ctrl+H)')}</div>`;
    if (st.tab === 'insertion') return `
      <div class="rg">${big('newScene', 'M12 5v14M5 12h14', 'Scène', 'Nouvelle scène après la scène courante')}${big('note', 'M5 4h14v12l-4 4H5z', 'Note', 'Insérer une note (non exportée)')}</div>
      <div class="rg col"><span class="rnum">Personnage<select data-ed-sel="insChar"><option value="">— insérer —</option>${p.characters.map(c => `<option>${esc((c.name || '').toUpperCase())}</option>`).join('')}</select></span><span class="rnum">Transition<select data-ed-sel="insTrans"><option value="">— insérer —</option>${TRANSITIONS.map(t => `<option>${esc(t)}</option>`).join('')}</select></span></div>
      <div class="rg">${big('titlePage', 'M6 3h12v18H6zM9 8h6M9 12h6', sc.titlePage ? 'Retirer la page de titre' : 'Page de titre', 'Page de titre', sc.titlePage ? 'class="rb big on"' : '')}</div>
      <div class="rg">${big('importText', 'M12 3v12M7 10l5 5 5-5M5 21h14', 'Coller un scénario', 'Importer un texte de scénario existant (reconnaissance automatique des éléments)')}</div>`;
    if (st.tab === 'page') {
      const num = (k, l, step = .1) => `<label class="rnum">${l}<input type="number" step="${step}" data-ed-set="${k}" value="${sc[k]}"></label>`;
      return `
      <div class="rg col">${`<label class="rnum">Police<select data-ed-set="font">${['Courier Prime', 'Courier New', 'Courier'].map(f => `<option ${f === sc.font ? 'selected' : ''}>${f}</option>`).join('')}</select></label>`}${num('size', 'Taille (pt)', 1)}</div>
      <div class="rg col">${num('lh', 'Interligne', .05)}<label class="rnum">Séparateur<select data-ed-set="sep"><option value=" – " ${sc.sep === ' – ' ? 'selected' : ''}>INT. LIEU – JOUR</option><option value=" - " ${sc.sep === ' - ' ? 'selected' : ''}>INT. LIEU - JOUR</option><option value=" / " ${sc.sep === ' / ' ? 'selected' : ''}>INT. LIEU / JOUR</option></select></label></div>
      <div class="rg col"><span class="f-help" style="margin:0">Marges (cm)</span><div class="line">${num('mt', 'Haut')}${num('mb', 'Bas')}</div><div class="line">${num('ml', 'Gauche')}${num('mr', 'Droite')}</div></div>
      <div class="rg col"><span class="f-help" style="margin:0">Retraits depuis la marge (cm)</span><div class="line">${num('char', 'Personnage')}${num('dial', 'Dialogue G')}${num('dialR', 'Dialogue D')}</div><div class="line">${num('paren', 'Didasc. G')}${num('parenR', 'Didasc. D')}</div></div>
      <div class="rg col"><label class="switch"><input type="checkbox" data-ed-set="numbered" ${sc.numbered ? 'checked' : ''}>Numéroter les scènes</label><label class="switch"><input type="checkbox" data-ed-set="pageNumbers" ${sc.pageNumbers ? 'checked' : ''}>Numéros de page</label><button class="btn sm" data-ed="resetLayout">Format par défaut</button></div>`;
    }
    if (st.tab === 'revision') return `
      <div class="rg">${big('stats', 'M5 20V10M12 20V4M19 20v-7', 'Statistiques', 'Pages, mots, répliques par personnage')}${big('checkHead', 'M5 12l4 4 10-10', 'Intitulés', 'Vérifier les intitulés de scène')}${big('unknownChars', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', 'Personnages', 'Personnages du scénario absents du réseau')}</div>
      <div class="rg col"><label class="switch"><input type="checkbox" data-ed-set="spell" ${sc.spell ? 'checked' : ''}>Vérification orthographique</label></div>
      <div class="rg col"><span class="f-help" style="margin:0;max-width:320px">Dialogues symphoniques : piste 1 dialogue narratif, piste 2 dialogue moral (valeurs), piste 3 mots clefs. Le mot clef vient en dernier dans la scène.</span></div>`;
    return `
      <div class="rg">${big('view', 'M6 3h12v18H6z', 'Page', 'Mode Page', `data-v="page" ${st.view === 'page' ? 'class="rb big on"' : ''}`)}${big('view', 'M3 5h8v14H3zM13 5h8v14h-8z', 'Aperçu', 'Pages réelles telles qu\'exportées', `data-v="lecture" ${st.view === 'lecture' ? 'class="rb big on"' : ''}`)}${big('view', 'M4 6h16M8 12h12M8 18h12', 'Plan', 'Plan des scènes', `data-v="plan" ${st.view === 'plan' ? 'class="rb big on"' : ''}`)}${big('focus', 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5', 'Focus', 'Mode concentration (Échap pour sortir)')}</div>
      <div class="rg col"><label class="switch"><input type="checkbox" data-ed-flag="nav" ${st.nav ? 'checked' : ''}>Volet de navigation</label><label class="switch"><input type="checkbox" data-ed-set="memo" ${sc.memo ? 'checked' : ''}>Résumés du tissage en marge</label><label class="switch"><input type="checkbox" data-ed-flag="ribbon" ${st.ribbon ? 'checked' : ''}>Ruban (double-clic sur un onglet)</label></div>
      <div class="rg col">${rb('zoomSet', '100 %', 'Zoom 100 %', 'data-z="100"')}${rb('zoomSet', 'Largeur de page', 'Largeur de page', 'data-z="fit"')}</div>`;
  }

  /* ---------------- synchronisation DOM → données ---------------- */
  function normalize() {
    if (!script) return;
    [...script.childNodes].forEach(n => {
      if (n.nodeType === 3) { if (!n.textContent.trim()) { n.remove(); return; } const p = document.createElement('p'); p.className = 'sp sp-action'; n.replaceWith(p); p.appendChild(n); }
      else if (n.nodeType === 1 && n.tagName !== 'P') { const p = document.createElement('p'); p.className = 'sp sp-action'; p.innerHTML = n.innerHTML; n.replaceWith(p); }
      else if (n.nodeType === 1 && !/\bsp-/.test(n.className)) n.className = 'sp sp-action';
    });
    if (!script.firstChild) { const p = document.createElement('p'); p.className = 'sp sp-scene'; p.innerHTML = '<br>'; script.appendChild(p); }
  }
  function sync() {
    const p = A.P(); if (!p || !script) return false;
    normalize();
    const byId = new Map(p.scenes.map(s => [s.id, s]));
    const order = []; const seen = new Set(); const prelude = []; let cur = null;
    A.$$(':scope > p', script).forEach(el => {
      const t = typeOf(el);
      if (t === 'scene') {
        let id = el.dataset.scene; let s = id && !seen.has(id) ? byId.get(id) : null;
        const h = A.parseHeading(el.textContent);
        if (!s) { s = A.newScene({ action: '', fil: cur ? cur.fil : p.fils[0]?.id }); s.blocks = []; el.dataset.scene = s.id; }
        if (el.textContent.trim()) { s.ie = h.ie; s.lieu = h.lieu; s.moment = h.moment; } else { s.ie = ''; s.lieu = ''; s.moment = ''; }
        s.blocks = []; seen.add(s.id); order.push(s); cur = s;
      } else {
        const b = { t, h: sanitize(el.innerHTML) };
        (cur ? cur.blocks : prelude).push(b);
      }
    });
    const before = JSON.stringify([p.scenes.map(s => [s.id, s.ie, s.lieu, s.moment, s.blocks]), p.prelude]);
    p.scenes = order; p.prelude = prelude;
    const after = JSON.stringify([p.scenes.map(s => [s.id, s.ie, s.lieu, s.moment, s.blocks]), p.prelude]);
    return before !== after;
  }
  const syncLater = A.debounce(() => { const changed = sync(); if (changed) { A.touched(); renderNav(A.P()); } marks(); updateStatus(); }, 450);
  function flush(silent) { if (!script || !document.body.contains(script)) return; syncLater.cancel(); if (sync()) A.touched(); }

  /* ---------------- pagination (repères) ---------------- */
  let pageH = 0;
  function pagePx() { if (pageH) return pageH; const d = document.createElement('div'); d.style.cssText = 'position:absolute;visibility:hidden;height:29.7cm'; document.body.appendChild(d); pageH = d.getBoundingClientRect().height; d.remove(); return pageH; }
  function marks() {
    if (!script) return; const sheet = script.parentElement; A.$$('.pagebreak-mark', sheet).forEach(m => m.remove());
    const H = pagePx(); const total = Math.max(1, Math.ceil(script.scrollHeight / H));
    for (let k = 1; k < total; k++) { const m = document.createElement('div'); m.className = 'pagebreak-mark'; m.style.top = (k * H) + 'px'; m.innerHTML = `<span>Page ${k + 1}</span>`; sheet.appendChild(m); }
    sheet.style.minHeight = (total * H) + 'px';
  }
  function updateStatus() {
    const p = A.P(); if (!p) return;
    const words = [...(p.prelude || []), ...p.scenes.flatMap(s => s.blocks || [])].filter(b => b.t !== 'note').map(b => textOf(b.h)).join(' ').split(/\s+/).filter(Boolean).length;
    const H = pagePx(); let total = script ? Math.max(1, Math.ceil(script.scrollHeight / H)) : null; let cur = 1; let inScript = false;
    const sel = window.getSelection(); if (script && sel.rangeCount && script.contains(sel.anchorNode)) { const r = sel.getRangeAt(0).getBoundingClientRect(); const top = r.top - script.getBoundingClientRect().top; if (r.top) { inScript = true; cur = Math.min(total, Math.max(1, Math.floor(top / (H * st.zoom / 100)) + 1)); } }
    if (A.P().script.titlePage && total) { total += 1; if (inScript) cur += 1; }
    const sp = A.$('#stPage', root); if (sp) sp.textContent = total ? `Page ${cur} sur ${total}` : `${p.scenes.length} scène(s)`;
    const sw = A.$('#stWords', root); if (sw) sw.textContent = `${words.toLocaleString('fr-FR')} mot${words > 1 ? 's' : ''}`;
    const ss = A.$('#stScenes', root); if (ss) ss.textContent = `${p.scenes.length} scène${p.scenes.length > 1 ? 's' : ''}`;
  }

  /* ---------------- aperçu paginé réel ---------------- */
  function buildPreview(p, host) {
    const sc = p.script;
    const blocks = Exporter.flatBlocks(p);
    const measure = document.createElement('div');
    measure.className = 'sheet'; measure.style.cssText = 'position:absolute;visibility:hidden;left:-9999px;top:0;min-height:0';
    measure.innerHTML = `<div class="script" style="min-height:0;padding-top:0;padding-bottom:0">${blocks.map(b => Exporter.blockHTML(b, sc)).join('')}</div>`;
    applyVars(measure.firstChild, sc); applyVars(measure, sc);
    document.body.appendChild(measure);
    const H = pagePx(); const mt = sc.mt / 29.7 * H, mb = sc.mb / 29.7 * H; const usable = H - mt - mb;
    const ps = [...measure.firstChild.children];
    const pages = []; let page = []; let startTop = ps.length ? ps[0].offsetTop : 0;
    ps.forEach((el, i) => {
      const bottom = el.offsetTop + el.offsetHeight;
      if (page.length && bottom - startTop > usable) {
        // ne pas laisser un intitulé ou un nom de personnage seul en bas de page
        const carry = [];
        while (page.length && /sp-(scene|character|paren)/.test(page[page.length - 1].className)) carry.unshift(page.pop());
        if (!page.length) { page = carry; carry.length = 0; }
        pages.push(page); page = carry; startTop = (carry[0] || el).offsetTop;
      }
      page.push(el);
    });
    if (page.length) pages.push(page);
    const tp = sc.titlePage ? `<div class="sheet"><div class="titlepage">${Exporter.titlePageInner(sc)}</div></div>` : '';
    host.innerHTML = tp + pages.map((pg, i) => `<div class="sheet">${sc.pageNumbers && (i > 0 || !sc.titlePage) ? `<div class="pno">${i + 1}.</div>` : ''}<div class="script" style="min-height:0">${pg.map(x => x.outerHTML).join('')}</div></div>`).join('');
    A.$$('.script', host).forEach(s => applyVars(s, sc));
    measure.remove();
    const spg = A.$('#stPage', root); if (spg) spg.textContent = `${pages.length + (sc.titlePage ? 1 : 0)} page${pages.length > 1 ? 's' : ''}`;
  }

  /* ---------------- outils de saisie ---------------- */
  function curP() {
    const sel = window.getSelection(); if (!sel.rangeCount || !script) return null;
    let n = sel.anchorNode; if (!script.contains(n)) return null;
    while (n && n.parentNode !== script) n = n.parentNode;
    return n && n.tagName === 'P' ? n : null;
  }
  function setType(p, t) {
    if (!p) return;
    const was = typeOf(p);
    p.className = 'sp sp-' + t; p.dataset.ph = PH[t] || '';
    if (t !== 'scene') { delete p.dataset.scene; delete p.dataset.memo; }
    if (t === 'paren' && !p.textContent.trim().startsWith('(')) { p.textContent = '(' + p.textContent.trim() + ')'; placeCaret(p, 1 + (p.textContent.length - 2)); }
    if (was === 'paren' && t !== 'paren') { const tx = p.textContent.replace(/^\(|\)$/g, ''); if (tx !== p.textContent) { p.textContent = tx; placeCaret(p, tx.length); } }
    updPh(p); markCur(); syncLater();
  }
  function placeCaret(p, offset = 0) {
    const r = document.createRange(); const sel = window.getSelection();
    let node = p, off = 0;
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT); let acc = 0, tn;
    while ((tn = walker.nextNode())) { if (acc + tn.length >= offset) { node = tn; off = offset - acc; break; } acc += tn.length; }
    if (node === p) { off = p.childNodes.length && offset ? p.childNodes.length : 0; }
    r.setStart(node, off); r.collapse(true); sel.removeAllRanges(); sel.addRange(r);
  }
  function caretAtEnd(p) { placeCaret(p, p.textContent.length); }
  function insertAfter(ref, t, html = '') {
    const np = document.createElement('p'); np.className = 'sp sp-' + t; np.dataset.ph = PH[t] || ''; np.innerHTML = html || '<br>';
    if (ref) ref.after(np); else script.appendChild(np);
    updPh(np); return np;
  }
  function markCur() {
    if (!script) return; A.$$('.cur', script).forEach(x => x.classList.remove('cur'));
    const p = curP(); if (p) p.classList.add('cur');
    const t = p ? typeOf(p) : null;
    A.$$('.sty', root).forEach(b => b.classList.toggle('on', b.dataset.t === t));
    ['bold', 'italic', 'underline', 'strikeThrough'].forEach(c => { const b = A.$(`.rb[data-ed="${c}"]`, root); if (b) { let on = false; try { on = document.queryCommandState(c); } catch (e) {} b.classList.toggle('on', on); } });
    // scène courante dans le volet
    let n = p; while (n && typeOf(n) !== 'scene') n = n.previousElementSibling;
    const id = n?.dataset.scene; A.$$('.navscene', root).forEach(x => x.style.background = x.dataset.id === id ? 'var(--accent-soft)' : '');
  }

  /* --- autocomplétion des personnages --- */
  function names() {
    const p = A.P(); const set = new Set(p.characters.map(c => (c.name || '').trim().toUpperCase()).filter(Boolean));
    p.scenes.forEach(s => (s.blocks || []).forEach(b => { if (b.t === 'character') { const n = textOf(b.h).replace(/\(.*?\)/g, '').trim().toUpperCase(); if (n) set.add(n); } }));
    return [...set];
  }
  let suggIdx = 0;
  function showSuggest(p) {
    const q = p.textContent.trim().toUpperCase();
    const list = names().filter(n => n.startsWith(q) && n !== q).slice(0, 6);
    if (!q || !list.length) { sugg.hidden = true; return; }
    suggIdx = 0;
    sugg.innerHTML = list.map((n, i) => `<div class="${i === 0 ? 'on' : ''}" data-n="${esc(n)}">${esc(n)}</div>`).join('');
    const r = p.getBoundingClientRect(); sugg.style.left = (r.left + 40) + 'px'; sugg.style.top = (r.bottom + 4) + 'px'; sugg.hidden = false;
  }
  function acceptSuggest(p, name) { p.textContent = name; caretAtEnd(p); sugg.hidden = true; updPh(p); syncLater(); }

  /* --- collage / import d'un scénario texte --- */
  function parsePlain(text) {
    const lines = text.replace(/\r/g, '').split('\n');
    const out = []; let prev = null;
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i]; const l = raw.trim();
      if (!l) { prev = null; continue; }
      let t = 'action';
      const next = (lines[i + 1] || '').trim();
      if (/^(\d+\s*[.)]\s*)?(INT|EXT|INT\.?\/EXT|I\/E)[.\s]/i.test(l)) t = 'scene';
      else if (/^(COUPE|FONDU|ENCHAÎNÉ|CUT TO|FADE)/i.test(l) && l === l.toUpperCase()) t = 'transition';
      else if (/^\(.*\)$/.test(l) && prev && ['character', 'dialogue', 'paren'].includes(prev)) t = 'paren';
      else if (prev === 'character' || prev === 'paren') t = 'dialogue';
      else if (l === l.toUpperCase() && /\p{L}/u.test(l) && l.length <= 40 && next && !/^(INT|EXT)/i.test(next)) t = 'character';
      else if (prev === 'dialogue' && /^\s{6,}/.test(raw)) t = 'dialogue';
      out.push({ t, text: t === 'scene' ? l.replace(/^\d+\s*[.)]\s*/, '') : l }); prev = t;
    }
    return out;
  }
  function insertParsed(items) {
    let ref = curP();
    if (ref && !ref.textContent.trim() && typeOf(ref) !== 'scene') { const prev = ref.previousElementSibling; ref.remove(); ref = prev; }
    let last = ref;
    items.forEach(it => { last = insertAfter(last, it.t, esc(it.text)); });
    if (last) caretAtEnd(last);
    flush(); A.commit(false); renderNav(A.P()); marks(); updateStatus();
  }

  /* ---------------- événements ---------------- */
  function bindEditor() {
    const scr = A.$('#edScroll', root);
    root.querySelector('.ribbon').addEventListener('mousedown', e => { if (e.target.closest('button') && !e.target.closest('select,input')) e.preventDefault(); });
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    root.addEventListener('dblclick', e => { if (e.target.closest('[data-edtab]')) { st.ribbon = !st.ribbon; A.$('.ribbon', root).classList.toggle('collapsed', !st.ribbon); } });
    A.$('#zoomRange', root).addEventListener('input', e => setZoom(+e.target.value));
    A.sortable(A.$('#navList', root), '.navscene', '.navscene .handle', ids => { flush(); const p = A.P(); const map = new Map(p.scenes.map(s => [s.id, s])); p.scenes = ids.map(i => map.get(i)).filter(Boolean); A.commit(false); renderPaper(p); renderNav(p); });
    A.$('#navList', root).addEventListener('click', e => { const n = e.target.closest('.navscene'); if (!n || e.target.closest('.handle')) return; goScene(n.dataset.id); });
    // éditeur de page de titre
    A.$$('[data-tp]', root).forEach(el => el.addEventListener('input', () => { A.P().script[el.dataset.tp] = el.innerText.trim(); A.touched(); }));
    const fb = A.$('#fbFind', root); fb && fb.addEventListener('keydown', e => { if (e.key === 'Enter') findNext(); if (e.key === 'Escape') toggleFind(false); });
    if (!script) return;
    script.addEventListener('input', onInput);
    script.addEventListener('keydown', onKey);
    script.addEventListener('paste', onPaste);
    script.addEventListener('keyup', markCur); script.addEventListener('mouseup', () => { markCur(); updateStatus(); });
    script.addEventListener('blur', () => { setTimeout(() => sugg.hidden = true, 150); flush(); });
    sugg.addEventListener('mousedown', e => { const d = e.target.closest('[data-n]'); if (d) { e.preventDefault(); const p = curP(); if (p) acceptSuggest(p, d.dataset.n); } });
    let tm; scr.addEventListener('scroll', () => { clearTimeout(tm); tm = setTimeout(updateStatus, 120); });
  }
  function onInput(e) {
    const p = curP();
    if (e.inputType === 'insertParagraph' && p) {
      const prev = p.previousElementSibling;
      if (prev && prev.tagName === 'P') {
        const pType = typeOf(prev);
        if (prev.dataset.scene && prev.dataset.scene === p.dataset.scene) {
          if (!prev.textContent.trim() && p.textContent.trim()) { delete prev.dataset.scene; delete prev.dataset.memo; prev.className = 'sp sp-action'; prev.dataset.ph = PH.action; }
          else { delete p.dataset.scene; delete p.dataset.memo; setType(p, NEXT.scene); }
        } else if (!p.textContent.trim()) setType(p, NEXT[pType] || 'action');
        else { p.className = 'sp sp-' + pType; }
        updPh(prev);
      }
    }
    if (p) { updPh(p); if (typeOf(p) === 'character') showSuggest(p); else sugg.hidden = true; }
    syncLater();
  }
  function onKey(e) {
    const p = curP(); const mod = e.ctrlKey || e.metaKey;
    if (!sugg.hidden && p) {
      const items = A.$$('div', sugg);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); suggIdx = (suggIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((x, i) => x.classList.toggle('on', i === suggIdx)); return; }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) { e.preventDefault(); acceptSuggest(p, items[suggIdx].dataset.n); if (e.key === 'Enter') { const np = insertAfter(p, 'dialogue'); placeCaret(np, 0); syncLater(); } return; }
      if (e.key === 'Escape') { sugg.hidden = true; return; }
    }
    if (e.key === 'Tab' && p) {
      e.preventDefault(); const t = typeOf(p);
      let i = TAB_CYCLE.indexOf(t); i = (i + (e.shiftKey ? -1 : 1) + TAB_CYCLE.length) % TAB_CYCLE.length;
      setType(p, t === 'action' && !p.textContent.trim() && !e.shiftKey ? 'character' : TAB_CYCLE[i]); return;
    }
    if (mod && /^[1-8]$/.test(e.key) && !e.altKey) { e.preventDefault(); setType(p, T.SCRIPT_TYPES[+e.key - 1].t); return; }
    if (mod && (e.key === 'f' || e.key === 'h')) { e.preventDefault(); toggleFind(true); return; }
    if (e.key === 'Escape' && document.body.classList.contains('focus-mode')) { document.body.classList.remove('focus-mode'); return; }
    if (e.key === 'Enter' && !e.shiftKey && p && !p.textContent.trim() && typeOf(p) === 'dialogue') { e.preventDefault(); setType(p, 'action'); return; }
  }
  function onPaste(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain') || '';
    if (!text.includes('\n')) { document.execCommand('insertText', false, text); return; }
    insertParsed(parsePlain(text));
  }
  function goScene(id) {
    if (st.view !== 'page') { st.view = 'page'; render(root); }
    const el = script && A.$(`p[data-scene="${id}"]`, script); if (!el) return;
    el.scrollIntoView({ block: 'start', behavior: 'smooth' }); placeCaret(el, el.textContent.length); script.focus(); markCur();
  }
  function setZoom(z) {
    if (z === 'fit') { const w = A.$('#edScroll', root).clientWidth - 40; const sheet = 21 / 29.7 * pagePx(); z = Math.round(Math.min(200, Math.max(50, w / sheet * 100)) / 10) * 10; }
    st.zoom = Math.min(200, Math.max(50, z));
    const zz = A.$('#edZoom', root); zz.style.transform = `scale(${st.zoom / 100})`; zz.style.marginBottom = st.zoom > 100 ? `${(st.zoom - 100) * 12}px` : '0';
    A.$('#zoomRange', root).value = st.zoom; A.$('#zoomPct', root).textContent = st.zoom + ' %';
  }
  function toggleFind(on) { st.find = on; const f = A.$('.findbar', root); f.hidden = !on; if (on) A.$('#fbFind', root).focus(); }
  function findNext() {
    const q = A.$('#fbFind', root).value; if (!q || !script) return;
    const sel = window.getSelection();
    if (!script.contains(sel.anchorNode)) placeCaret(script.firstChild, 0);
    let ok = window.find ? window.find(q, false, false, true) : false;
    if (ok && !script.contains(window.getSelection().anchorNode)) { placeCaret(script.firstChild, 0); ok = window.find(q, false, false, true); }
    A.$('#fbInfo', root).textContent = ok ? '' : 'Aucun résultat';
  }
  function replaceAll() {
    const q = A.$('#fbFind', root).value; const r = A.$('#fbRepl', root).value; if (!q || !script) return;
    let n = 0; const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const w = document.createTreeWalker(script, NodeFilter.SHOW_TEXT); let t;
    while ((t = w.nextNode())) { const m = t.textContent.match(re); if (m) { n += m.length; t.textContent = t.textContent.replace(re, r); } }
    flush(); A.commit(false); renderNav(A.P()); A.$('#fbInfo', root).textContent = n + ' remplacement(s)';
  }

  async function onClick(e) {
    const tab = e.target.closest('[data-edtab]'); if (tab) { st.tab = tab.dataset.edtab; A.$$('[data-edtab]', root).forEach(b => { b.classList.toggle('on', b === tab); b.setAttribute('aria-selected', b === tab); }); A.$('.ribbon', root).innerHTML = ribbonHTML(A.P()); if (!st.ribbon) { st.ribbon = true; A.$('.ribbon', root).classList.remove('collapsed'); } return; }
    const ps = e.target.closest('[data-plan-scene]'); if (ps) return goScene(ps.dataset.planScene);
    const b = e.target.closest('[data-ed]'); if (!b) return;
    const cmd = b.dataset.ed; const p = curP(); const P = A.P();
    switch (cmd) {
      case 'bold': case 'italic': case 'underline': case 'strikeThrough': case 'removeFormat': document.execCommand(cmd); markCur(); syncLater(); break;
      case 'cut': case 'copy': document.execCommand(cmd); break;
      case 'paste': A.toast('Utilisez Ctrl+V (⌘+V) pour coller : le navigateur ne permet pas au bouton de lire le presse-papiers.'); break;
      case 'upper': { const sel = window.getSelection(); if (sel.rangeCount && !sel.isCollapsed) document.execCommand('insertText', false, sel.toString().toLocaleUpperCase('fr')); else if (p) { p.textContent = p.textContent.toLocaleUpperCase('fr'); caretAtEnd(p); } syncLater(); break; }
      case 'type': if (p) setType(p, b.dataset.t); else A.toast('Placez d\'abord le curseur dans le scénario'); break;
      case 'find': toggleFind(true); break;
      case 'findClose': toggleFind(false); break;
      case 'findNext': findNext(); break;
      case 'replaceAll': replaceAll(); break;
      case 'newScene': {
        if (!script) break; let ref = p; if (ref) { while (ref.nextElementSibling && typeOf(ref.nextElementSibling) !== 'scene') ref = ref.nextElementSibling; } else ref = script.lastElementChild;
        const np = insertAfter(ref, 'scene'); placeCaret(np, 0); script.focus(); syncLater(); break;
      }
      case 'note': { if (!script) break; const np = insertAfter(p || script.lastElementChild, 'note'); placeCaret(np, 0); script.focus(); syncLater(); break; }
      case 'titlePage': P.script.titlePage = !P.script.titlePage; flush(); A.commit(false); render(root); break;
      case 'importText': A.modal({ title: 'Coller un scénario existant', wide: true, html: `<p>Collez un scénario au format texte : les intitulés (INT./EXT.), personnages en majuscules, didascalies entre parenthèses, dialogues et transitions sont reconnus automatiquement. Le texte est inséré à la position du curseur et les scènes apparaissent dans le tissage.</p><textarea class="in" id="impTxt" rows="14" style="font-family:var(--font-script)"></textarea>`, actions: [{ label: 'Annuler' }, { label: 'Insérer', cls: 'primary', run: back => { const v = A.$('#impTxt', back).value; if (!v.trim()) return; if (!curP() && script) placeCaret(script.lastElementChild, script.lastElementChild.textContent.length); insertParsed(parsePlain(v)); } }] }); break;
      case 'view': flush(); st.view = b.dataset.v; render(root); break;
      case 'focus': document.body.classList.toggle('focus-mode'); if (document.body.classList.contains('focus-mode')) A.toast('Mode Focus : Échap pour quitter'); break;
      case 'zoom': setZoom(st.zoom + +b.dataset.z); break;
      case 'zoomSet': setZoom(b.dataset.z === 'fit' ? 'fit' : +b.dataset.z); break;
      case 'resetLayout': { const d = { font: 'Courier Prime', size: 12, lh: 1, mt: 2.5, mb: 2.5, ml: 3.5, mr: 2.5, char: 6, paren: 4.5, parenR: 4, dial: 3, dialR: 2.5, sep: ' – ' }; flush(); Object.assign(P.script, d); A.commit(false); render(root); break; }
      case 'stats': flush(); statsDialog(P); break;
      case 'checkHead': { flush(); const bad = P.scenes.map((s, i) => [i + 1, s]).filter(([, s]) => !s.ie || !s.lieu || !s.moment); A.modal({ title: 'Vérification des intitulés', html: bad.length ? `<p>${bad.length} intitulé(s) incomplet(s) :</p><ul>${bad.map(([n, s]) => `<li>Scène ${n} : « ${esc(A.headingOf(s) || '(vide)')} » — manque ${[!s.ie && 'INT./EXT.', !s.lieu && 'le lieu', !s.moment && 'le moment'].filter(Boolean).join(', ')}</li>`).join('')}</ul>` : '<p>Tous les intitulés sont complets (INT./EXT., lieu, moment).</p>' }); break; }
      case 'unknownChars': {
        flush(); const known = new Set(P.characters.map(c => (c.name || '').trim().toUpperCase()));
        const unk = names().filter(n => !known.has(n));
        A.modal({ title: 'Personnages du scénario', html: unk.length ? `<p>Ces personnages parlent dans le scénario mais ne figurent pas dans le réseau de personnages :</p><p><b>${unk.map(esc).join(', ')}</b></p>` : '<p>Tous les personnages qui parlent figurent dans le réseau de personnages.</p>',
          actions: unk.length ? [{ label: 'Fermer' }, { label: 'Les ajouter au réseau', cls: 'primary', run: () => { unk.forEach(n => P.characters.push({ id: A.uid(), name: A.capWords(n.toLocaleLowerCase('fr')), role: 'Autre', archetype: '' })); A.commit(false); A.toast(unk.length + ' personnage(s) ajouté(s)'); } }] : [{ label: 'Fermer' }] });
        break;
      }
    }
  }
  function onChange(e) {
    const el = e.target; const P = A.P();
    if (el.dataset.edSel) {
      const v = el.value; el.value = ''; if (!v || !script) return;
      let p = curP() || script.lastElementChild;
      if (el.dataset.edSel === 'insChar') { const np = (p && !p.textContent.trim()) ? (setType(p, 'character'), p) : insertAfter(p, 'character'); np.textContent = v; const d = insertAfter(np, 'dialogue'); placeCaret(d, 0); }
      else { const np = (p && !p.textContent.trim()) ? (setType(p, 'transition'), p) : insertAfter(p, 'transition'); np.textContent = v; caretAtEnd(np); }
      script.focus(); syncLater(); return;
    }
    if (el.dataset.edFlag) { st[el.dataset.edFlag] = el.checked; if (el.dataset.edFlag === 'nav') A.$('.ed-nav', root).hidden = !el.checked; if (el.dataset.edFlag === 'ribbon') A.$('.ribbon', root).classList.toggle('collapsed', !el.checked); return; }
    if (el.dataset.edSet) {
      const k = el.dataset.edSet; let v = el.type === 'checkbox' ? el.checked : el.type === 'number' ? parseFloat(el.value) : el.value;
      if (el.type === 'number' && isNaN(v)) return;
      flush(); P.script[k] = v; A.commit(false);
      if (k === 'spell' && script) script.spellcheck = v;
      else { const keepTab = st.tab; render(root); st.tab = keepTab; }
    }
  }

  function statsDialog(P) {
    const per = {}; let curName = null; let dial = 0;
    P.scenes.forEach(s => (s.blocks || []).forEach(b => {
      if (b.t === 'character') { curName = textOf(b.h).replace(/\(.*?\)/g, '').trim().toUpperCase(); per[curName] = per[curName] || { r: 0, w: 0, sc: new Set() }; per[curName].r++; per[curName].sc.add(s.id); }
      else if (b.t === 'dialogue' && curName) { const w = textOf(b.h).split(/\s+/).filter(Boolean).length; per[curName].w += w; dial += w; }
    }));
    const all = P.scenes.flatMap(s => s.blocks || []).filter(b => b.t !== 'note').map(b => textOf(b.h)).join(' ').split(/\s+/).filter(Boolean).length;
    const ie = { 'INT.': 0, 'EXT.': 0, 'INT./EXT.': 0 }; const mo = {}; P.scenes.forEach(s => { ie[s.ie] = (ie[s.ie] || 0) + 1; mo[s.moment || '—'] = (mo[s.moment || '—'] || 0) + 1; });
    const fils = P.fils.map(f => [f.name, P.scenes.filter(s => s.fil === f.id).length]);
    const rows = Object.entries(per).sort((a, b) => b[1].w - a[1].w);
    A.modal({ title: 'Statistiques du scénario', wide: true, html: `<table class="stats-table"><tr><td>Scènes</td><td class="n">${P.scenes.length}</td></tr><tr><td>Mots (hors notes)</td><td class="n">${all.toLocaleString('fr-FR')}</td></tr><tr><td>Mots de dialogue</td><td class="n">${dial.toLocaleString('fr-FR')} (${all ? Math.round(dial / all * 100) : 0} %)</td></tr><tr><td>Intérieurs / extérieurs</td><td class="n">${ie['INT.']} / ${ie['EXT.']}${ie['INT./EXT.'] ? ' / ' + ie['INT./EXT.'] + ' mixtes' : ''}</td></tr><tr><td>Moments</td><td class="n">${Object.entries(mo).map(([k, v]) => esc(k) + ' ' + v).join(' · ')}</td></tr><tr><td>Scènes par fil d'intrigue</td><td class="n">${fils.map(([n, v]) => esc(n) + ' ' + v).join(' · ')}</td></tr></table>
      <h3 style="margin:16px 0 4px;font-size:15px">Répliques par personnage</h3>${rows.length ? `<table class="stats-table"><tr><th>Personnage</th><th class="n">Répliques</th><th class="n">Mots</th><th class="n">Scènes</th></tr>${rows.map(([n, v]) => `<tr><td>${esc(n)}</td><td class="n">${v.r}</td><td class="n">${v.w}</td><td class="n">${v.sc.size}</td></tr>`).join('')}</table>` : '<p>Aucun dialogue pour l\'instant.</p>'}` });
  }

  return { render, flush, sync, scriptHTML, textOf, sanitize, PH, LABEL };
})();
window.Editor = Editor;
