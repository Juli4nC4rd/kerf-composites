# Revue scientifique — film Canvas « méthode du contour sur stratifié CFRP croisé »

Relecteur : agent de revue. Aucun fichier modifié.
Objets relus : `/home/card/Kerf/assets/js/contourmovie.js` (1728 lignes),
`/home/card/Kerf/methode.html` (l. 64-147), `/home/card/Kerf/en/method.html` (l. 64-147),
`/home/card/Kerf/assets/css/main.css` (l. 288-295).
Référence : `spec-physique.md`. Vérifications à la source faites dans
`1-s2.0-S0263822326001121-main.pdf` (Ahmad et al. 2026 = [A] = [1]) et
`PhD Thesis_PraveenKR_Final.pdf` ([P] = [3]).

**Résumé en une ligne** : le cœur physique du film est juste — tableaux w(z) et σ_yy(z)
recopiés exactement, signes corrects et mirrorés sur les deux faces, exagération ×100
réellement appliquée à des micromètres réels, carte conforme. Les défauts sont dans
l'habillage : l'affiche SVG de repli dessine un bombé lisse de métal, deux mentions
obligatoires disparaissent sous 480 px, et la légende 2 remplace la raison documentée des
feuillards par deux fonctions inventées.

---

## A. CORRECTIONS OBLIGATOIRES

### A1. L'affiche de repli (`.movie-poster`) dessine un bombé lisse sans structure de plis

**Fichier** : `methode.html` l. 67-75 et `en/method.html` l. 67-75 (SVG identique).
**Texte exact fautif** :

```
l. 72 : <path d="M400 64 H548 Q538 118 548 172 H400 Z" .../>
l. 74 : <path d="M760 64 H612 Q622 118 612 172 H760 Z" .../>
l. 68/73/75 : sept <line> équidistantes (y = 76, 88, 100, 112, 124, 136, 148)
```

Trois violations simultanées de la spec §5 :

- **§5 n° 1** : les deux faces de coupe sont des arcs quadratiques lisses (`Q`), c.-à-d.
  exactement le profil « cosinus » d'un métal que [P] p. 117-118 récuse
  (« nowhere near to the cosine profile. It has sharp bends at the interface »).
- **§5 n° 2** : aucune marche aux interfaces, gradient continu.
- **§5 n° 5** : neuf bandes d'épaisseur égale (lignes tous les 12 px) au lieu de cinq
  couches 1,2 / 1,0 / 1,2 / 1,0 / 1,2 mm ; et le nombre de plis n'a aucun rapport avec 20.

Défaut supplémentaire : l'enveloppe (`Q538`) et les lignes internes (x2 = 538 à y = 76)
se contredisent — le contour rentre au milieu de l'épaisseur alors que les lignes rentrent
en peau. Le tracé n'est donc même pas cohérent avec lui-même.

**Pourquoi c'est obligatoire** : `main.css` l. 288-295 masque l'affiche quand JS est actif,
mais la montre **seule** quand JS est absent (`.no-js .movie-stage { display:none }`).
C'est donc la seule image que verra un visiteur sans JS, et elle enseigne précisément
l'erreur que tout le reste du film s'applique à éviter. Le SVG est du travail nouveau
(absent de `git show HEAD:methode.html`), il est donc dans le périmètre.

**Correction proposée** (remplacer les deux `path`, en gardant le repère x = 548 / 612 pour
le jour de coupe ; échelle 108 px pour 5,6 mm et 2 px par µm de w, interfaces à
y = 87 / 106 / 130 / 149) :

```html
<path d="M400 64 H539 L547 87 L553 87 L553 106 L546 106 L547 130 L553 130 L554 149 L548 149 L539 172 H400 Z" fill="none" stroke="currentColor" stroke-width="2"/>
<path d="M760 64 H621 L613 87 L607 87 L607 106 L614 106 L613 130 L607 130 L606 149 L612 149 L621 172 H760 Z" fill="none" stroke="currentColor" stroke-width="2"/>
```

et remplacer les sept `<line>` de chaque moitié par **quatre** lignes d'interface aux
y = 87, 106, 130, 149 s'arrêtant sur le nouveau contour (x2 = 553 / 546 / 553 / 548 à
gauche, x1 = 607 / 614 / 607 / 612 à droite), plus les mêmes quatre y dans le panneau
« pièce entière ». On obtient un escalier : les deux couches 90° ressortent, les deux
peaux 0° plongent vers les faces libres, couche centrale 0° peu creusée.

---

### A2. La mention obligatoire d'exagération est tronquée sous 480 px

**Fichier** : `contourmovie.js` l. 1084-1085.

```js
var lines = [this.L.exag];
if (this.mid) lines.push(this.L.amp);      // this.mid = (largeur canvas >= 480 px)
```

Spec §3.6 : « **Obligation** : afficher en permanence à l'écran, pendant la phase de
déformation, la mention "déformation × 100 — amplitude réelle ≈ 7 µm crête à crête" ».
Sur téléphone (canvas ≈ 340 px), seul « déformation × 100 » reste : le spectateur voit une
déformation de l'ordre du dixième d'épaisseur, avec un facteur d'échelle mais **sans jamais
savoir de quoi**. C'est la violation directe de la spec §5 n° 4.

**Correction proposée** : supprimer la condition, et raccourcir la seconde ligne pour les
petits écrans plutôt que la supprimer.

```js
var lines = [this.L.exag];
lines.push(this.mid ? this.L.amp : this.L.ampShort);
```

avec, dans `movie-terms`, en FR `<li data-k="ampShort">réel ≈ 7 µm</li>` et en EN
`<li data-k="ampShort">actual ≈ 7 µm</li>`. (Solution minimale équivalente : remplacer la
ligne 1085 par `lines.push(this.L.amp);` — la boîte `tbox` se redimensionne seule.)

---

### A3. La composante tracée n'est jamais annoncée sous 480 px, ni dans la légende 7

**Fichiers** : `contourmovie.js` l. 1537-1539 (`if (this.mid) { this.tbox([L.note0, L.note90, L.artef] …) }`)
et légende 7 de `methode.html` l. 105 / `en/method.html` l. 106.

