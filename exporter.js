/* =====================================================================
   TRUBY STUDIO — Exports : HTML, Markdown, PDF, Fountain, fichier projet
   ===================================================================== */
'use strict';

const Exporter = (() => {
  const T = window.TRUBY; const A = App;
  const esc = A.esc;
  const txt = h => Editor.textOf(h || '');
  const UP = new Set(['scene', 'character', 'transition', 'shot']);

  /* ---------- scénario : blocs aplatis ---------- */
  function flatBlocks(p) {
    const out = (p.prelude || []).filter(b => b.t !== 'note').map(b => ({ ...b }));
    p.scenes.forEach((s, i) => {
      out.push({ t: 'scene', h: esc(A.headingOf(s, p.script.sep)), n: i + 1 });
      const blocks = s.blocks === undefined ? (s.action ? [{ t: 'action', h: esc(s.action) }] : []) : s.blocks;
      blocks.forEach(b => { if (b.t !== 'note' && A.filled(b.h)) out.push({ ...b }); });
    });
    return out;
  }
  function blockHTML(b, sc) {
    const num = b.t === 'scene' && sc.numbered && b.n ? `${b.n}. ` : '';
    return `<p class="sp sp-${b.t}">${num}${b.h || ''}</p>`;
  }
  function titlePageInner(sc) {
    return `<div><div class="tt">${esc(sc.title || '')}</div><div style="margin-top:1.2em">écrit par</div><div>${esc(sc.author || '')}</div>${sc.draft ? `<div style="margin-top:2em;font-size:.9em">${esc(sc.draft)}</div>` : ''}</div>${sc.contact ? `<div class="tbot">${esc(sc.contact)}</div>` : ''}`;
  }
  function scriptCSS(sc) {
    return `
@page { size: A4; margin: ${sc.mt}cm ${sc.mr}cm ${sc.mb}cm ${sc.ml}cm; ${sc.pageNumbers ? `@top-right { content: counter(page) "."; font-family: "${sc.font}", "Courier New", monospace; font-size: ${sc.size}pt; }` : ''} }
${sc.titlePage ? '@page title { margin: 2.5cm; @top-right { content: none; } }' : ''}
.screenplay { font-family: "${sc.font}", "Courier New", Courier, monospace; font-size: ${sc.size}pt; line-height: ${sc.lh}; color: #000; }
.screenplay p { margin: 0; white-space: pre-wrap; orphans: 2; widows: 2; }
.screenplay .sp-scene { font-weight: 700; text-transform: uppercase; margin-top: 2em; margin-bottom: 1em; break-after: avoid; page-break-after: avoid; }
.screenplay .sp-scene:first-child { margin-top: 0; }
.screenplay .sp-action { margin-bottom: 1em; }
.screenplay .sp-character { text-transform: uppercase; margin-left: ${sc.char}cm; margin-top: .2em; break-after: avoid; page-break-after: avoid; }
.screenplay .sp-paren { margin-left: ${sc.paren}cm; margin-right: ${sc.parenR}cm; break-after: avoid; page-break-after: avoid; }
.screenplay .sp-dialogue { margin-left: ${sc.dial}cm; margin-right: ${sc.dialR}cm; margin-bottom: 1em; }
.screenplay .sp-transition { text-transform: uppercase; text-align: right; margin: 1em 0; }
.screenplay .sp-shot { text-transform: uppercase; margin: 1em 0; }
.titlepage { page: title; break-after: page; page-break-after: always; height: 24.6cm; position: relative; display: flex; align-items: center; justify-content: center; text-align: center; font-family: "${sc.font}", "Courier New", monospace; font-size: ${sc.size}pt; }
.titlepage .tt { font-weight: 700; font-size: 1.6em; text-transform: uppercase; }
.titlepage .tbot { position: absolute; left: 0; bottom: 0; text-align: left; white-space: pre-wrap; }`;
  }
  function screenplayBody(p) {
    const sc = p.script;
    return `${sc.titlePage ? `<section class="titlepage">${titlePageInner(sc)}</section>` : ''}<section class="screenplay">${flatBlocks(p).map(b => blockHTML(b, sc)).join('\n')}</section>`;
  }
  function docShell(title, css, body) {
    return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap">
<meta name="generator" content="Truby Studio">
<style>
body { margin: 0; background: #fff; color: #111; }
${css}
@media screen { body { background: #e9ebef; } .paper { background: #fff; width: 21cm; margin: 24px auto; padding: 2.5cm ${'${MR}'} 2.5cm ${'${ML}'}; box-shadow: 0 2px 10px rgba(0,0,0,.12); box-sizing: border-box; } }
@media print { .paper { padding: 0; } .noprint { display: none; } }
</style></head><body>${body}</body></html>`;
  }
  function scriptDoc(p) {
    const sc = p.script;
    return docShell(sc.title || p.title, scriptCSS(sc), `<div class="paper">${screenplayBody(p)}</div>`).replace('${MR}', sc.mr + 'cm').replace('${ML}', sc.ml + 'cm');
  }

  /* ---------- dossier : texte par section ---------- */
  const g = (p, path) => A.getP(p, path);
  function fieldsMD(p, groups, base) {
    let out = '';
    groups.forEach(gr => {
      let part = '';
      const obj = g(p, base) || {};
      (gr.fields || []).forEach(f => { if (f.showIf && !f.showIf(obj)) return; const v = g(p, base + '.' + f.k); if (!A.filled(v)) return;
        if (Array.isArray(v)) part += `**${f.l}**\n\n${v.filter(x => A.filled(x.text)).map(x => `- ${String(x.text).trim()}${x.stars ? ' ' + '★'.repeat(x.stars) : ''}`).join('\n')}\n\n`;
        else part += `**${f.l}** — ${String(v).trim()}\n\n`; });
      if (gr.list) { const arr = g(p, base + '.' + gr.list) || []; arr.forEach((it, i) => { const line = gr.itemFields.map(f => it[f.k] ? `${f.l} : ${it[f.k]}` : '').filter(Boolean).join(' · '); if (line) part += `${i + 1}. ${line}\n`; }); if (arr.length) part += '\n'; }
      if (part) out += `### ${gr.group}\n\n${part}`;
    });
    return out;
  }
  function characterMD(p, c) {
    if (!c) return '';
    const arch = (T.ARCHETYPES.find(a => a[0] === c.archetype) || [])[1];
    let s = `### ${c.name || 'Sans nom'}${c.role ? ' — ' + c.role : ''}${arch && c.archetype ? ' [' + arch + ']' : ''}\n\n`;
    [['faiblessePsy', 'Faiblesses psychologiques'], ['faiblesseMorale', 'Faiblesses morales'], ['besoinPsy', 'Besoin psychologique'], ['besoinMoral', 'Besoin moral']].concat(T.CHAR_FIELDS.map(f => [f.k, f.l]))
      .forEach(([k, l]) => { if (A.filled(c[k])) s += `- **${l}** : ${String(c[k]).trim()}\n`; });
    const sym = (p.symboles.persos || {})[c.id]; if (sym && A.filled(sym.symbole)) s += `- **Symbole${sym.type ? ' (' + sym.type + ')' : ''}** : ${sym.symbole}\n`;
    return s + '\n';
  }
  function sectionMD(p, id) {
    const sec = T.SECTIONS.find(s => s.id === id);
    let s = `## ${sec.n}. ${sec.title}\n\n`;
    if (id === 'premisse') {
      s += fieldsMD(p, T.PREMISSE, 'premisse');
      const ck = T.CHECKLIST_PREMISSE.map(([k, t]) => `- [${p.premisse.check[k] ? 'x' : ' '}] ${t}`).join('\n'); s += `### Check-list des prémisses\n\n${ck}\n\n`;
    } else if (id === 'structure') {
      const S = T.STRUCTURES[p.structure.mode];
      s += `_${S ? S.title + ' — ' + S.full : 'Structure non encore choisie (7 étapes ou 22 étapes)'}_\n\n`;
      const barred = p.structure.mode === '22' ? T.STEPS.filter(st => !A.structOn(p, st)) : [];
      if (barred.length) s += `_Étapes barrées : ${barred.map(st => st.n + '. ' + st.title).join(' ; ')}._\n\n`;
      if (A.filled(p.structure.evenements)) s += `### Événements\n\n${p.structure.evenements.trim()}\n\n`;
      A.activeSteps(p).forEach(st => {
        const d = p.structure.data[st.id] || {}; const parts = st.f.map(f => A.filled(d[f.k]) ? `**${f.l}** — ${String(d[f.k]).trim()}` : '').filter(Boolean);
        s += `### ${st.n}. ${st.title}\n\n${parts.length ? parts.join('\n\n') : '_À compléter._'}\n\n`;
      });
    } else if (id === 'personnages') {
      p.characters.forEach(c => s += characterMD(p, c));
      const co = p.persoGlobal.coins || {}; const nm = k => (p.characters.find(c => c.id === co[k]) || {}).name;
      if (nm('tl') || nm('tr')) s += `### Opposition à quatre coins\n\n- Héros : ${nm('tl') || '—'}\n- Adversaire principal : ${nm('tr') || '—'}\n- Deuxième adversaire : ${nm('bl') || '—'}\n- Troisième adversaire : ${nm('br') || '—'}\n\n`;
      s += fieldsMD(p, [{ group: 'Problème moral central et transformation du héros', fields: T.PERSO_GLOBAL }], 'persoGlobal');
    } else if (id === 'debat') {
      s += fieldsMD(p, T.DEBAT, 'debat');
      const v = p.debat.variations || {}; const lines = p.characters.filter(c => A.filled(v[c.id])).map(c => `- **${c.name}** : ${v[c.id]}`);
      if (lines.length) s += `### Les personnages comme variations sur un même thème\n\n${lines.join('\n')}\n\n`;
    } else if (id === 'univers') {
      const nat = T.NATURAL.filter(([k]) => (p.univers.nat || {})[k]).map(x => x[1]); if (nat.length) s += `**Cadres naturels** — ${nat.join(', ')}\n\n`;
      s += fieldsMD(p, T.UNIVERS, 'univers');
    } else if (id === 'symboles') s += fieldsMD(p, T.SYMBOLES, 'symboles');
    else if (id === 'intrigue') {
      s += fieldsMD(p, T.INTRIGUE, 'intrigue');
      const rv = (p.intrigue.reveals || []).filter(r => A.filled(r.revelation)); if (rv.length) s += `### Rebondissements-révélations supplémentaires\n\n${rv.map((r, i) => `${i + 1}. ${r.revelation}${r.decision ? ' → décision : ' + r.decision : ''}${r.desir ? ' → ' + r.desir : ''}`).join('\n')}\n\n`;
    } else if (id === 'tissage') {
      p.scenes.forEach((sc, i) => { const st = A.structOn(p, { id: sc.step }) ? A.stepDef(p, sc.step) : null; const fil = p.fils.find(f => f.id === sc.fil); const who = sc.persos.map(id2 => (p.characters.find(c => c.id === id2) || {}).name).filter(Boolean);
        s += `${i + 1}. **${A.headingOf(sc, p.script.sep).toUpperCase() || 'SCÈNE'}** — ${sc.action || '…'}${st ? ` _(étape ${st.n} : ${st.title})_` : ''}${p.fils.length > 1 && fil ? ` [${fil.name}]` : ''}${who.length ? ` · ${who.join(', ')}` : ''}\n`;
        const b = Object.entries(sc.build || {}).filter(([, v]) => A.filled(v)); if (b.length) s += b.map(([k, v]) => `   - ${(T.SCENE_BUILD.find(f => f.k === k) || {}).l || k} : ${v}`).join('\n') + '\n';
      });
      s += '\n';
    } else if (id === 'scenario') s += scriptMD(p, false);
    return s;
  }

  /* ---------- scénario en Markdown / Fountain ---------- */
  function scriptMD(p, withTitle = true) {
    const sc = p.script; let s = withTitle ? `# ${sc.title || p.title}\n\n_écrit par ${sc.author || '—'}_${sc.draft ? ' · ' + sc.draft : ''}\n\n---\n\n` : '';
    flatBlocks(p).forEach(b => {
      const t = txt(b.h).trim(); if (!t) return;
      if (b.t === 'scene') s += `\n### ${sc.numbered ? b.n + '. ' : ''}${t.toUpperCase()}\n\n`;
      else if (b.t === 'action') s += `${t}\n\n`;
      else if (b.t === 'character') s += `**${t.toUpperCase()}**  \n`;
      else if (b.t === 'paren') s += `_${t}_  \n`;
      else if (b.t === 'dialogue') s += `${t.replace(/\n/g, '  \n')}\n\n`;
      else if (b.t === 'transition') s += `> ${t.toUpperCase()}\n\n`;
      else if (b.t === 'shot') s += `**${t.toUpperCase()}**\n\n`;
    });
    return s;
  }
  function fountain(p) {
    const sc = p.script; let s = `Title: ${sc.title || p.title}\nCredit: écrit par\nAuthor: ${sc.author || ''}\n${sc.draft ? 'Draft date: ' + sc.draft + '\n' : ''}${sc.contact ? 'Contact: ' + sc.contact.replace(/\n/g, '\n    ') + '\n' : ''}\n`;
    flatBlocks(p).forEach(b => {
      const t = txt(b.h).trim(); if (!t) return;
      if (b.t === 'scene') s += `\n${/^(INT|EXT|I\/E)/i.test(t) ? '' : '.'}${t.toUpperCase()}${sc.numbered ? ' #' + b.n + '#' : ''}\n\n`;
      else if (b.t === 'character') s += `${t.toUpperCase()}\n`;
      else if (b.t === 'paren') s += `${t.startsWith('(') ? t : '(' + t + ')'}\n`;
      else if (b.t === 'dialogue') s += `${t}\n\n`;
      else if (b.t === 'transition') s += `> ${t.toUpperCase()}\n\n`;
      else s += `${b.t === 'shot' ? '!' : ''}${t}\n\n`;
    });
    return s;
  }
  function dossierMD(p) {
    let s = `# ${p.title} — dossier d'écriture (méthode Truby)\n\n_Auteur : ${p.author || '—'} · exporté le ${new Date().toLocaleDateString('fr-FR')} depuis Truby Studio._\n\n> Ce document suit le processus de John Truby (« L'Anatomie du scénario ») : prémisse, sept étapes clefs / vingt-deux étapes, personnages, débat moral, univers du récit, réseau de symboles, intrigue, tissage des scènes, puis le scénario.\n\n`;
    ['premisse', 'structure', 'personnages', 'debat', 'univers', 'symboles', 'intrigue', 'tissage'].forEach(id => { s += sectionMD(p, id) + '\n'; });
    s += `## 9. Scénario final\n\n` + scriptMD(p, false);
    return s;
  }
  function mdToHTML(md) {
    const lines = md.split('\n'); let out = ''; let inList = false, inOl = false;
    const inline = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[\s(])_(.+?)_(?=[\s.,;:)]|$)/g, '$1<i>$2</i>');
    const close = () => { if (inList) { out += '</ul>'; inList = false; } if (inOl) { out += '</ol>'; inOl = false; } };
    lines.forEach(l => {
      let m;
      if ((m = l.match(/^(#{1,4}) (.*)/))) { close(); out += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`; }
      else if ((m = l.match(/^\s*- \[( |x)\] (.*)/))) { if (!inList) { close(); out += '<ul class="ck">'; inList = true; } out += `<li>${m[1] === 'x' ? '☑' : '☐'} ${inline(m[2])}</li>`; }
      else if ((m = l.match(/^\s*- (.*)/))) { if (!inList) { close(); out += '<ul>'; inList = true; } out += `<li>${inline(m[1])}</li>`; }
      else if ((m = l.match(/^\d+\. (.*)/))) { if (!inOl) { close(); out += '<ol>'; inOl = true; } out += `<li>${inline(m[1])}</li>`; }
      else if ((m = l.match(/^> (.*)/))) { close(); out += `<blockquote>${inline(m[1])}</blockquote>`; }
      else if (l.trim() === '---') { close(); out += '<hr>'; }
      else if (l.trim()) { close(); out += `<p>${inline(l)}</p>`; }
      else close();
    });
    close(); return out;
  }
  function dossierDoc(p) {
    const md = ['premisse', 'structure', 'personnages', 'debat', 'univers', 'symboles', 'intrigue', 'tissage'].map(id => sectionMD(p, id)).join('\n');
    const sc = p.script;
    const css = scriptCSS(sc).replace(/@page \{[^}]*\{[^}]*\}[^}]*\}|@page \{[^}]*\}/, `@page { size: A4; margin: 2.2cm 2cm; }`) + `
.dossier { font-family: "Source Serif 4", Georgia, serif; font-size: 11.5pt; line-height: 1.5; color: #1a1d22; max-width: 17cm; margin: 0 auto; }
.dossier h1 { font-size: 26pt; margin: 0 0 4pt; } .dossier h2 { font-size: 17pt; margin: 22pt 0 6pt; border-bottom: 1px solid #ccd; padding-bottom: 3pt; break-after: avoid; }
.dossier h3 { font-size: 12.5pt; margin: 14pt 0 4pt; color: #185abd; break-after: avoid; } .dossier p { margin: 0 0 7pt; } .dossier blockquote { margin: 8pt 0; padding: 6pt 10pt; border-left: 3px solid #185abd; background: #f3f6fb; }
.dossier ul.ck { list-style: none; padding-left: 0; } .script-part { break-before: page; page-break-before: always; } .script-part h2.sp-title { font-family: "Source Serif 4", Georgia, serif; }
@media screen { .dossier, .script-wrap { background: #fff; width: 21cm; max-width: 100%; margin: 24px auto; padding: 2cm; box-sizing: border-box; box-shadow: 0 2px 10px rgba(0,0,0,.12); } }`;
    const body = `<div class="dossier"><h1>${esc(p.title)}</h1><p><i>Dossier d'écriture selon la méthode de John Truby — ${esc(p.author || '')} — ${new Date().toLocaleDateString('fr-FR')}</i></p>${mdToHTML(md)}</div>
      <div class="script-part script-wrap" style="padding-left:${sc.ml}cm;padding-right:${sc.mr}cm">${screenplayBody(p)}</div>`;
    return docShell(p.title + ' — dossier', css, body).replace('${MR}', '2cm').replace('${ML}', '2cm');
  }

  /* ---------- PDF via la boîte d'impression ---------- */
  function printDoc(html) {
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(f);
    f.onload = () => {
      const w = f.contentWindow;
      const go = () => { try { w.focus(); w.print(); } catch (e) { A.toast('Impression impossible ici : exportez en HTML puis imprimez en PDF depuis le navigateur.', { alert: true }); } setTimeout(() => f.remove(), 60000); };
      (w.document.fonts ? w.document.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 250));
    };
    f.srcdoc = html;
    A.toast('Dans la fenêtre d\'impression, choisissez « Enregistrer au format PDF ».');
  }

  /* ---------- panneau ---------- */
  function panelHTML(p) {
    const btn = (k, l, cls = '') => `<button class="btn sm ${cls}" data-exp="${k}">${l}</button>`;
    return `<div class="exp-grid">
      <div class="exp-card"><h3>Scénario final</h3><p>Uniquement le scénario (page de titre comprise), au format de mise en page défini dans l'éditeur.</p><div class="b">${btn('scriptPDF', 'PDF', 'primary')}${btn('scriptHTML', 'HTML')}${btn('scriptMD', 'Markdown')}${btn('scriptFountain', 'Fountain')}${btn('scriptCopy', 'Copier (Markdown)')}</div></div>
      <div class="exp-card"><h3>Dossier complet</h3><p>Toutes les étapes de Truby, de la prémisse au tissage, suivies du scénario.</p><div class="b">${btn('dossierPDF', 'PDF', 'primary')}${btn('dossierHTML', 'HTML')}${btn('dossierMD', 'Markdown')}${btn('dossierCopy', 'Copier (Markdown)')}</div></div>
      <div class="exp-card"><h3>Fichier projet (.truby)</h3><p>Le projet modifiable, à rouvrir ici pour continuer à travailler. Seul Truby Studio reconnaît ce format.</p><div class="b">${btn('projSave', 'Enregistrer le fichier', 'primary')}${btn('projSaveAs', 'Enregistrer sous…')}</div></div>
      <div class="exp-card"><h3>Pour Claude ou ChatGPT</h3><p>Le Markdown est lisible par n'importe quelle IA : copiez-le dans la conversation, ou connectez Claude directement avec le bouton « Claude ».</p><div class="b">${btn('dossierCopy', 'Copier le dossier')}${btn('openClaude', 'Ouvrir Claude')}</div></div>
    </div>`;
  }
  function onClick(btn) {
    const p = A.P(); if (!p) return;
    if (window.Editor && A.ui.view === 'scenario') Editor.flush(true);
    const name = A.safeName(p.title);
    const dl = async (content, ext, type) => { const ok = await A.download(new Blob([content], { type: type + ';charset=utf-8' }), name + ext); if (ok) A.toast('Fichier exporté : ' + name + ext); return ok; };
    /* dans claude.ai, l'impression est bloquée : on enregistre une page prête à imprimer en PDF */
    const pdf = (html, ext) => window.claude ? dl(html, ext, 'text/html').then(ok => ok && A.toast('Ouvrez ce fichier puis Ctrl+P (Cmd+P) → « Enregistrer au format PDF ».', { alert: true })) : printDoc(html);
    switch (btn.dataset.exp) {
      case 'scriptPDF': return pdf(scriptDoc(p), '-scenario-pour-PDF.html');
      case 'scriptHTML': return dl(scriptDoc(p), '-scenario.html', 'text/html');
      case 'scriptMD': return dl(scriptMD(p), '-scenario.md', 'text/markdown');
      case 'scriptFountain': return dl(fountain(p), '.fountain', 'text/plain');
      case 'scriptCopy': return A.copyText(scriptMD(p), 'Scénario copié (Markdown)');
      case 'dossierPDF': return pdf(dossierDoc(p), '-dossier-pour-PDF.html');
      case 'dossierHTML': return dl(dossierDoc(p), '-dossier.html', 'text/html');
      case 'dossierMD': return dl(dossierMD(p), '-dossier.md', 'text/markdown');
      case 'dossierCopy': return A.copyText(dossierMD(p), 'Dossier copié (Markdown)');
      case 'projSave': return A.saveProjectFile(p);
      case 'projSaveAs': return A.saveProjectFile(p, true);
      case 'openClaude': btn.closest('.modal-back')?.remove(); return ClaudePanel.open();
    }
  }

  return { panelHTML, onClick, flatBlocks, blockHTML, titlePageInner, sectionMD, characterMD, dossierMD, scriptMD, fountain, scriptDoc, dossierDoc };
})();
window.Exporter = Exporter;
