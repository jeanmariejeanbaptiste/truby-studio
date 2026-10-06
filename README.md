# Truby Studio

Atelier d'écriture scénaristique guidé par la méthode de John Truby (*L'Anatomie du scénario*).

## Utiliser l'outil

- **En ligne** : une fois GitHub Pages activé (Settings → Pages → Source : *GitHub Actions*), l'outil est publié à chaque modification de `truby-studio/` sur `main`.
- **En local** : ouvrez `truby-studio/index.html` dans Chrome, Edge ou Firefox. Aucune installation.

## Sauvegarde

- Enregistrement automatique dans le navigateur (localStorage).
- **Fichier projet `.truby`** (Ctrl+S) : à garder sur votre disque ou votre cloud. Sous Chrome/Edge, le fichier choisi est ensuite réenregistré automatiquement. Rouvrez-le avec « Ouvrir un fichier .truby » ou par glisser-déposer : seul Truby Studio reconnaît ce format.

## Processus (ordre de Truby)

1. Prémisse · 2. Structure narrative : 7 étapes **ou** 22 étapes (choix engageant, verrouillé ; en 22 étapes, les étapes non nécessaires peuvent être barrées sauf 3, 5, 7, 10, 19, 20, 22) · 3. Personnages · 4. Débat moral · 5. Univers du récit · 6. Réseau de symboles · 7. Intrigue · 8. Tissage des scènes · 9. Scénario (éditeur façon Word) · 10. Exports (HTML, Markdown, PDF, Fountain, .truby).

## Claude

Sauvegarde : dans claude.ai, chaque projet est aussi enregistré sur votre compte claude.ai (espace privé), et les exports passent par la fenêtre d'enregistrement de claude.ai. Bouton « Claude » : l'assistant utilise votre compte claude.ai (capacité « sample » des artefacts), sans clé API. Il fonctionne uniquement quand Truby Studio est ouvert comme artefact sur claude.ai ; ailleurs (GitHub Pages, fichier local) le panneau l'indique et le reste de l'outil fonctionne normalement. Claude lit le projet et propose des modifications que vous appliquez d'un clic.

## Fichiers

`index.html`, `styles.css`, `data.js` (contenu Truby), `app.js` (étapes, projets, annuler/rétablir), `editor.js` (éditeur de scénario), `exporter.js`, `claude.js`, `sample.js` (exemple Casablanca).