Spec §5 n° 15 (« oublier de dire quelle composante est tracée ») est la note que [A] répète
sous chacune de ses figures, vérifiée à la source sous la fig. 9 (p. 11) :
« for the 0˚ply, the plotted stress is transverse to fibre; for the 90˚ply, the plotted
stress is along the fibre ». Les étiquettes `note0` / `note90` existent bien, mais elles ne
sont dessinées que si `this.mid`, et la légende 7 — le seul texte lu par un lecteur d'écran
ou par un visiteur mobile — ne contient pas l'information. Sur mobile, le film affiche donc
une carte signée sans dire ce qu'elle mesure.

**Correction proposée** : ajouter la phrase à la légende 7 (elle protège aussi la
transcription et l'accessibilité, quelle que soit la largeur).

FR — `methode.html` l. 105, remplacer le `<li>` par :

```html
<li>σ<sub>yy</sub> restituée sur la face de coupe : −130 MPa aux deux interfaces avec les couches 0° externes, +40 MPa au cœur de la couche 0° centrale, fort gradient dans les couches 90°. Dans les couches 0° (fibres dans le plan de coupe) σ<sub>yy</sub> est la contrainte transverse aux fibres ; dans les couches 90° (fibres normales au plan de coupe) elle est la contrainte le long des fibres. Les zones hachurées ne sont pas exploitables.</li>
```

EN — `en/method.html` l. 106 :

```html
<li>σ<sub>yy</sub> recovered on the cut surface: −130 MPa at both interfaces with the outer 0° layers, +40 MPa in the middle of the central 0° layer, a strong gradient through the 90° layers. In the 0° layers (fibres in the cut plane) σ<sub>yy</sub> is the stress transverse to the fibres; in the 90° layers (fibres normal to the cut plane) it is the stress along the fibres. The hatched zones are not usable.</li>
```

(Le passage de +42 à +40 est justifié en B1 ; si vous gardez +42, ne changez que la phrase
sur la composante.)

---

### A4. Légende 2 : la raison documentée des feuillards est remplacée par deux fonctions inventées

**Fichier** : `methode.html` l. 100, `en/method.html` l. 101.
**Texte exact fautif** :

> FR : « Deux feuillards sacrificiels sont **collés** au-dessus et au-dessous de la pièce,
> **débordant en entrée et en sortie du fil** : ils **amorcent et stabilisent l'arc**, et
> **protègent les bords**. »
> EN : « Two sacrificial shims are **bonded** above and below the part, **overhanging at
> wire entry and exit**: they **start and stabilise the arc**, and **protect the edges**. »

Texte de [A], vérifié à la source (p. 4-5, §4.1.1) :

> « The samples were symmetrically clamped. **Thin metal sheets were used at the top and
> bottom of the specimens** during the machine cutting to **overcome the lack of electrical
> conductivity in carbon fibre composites** [30]. This enabled the machine to **generate
> the required sparks and start cutting**. »

Trois affirmations du film ne sont dans aucune des deux sources : « collés », « débordant
en entrée et en sortie du fil », « protègent les bords ». « stabilisent l'arc » est une
extrapolation (les feuillards sont sur les faces, pas dans la saignée). Et surtout **la
seule raison publiée — la conductivité électrique insuffisante du CFRP — a disparu de la
légende**, alors que c'est le point composite décisif de la spec (§4 étape 2, avec la
preuve a contrario de [P] p. 92 : fil cassé après 2,4 mm sans dispositif). Le mot interdit
« métallique » a visiblement conduit à supprimer l'information au lieu de la reformuler ;
elle se reformule sans mot interdit.

**Correction proposée** :

FR — `methode.html` l. 100 :

```html
<li>Bridage symétrique de part et d'autre du trajet. Deux feuillards sacrificiels minces sont plaqués sur la face supérieure et sur la face inférieure de la pièce : le composite carbone conduit trop mal l'électricité pour que la coupe s'amorce seule, et ces feuillards permettent à la machine de produire les étincelles et de démarrer la coupe.</li>
```

EN — `en/method.html` l. 101 :

```html
<li>Symmetric clamping on both sides of the cut path. Two thin sacrificial shims are placed against the top and bottom faces of the part: carbon composite conducts electricity too poorly for the cut to start on its own, and these shims let the machine generate the sparks and begin cutting.</li>
```

(Le débord dessiné dans le canvas, `SHIM_OVER = 0.30` l. 147, peut rester : c'est une mise
en scène acceptable tant que le texte ne l'affirme pas.)

---

## B. CORRECTIONS RECOMMANDÉES

### B1. « +42 MPa » contredit la valeur publiée pour la même coupe

`methode.html` l. 105 et `movie-terms` `data-k="maxt"` l. 144 ; `en/method.html` l. 106 et
l. 145 ; `contourmovie.js` l. 62 (`[3.00, 42]`, valeur de tableau, à conserver).

La spec §2.5 autorise +42 MPa comme **lecture de la fig. 9(c) à ± 5 MPa**. Mais la
**Table 5 de [A] p. 11, vérifiée à la source**, publie pour la coupe #2 : *Stress
transverse to fibres = **40**, Stress along the fibre direction = **−130*** ; l'abstract
dit « maximum value of 40 MPa ». Afficher −130 (valeur publiée) à côté de +42 (valeur lue
sur graphique) mélange deux statuts. Le tableau `S_TAB` peut garder 42 (c'est le pic local
du profil) ; **l'étiquette affichée devrait dire +40 MPa**.

Remplacement : `<li data-k="maxt">+40 MPa</li>` (FR et EN), et « +40 MPa au cœur de la
couche 0° centrale » dans la légende 7 (déjà intégré au texte proposé en A3).

### B2. Une seule coupe est présentée comme « le » résultat

La carte et la légende 7 donnent −130 / +42 sans dire que c'est la **coupe #2**, alors que
la coupe #1 de la **même plaque** donne −70 / +30 ([A] Table 5, vérifiée). La spec §7 en
fait la seule mesure de reproductibilité disponible, et §5 n° 13 interdit d'afficher une
incertitude chiffrée à la place. Ajouter une étiquette canvas, affichée en scène 7 à côté
de `clt` :

FR `<li data-k="disp">deux coupes de la même plaque : −70 et −130 MPa</li>`
EN `<li data-k="disp">two cuts on the same plate: −70 and −130 MPa</li>`

et l'insérer dans le `tbox` de `contourmovie.js` l. 1539 :
`this.tbox([L.clt, L.disp], W - pad, pad, { align: "right", mul: 0.78, color: this.cfgs });`

### B3. L'étape méthodologique centrale de [A] est absente

Le film passe de la mesure (scène 5) au maillage EF (scène 6) sans jamais montrer ni dire
le **lissage linéaire incrémental couche par couche**, qui est la nouveauté revendiquée de
[A] (abstract : « A novel incremental linear smoothing approach… gave better approximation
than the conventional spline smoothing method used in the standard contour method »), et
que la spec §4 étape 5 appelle « le cœur méthodologique ». Ce n'est pas une erreur (aucune
spline n'est montrée, donc §5 n° 8 n'est pas violé), mais c'est l'argument technique le
plus vendeur de la page, et il manque.

