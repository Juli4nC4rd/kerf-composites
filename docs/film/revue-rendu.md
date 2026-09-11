# Revue de rendu — film Canvas 2D « méthode du contour »

Périmètre : `/home/card/Kerf/methode.html`, `/home/card/Kerf/en/method.html`,
`/home/card/Kerf/assets/js/contourmovie.js`, section « Film » de
`/home/card/Kerf/assets/css/main.css`. Aucun fichier du site n'a été modifié.

Captures : `qa/<langue>_<largeur>_<mode>_t<NN>_<scène>.png` (98 images : FR 1280 / 768 / 390 px
en clair et en sombre, EN 1280 px en clair, T ∈ {1, 4, 7, 10, 13, 16, 20, 23, 27, 30, 34, 37, 40, 43}),
plus des agrandissements `qa/zoom_*.png` (dpr 4) et les images de vérification `qa/dyn_*.png`.
Le bandeau `.site-header` étant `position: sticky`, il recouvre le haut de `figure.movie`
dans une capture d'élément ; il a été masqué à l'exécution (sans toucher aux fichiers)
pour que le canvas soit intégralement visible.

---

## 1. Défauts BLOQUANTS

### B1 — La cote totale « 5,6 mm » est coupée par le bord droit du canvas
**Images** : `fr_1280_clair_t04_s1piece.png` (on lit « 5,6 mr »), `fr_1280_sombre_t04_s1piece.png`,
`fr_1280_clair_t07_s2prep.png` et `fr_768_sombre_t07_s2prep.png` (quasi entièrement hors champ),
`fr_768_clair_t10_s2prep.png`, `en_1280_clair_t04_s1piece.png` et `en_1280_clair_t07_s2prep.png`
(identique en anglais).
**Scènes** : 1 (la pièce) et 2 (préparation). **Largeurs** : 768 et 1280 px. **Modes** : clair et sombre. **FR et EN.**

C'est la seule cote qui donne l'épaisseur totale du stratifié ; elle est illisible sur les deux
langues, les deux modes et les deux largeurs concernées.

**Cause probable** — `Movie.prototype.drawDims` (contourmovie.js ~l. 1240-1285) pose le trait de cote
totale à `pts[0][0] + ex` avec `ex = dx * 4.4 = this.fs * 1.3 * 4.4 ≈ 5,7 · fs`, puis appelle
`this.tbox([this.L.total], …)` encore plus à droite. Or :
- `Movie.prototype.fit` (l. 498-543) ne borne **que la géométrie du modèle** ; aucune annotation
  n'entre dans la boîte englobante. En fin de scène 1 `fillW = 0,84`, donc le coin droit de la pièce
  est déjà à ~0,92 · W ;
- `Movie.prototype.tbox` (l. 1034-1062) calcule `bx` et `bw` sans jamais les ramener dans
  `[0, canvas.width]`.