FR — `methode.html` l. 103 (légende 5) :

```html
<li>Les deux faces sont relevées au pas de 0,1 mm, recalées sur une grille commune, puis moyennées point par point. Le profil moyen est ensuite ajusté couche par couche, une droite par couche : une spline unique lisserait la marche d'interface. La moyenne annule les écarts antisymétriques (trajectoire du fil, cisaillement) ; elle ne corrige pas les écarts symétriques.</li>
```

EN — `en/method.html` l. 104 :

```html
<li>Both faces are measured on a 0.1 mm step, registered on a common grid, then averaged point by point. The averaged profile is then fitted layer by layer, one straight line per layer: a single spline would smooth the interface step away. Averaging cancels antisymmetric deviations (wire path, shear); it does not correct symmetric ones.</li>
```

### B4. Légende 4 : le relâchement est présenté comme une conséquence du débridage

`methode.html` l. 102, `en/method.html` l. 103 : « **Bridage et feuillards retirés**, les
deux moitiés se séparent. » Physiquement, la relaxation se produit **pendant** la coupe ;
le bridage sert à empêcher les mouvements parasites, pas à retenir la déformation. Le film
montre d'ailleurs les faces plates pendant la scène 3 puis déformées après le débridage
(`contourmovie.js` l. 285-287 : `gap`, `split`, `amp` montent après `clampOff`), ce qui
renforce la lecture fausse.

FR : « La coupe terminée, bridage et feuillards sont retirés : les deux moitiés, relâchées
au fur et à mesure de la coupe, se séparent. Les plis 90°, comprimés le long des fibres,
ressortent ; les plis 0°, tendus en travers des fibres, rentrent. Marches franches aux
interfaces, rampe vers les deux faces libres. »

EN : « With the cut complete, clamps and shims are removed: the two halves, relaxed as the
cut progressed, come apart. The 90° plies, compressed along the fibres, stand proud; the 0°
plies, in tension across the fibres, are drawn back. Sharp steps at the interfaces, a ramp
towards the two free faces. »

### B5. EN : « rise / sink » suggère un déplacement vertical

`en/method.html` l. 103 (« the 90° plies… **rise**; the 0° plies… **sink** ») et l. 125-126
(`comp` : « material **rises** », `tens` : « material **sinks** »). Le déplacement est
normal au plan de coupe, donc horizontal à l'écran. Remplacer par :

```html
<li data-k="comp">90° in compression: material stands proud</li>
<li data-k="tens">0° in tension: material is drawn back</li>
```

Le FR « ressort / rentre » est correct, ne pas y toucher.

### B6. FR : « théorie des stratifiés » au lieu de « théorie classique des stratifiés »

`methode.html` l. 142 : `<li data-k="clt">théorie des stratifiés : +29 / −52 MPa</li>`.
L'EN dit bien « classical laminate theory ». Le nom consacré (TCS / CLT) est
« théorie **classique** des stratifiés ». Remplacer par :
`<li data-k="clt">théorie classique des stratifiés : +29 / −52 MPa</li>`.

### B7. Le panneau w(z) place ses deux étiquettes chiffrées aux extrémités de l'axe

`contourmovie.js` l. 1218 (`var WMIN = -5.2, WMAX = 3.6;`) et l. 1225 / 1227 :
`ctx.fillText("−4,45", ax, …)` puis `ctx.fillText("+2,80", ax + aw, …)`. `ax` correspond à
w = −5,2 et `ax + aw` à w = +3,6. Les deux valeurs affichées (correctes : ce sont bien les
extrema de [A] fig. 5(c)) sont donc posées à 8,5 % et 9 % de la largeur de l'axe de leur
position réelle, et la courbe ne touche jamais l'étiquette censée la borner. Corriger en
plaçant les libellés sous leur abscisse réelle :

```js
ctx.textAlign = "center";
ctx.fillText("−4,45".replace(",", this.dec), wx(-4.45), ay + ah + this.fs * 1.25);
ctx.fillText("+2,80".replace(",", this.dec), wx(2.80), ay + ah + this.fs * 1.25);
```

(et ajouter un petit trait de repère à `wx(-4.45)` / `wx(2.80)`).

### B8. Le bloc dessiné n'a pas les proportions de la plaque, et les bandes d'artefact en sont amplifiées

`contourmovie.js` l. 136-137 : `HZ = 16 * MM` (32 mm de trajet) et `LEN = 10 * MM` (10 mm
par moitié), pour une plaque réelle de 100 × 100 × 5,6 mm (coupe #2) ou 200 × 200 × 5,6 mm
(coupe #1), vérifié à la source ([A] p. 4 §3). Conséquence directe sur la carte :
`drawHatch` l. 954 pose `uEnd = 7/32`, c'est-à-dire les **1,25 × l'épaisseur** de [P]
(7 mm) rapportés à la largeur **dessinée** de 32 mm — donc **44 % de la carte hachurée**,
alors que sur la plaque réelle de 100 mm cela ferait 14 %. Le calcul est juste, la
proportion affichée est trompeuse.

Aucune légende n'affirme de dimension en X/Y, donc ce n'est pas une erreur factuelle. Deux
corrections possibles, par ordre de préférence :

1. porter `HZ` à `50 * MM` (100 mm de trajet, la largeur réelle de la coupe #2) et laisser
   `uEnd = 7 / 100` — la carte redevient représentative ; il faut alors vérifier le cadrage
   (`SCENES[*].fw/fh`) ;
2. ou ajouter une étiquette de scène 1 : FR `<li data-k="detail">détail : 32 mm du trajet
   de coupe (plaque 100 × 100 mm)</li>`, EN `<li data-k="detail">detail: 32 mm of the cut
   path (100 × 100 mm plate)</li>`.

Rappel utile : le rognage à 1,25 × l'épaisseur vient de [P] p. 163, **pour une coupe au fil
diamanté** ; [A] mesure jusqu'à 0,1 mm du périmètre et ne rapporte aucun rognage (spec
§3.5 : « *non trouvé dans [A]* »). Le garder est prudent et défendable, mais c'est une
extrapolation, pas une donnée de [A].

### B9. L'écartement des deux moitiés (2,8 mm) peut se lire comme de la relaxation

`contourmovie.js` l. 139 (`GAP = 0.42` unités modèle = 2,8 mm) et l. 141 (`SPLIT = 0.98`
= 6,5 mm de décalage vertical en scène 5). Le kerf réel fait 0,25 mm et les moitiés ne
s'écartent pas. C'est une vue éclatée légitime, mais elle voisine avec la mention
« déformation × 100 » : un lecteur peut attribuer l'écart à la relaxation. Ajouter
« vue éclatée » / « exploded view » à la boîte `drawExag` (scène 4) ou en étiquette de
scène 4 lève l'ambiguïté à peu de frais.

### B10. La face de coupe ne porte aucune trace de fibres

`contourmovie.js` l. 1377 : les boîtes de couche passent `fibre: L.a === 0 ? 2 : 0`, mais
leur face de coupe est explicitement sautée (`skip: n[0] === -1`), et `drawCutFace`
(l. 725-773) ne rappelle jamais `this.fibre`. Résultat : la distinction visuelle
rayures ↔ pointillés — le meilleur argument visuel de la note « 0° transverse / 90° le long
des fibres » — existe en scène 1 sur les faces avant du bloc, puis **disparaît exactement
au moment où elle devient utile** (scènes 4 à 7, sur la face de coupe elle-même). Appeler
`this.fibre` par bande de couche dans `drawCutFace`, au moins quand `st.amp < 0.02`
(face plane, scènes 6-7), rendrait la carte beaucoup plus parlante.

### B11. L'écart de coupe antisymétrique est une forme inventée : à annoncer comme schématique

`contourmovie.js` l. 88-90 :

```js
function artef(z, u) {
  return 0.90 * (2 * z / T - 1) + 0.30 * Math.sin(Math.PI * u);
}
```

Ni la pente de ±0,90 µm dans l'épaisseur ni l'arc de 0,30 µm en largeur ne figurent dans
les sources (la spec §3.5 ne donne que la *nature* des artefacts antisymétriques :
dérive/ondulation du fil, cisaillement). **L'algèbre, elle, est juste** : avec un écart δ de
la ligne médiane de saignée, la face A mesurée vaut w + δ et la face B w − δ en déplacement
sortant, ce que le code écrit exactement (`half.sign * st.art * artef(...)`, l. 670), et la
moyenne restitue w. C'est donc une mise en scène acceptable, à condition de ne jamais la
chiffrer — ce que le film ne fait pas. Sécurisation minimale : dans le panneau, écrire
`face A / face B (écart schématique)` en scène 5, ou ajouter « (représentation
schématique) » dans la parenthèse de la légende 5.

Deux points annexes, non bloquants :
- `st.art` vaut 1 en permanence (`sceneState` l. 244) : la face de coupe porte donc déjà
  l'écart en **scène 4**, avant que la légende 5 ne l'introduise, alors que le panneau de
  la scène 4 (`panelMode = "w"`, l. 291) trace le w(z) **propre**. Panneau et volume se
  contredisent pendant six secondes.
- l'arc `0.30 * sin(π u)` fait varier w selon la largeur, alors que [A] p. 6 §4.1.5
  constate « no change in the displacement data along the width ». L'amplitude (4 % de la
  plage) et le statut d'artefact rendent la chose tolérable.

### B12. Le pas de mesure affiché (0,1 mm) n'est pas celui des points dessinés

`contourmovie.js` l. 820-821 : `drawDots` place un point une rangée sur deux et une colonne
sur deux, soit ≈ 0,4 mm × 3,6 mm à l'écran, sous l'étiquette `step` = « pas de mesure
0,1 mm ». Aucun lecteur ne comptera, mais le faisceau balayé ressemble à une sonde laser
(rendu `drawScan` l. 833-858) alors que le 0,1 mm cité est le pas MMT à palpeur scanning
Ø 3 mm de [A] (p. 5 §4.1.2, vérifié). Si l'on veut être exact : soit lever l'ambiguïté du
rendu, soit écrire simplement « pas de mesure fin, plusieurs points par couche ».

---

## C. REMARQUES MINEURES

- **C1.** `figcaption` (`methode.html` l. 146, `en/method.html` l. 147) : « sept étapes,
  **43 secondes**, en boucle ». La somme des durées (`SCENES`, l. 213-221) vaut 43,5 s, et
  la boucle complète 45,0 s avec `HOLD = 1.5` (l. 226). Écrire « 45 secondes » (ou
  « environ 45 s ») serait plus exact.
- **C2.** `<h2 id="steps-title">Quatre étapes.</h2>` (`methode.html` l. 62) surplombe
  immédiatement un film annoncé « sept étapes ». Les deux découpages sont légitimes (quatre
  étapes commerciales, sept scènes) mais la collision de comptes est lisible à l'écran.
- **C3.** `<li data-k="stack">[0° / 90° / 0° / 90° / 0°]</li>` (l. 111) : la notation sans
  indice se lit comme un stratifié à 5 plis. La ligne suivante (« 20 plis, 4 par couche »)
  rattrape, mais `[0°₄ / 90°₄ / 0°₄ / 90°₄ / 0°₄]` serait exact au premier coup d'œil.
- **C4.** `drawArrows` l. 877 : `len = -st.arrowS * wv * KW * 7.0`. Les flèches sont 7 fois
  plus longues que le déplacement déjà exagéré ×100 qu'elles désignent. Direction et
  inversion de signe sont justes ; seule la longueur est arbitraire.
- **C5.** `drawHatch` l. 955 : `var e = 0.09;` — la largeur des bandes d'artefact
  d'interface (± 0,09 mm). La spec §7 note que [P] « ne chiffre pas une largeur : *non
  trouvé* ». C'est un choix de dessin, jamais affiché, donc sans conséquence ; la valeur est
  en bas de la fourchette « quelques dixièmes de mm ».
- **C6.** L'échelle de couleur (`MAP_MIN = -130, MAP_MAX = 50, MAP_BANDS = 12`, l. 96) donne
  des bornes de bande à −130, −115, …, −10, +5, +20, +35, +50 : **0 n'est pas une borne de
  bande**, il tombe dans la bande [−10, +5] dont le centre (−2,5) est rendu quasi neutre.
  L'ancrage du neutre sur 0 est donc respecté de fait, et le repère 0 est tracé plus épais
  sur la barre (l. 1116-1120), conformément à la spec §6.2. Rien à corriger ; à savoir si un
  jour on veut 0 exactement sur une frontière (il faudrait 12 bandes de 15 MPa sur
  −135 / +45, ou 13 bandes).
- **C7.** « collés » / « bonded » (légende 2) est déjà traité en A4, mais la même nuance
  vaut pour le canvas : rien n'est affirmé dans `movie-terms`, donc rien à changer là.

---

## D. Réponses point par point à la commande de revue

### D1. Tableaux W_TAB et S_TAB

**`W_TAB` (l. 39-51) : conforme au mot près à la spec §3.6.** Les 41 couples (z, w) sont
identiques, y compris les points doublés qui matérialisent les quatre marches
(1,19 → 1,20 ; 2,19 → 2,20 ; 3,39 → 3,40 ; 4,39 → 4,40). Vérifications dérivées :

| Contrôle | Valeur dans le code | Spec |
|---|---|---|
| crête à crête | +2,80 − (−4,45) = 7,25 µm | 7,3 µm ✓ |
| marche z = 1,2 | +2,85 µm | 2,9 à 3,6 ✓ (limite basse) |
| marche z = 2,2 | −2,60 µm | *la spec elle-même donne 2,60, sa fourchette « 2,9 à 3,6 » est un peu optimiste* |
| marche z = 3,4 | +3,60 µm | ✓ |
| marche z = 4,4 | −3,37 µm | ✓ |
| plateaux 90° | +2,25 à +2,80 | « 2 plateaux hauts, pente ≤ 0,6 µm » ✓ |
| couche 0° centrale | −0,35 à −1,15 | « bas et peu creusé, −0,3 à −1,2 » ✓ |
| peaux 0° | rampes jusqu'à −4,45 aux deux faces | ✓ symétrique |

**`S_TAB` (l. 57-68) : conforme au mot près à la spec §2.5** (colonne « contour #2 »), les
36 couples sont identiques. Vérifications :

- interfaces à **1,2 / 2,2 / 3,4 / 4,4 mm** : oui, dans `LAYERS` (l. 27-33), `S_TAB`,
  `W_TAB`, `drawHatch` (l. 960), `drawPanel` (l. 1172) et `drawCotes` (l. 1240) — cinq
  endroits, tous cohérents. Épaisseurs 1,2 / 1,0 / 1,2 / 1,0 / 1,2 mm, total 5,6 mm ✓
  ([A] p. 5 §4.1.2 : « 1.2 mm for the 0˚ ply cluster & 1 mm for the 90˚ ply cluster »,
  vérifié à la source).
- **signes** : 0° positifs (+28 à +42), 90° négatifs sauf la remontée à +5 en fin de L2 —
  exactement le tableau de la spec.
- **extrema** : min = −130 MPa en z = 1,2 **et** z = 4,4, c'est-à-dire aux deux interfaces
  avec les couches 0° externes ✓ ; max = +42 MPa en z = 3,00 ✓ (voir B1 sur l'affichage).
- **gradient dans les couches 90°** : L2 monte de −130 (interface couche 0° externe) à +5
  (interface couche 0° centrale) ; L4 descend de −12 à −130 dans le sens miroir. Aucun
  créneau plat à −130 : §5 n° 6 respecté, et l'orientation du gradient est la bonne dans
  les deux couches.
- **rendu** : `buildMapTexture` (l. 427-440) échantillonne 560 lignes sur 5,6 mm, soit
  0,01 mm/pixel, et choisit la couche par `while (li < 4 && z >= LAYERS[li].z1) li++` : le
  saut +28 → −130 à z = 1,2 tient sur un pixel. Discontinuité nette ✓.

### D2. Signe réellement dessiné — **correct, et miroir sur les deux faces**

Chaîne suivie : `cutFacePts` l. 662-678 → `mkXform` l. 478-487 → `halves` l. 488-496.

1. Chaque demi-pièce est une boîte `boxVerts([LEN/2, …], [LEN/2, …])`, donc **locale
   x ∈ [0, LEN]** : la face de coupe est en x local = 0, le corps s'étend vers +x. La
   normale **sortante** de la face de coupe est donc **−x local**, ce que le code confirme
   en deux endroits : `outN = half.x.n([-1,0,0])` (l. 728) et
   `cutVisible = rotN(half.x.n([-1,0,0]))[2] > 0.03` (l. 680-682).
2. l. 671 : `var lp = [-(wv * KW * st.amp), row.y, zc];` — le **signe moins** convertit un
   w positif en x local négatif, c'est-à-dire un déplacement **selon la normale sortante**.
   Donc **w > 0 ⇒ la matière sort ; w < 0 ⇒ la matière rentre**. Comme `W_TAB` donne w > 0
   dans les deux couches 90° et w < 0 dans les trois couches 0° : **les plis 90° ressortent
   et les plis 0° rentrent**. Conforme à la spec §3.1 et §5 n° 3, et cohérent avec [A]
   fig. 5(c) et fig. 9(c).
3. **Demi-pièce A** : `mkXform(0, [g, …])`, rotation nulle, normale sortante = −x monde,
   corps en x ∈ [g, g+LEN]. **Demi-pièce B** (avant retournement) :
   `mkXform(π·(1−flipB), [lerp(−g, g, flipB), …])` → à `flipB = 0`, rotation π :
   `p(q) = [−q₀ + pos₀, q₁ + pos₁, −q₂ + pos₂]`. La normale sortante devient **+x monde**,
   le corps occupe x ∈ [−g−LEN, −g]. Un w > 0 donne x monde = +w·KW − g, donc **vers le
   jour de coupe**, donc **sortant** là aussi. **Les deux faces sont bien en symétrie
   miroir : 90° sortant et 0° rentrant des deux côtés.** Vérifié aussi en scène 5-7, où
   `flipB = 1` remet B en rotation nulle sans changer la formule.
4. **Exagération ×100 sur des micromètres réels : oui.** `MM = 0.15` unité modèle par mm
   (l. 134) ; `KW = MM * 100 / 1000` (l. 138) = (1 µm en unités modèle) × 100. `wv` est lu
   en **µm** dans `W_TAB`, donc `wv * KW` = w réel × 100. Contrôle d'ordre de grandeur : la
   marche de 2,85 µm devient 0,0428 unité face à une couche 1,2 mm = 0,18 unité, soit
   **24 % d'une couche** — exactement la justification de la spec §3.6, et bien dans la
   fourchette ×80 à ×150. Aucune amplitude n'est en mm ni dessinée à 1:1.

**Sous-réserve** : l'écart de coupe `artef` est ajouté **avant** la multiplication par KW
(l. 670), donc lui aussi exagéré ×100 — c'est cohérent, mais il n'est pas sourcé (voir B11).

### D3. Orientation des fibres — **correcte partout où elle est dessinée**

Correspondance des repères : le modèle a **x = normale de coupe = Y physique**,
**y = épaisseur = Z physique**, **z = trajet de coupe = X physique** (`yOf(z)` l. 143,
`HZ` l. 136 « 32 mm de trajet de coupe », `LEN` l. 137 profondeur d'une moitié).

- `fibre: L.a === 0 ? 2 : 0` (l. 1351 et 1377) : les couches **0°** reçoivent l'axe 2 =
  z modèle = **X physique** ; les couches **90°** reçoivent l'axe 0 = x modèle = **Y
  physique**. C'est exactement [A] p. 4 §3, vérifié à la source : « the 0˚ plies/layers are
  the fibres orientation that was aligned with the X-axis ».
- `Movie.prototype.fibre` (l. 563-609) : si l'axe fibre est dans le plan de la facette
  (`a1 === axis` ou `a2 === axis`) → **traits** dans la direction des fibres ; sinon →
  **pointillés** (grille de disques). Donc, sur une facette de normale x modèle
  (= plan de coupe) : **0° = rayures parallèles au trajet de coupe** (fibres coupées en
  travers mais couchées dans le plan de coupe) et **90° = pointillés** (bouts de fibres
  normaux à la face). C'est la lecture physique correcte, et elle est cohérente sur les six
  faces (dessus/dessous : traits croisés 0°/90° ; flancs : 0° pointillés, 90° traits).
- **Plan de coupe** : `drawPlane` (l. 1263-1290) trace le plan en **x modèle = 0**, donc de
  **normale Y physique** ✓, étiqueté `cut` = « plan de coupe, normale Y » et `rel` =
  « σyy relâchée » ✓. La coupe est bien unique, plane, à mi-largeur, et c'est σ_yy qui est
  cartographiée ([A] p. 4 §3, vérifié : « the cut was performed at mid-width location to
  capture the same stress component, i.e., the stress along the Y-axis »).
- **Défaut** : la face de coupe elle-même n'est jamais texturée (voir B10), et aucun trièdre
  X/Y/Z n'est dessiné alors que les étiquettes `fx`/`fy` (« 0° fibres selon X », « 90°
  fibres selon Y ») nomment des axes qu'on ne voit pas. Deux flèches annotées X et Y en
  scène 1 régleraient les deux points.

### D4. Carte finale

| Exigence spec | État |
|---|---|
| bornes −130 / +50 MPa | ✓ l. 96 `MAP_MIN = -130, MAP_MAX = 50` |
| neutre ancré sur 0, pas étiré symétriquement | ✓ `sigRGB` l. 122-125 : rampe négative de 0 → −130, rampe positive de 0 → +50, chacune partant du même gris neutre `[235,231,224]` |
| 0 marqué sur la barre | ✓ `drawBar` l. 1113-1125, repère 0 en trait épais et couleur `--fg` |
| bandes discrètes (12 à 14 paliers) | ✓ `MAP_BANDS = 12`, pas de 15 MPa, `bandCentre` l. 115-121 |
| bandes rectilignes parallèles aux plis | ✓ texture de **6 px de large** extrudée (l. 428), donc σ strictement invariant selon la largeur — pas d'« oignons » (§5 n° 12) |
| structure pli par pli | ✓ discontinuités à z = 1,2 et 4,4, gradients internes aux 90° |
| bandes d'artefact aux extrémités | ✓ `drawHatch` l. 956-957, `uEnd = 7/32` = 1,25 × épaisseur ([P] p. 163, vérifié à la source) — mais proportion trompeuse, voir B8 |
| bandes d'artefact aux interfaces | ✓ l. 960-961, ± 0,09 mm autour de 1,2 / 2,2 / 3,4 / 4,4 |
| bandes d'artefact aux faces libres | ✓ l. 958-959, z < 0,09 et z > 5,51 ([P] p. 45-46) |
| pics d'interface non présentés comme réels | ✓ la carte est bornée par `S_TAB` (max |σ| = 130), aucun +250/−250 (§5 n° 14) |
| composante annoncée | ⚠ `note0`/`note90` seulement si largeur ≥ 480 px et absents de la transcription → **A3** |
| pas d'incertitude chiffrée | ✓ aucune (§5 n° 13) |
| palette | écart assumé et autorisé par la spec §6.2 (divergente au lieu de l'arc-en-ciel Abaqus) |

### D5. Chiffres — inventaire et traçabilité

Tous les chiffres visibles ont été relevés ; **tous sont sourcés**, sauf le cas +42 traité
en B1. Les vérifications marquées « source » ont été refaites dans le PDF.

**Légendes (FR et EN, textes strictement équivalents)**

| Chiffre | Où | Source |
|---|---|---|
| 20 plis | lég. 1, aria-label canvas | [A] p. 4 §3 — **vérifié** |
| cinq couches ; 1,2 / 1,0 / 1,2 / 1,0 / 1,2 mm | lég. 1 | [A] p. 5 §4.1.2 (« 1.2 mm for the 0˚ ply cluster & 1 mm for the 90˚ ply cluster ») — **vérifié** |
| 5,6 mm | lég. 1 | [A] p. 4 §3 (« 200 × 200 × 5.6 mm³ ») — **vérifié** |
| Deux feuillards | lég. 2 | [A] p. 4 §4.1.1 (« at the top and bottom ») — **vérifié** |
| Ø 0,25 mm | lég. 3 | [A] p. 4 §4.1.1 (« brass wire of 0.25 mm diameter ») — **vérifié** |
| 0,18 mm/min | lég. 3 | [A] p. 5 §4.1.1 (« approx. 0.18 mm/min ») — **vérifié** |
| une seule passe / pas de reprise | lég. 3 | [A] p. 3 §2 (« Re-cutting the material removes the relaxed layer so it is avoided ») — **vérifié** |
| 0,1 mm | lég. 5 | [A] p. 5 §4.1.2 — **vérifié** |
| 119,3 GPa · 8,2 GPa | lég. 6 | [A] Table 2 p. 4 — **vérifié** |
| −130 MPa | lég. 7 | [A] abstract p. 1 et Table 5 p. 11 (coupe #2) — **vérifié** |
| +42 MPa | lég. 7 | spec §2.5 (lecture fig. 9(c), ± 5 MPa) ; **[A] Table 5 publie 40** → B1 |
| 0° / 90° | lég. 1, 4, 7 | [A] p. 4 §3 |

**Textes dessinés dans le canvas (`ul.movie-terms`)**

| Chiffre | Clé | Source |
|---|---|---|
| [0° / 90° / 0° / 90° / 0°] | `stack` | [A] p. 4 §3 (indices ₄ omis, voir C3) |
| 20 plis, 4 par couche | `plies` | [A] p. 4 §3 |
| 5,6 mm | `total` | [A] p. 4 §3 |
| Ø 0,25 mm | `wirel` | [A] p. 4 §4.1.1 |
| 0,18 mm/min, une seule passe | `speed` | [A] p. 5 §4.1.1 |
| pas de mesure 0,1 mm | `step` | [A] p. 5 §4.1.2 (voir B12 sur le rendu) |
| déformation × 100 | `exag` | spec §3.6 (choix recommandé, pas une mesure) |
| amplitude réelle 7,3 µm crête à crête | `amp` | [A] fig. 5(c) p. 7 : +2,80 − (−4,45) = 7,25 ✓ |
| E11 119,3 GPa · E22 8,2 GPa | `props` | [A] Table 2 p. 4 — **vérifié** |
| théorie des stratifiés : +29 / −52 MPa | `clt` | [A] Table 5 p. 11 (CLT, épaisseurs mesurées) — **vérifié** |
| −130 MPa | `minc` | [A] Table 5 p. 11 — **vérifié** |
| +42 MPa | `maxt` | spec §2.5 ; **40 publié** → B1 |
| σyy (MPa) | `sig` | [A] fig. 9 note — **vérifié** |

**Chiffres tracés par le code (hors `movie-terms`)**

| Chiffre | Où | Source |
|---|---|---|
| 1,2 / 1,0 / 1,2 / 1,0 / 1,2 (cotes de tranche) | `drawCotes` l. 1253 | [A] p. 5 §4.1.2 ✓ |
| 0,0 / 1,2 / 2,2 / 3,4 / 4,4 / 5,6 (axe z du panneau) | `drawPanel` l. 1172-1179 | [A] fig. 9(c) p. 11 ✓ |
| −4,45 et +2,80 (extrema du panneau) | `drawPanel` l. 1225-1227 | [A] fig. 5(c) p. 7 ✓ (placement à corriger, B7) |
| −130 / −100 / −50 / 0 / +50 (graduations de barre) | `drawBar` l. 1113 | −130 = [A] Table 5 ; +50 = borne spec §6.2 ; les autres sont des graduations |
| 0° / 90° (étiquettes de couche) | `annotate` l. 1550 | [A] p. 4 §3 ✓ |

**Aria-labels et figcaption**

| Chiffre | Où | Source |
|---|---|---|
| « 20 plis » / « 20-ply » | aria-label du canvas | ✓ |
| « Sept étapes » / « Seven steps », « Scène 1 » à « Scène 7 » | aria-labels | ✓ structurels |
| « 43 secondes » | figcaption | durée réelle 43,5 s + 1,5 s d'arrêt = 45,0 s → C1 |
| « exagérée 100 fois » | figcaption | spec §3.6 ✓ |
| aria-label de l'affiche SVG | poster | aucun chiffre |

**Chiffres présents dans le code mais jamais affichés** (donc sans obligation de source,
listés pour mémoire) : `e = 0.09` mm (largeur des bandes d'interface, C5) ; `uEnd = 7/32`
(B8) ; `GAP` = 2,8 mm et `SPLIT` = 6,5 mm (B9) ; amplitudes de `artef`, ±0,90 µm et
0,30 µm (B11) ; `HZ` = 16 mm et `LEN` = 10 mm (B8).

### D6. Contrôle des règles de contenu

- **Mots interdits** : `grep -inE 'm[ée]tal|metallic|metals|DRX|XRD|X-ray|diffract|perçage
  incr|hole.drill|slitting'` sur `methode.html`, `en/method.html` et `contourmovie.js` →
  **aucune occurrence**. Aucun superlatif détecté (`le meilleur`, `parfait`, `unique`,
  `spectaculaire`, `remarquable`, `révolution`…). Attention : c'est justement l'évitement de
  « métallique » qui a fait perdre le contenu de la légende 2 (A4) — le substitut proposé
  n'emploie aucun mot interdit.
- **Tirets cadratins** : `grep -c '—'` = **0** dans les trois fichiers. La mention
  obligatoire de la spec §3.6, qui en contient un, a été correctement scindée en deux
  lignes (`exag` + `amp`) — sous réserve de A2.
- **Cohérence FR/EN** : les 7 légendes se correspondent phrase à phrase ; les 36 clés de
  `movie-terms` sont identiques et dans le même ordre dans les deux pages (dont
  `data-k="dec"` = `,` en FR et `.` en EN, correctement consommé par `fmt` l. 1030-1033 et
  par les libellés du panneau l. 1225-1227). Trois écarts de fond relevés : B5 (rise/sink),
  B6 (théorie *classique*), et l'identité du reste est bonne.

### D7. Les 16 erreurs de la spec §5, vérifiées dans le code

| # | Erreur | Verdict |
|---|---|---|
| 1 | bombé global lisse | **Canvas : évité** (`W_TAB` en marches, risers dessinés `drawCutFace` l. 731-745). **Affiche SVG : violé** → A1 |
| 2 | gradient continu sans structure de plis | **Canvas : évité** (`S_TAB` discontinu, `buildMapTexture` par couche). **Affiche SVG : violé** → A1 |
| 3 | signe inversé | **évité**, démontré en D2 : w > 0 ⇒ sortant, 90° sortent, 0° rentrent, sur les deux faces |
| 4 | amplitudes en mm / 1:1 sans mention | **évité sur ≥ 480 px** (`drawExag` l. 1081-1090) ; **tronqué sous 480 px** → A2 |
| 5 | couches d'épaisseurs égales | **Canvas : évité** (`LAYERS` l. 27-33, cotes affichées). **Affiche SVG : violé** (9 bandes égales) → A1 |
| 6 | contrainte uniforme dans un pli 90° | **évité** : L2 va de −130 à +5, L4 de −12 à −130 |
| 7 | pli le plus déformé = pli le plus contraint | **évité et explicitement démenti** : légende 6 (« Le pli qui se déplace le plus n'est donc pas celui qui porte le plus de contrainte ») + `props` E11/E22 |
| 8 | spline unique montrée comme si ça marchait | **évité** : aucune spline dans le film. En revanche l'ajustement linéaire incrémental n'est pas montré non plus → B3 |
| 9 | électro-érosion « ordinaire » sur composite | **évité** : feuillards présents (scènes 2-3), 0,18 mm/min affiché. Mais la *raison* des feuillards est fausse → A4 |
| 10 | recoupe / deuxième passe | **évité** : `drawWire` fait une passe unique (`wp` monotone l. 273), légende 3 le dit |
| 11 | pièce immergée | **évité** : aucun bac, aucun fluide dessiné |
| 12 | carte en « oignons » / motifs 2D riches | **évité** : texture d'une colonne, bandes strictement rectilignes |
| 13 | incertitude chiffrée (« ± 20 MPa ») | **évité** : aucune. (La dispersion inter-coupes, elle, manque → B2) |
| 14 | pics d'interface montrés comme réels | **évité** : carte bornée à ±130 par les données, interfaces hachurées |
| 15 | ne pas dire quelle composante est tracée | **violé sous 480 px et dans la transcription** → A3 |
| 16 | stratifié symétrique dessiné asymétrique | **évité** : empilement symétrique, w(z) et σ(z) symétriques, aucun gauchissement global dessiné |

Bilan : 12 évitées franchement, 1 évitée par omission (n° 8), **3 violées** — deux par
l'affiche SVG (n° 1, 2, 5) et une par le seuil `this.mid` (n° 4 et 15).

### D8. Mises en scène non sourcées — acceptables ou non

| Élément | Verdict | Ce qui le rendrait honnête |
|---|---|---|
| Forme de l'écart antisymétrique `artef` (l. 88-90) | **Acceptable.** L'algèbre est juste (face A = w + δ, face B = w − δ en déplacement sortant ; la moyenne restitue w), la forme est arbitraire mais jamais chiffrée à l'écran | ajouter « (écart schématique) » au libellé `face A / face B` du panneau, scène 5 → B11 |
| Retournement de la moitié B en scène 5 (`flipB`, l. 491-492) | **Acceptable et physiquement juste.** La rotation de π autour de l'axe d'épaisseur est le retournement réel ; le code miroite bien la largeur (z local → −z monde) tout en gardant l'épaisseur, et les deux faces s'affichent alors en déplacement sortant avec des écarts de signes opposés — exactement ce qu'on compare avant moyennage | optionnel : dire dans la légende 5 que retourner la face B impose de la remiroiter avant recalage |
| Écartement des deux moitiés (2,8 mm) et décalage vertical (6,5 mm) | **Acceptable comme vue éclatée**, mais voisine dangereusement de la mention « ×100 » | mention « vue éclatée » → B9 |
| Taille du bloc : 32 × 20 × 5,6 mm contre une plaque 100 × 100 × 5,6 mm | **Acceptable en soi** (aucune dimension en plan n'est affirmée), **mais** il en résulte 44 % de carte hachurée au lieu de 14 % | porter `HZ` à 50·MM, ou étiqueter « détail : 32 mm du trajet de coupe » → B8 |
| Rognage 1,25 × épaisseur appliqué à la coupe [A] | **Acceptable, prudent**, mais c'est du [P] (fil diamanté) transposé à une coupe WEDM pour laquelle [A] ne rapporte aucun rognage | rien d'obligatoire ; ne pas chiffrer « 7 mm » à l'écran |
| Relâchement montré au débridage | **Trompeur** : suggère que le bridage retenait la déformation | reformuler la légende 4 → B4 |
| Feuillards dessinés débordants et « collés » | **Dessin acceptable, texte non** | → A4 |
| Faisceau balayant qui ressemble à un laser, sous une légende « pas 0,1 mm » (MMT à palpeur Ø 3 mm) | **Mineur** | → B12 |
| Affiche SVG en bombé lisse | **Non acceptable** : c'est la signature métal que le film combat | → A1 |

---

## VERDICT

**Publiable après corrections obligatoires.**

Le noyau scientifique est solide et, sur les points où la spec est intransigeante — signes,
formes en créneaux, épaisseurs inégales, gradient dans les couches 90°, extrema, ancrage du
zéro, bandes rectilignes, absence d'incertitude inventée, absence de spline triomphante —
le code est juste et se vérifie ligne à ligne contre les tableaux de référence, eux-mêmes
recoupés avec les PDF. La démonstration du signe (normale sortante, miroir des deux faces)
et celle de l'exagération (×100 sur des micromètres réels) sont sans ambiguïté.

Quatre corrections conditionnent la publication : **A1** (l'affiche de repli enseigne
l'erreur n° 1 de la spec à tout visiteur sans JS), **A2** et **A3** (deux mentions rendues
obligatoires par la spec disparaissent sous 480 px, c'est-à-dire sur la moitié du trafic),
et **A4** (la seule raison publiée de la présence des feuillards a été remplacée par trois
affirmations absentes des deux sources). Elles sont toutes petites : deux `path` SVG, une
condition `if` supprimée, deux phrases de légende réécrites en FR et en EN.

Les recommandations B1 à B3 (valeur publiée +40, dispersion inter-coupes, lissage couche par
couche) transformeraient un film juste en film qui dit aussi la solidité de sa propre
source ; elles méritent d'être traitées dans la foulée.