### B2 — Le bridage et les feuillards débordent du canvas (haut, bas et droite)
**Images** : `fr_1280_clair_t07_s2prep.png` (mors coupés en haut à gauche et en bas à droite),
`fr_1280_clair_t13_s3coupe.png` (mors coupé en haut), `fr_1280_clair_t20_s4relach.png` et
`fr_1280_sombre_t20_s4relach.png` (tout le haut et tout le bas de l'assemblage sont tronqués),
`fr_768_clair_t20_s4relach.png` (débordement à droite), `fr_390_clair_t20_s4relach.png`.
**Scènes** : 2, 3 et 4. **Toutes largeurs, les deux modes.**

**Cause probable** — trois défauts cumulés dans `Movie.prototype.fit` :
1. le mors est un pavé de demi-dimensions `[CLAMP_HX, CLAMP_H/2, HZ*0.94]` (l. 1428-1429), soit
   **± 2,256 en Z** ; or `fit` ne pousse que `blend([sx*(CLAMP_X+CLAMP_HX), sz*ch, 0], st.clamp)`
   (l. 528) — **l'étendue en Z du mors n'est jamais dans la boîte englobante** ;
2. pour les feuillards, `fit` pousse des points sur les axes (`[±SHIM_X, ±sh, 0]` et
   `[0, ±sh, ±(HZ+SHIM_OVER)]`, l. 521-522) mais **jamais les coins** ; en projection orthographique
   l'extremum en x ou y écran est souvent un coin ;
3. `blend(p, w)` (l. 514-517) **rapproche ces points de l'origine proportionnellement à l'opacité**
   (`st.shim`, `st.clamp`) alors que `drawBox` les dessine à leur position réelle en ne faisant
   varier que l'alpha. Pendant l'apparition (scène 2, `st.clamp` monte de 0 à 1 entre p = 0,04 et 0,14)
   et surtout pendant la disparition (scène 4, `st.clamp = 1 - seg(p, 0.18, 0.28)`), le cadrage
   sous-estime la scène d'un facteur pouvant atteindre 2.

### B3 — Deux étiquettes du canvas se superposent en scène 2
**Images** : `fr_1280_clair_t07_s2prep.png`, `fr_768_sombre_t07_s2prep.png`,
`en_1280_clair_t07_s2prep.png` (pire en anglais, la chaîne étant plus longue).
**Scène** : 2 (préparation), au moment du fondu. **Toutes largeurs ≥ 480 px, les deux modes.**

Le cartouche « bridage symétrique » recouvre la seconde ligne de « plan de coupe, normale Y /
σyy relâchée », qui devient illisible (« …lâchée » en EN : « …y released »).

**Cause probable** — `Movie.prototype.drawPlane` (l. 1287-1313) pose son `tbox` à une position fixe
déduite de `p[0]` (coin du plan de coupe projeté), et l'annotation du bridage est posée par
`Movie.prototype.tag` avec un décalage fixe `(-1.4, -2.6) · fs` (bloc scène 2, l. 1488-1492).
Aucune des deux fonctions ne connaît les rectangles déjà occupés : `tbox` renvoie bien
`[bx, by, bw, bh]` mais ce retour n'est utilisé nulle part pour éviter les collisions.
Le recouvrement est aggravé par le fait que les deux annotations se chevauchent dans le temps
(`s.plane = 1 - seg(p, 0, 0.25)` décroît pendant que `s.clamp = seg(p, 0.04, 0.14)` croît).

### B4 — Sous 480 px, le film perd l'essentiel de son contenu explicatif
**Images** : `fr_390_clair_t27_s5mesure.png` et `fr_390_sombre_t27_s5mesure.png` (deux barres grises
sans aucune légende : ni « face A », ni « face B », ni panneau `profil w(z)`),
`fr_390_clair_t43_s7carte.png` et `fr_390_sombre_t43_s7carte.png` (carte σyy sans les repères
`0°`/`90°`, sans « −130 MPa », sans « +42 MPa », échelle réduite à trois graduations),
`fr_390_clair_t04_s1piece.png` (plan de coupe dessiné mais non légendé).
**Largeur** : 390 px. **Les deux modes.**

À 390 px le canvas mesure 340 × 191 px CSS. Dans `Movie.prototype.resize` (l. 445-455) :
`this.mid = cw >= 480` → **faux**, `this.wide = cw >= 620` → **faux**.
Conséquences en cascade :
- `panelOn = st.panel > 0.01 && this.wide` (l. 1333) : le panneau `profil w(z)`, qui porte toute la
  démonstration des scènes 4 et 5 (les deux faces et leur moyenne), **n'est jamais affiché** ;
- les gardes `if (… && this.mid)` des l. 1477, 1483, 1488, 1497, 1504, 1516, 1537 suppriment
  « feuillards sacrificiels », « bridage symétrique », « sillon », « face A »/« face B »,
  « 0° »/« 90° » sur la carte, « −130 MPa », « +42 MPa » ;
- `if (this.mid) lines.push(this.L.amp)` (l. 1085) retire « amplitude réelle 7,3 µm crête à crête » ;
- `var ticks = this.mid ? [-130,-100,-50,0,50] : [-130,0,50]` (l. 1113).

S'y ajoute la taille de texte : `this.fs = Math.max(9.5, Math.min(13.5, cw/56)) * dpr` (l. 451) →
à 390 px, `cw/56 = 6,1`, le plancher de **9,5 px CSS** s'applique, sous le minimum de lisibilité usuel
(12 px), et il n'y a plus de marge de manœuvre pour rétrécir davantage.

**Le seuil `wide` mord aussi sur ordinateur** : à une fenêtre de 640-668 px le canvas fait 590 px,
donc `wide` est faux et le panneau `profil w(z)` disparaît des scènes 4 et 5 alors que la place
existe largement.

---

## 2. Défauts MINEURS

### M1 — Décalage de mise en page (CLS 0,127) imputable au bloc film
Mesuré : `figure.movie` fait **213 px** de haut sans JavaScript (affiche SVG) et **633 px** avec
JavaScript, à 412 px de large — soit +420 px poussés vers le bas au moment où `main.js` bascule
`no-js` → `js`. Lighthouse attribue la totalité du CLS (0,127) à `body > main#main`.
**Cause** — `main.css` l. 288-292 (`.js .movie-poster{display:none}` et
`.no-js .movie-stage, .no-js .movie-caption, .no-js .movie-controls, .no-js .movie-transcript{display:none}`)
combiné au chargement `defer` de `assets/js/main.js` (methode.html l. 310) : la bascule a lieu après
la première peinture. Réserver la hauteur de la scène (`aspect-ratio` sur `.movie-stage` plutôt que
sur le seul `canvas`) ou aligner la hauteur de l'affiche sur celle du canvas supprimerait le décalage.

### M2 — `min-height` de la légende insuffisant sous 390 px
Mesures de la hauteur réelle de `.movie-caption` selon la scène :
1280/768 px → 105 px partout (`min-height` 105) ; 640/480/390 px → 168 px partout (`min-height` 168) ;
**360 px → 189 px pour la scène 6** ; **320 px → 210 px pour la scène 6**.
Le film fait donc sauter la mise en page en entrant dans la scène 6 sur les téléphones de 320-375 px
(Galaxy S8/S9, iPhone SE).
**Cause** — `main.css` l. 339 : `@media (max-width:640px){ .movie-caption{ min-height: 12em } }`.
La légende 06 est la plus longue ; il faut 15em environ à 320 px.

### M3 — Scène 7 : un tiers du canvas reste vide sous l'échelle
**Images** : `fr_1280_clair_t43_s7carte.png`, `fr_1280_sombre_t43_s7carte.png`,
`dyn_reduced_motion_1280.png` (image d'arrêt en mouvement réduit).
La carte + l'échelle occupent le haut, les ~35 % inférieurs sont vides.
**Cause** — `SCENES[6].fh = [0.56, 0.52]` (l. 219) combiné à `s.shiftY = -0.03` (l. 331) et au
placement de la barre par `drawBar` (`by = H - pad - fs*2.1 - bh`, l. 1098) : la barre est ancrée
en bas du canvas alors que la carte est cadrée en haut, laissant un vide central.

### M4 — « zones hachurées : non exploitables » s'affiche avant les hachures
**Image** : `fr_1280_clair_t40_s7carte.png` (le cartouche est là, les hachures ne sont pas visibles).
**Cause** — dans `sceneState` case 6 (l. 320-327) : `s.tags = seg(p, 0.20, 0.45)` et
`s.hatch = seg(p, 0.32, 0.58)`. Le texte est pleinement opaque (p = 0,45, soit t ≈ 40,5 s) alors que
les hachures sont encore à ~20 % d'opacité.

### M5 — Rupture de phase des hachures entre quadrilatères voisins
**Image** : `zoom_s7_map_avec_hachures_t43.4.png` (à la frontière u = 7/32, les diagonales ne se
prolongent pas et changent de phase).
**Cause** — `Movie.prototype.hatchQuad` (l. 925-953) démarre ses diagonales à
`x = mnx - (mxy - mny)` où `mnx`/`mny` sont la boîte englobante **écran du quadrilatère courant**.
Chaque appel de `drawHatch` (l. 954-962, sept appels) repart donc d'une origine différente.
Une phase globale (`x0 = Math.floor(x / stp) * stp` sur l'écran entier) rendrait le motif continu.

### M6 — La grille de facettes transparaît sous la carte σyy pendant le fondu
**Image** : `zoom_s7_map_sans_hachures_t38.6.png` (coutures verticales et horizontales pâles sur toute
la carte).
**Cause** — `s.mapAlpha = 0.5 + 0.5 * seg(p, 0, 0.30)` (l. 322) : pendant ~1,7 s la carte est
semi-transparente et laisse voir les arêtes des facettes (`ctx.stroke()` de `drawBox`, l. 624-626,
et la nervure `fibre`). Visible en clair et en sombre.

### M7 — La scène 4 ne montre jamais vraiment les faces de coupe déformées
**Images** : `zoom_s4_faces_t21.5.png`, `fr_1280_clair_t23_s4relach.png`.
Entre t ≈ 21 s et t ≈ 25 s les deux moitiés sont écartées et décalées verticalement, mais les deux
surfaces de coupe (normale locale −X) sont orientées à l'opposé de la caméra : on ne voit que les
faces latérales et le fond de page à travers l'écart. Toute la démonstration repose alors sur le seul
panneau `profil w(z)` — donc sur rien du tout en dessous de 620 px de canvas (cf. B4).
**Cause** — la trajectoire de caméra `SCENES[3].yaw = [0.62, 0.95]` / `pitch = [0.46, 0.20]`
(l. 216) combinée à `Movie.prototype.halves` (`b = mkXform(π(1-flipB), …)`, l. 488-494) : à
`flipB = 0` les deux faces se regardent l'une l'autre, donc l'une est masquée par sa propre moitié et
l'autre est de dos. `Movie.prototype.cutVisible` (l. 657) le constate mais rien ne corrige le cadrage.

### M8 — Languettes de jupe dépassant de la silhouette en scène 5
**Images** : `zoom_s5_flip_t26.png`, `zoom_s5_faceA_t28.5.png` (petits ergots sombres à l'extrémité
gauche des deux moitiés).
**Cause** — `Movie.prototype.drawSkirt` (l. 680 et suivantes) relie le bord de la face déformée à
l'arête de la pièce ; aux quatre coins la bande est dessinée même quand la facette est vue par la
tranche, ce qui produit un triangle dégénéré de quelques pixels hors du contour.

### M9 — Code mort : `self.last = 0` sans effet
`Movie.prototype.bind` (l. 1621-1634) remet `self.last = 0` au clic sur Lecture/Pause et sur Rejouer,
mais la boucle d'animation de `init` (l. 1690-1702) utilise **sa propre variable de fermeture `last`**,
jamais `m.last`. L'effet reste limité (`dt = Math.min(ts - last, 200)/1000` borne le saut à 0,2 s),
mais la reprise après une longue pause avance d'un cran de 0,2 s au lieu de repartir exactement.

### M10 — Le bandeau collant masque le haut du canvas
En faisant défiler jusqu'à amener `figure.movie` en haut de la fenêtre, `.site-header`
(`position: sticky`, main.css l. 157) recouvre les ~70 px supérieurs du canvas — soit exactement la
bande où la scène 5 pose « pas de mesure 0,1 mm » et « face A ». Ce n'est pas un défaut du film
lui-même mais il en dégrade la lecture ; une marge haute dans le canvas, ou
`scroll-margin-top` sur `.movie`, l'éviterait.

---

## 3. Vérifications passées

| Vérification | Résultat |
|---|---|
| 50 s de lecture réelle en `http://` | Aucun `pageerror`, aucun `console.error`/`warning`. Échantillons de t : 5,76 → 40,75 → **0,72** → 5,76 : la boucle repart bien après `TOTAL + HOLD = 45 s`. |
| 50 s de lecture réelle en `file://` | Aucun message non plus ; mêmes valeurs de t. Le film fonctionne sans serveur. |
| 98 captures (3 largeurs × 2 modes + EN) | `qa/capture-console.txt` : **aucun message**. |
| Pause hors écran / reprise | Visible : t 1,68 → 3,66 ; hors écran : t **3,90 → 3,90** (figé 2,5 s) ; retour : 4,62 → 6,61. `IntersectionObserver` avec `rootMargin: 80px` (l. 1668-1675) et garde `if (!m.playing || !m.inView) return`. |
| Bouton Lecture/Pause | État initial `aria-pressed="true"` + libellé « Pause ». Après clic : `aria-pressed="false"`, libellé « Lecture », t figé (0,78 → 0,78). Après second clic : `aria-pressed="true"`, « Pause », t reprend (1,38 → 2,88). |
| Bouton Rejouer | t = 0,30, légende « 01 », lecture relancée. |
| Clic sur un segment | Segment 6 → t = 32,36, légende « 06 », lecture non interrompue (conforme). |
| Ordre de tabulation | Lecture → Rejouer → 7 segments dans l'ordre → `<summary>` de la transcription. Aucun piège. |
| Flèches ← / → dans la barre | Déplacent le focus **et** positionnent le film : → t = 6 (scène 2), →→ t = 18,5 (scène 4), ← t = 11,5 (scène 3). Bornes respectées. |
| Entrée / Espace sur un segment | Entrée sur le segment 7 → t = 38, légende « 07 » ; Espace sur le segment 2 → t = 6, légende « 02 ». Entrée sur Lecture bascule `aria-pressed`. |
| Focus visible | `outline: solid 2px rgb(200,146,58)` (laiton), `outline-offset: 2px`, identique sur les boutons et sur les segments. |
| `aria-current` | Mis à jour sur le segment actif par `Movie.prototype.ui` (l. 1580-1586). |
| `reduced_motion: 'reduce'` | Le film **ne démarre pas** (`aria-pressed="false"`), t reste à **43,45** sur les deux relevés, légende « 07 » : c'est bien l'image finale de la carte. Capture `dyn_reduced_motion_1280.png`. |
| `?t=13` | t = 12,97 sur deux relevés à 3 s d'intervalle, `aria-pressed="false"`, légende « 03 » : lecture bien figée. `?t=` accepté sur les 98 captures avec un rendu reproductible (générateur pseudo-aléatoire déterministe `rnd(Math.floor(st.t*30))`). |
| Sans JavaScript (`java_script_enabled=False`) | Affiche SVG **visible**, canvas **masqué**, contrôles / légende / transcription masqués, `<html class="no-js">`, `figcaption` bascule sur la variante « Principe : … ». Capture `dyn_nojs_1280.png`. |
| Mode sombre au défilement | 1280 px et 390 px : `body.is-dark` ajouté après le héros, fond de page `rgb(43,39,35)`, **pixels du canvas relevés en haut à gauche et en bas à droite = `rgb(43,39,35)`** (identiques au fond de page), retour à `rgb(244,241,236)` en remontant. Le `MutationObserver` sur `document.body` (l. 1683-1687) relit bien les jetons et redessine. |
| Ratio d'aspect | **1,7778 exactement** à 1280, 1024, 768, 640, 480, 390, 360 et 320 px. Pas de déformation. |
| Débordement horizontal | `figure.scrollWidth - clientWidth = 0` et `document.scrollWidth == clientWidth` à toutes ces largeurs. La barre segmentée et la légende ne débordent jamais. |
| Séparateur décimal FR/EN | FR « 1,2 / −4,45 / 0,1 mm », EN « 1.2 / -4.45 / 0.1 mm » : `this.dec` lu dans `li[data-k="dec"]`, correct sur les deux pages. |
| Cohérence FR ↔ EN | Mêmes cadrages, mêmes valeurs, mêmes cartouches ; les défauts B1, B2 et B3 sont présents à l'identique sur les deux langues, aucun défaut spécifique à l'anglais (en dehors de l'aggravation de B3 par des chaînes plus longues). |
| Coutures / trous entre facettes | Agrandissements dpr 4 (`zoom_s4_faces_t19.6`, `zoom_s4_faces_t21.5`, `zoom_s5_flip_t26`, `zoom_s5_faceA_t28.5`, `zoom_s6_mesh_t33`) : la « jupe de raccord » (`drawSkirt`) fait bien son office, aucun jour dans la matière. Seuls subsistent les ergots de M8. |
| Ordre des faces | Tri de `items` par `pri` puis profondeur `projU(c)[2]` (l. 1439-1441) et rejet des faces arrière (`if (n[2] <= 0) continue`, l. 617) : aucune face passant devant une autre à tort n'a été observée sur les 98 images ni sur les agrandissements. |
| Contraste en mode sombre | Textes du canvas en `--fg` (papier) sur `--bg` (foncé) : lisibles. Repères `0°`/`90°` posés sur la carte scientifique : contraste plus faible sur les bandes bleu moyen, mais restent lisibles (image `zoom_s7_map_t42.png`). |

---

## 4. Performance

Mesure : 60 appels successifs de `KerfContourMovie.seek()` couvrant les 43,5 s, médiane de trois séries,
fenêtre 1280 px, film en pause.

| Configuration | Canvas (pixels internes) | Temps moyen par image | Séries |
|---|---|---|---|
| dpr 1 | 1070 × 602 | **3,69 ms** | 4,32 / 3,69 / 3,28 |
| dpr 2 | 2140 × 1204 | **10,35 ms** | 10,54 / 10,02 / 10,35 |

La boucle vise 30 images/s (`if (ts - last < 32) return`, l. 1692), soit un budget de 33 ms :
on est à 11 % du budget en dpr 1 et à 31 % en dpr 2. `dpr` est plafonné à 2 dans `resize`
(`Math.min(window.devicePixelRatio || 1, 2)`), ce qui protège les écrans 3×.

**Taille du fichier JavaScript** : `assets/js/contourmovie.js` = **67 417 octets** (65,8 Kio) brut,
**17 788 octets** (17,4 Kio) une fois gzippé. Pas de dépendance, pas de ressource externe.
`assets/js/main.js` = 2,3 Kio. Poids total de la page mesuré par Lighthouse : 205 Kio.

## 5. Lighthouse

`lighthouse http://127.0.0.1:8791/methode.html --only-categories=performance,accessibility,best-practices,seo`
(Lighthouse 13.4.1, Chrome headless, émulation mobile). Rapport complet : `qa/lh-methode.json`.

| Catégorie | Score |
|---|---|
| Performance | **95** |
| Accessibilité | **100** |
| Bonnes pratiques | **100** |
| SEO | **100** |

**Audits d'accessibilité en échec : aucun.** Les 100 points sont obtenus sans réserve — l'audit
`unsized-images` ne relève aucun élément, et aucun audit `binary` de la catégorie accessibilité
n'a un score inférieur à 1. Les libellés `aria-label` des sept segments, l'`aria-pressed` du bouton
Lecture/Pause et l'`aria-label` descriptif du `<canvas role="img">` sont donc tous valides.

Métriques et audits non parfaits (hors accessibilité) :

| Audit | Valeur | Score | Sélecteur mis en cause |
|---|---|---|---|
| First Contentful Paint | 0,9 s | 1 | — |
| Speed Index | 0,9 s | 1 | — |
| Largest Contentful Paint | 1,7 s | 0,99 | — |
| Total Blocking Time | 0 ms | 1 | — |
| **Cumulative Layout Shift** | **0,127** | **0,82** | `body > main#main` — voir **M1** |
| `cls-culprits-insight` | — | 0 | `body > main#main` (0,127, la totalité du CLS) |
| `layout-shifts` | — | 0 | `body > main#main` |
| `render-blocking-insight` | — | 0 | `http://127.0.0.1:8791/assets/css/main.css` (21 832 octets bloquants) |
| Main-thread work | 1,5 s | 1 | — |
| Script bootup time | 0,3 s | 1 | — |
| Total byte weight | 205 Kio | 1 | — |

Le seul point coûteux est donc le CLS, entièrement imputable à la bascule affiche SVG → canvas
du bloc film (M1) ; le corriger ferait passer la performance à 100.
