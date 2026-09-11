# Spécification physique — film d'animation « méthode du contour sur stratifié CFRP croisé »

Document de référence pour le développeur du canvas JS. **Toute valeur numérique est
sourcée** (page ou figure). Quand une valeur n'existe pas dans les deux sources lues,
c'est écrit explicitement : *non trouvé dans les sources*.

## Sources lues (et seulement celles-là)

- **[A]** Ahmad B., Zhang X., Guo H., Fitzpatrick M.E., Ayre D., « Estimation of residual
  stress in carbon fibre composite laminate using the contour method », *Composite
  Structures* **383** (2026) 120147. Pagination citée = pagination de l'article (p. 1 à 14).
- **[P]** Karebasannanavar Ramachandrappa P. (« Praveen K R »), *Advancing the Contour
  Method to Characterise Residual Stress in Polymer Composites*, thèse de doctorat,
  The Open University, 2024 (soutenue juillet 2023). Pagination citée = **pagination
  imprimée** de la thèse (= page PDF − 13).

Convention d'étiquetage : **[E]** = mesuré/publié dans la source ; **[D]** = déduit par
raisonnement explicité (théorie des stratifiés / principe de Bueckner) ; *non trouvé*.

---

## 1. Empilement à représenter et plan de coupe

### 1.1 Empilement retenu pour le film — celui de [A]

C'est le cas le mieux documenté (géométrie, épaisseurs mesurées, profil de déplacement
publié, carte de contraintes publiée), donc **c'est celui que le film doit représenter**.

| Grandeur | Valeur | Source |
|---|---|---|
| Matériau | préimprégné CFRP **MTC510-UD300-HS-33%RW** (SHD0373-300P), fibre de carbone / résine thermodurcissable | [A] p. 4, §3 |
| Nombre de plis | **20 plis** unidirectionnels | [A] p. 4, §3 |
| Séquence | **[0°₄ , 90°₄ , 0°₄ , 90°₄ , 0°₄]** — 5 « couches » (*layers*), chacune = **grappe (cluster) de 4 plis** de même orientation | [A] p. 4, §3 et fig. 2(c)(d) |
| Épaisseur **nominale** d'un pli | **0,28 mm** (couche = 4 × 0,28 = 1,12 mm) | [A] p. 4, §3 et p. 9, §5.1 |
| Épaisseur **mesurée** d'un pli | **0,30 mm** pour un pli 0° ; **0,25 mm** pour un pli 90° | [A] p. 9, §5.1 |
| Épaisseur **mesurée** d'une couche | **1,2 mm** (grappe 0°) ; **1,0 mm** (grappe 90°) | [A] p. 5, §4.1.2 ; p. 9, §5.1 ; fig. 3(d) |
| Épaisseur totale | **5,6 mm** | [A] p. 4, §3 |
| Dimensions de plaque | **200 × 200 × 5,6 mm³** (coupe #1) ; **100 × 100 × 5,6 mm³** (coupe #2, après recoupe du demi-plateau) | [A] p. 4, §3 |
| Cuisson | autoclave 2 bar, **120 °C pendant 60 min**, barrage en liège autour de la plaque pour éviter le fluage de résine | [A] p. 4, §3 |
| Tg mesurée (DMA) | **118 °C** → ΔT utilisé en TCS = Tg − T_ambiante = 118 − 20 = **98 K** | [A] p. 6, §4.2 |

**Géométrie à dessiner** : les 5 couches ont des épaisseurs **inégales** —
1,2 / 1,0 / 1,2 / 1,0 / 1,2 mm. Ne pas dessiner 5 bandes égales.
Position des interfaces depuis la face z = 0 : **1,2 — 2,2 — 3,4 — 4,4 mm**
(total 5,6 mm). Ces cotes sont celles des axes de la fig. 9(c) de [A] (p. 11).

> Détail physique à légender : l'épaisseur mesurée diffère du nominal parce qu'à la
> chauffe **les fibres se contractent et la résine se dilate** (α₁₁ = −0,14·10⁻⁶ /°C,
> α₂₂ = +42·10⁻⁶ /°C) ; les couches riches en résine dans la direction considérée
> s'épaississent, les autres s'amincissent. [A] p. 12, §5.3 et Table 2 p. 4.
> **Effet chiffré : prendre les épaisseurs mesurées plutôt que nominales réduit les pics
> de contrainte de 24 à 36 %** (calcul depuis Tables 4 et 5 de [A], p. 11 :
> transverse 45→30 MPa soit −33 % et 55→40 MPa soit −27 % ; le long des fibres
> −110→−70 MPa soit −36 % et −170→−130 MPa soit −24 %).

### 1.2 Propriétés matériau du pli (à afficher au moment du calcul EF)

| E₁₁ (fibre) | E₂₂ (résine) | G₁₂ | ν₁₂ | α₁₁ | α₂₂ |
|---|---|---|---|---|---|
| **119,3 GPa** | **8,2 GPa** | **3,6 GPa** | **0,34** | **−0,14·10⁻⁶ °C⁻¹** | **+42·10⁻⁶ °C⁻¹** |

[A] Table 2, p. 4. Le rapport E₁₁/E₂₂ ≈ **14,5** est le ressort de toute l'animation
(voir §3.4).

### 1.3 Plan de coupe

- Repère global XYZ : **X = largeur de la plaque**, **Y = direction de la contrainte
  mesurée**, **Z = épaisseur**. Les plis « 0° » ont leurs fibres **alignées sur X**.
  [A] p. 4, §3.
- La coupe est **plane, unique**, réalisée **le long de l'axe X**, à mi-largeur ; sa
  **normale est Y**. Elle relâche donc **σ_yy** et c'est σ_yy qui est cartographié.
  [A] p. 4, §3 et p. 9, §5.1.
- Conséquence directionnelle, essentielle et à légender dans le film :
  - dans un **pli 0°** (fibres ∥ X, donc **dans le plan de coupe**), σ_yy est la
    contrainte **transverse aux fibres** ;
  - dans un **pli 90°** (fibres ∥ Y, donc **perpendiculaires au plan de coupe**),
    σ_yy est la contrainte **le long des fibres**.
  [A] note répétée sous les fig. 7, 8, 9, 10 (p. 9 à 12).
- Les deux coupes de [A] : coupe #1 à 100 mm du bord de la plaque 200×200 ;
  coupe #2 à 50 mm du bord du demi-plateau 100×100. [A] p. 4, §3.

### 1.4 Empilement alternatif (sources, mais **à ne pas** représenter)

Pour information seulement — ne pas mélanger avec le cas [A] :
- [P] plaque **symétrique** T700S(24K)/MTM46, **19 plis**, **7,7 mm**, plis de
  **0,375 à 0,625 mm** d'épaisseur (épaisseurs variables mesurées pli par pli),
  cuisson four sous vide 135 °C/90 min + post-cuisson 180 °C/60 min, **Tg = 197 °C**
  (DSC modulée, moyenne de 3 échantillons : 193,19 / 203,33 / 195,77 °C).
  [P] p. 68-69 (Table 3-1), p. 76-77, p. 158-159.
- [P] plaque **asymétrique** [0,90], **7,4 mm**, 145 × 36 mm. [P] p. 68-69.

---

## 2. État de contrainte résiduelle AVANT la coupe, pli par pli

### 2.1 Origine physique (à légender dans le film)

Trois échelles, toutes citées dans [A] p. 1-2, §1 :

1. **Micro (dans un pli)** : désaccord de dilatation fibre/matrice. Au refroidissement,
   la matrice se rétracte beaucoup plus que la fibre (α_matrice ≫ α_fibre, d'un ordre de
   grandeur) → **fibres en compression, matrice en traction**. [A] p. 1, §1-i.
2. **Méso / macro (pli à pli)** — **c'est le niveau que la méthode du contour mesure
   ici** : au refroidissement depuis la cuisson, chaque pli voudrait se contracter selon
   sa propre anisotropie mais en est empêché par ses voisins d'orientation orthogonale.
   [A] p. 1, §1-ii.
3. **Global (dans l'épaisseur du stratifié)** : gradient de vitesse de refroidissement,
   gradient de température ou d'humidité ; les stratifiés épais refroidissent plus
   lentement à cœur. [A] p. 2, §1-iii.

[P] ajoute explicitement que le **retrait chimique** et le **gradient de degré de
réticulation** contribuent en plus des CTE, et que la TCS (théorie classique des
stratifiés) **ne** les prend **pas** en compte ([P] p. 183, §5.3). Aucune des deux
sources ne donne de valeur chiffrée séparée pour la part de retrait chimique :
*non trouvé dans les sources*.

### 2.2 Signe, pli par pli — le point non négociable

> **Pli 90° (fibres ⟂ au plan de coupe, σ mesurée = σ le long des fibres) → COMPRESSION.**
> **Pli 0° (fibres ∥ au plan de coupe, σ mesurée = σ transverse aux fibres) → TRACTION.**

- [A], résumé et conclusions : « tensile residual stress in the direction transverse to
  the fibres with a maximum value of **40 MPa**, and compressive residual stress along the
  fibre direction with a maximum value of **−130 MPa** » (p. 1, abstract ; p. 12-13, §6).
- [P], échantillon symétrique : « **0° plies are primarily tensile in nature, while 90°
  plies experience compression** » (p. 163-164, §4.4) ; traction dans les plis 0° de
  **25 à 30 MPa** (p. 160).
- Raison physique [D] : la fibre a un α quasi nul (voire négatif) ; au refroidissement,
  le pli 90° voudrait rester long selon Y mais les plis 0° voisins, gouvernés par la
  résine selon Y (α₂₂ = 42·10⁻⁶), se contractent fortement et compriment le pli 90°
  dans sa direction fibre ; réciproquement le pli 0° est mis en **traction transverse**
  par ses voisins 90° rigides. C'est le mécanisme classique du croisé, et c'est
  précisément ce qui rend la matrice sujette à la microfissuration ([A] p. 2, §1).

### 2.3 Forme du profil dans l'épaisseur

- **Le profil de référence analytique est un CRÉNEAU pli par pli, pas un gradient
  continu.** La TCS donne une valeur **constante dans chaque couche** et un **saut
  discontinu** à chaque interface 0°/90°. [A] fig. 8(b) et fig. 9(c), p. 10-11 (courbe
  noire pointillée) ; [P] fig. 5-25, p. 190 (courbe magenta).
- **Symétrie** : l'empilement [0₄/90₄/0₄/90₄/0₄] est symétrique par rapport à
  z = 2,8 mm ; le profil TCS est donc **symétrique**, et le profil mesuré l'est
  approximativement (fig. 9(c) de [A] : les deux pics de compression à −130 MPa se
  trouvent aux deux interfaces avec les couches **externes** 0°, c.-à-d. z = 1,2 mm et
  z = 4,4 mm).
- **Le profil mesuré n'est PAS un créneau parfait** : à l'intérieur des couches 90° il
  existe un **fort gradient**, la compression étant maximale à l'interface avec la couche
  0° externe et remontant jusqu'à ≈ 0 à l'interface avec la couche 0° centrale
  ([A] fig. 9(c), p. 11). C'est le principal apport expérimental par rapport à la TCS :
  « the stress profile at interface obtained with the modified contour method is unique…
  Classical laminate theory assumes uniform distribution of stress throughout the ply
  thickness and does not account for the interface stresses » ([A] p. 11, §5.2).
- **Effet de bord / gradient global** : [P] montre en plus, sur 19 plis, que la
  **moyenne par paire de plis** dessine une **ondulation lente dans l'épaisseur**
  (± ~35 MPa, ~2 périodes sur 7,7 mm) que ni la TCS ni la simulation thermique ne
  produisent : « the application of the contour method in symmetric samples offers the
  benefit of furnishing data pertaining to the **global variation of residual stress
  across the thickness** » ([P] p. 189, fig. 4-15 p. 161 et fig. 5-25 p. 190).
  Si le film veut montrer ce point, le représenter comme une **modulation lente
  superposée au créneau**, pas comme une alternative au créneau.
- Une différence notable existe **entre deux coupes de la même plaque** (coupe #1 vs
  coupe #2), attribuée par [A] à « variations in material shrinkage and cooling rates at
  separate locations of the same plate during the curing process » ([A] p. 11, §5.1).
  → le film peut légender « le champ n'est pas homogène dans le plan de la plaque ».

### 2.4 Valeurs simulées vs mesurées — tableau de comparaison

**Cas [A]** (croisé symétrique 20 plis, épaisseurs **mesurées**, [A] Table 5 p. 11) :

| Méthode | σ transverse aux fibres (plis 0°) | σ le long des fibres (plis 90°) |
|---|---|---|
| Contour, coupe #1 | **+30 MPa** | **−70 MPa** |
| Contour, coupe #2 | **+40 MPa** | **−130 MPa** |
| TCS (analytique) | **+29 MPa** | **−52 MPa** |

Avec les épaisseurs **nominales** ([A] Table 4, p. 11) : contour #1 +45 / −110 ;
contour #2 +55 / −170 ; TCS +30 / −44.

**Cas [P]** (échantillon **asymétrique** [0,90], 7,4 mm — c'est là que se trouve la
valeur −72 MPa) :

| Méthode | dans le pli **90°**, à l'interface 90°/0° (z ≈ 3,5 mm) | dans le pli **90°**, en peau (z = 0) | dans le pli **0°** |
|---|---|---|---|
| Simulation thermique ABAQUS | **−72 MPa** | +45 MPa | +13 → +8 MPa |
| TCS | **−122 MPa** | +95 MPa | +25 → +16 MPa |
| Méthode du contour (mesure) | **≈ −150 MPa** (creux mesuré) | +30 → +45 MPa | 0 → +22 MPa |
| Slitting (pulse method) | ≈ −80 MPa (segment moyen) | ≈ +45 MPa (segment moyen) | ≈ +15 MPa |

Sources : [P] fig. 5-21 p. 187 (simulation, **−72 MPa au point le plus comprimé, dans le
pli 90°, en contrainte le long des fibres**) ; [P] fig. 5-17 p. 184 (TCS) ; [P] fig. 5-24
p. 189 (superposition des quatre méthodes). Valeurs lues sur graphique → précision de
lecture ± 5 MPa.
Dans l'échantillon **symétrique** de [P], le contour brut descend à **−130 à −165 MPa**
dans les plis 90° (fig. 4-15 p. 161 et fig. 5-25 p. 190), tandis que TCS et simulation
donnent **≈ −28 à −30 MPa** en valeur moyenne par pli — l'écart est expliqué par [P]
comme un effet de **pics d'interface** et de sensibilité au module élevé des plis 90°.

> **Formulation honnête à reprendre pour le film** : « la simulation thermo-élastique
> donne un maximum de compression de −72 MPa dans le pli 90° à l'interface, alors que la
> mesure par contour donne −100 à −150 MPa au même endroit. » ([P] fig. 5-21 p. 187 et
> fig. 5-24 p. 189). Ce n'est **pas** une erreur d'un facteur 2 à balayer : la TCS et la
> simulation ignorent le retrait chimique et les contraintes d'interface ([A] p. 11, §5.2 ;
> [P] p. 183, §5.3).

### 2.5 TABLEAU DE RÉFÉRENCE σ(z) POUR DESSINER LA CARTE

Cas [A], coupe #2, lissage linéaire incrémental, **épaisseurs mesurées**.
Lecture de la fig. 9(c) de [A], p. 11 (± 5 MPa). z en mm depuis une face ; t = 5,6 mm.
« CLT » = créneau analytique de référence de la même figure.

| z (mm) | couche | orientation | σ_yy contour #2 (MPa) | σ_yy contour #1 (MPa) | σ_yy CLT (MPa) |
|---|---|---|---|---|---|
| 0,00 | L1 | 0° | +30 | +18 | +30 |
| 0,20 | L1 | 0° | +32 | +18 | +30 |
| 0,40 | L1 | 0° | +30 | +18 | +30 |
| 0,60 | L1 | 0° | +28 | +18 | +30 |
| 0,80 | L1 | 0° | +28 | +18 | +30 |
| 1,00 | L1 | 0° | +30 | +20 | +30 |
| 1,15 | L1 | 0° | +28 | +25 | +30 |
| **1,20⁻ / 1,20⁺** | **interface** | 0°→90° | **+28 → −130** | **+25 → −68** | **+30 → −52** |
| 1,30 | L2 | 90° | −128 | −55 | −52 |
| 1,40 | L2 | 90° | −110 | −45 | −52 |
| 1,60 | L2 | 90° | −85 | −28 | −52 |
| 1,80 | L2 | 90° | −55 | −25 | −52 |
| 2,00 | L2 | 90° | −25 | −30 | −52 |
| 2,10 | L2 | 90° | −10 | −38 | −52 |
| **2,20⁻ / 2,20⁺** | **interface** | 90°→0° | **+5 → −3** | **−45 → −2** | **−52 → +30** |
| 2,40 | L3 | 0° | −8 | +10 | +30 |
| 2,60 | L3 | 0° | +30 | +28 | +30 |
| 2,80 | L3 | 0° | +28 | +28 | +30 |
| 3,00 | L3 | 0° | **+42** (max traction) | +28 | +30 |
| 3,20 | L3 | 0° | +30 | +25 | +30 |
| 3,30 | L3 | 0° | +10 | +10 | +30 |
| **3,40⁻ / 3,40⁺** | **interface** | 0°→90° | **−12** | **−5 → −38** | **+30 → −52** |
| 3,60 | L4 | 90° | −18 | −32 | −52 |
| 3,80 | L4 | 90° | −28 | −20 | −52 |
| 3,90 | L4 | 90° | −32 | **−13** | −52 |
| 4,10 | L4 | 90° | −50 | −22 | −52 |
| 4,30 | L4 | 90° | −80 | −42 | −52 |
| **4,40⁻ / 4,40⁺** | **interface** | 90°→0° | **−130 → +30** | **−50 → +15** | **−52 → +30** |
| 4,60 | L5 | 0° | +35 | +20 | +30 |
| 4,80 | L5 | 0° | +32 | +18 | +30 |
| 5,00 | L5 | 0° | +30 | +15 | +30 |
| 5,20 | L5 | 0° | +30 | +15 | +30 |
| 5,40 | L5 | 0° | +30 | +18 | +30 |
| 5,60 | L5 | 0° | +30 | +20 | +30 |

Extrema à respecter : **min = −130 MPa** (aux deux interfaces avec les couches 0°
externes, z = 1,2 et 4,4 mm) ; **max = +42 MPa** (mi-couche 0° centrale, z ≈ 3,0 mm).
Cohérent avec l'abstract de [A] : +40 / −130 MPa.

**Version simplifiée acceptable pour l'animation** (si l'on ne veut qu'une courbe) :
créneau TCS (+30 / −52) **plus** le gradient mesuré dans les couches 90° : −130 MPa à
l'interface avec la couche 0° externe, remontée quasi linéaire jusqu'à ≈ 0 à
l'interface avec la couche 0° centrale. Ne jamais afficher un créneau 90° plat à
−130 MPa : ce serait contredire la fig. 9(c).

**Dans le plan de la coupe (direction X, largeur)** : la contrainte est **quasi invariante
selon X** — [A] indique qu'il n'y a pas de variation du déplacement selon la largeur
(« there is no change in the displacement data along the width », p. 6, §4.1.5), et les
cartes fig. 9(a)(b) p. 11 sont des **bandes horizontales rectilignes** sur toute la
largeur. → La carte 2D du film = **bandes parallèles aux plis**, pas une « cible »
concentrique comme sur une soudure métallique.

---

## 3. Déformation de la surface de coupe après relâchement

### 3.1 Signe — un pli en compression normale **ressort**

**[D] + [E]** Principe de Bueckner ([A] p. 3, §2) : la contrainte cherchée est celle
qu'il faut appliquer pour **ramener la surface coupée à plat**. Donc :

- un pli en **compression** normale au plan de coupe se **détend en s'allongeant** →
  la matière **saille / ressort hors du plan** (déplacement **positif**, vers
  l'extérieur) ;
- un pli en **traction** normale se **raccourcit** → la matière **rentre / se creuse**
  (déplacement **négatif**).

Vérification sur les données publiées : dans [A] fig. 5(c) p. 7, les deux couches **90°**
ont un déplacement **positif** (≈ +2,2 à +2,8 µm) et les couches **0°** un déplacement
**négatif** (0 à −4,5 µm) ; or fig. 9(c) p. 11 donne les 90° **comprimées** et les 0° en
**traction**. Les deux sont cohérents avec la règle ci-dessus.
[P] dit la même chose en mots : « thermal and chemical shrinkage lead to the displacement
of fibres within the 0° plies. Consequently, this induces a **compressed displacement
profile in the 0° plies**, which stands in sharp contrast to the behaviour observed in the
90° plies » ([P] p. 160).

### 3.2 Forme : CRÉNEAUX à marches franches aux interfaces

- Le profil w(z) mesuré est **en marches (créneaux) avec des sauts nets aux interfaces
  0°/90°**, chaque couche portant une pente lente à l'intérieur : c'est littéralement le
  titre de la figure : « average of incremental linear fittings showing **sharp shifts in
  displacement profile around interfaces** » ([A] fig. 5(c), p. 7).
- [P] confirme sur 19 plis : le profil brut lissé oscille **une fois par pli**
  ([P] fig. 3-56, p. 126), et la carte 2D du déplacement reproduit visuellement
  l'empilement : « the 2D map of the measured surface displacements shows **similar ply
  orientation as captured in the microscopy image** » ([P] p. 117, fig. 3-48).
- Détail interne au pli ([P] p. 190) : « **more displacement is observed at the ply centre
  compared to displacement at the interface** » → chaque pli forme un petit **arc bombé**,
  la marche n'est donc pas un plateau parfaitement plat.
- **Ce n'est pas non plus un profil sinusoïdal** : [P] l'écrit noir sur blanc, les
  formules standard du contour supposent une distribution cosinusoïdale « in practice, the
  cut surface displacement of laminated polymer composites is **nowhere near to the cosine
  profile. It has sharp bends at the interface** » ([P] p. 117-118).

### 3.3 Amplitudes absolues

| Grandeur | Valeur | Source |
|---|---|---|
| Plage des déplacements moyennés, coupe #1 | **± 10 µm** | [A] p. 5, §4.1.2 ; échelle de la fig. 4(b), p. 6 : −10 à +10 ×10⁻³ mm |
| Profil lissé coupe #2, extrema | **+2,8 µm** (couches 90°) à **−4,45 µm** (peaux 0°) → **7,3 µm crête à crête** | [A] fig. 5(c), p. 7 |
| Saut au passage d'une interface 0°/90° | **≈ +2,9 à +3,6 µm** | [A] fig. 5(c), p. 7 |
| Exactitude de la MMT | **1,5 µm** (Zeiss Contura g2, palpeur scanning Ø 3 mm) | [A] p. 5, §4.1.2 |
| Dispersion des ajustements linéaires selon la largeur X | **≈ 1 µm** (0,001 mm) | [A] p. 6, §4.1.4 |
| Échelle de la carte 2D de déplacement [P], échantillon symétrique | **−9 à +6 µm** | [P] fig. 3-48, p. 117 |
| Amplitude du profil lissé [P], échantillon symétrique | oscillation d'environ **±2 à 3 µm** autour de 0, données brutes ±5 à ±8 µm | [P] fig. 3-56, p. 126 |

**Ordre de grandeur à retenir : quelques micromètres. Jamais des millimètres, jamais des
dixièmes de millimètre.** Rapport épaisseur/déformation ≈ 5600 µm / 7 µm ≈ **800**.

### 3.4 Pourquoi le pli qui ressort le moins porte la plus grosse contrainte

Point de pédagogie à faire apparaître : **le déplacement le plus grand n'est pas là où la
contrainte est la plus grande**. Les couches 0° se creusent jusqu'à −4,5 µm mais ne
portent que +30 à +40 MPa, tandis que les couches 90° ne ressortent que de +2,5 µm et
portent −130 MPa. Raison [D] : la contrainte rétablie est de l'ordre de E × (déformation
imposée), et E₁₁/E₂₂ ≈ 14,5. [A] le dit pour le cas symétrique : « less effect in terms of
stress magnitude seen for 0° layers pertains to the **small values for elastic modulus and
Poisson's ratio for transverse to fibre direction** » ([A] p. 9, §5.1) ; [P] : « 90° plies
have **higher stiffness perpendicular to the cut plane** » ([P] p. 163-164).

### 3.5 Moyennage des deux faces et effets de bord

- **Les deux demi-surfaces sont mesurées**, recalées sur une grille commune, puis
  **moyennées point par point**. [A] p. 3, §2 (« The measured contours/displacements are
  averaged ») ; [P] p. 88, §3.6.2 (« the out-of-plane deformation of **both cut surfaces**
  was mapped ») et p. 97, §3.7.3.2 (« mapped onto a common grid and then averaged »).
- **Ce que le moyennage supprime** : les artefacts **antisymétriques** (ceux dont les deux
  faces se « correspondent » en se retournant) — dérive/ondulation du fil, cisaillement.
  « Asymmetrical artefacts are less concerned as they **can be cancelled out during data
  averaging** » ([P] p. 35, §2.7.2) ; « it has the potential to eliminate numerous sources
  of error, including but not limited to **shear stresses and asymmetric cutting
  artefacts** » ([P] p. 46, §2.7.4).
- **Ce que le moyennage NE supprime PAS** : les artefacts **symétriques**, c.-à-d. ceux
  qui laissent les deux faces en **symétrie miroir** (variation de largeur de saignée,
  évasement en entrée/sortie de fil) : « symmetrical artefacts can impose **substantial
  error as they cannot cancel each other during averaging** » ([P] p. 35, §2.7.2).
  **C'est le message à faire passer dans le film : la moyenne des deux faces n'est pas une
  purification magique.**
- **Effets de bord mesurés** : [P] a dû **écarter les données sur une bande de 1,25 ×
  l'épaisseur de l'échantillon à chaque extrémité de la coupe** (entrée et sortie de fil
  diamanté) : « the displacement is **trimmed to 1,25 times the thickness of the sample** »
  ([P] p. 163, §4.4 et fig. 4-17). Pour un échantillon de 7,4 mm d'épaisseur, cela fait
  **≈ 9,3 mm rognés de chaque côté**.
- [A] mesure jusqu'à **0,1 mm du périmètre** ([A] p. 5, §4.1.2) et ne rapporte pas de
  rognage de bord : *non trouvé dans [A]*.

### 3.6 FONCTION w(z) DE RÉFÉRENCE POUR L'ANIMATION

Lecture point à point de la fig. 5(c) de [A], p. 7 (coupe #2, moyenne des ajustements
linéaires incrémentaux). Colonne z = position depuis la face, avec les marches **replacées
sur les interfaces physiques** (1,2 / 2,2 / 3,4 / 4,4 mm ; la figure d'origine les place à
1,05 / 2,35 / 3,15 / 4,45 mm, décalage lié au zéro de la mesure — préférer les interfaces
physiques pour l'animation, les amplitudes sont conservées).

| z (mm) | couche | w (µm) | z (mm) | couche | w (µm) |
|---|---|---|---|---|---|
| 0,00 | L1 0° | −4,45 | 2,90 | L3 0° | −0,90 |
| 0,10 | L1 0° | −4,45 | 3,10 | L3 0° | −1,05 |
| 0,20 | L1 0° | −3,95 | 3,39 | L3 0° | −1,15 |
| 0,30 | L1 0° | −3,45 | **3,40** | **saut** | **−1,15 → +2,45** |
| 0,40 | L1 0° | −2,95 | 3,60 | L4 90° | +2,48 |
| 0,50 | L1 0° | −2,50 | 3,80 | L4 90° | +2,52 |
| 0,60 | L1 0° | −2,05 | 4,00 | L4 90° | +2,55 |
| 0,70 | L1 0° | −1,55 | 4,20 | L4 90° | +2,60 |
| 0,80 | L1 0° | −1,10 | 4,39 | L4 90° | +2,62 |
| 0,90 | L1 0° | −0,60 | **4,40** | **saut** | **+2,62 → −0,75** |
| 1,19 | L1 0° | −0,05 | 4,60 | L5 0° | −1,10 |
| **1,20** | **saut** | **−0,05 → +2,80** | 4,80 | L5 0° | −1,85 |
| 1,40 | L2 90° | +2,72 | 5,00 | L5 0° | −2,60 |
| 1,60 | L2 90° | +2,62 | 5,20 | L5 0° | −3,35 |
| 1,80 | L2 90° | +2,52 | 5,40 | L5 0° | −4,05 |
| 2,00 | L2 90° | +2,42 | 5,50 | L5 0° | −4,45 |
| 2,19 | L2 90° | +2,25 | 5,60 | L5 0° | −4,45 |
| **2,20** | **saut** | **+2,25 → −0,35** | | | |
| 2,40 | L3 0° | −0,45 | | | |
| 2,60 | L3 0° | −0,60 | | | |
| 2,80 | L3 0° | −0,78 | | | |

Caractéristiques à respecter impérativement :
1. **4 marches franches** aux 4 interfaces, hauteur **2,9 à 3,6 µm**.
2. Les **2 couches 90°** sont les 2 plateaux **hauts** (+2,2 à +2,8 µm), presque plats
   (pente ≤ 0,6 µm par couche).
3. La couche **0° centrale** est un plateau **bas et peu creusé** (−0,3 à −1,2 µm).
4. Les **2 couches 0° externes** plongent en **rampe quasi linéaire jusqu'à −4,45 µm aux
   deux faces libres** du stratifié. Cette rampe est **symétrique** (miroir par rapport à
   z = 2,8 mm). [A] ne commente pas cette rampe dans le texte : elle est **mesurée**, et
   elle ne produit **pas** de pic de contrainte dans les couches 0° (fig. 9(c) : +30 MPa
   quasi uniforme) — donc **ne pas** la légender « artefact » ni la supprimer.
5. **w est quasi indépendant de X** (la largeur) : [A] p. 6, §4.1.5. Pour la surface 3D de
   l'animation, extruder w(z) le long de X avec au plus un bruit résiduel faible.

**Facteur d'exagération recommandé : × 100.**
Justification : à ×100, la marche d'interface (2,9 µm) devient 0,29 mm face à une couche
de 1,2 mm, soit ~24 % d'une couche — franchement visible sans caricaturer. Plage
acceptable **×80 à ×150** ; **au-delà de ×200 la marche dépasse la moitié de l'épaisseur
d'une couche et devient mensongère**.
**Obligation** : afficher en permanence à l'écran, pendant la phase de déformation, la
mention « **déformation × 100 — amplitude réelle ≈ 7 µm crête à crête** ».

---

## 4. Étapes de la méthode dans l'ordre, avec les détails composites à montrer

### Étape 1 — Bridage symétrique, avant toute coupe
- Bridage **symétrique de part et d'autre du trajet de coupe**. [A] p. 4, §4.1.1 :
  « The samples were **symmetrically clamped** » ; photo fig. 3(b), p. 5 : la plaque est
  serrée entre deux longs mors rigides parallèles au trajet, sur la table de l'électro-
  érodeuse.
- À légender : si la pièce bouge pendant la coupe, la surface relâchée n'est plus
  interprétable (le contour repose sur l'hypothèse d'une coupe plane sur une pièce
  maintenue). *Aucune valeur d'effort de serrage dans les sources : non trouvé.*

### Étape 2 — Feuillards métalliques sacrificiels
- **Où** : **une tôle métallique mince plaquée sur la face supérieure et une sur la face
  inférieure** de l'éprouvette, pendant la coupe. [A] p. 4, §4.1.1 et fig. 3(d), p. 5
  (on les voit encadrer le stratifié sur la vue en coupe).
- **Pourquoi** : le CFRP n'est **pas suffisamment conducteur** ; les feuillards permettent
  à la machine d'**amorcer les étincelles et de démarrer la coupe**. [A] p. 4-5, §4.1.1 :
  « to overcome the **lack of electrical conductivity** in carbon fibre composites…
  **this enabled the machine to generate the required sparks and start cutting** ».
- **Preuve a contrario, à mentionner** : sans ce dispositif, l'électro-érosion à fil
  échoue sur CFRP. [P] a essayé et a cassé le fil : pénétration **de 2,4 mm seulement**,
  y compris en sandwichant l'échantillon entre deux pièces en acier inoxydable
  ([P] p. 92, §3.7.2, fig. 3-17). C'est la différence décisive entre les deux sources —
  **ne pas présenter la coupe WEDM sur composite comme une opération banale**.

### Étape 3 — Coupe unique au fil, en une passe
- Machine : **Fanuc Robocut α-C600i**, **fil laiton Ø 0,25 mm**. [A] p. 4, §4.1.1.
- Paramètres (Table 3, [A] p. 4) — à afficher si l'on veut du concret :
  tension à vide **VS = 20 V**, courant **CC = 5 A**, temps ON **50 µs**,
  temps OFF **800 µs**, tension de fil **T = 1500 N**, avance fil **WF = 13 m/min**.
- Qualitativement : il a fallu des **paramètres électriques à haute énergie** (tension,
  courant, durée d'étincelle) — « it was **not possible to cut the carbon fibre composite
  with low-energy electrical parameters** » ([A] p. 5, §4.1.1).
- **Vitesse de coupe ≈ 0,18 mm/min** — c'est **lent**, le film doit le suggérer ;
  coupe menée **sans rupture de fil**. [A] p. 5, §4.1.1.
- **Une seule passe, jamais de reprise** : une recoupe enlèverait la couche relâchée.
  [A] p. 3, §2 et p. 4, §4.1.1.
- **Pas de fissuration ni de délaminage** observés sur les surfaces coupées de [A]
  (p. 5, §4.1.1). [P] observe en revanche, sur ses coupes au fil diamanté, des
  microfissures, décohésions fibre/matrice et porosités, sans pouvoir trancher entre
  défaut de fabrication, dommage de coupe et effet du relâchement ([P] p. 117).
- **Point de vigilance thermique** : [P] mesure par caméra IR une température de coupe
  maximale de **20,7 °C** contre Tg = 197 °C, ce qui valide l'hypothèse élastique
  ([P] p. 132). [P] écrit aussi qu'**immerger un composite comme on le fait pour les
  métaux n'est pas envisageable**, l'eau pouvant relâcher la contrainte résiduelle
  ([P] p. 132). ⚠ [A] fait pourtant sa coupe sur une électro-érodeuse à fil (procédé
  normalement noyé) **sans mentionner l'immersion** : *le statut de l'immersion n'est pas
  tranché dans les sources*. → **Ne pas montrer explicitement la pièce noyée dans un bac.**

### Étape 4 — Métrologie des deux faces
- **MMT Zeiss Contura g2**, **palpeur scanning Ø 3 mm**, **exactitude 1,5 µm**.
  Pas de mesure **0,1 mm** dans les deux directions du plan de coupe, et à 0,1 mm du
  périmètre. [A] p. 5, §4.1.2.
  Justification du pas : il faut plusieurs points par couche de 1,0-1,2 mm, le gradient
  étant concentré à l'interface entre grappes orthogonales ([A] p. 5, §4.1.2).
- Variante [P] : **sonde laser à balayage Micro-epsilon ILD2210-10 TP8** montée sur MMT
  Zeiss Eclipse, spot Ø 50 µm, pas **25 µm**, en salle **thermorégulée** (exigence
  explicite pour un composite à contraintes d'origine thermique) ; le palpeur à contact
  Ø 1 mm sert à relever le **périmètre**. [P] p. 88, §3.6.2.
- **Les deux faces sont mesurées, recalées, puis moyennées point par point** (voir §3.5).
- **Contrôle de viscoélasticité à montrer ou légender** : les deux faces ont été
  **remesurées plusieurs semaines après** la première mesure, **sans différence notable**
  ([A] p. 5, §4.1.2). C'est ce qui autorise le calcul élastique.

### Étape 5 — Lissage / ajustement **pli par pli** (le cœur méthodologique)
- **Ce qui ne marche pas** : le lissage spline 3D classique du contour sur métaux.
  [A] a testé « various spline orders and knot spacings… **no significant improvement** »
  (p. 9, §5.1). La spline « fit the data set altogether and is **unable to account for the
  linearity and sudden shift present** » (p. 9). Résultat : des pics aberrants, jusqu'à
  **+475 / −399 MPa** sur la carte spline ([A] fig. 7(a), p. 9, bornes de l'échelle),
  et un profil faux (compression au centre du pli 90° et **traction aux interfaces**,
  [A] p. 9, §5.1).
  Réglage spline testé : espacement de nœuds **1 mm** selon l'épaisseur Z et **5,5 mm**
  selon la largeur X ([A] p. 5, §4.1.3).
- **Ce qui marche (méthode [A])** : **lissage linéaire incrémental 1-D** — la donnée est
  découpée en **5 groupes** (un par couche), et **chaque couche est lissée séparément par
  une droite** selon l'épaisseur Z, par tranches de **10 mm** selon la largeur X, puis les
  droites sont moyennées. [A] p. 6, §4.1.4 et fig. 5, p. 7.
- **Variante [P]** : **filtre médian**, taille de masque **7,0 × 0,25 mm** (asymétrique) ou
  **7,0 × 0,1 mm** (symétrique) ; jugé moins sensible aux artefacts de coupe que la spline
  ([P] p. 155-156, p. 161). Longueur d'onde minimale résoluble λ_min ≈ **0,51 à 0,60 mm**
  (= 5 × Rsm, avec Rsm = 0,10-0,12 mm), contre 3 × espacement de fibres = 0,09 mm
  ([P] Table 3-8, p. 118) ; rugosité Ra des coupes **0,95 à 1,5 µm** ([P] p. 114).
- **À l'écran** : montrer le nuage de points bruité, puis **une droite par couche**, et la
  **marche qui apparaît à l'interface** — pas une courbe unique qui traverse tout.

### Étape 6 — Calcul EF, déplacement inversé, propriétés orthotropes par pli
- Modèle **3D d'une seule moitié coupée**, éléments hexaédriques **C3D8R** (intégration
  réduite), **Abaqus/CAE 6.14-1**. [A] p. 6, §4.1.5, fig. 6 p. 8.
- **Le profil lissé est appliqué avec le signe inversé** comme condition aux limites en
  déplacement sur la surface de coupe. [A] p. 6, §4.1.4 (« This data **with reverse sign**
  was then input to FE model ») ; [P] p. 153 et p. 159.
- **Maillage sur la surface de coupe : 0,1 mm selon Z × 0,5 mm selon X**, biaisé dans la
  3ᵉ direction Y (0,2 / 0,2 / 0,3 / 0,4 / 0,5 / 0,6 / 0,9 / 1,1 / 1,4 / 1,7 / 2,2 / 2,7 /
  3,4 / 4,2 / 5,2 … 9,9 mm). [A] p. 6, §4.1.5 et fig. 6(c) p. 8. Seul le maillage de la
  surface de coupe compte.
- **Blocage des mouvements de corps rigide** : contraintes appliquées à **deux nœuds
  d'angle** de la surface de coupe ([A] p. 3, §2 et p. 6, §4.1.5) ; [P] utilise
  X = Y = 0 en bas à gauche et Y = 0 en bas à droite ([P] p. 153, p. 159).
- **Analyse linéaire élastique**. [A] p. 3, §2 et p. 6, §4.1.5.
- **Propriétés orthotropes assignées pli par pli**, avec le repère local orienté selon la
  fibre de chaque pli : E₁₁, ν₁₂ dans la direction fibre, E₂₂, ν₂₁ transverse.
  [A] p. 6, §4.1.5 ; [P] p. 158-159 (« the directional properties are assigned to
  individual plies by orienting the **local co-ordinate system in the direction of the
  fibre** »).
- **Géométrie des plis modélisée individuellement** : [P] construit **19 périmètres**, un
  par pli, extrudés sur la profondeur réelle de 36,25 mm, avec 13 à 16 éléments dans
  l'épaisseur de chaque pli (taille 0,0275 à 0,035 mm) ([P] p. 158-159).
- **La pièce coupée est supposée plate** dans le modèle EF, alors que le schéma de principe
  la montre bombée — simplification explicite de [A] (p. 3, §2). Si le film montre le
  schéma de principe bombé, il doit dire que le calcul se fait sur la géométrie plane.

### Étape 7 — Carte finale, incertitude, bandes d'artefact
- **Carte** : bandes horizontales alternées, une par couche, sur toute la largeur de la
  coupe. [A] fig. 9(a)(b), p. 11.
- **Profil extrait** superposé à la TCS. [A] fig. 9(c), p. 11.
- **Incertitude** : ⚠ **aucune barre d'erreur formelle n'est publiée dans les deux
  sources**. Ce qu'on peut légitimement afficher, et rien d'autre :
  - **écart contour ↔ TCS** : +30 vs +29 MPa dans les 0° (excellent), **−70 à −130 vs
    −52 MPa** dans les 90° ([A] Table 5, p. 11) ;
  - **écart entre deux coupes de la même plaque** : **−70 vs −130 MPa**, soit un facteur
    ~1,9 ([A] Table 5, p. 11) — c'est la meilleure mesure de reproductibilité disponible ;
  - **effet du choix nominal/mesuré des épaisseurs : 24 à 36 %** ([A] Tables 4 et 5, p. 11) ;
  - **exactitude métrologique 1,5 µm** sur des déplacements de ±10 µm ([A] p. 5) ;
  - [P] plafonne les pics d'interface par l'**ILSS**, valeur retenue **150 MPa** (valeur
    de fiche technique, non mesurée) : au-delà, le pic est considéré non physique et
    écarté ([P] p. 157-158, fig. 4-12 ; p. 189).
  → Légende honnête proposée : « pas d'incertitude formelle publiée sur composite ;
  dispersion inter-coupes observée : −70 à −130 MPa ».
- **Bandes d'artefact — où et quelle largeur** :
  - **Aux interfaces 0°/90°** : pics de contrainte **spurieux**, jusqu'à **+250 à +440 MPa
    et −165 à −250 MPa** dans [P] (fig. 4-15 p. 161, fig. 5-25 p. 190), causés par le
    désalignement entre le profil de déplacement lissé et la géométrie de pli
    ([P] p. 159-160, p. 189). Largeur : **quelques dixièmes de mm de part et d'autre de
    l'interface** (ordre de la taille de maille / de l'épaisseur de pli) ; *[P] ne chiffre
    pas une largeur : non trouvé*.
  - **Aux extrémités du trajet de coupe** (entrée et sortie du fil) : zone à **écarter sur
    1,25 × l'épaisseur de l'échantillon** ([P] p. 163, fig. 4-17).
  - **Aux deux faces libres du stratifié** (z = 0 et z = t) : [P] rappelle que les
    contraintes « mesurées » par extrapolation au bord « must be interpreted with prudence
    and are frequently omitted from reports » ([P] p. 45-46, §2.7.4).
  → Dans le film : hachurer/griser ces trois zones, avec la mention
  « zones non exploitables ».

---

## 5. Erreurs de représentation à proscrire

1. **Un bombé global lisse (« cuvette » ou « dôme ») sur toute la surface de coupe.**
   C'est la signature d'un métal. Ici le profil est **en créneaux à marches franches**,
   une marche par changement d'orientation de pli. [A] fig. 5(c), p. 7 ; [P] p. 117-118
   (« nowhere near to the cosine profile. It has **sharp bends at the interface** »).
2. **Un gradient continu et doux dans l'épaisseur, sans structure de plis.** Le profil TCS
   est **discontinu** aux interfaces. [A] fig. 9(c) p. 11 ; [P] fig. 5-25 p. 190.
3. **Signe inversé.** Les plis dont les fibres sont **perpendiculaires au plan de coupe**
   (90° ici, contrainte **le long des fibres**) sont en **compression** et **ressortent** ;
   les plis dont les fibres sont **dans le plan de coupe** (0°, contrainte **transverse**)
   sont en **traction** et **rentrent**. [A] abstract p. 1 et fig. 5(c) p. 7 ; [P] p. 160.
4. **Amplitudes en mm, ou déformation à l'échelle 1:1 sans mention.** L'amplitude réelle
   est de **quelques µm** ; toute exagération doit être **écrite à l'écran**. [A] p. 5, §4.1.2.
5. **Couches d'épaisseurs égales.** Elles valent 1,2 / 1,0 / 1,2 / 1,0 / 1,2 mm
   (mesurées) — la différence est visible sur la photo de la tranche ([A] fig. 3(d), p. 5)
   et change les pics de **24 à 36 %**. [A] p. 9 §5.1, p. 12 §5.3.
6. **Contrainte parfaitement uniforme à l'intérieur d'un pli 90°.** Le contour révèle un
   **gradient fort dans la couche 90°** (−130 MPa à une interface, ≈ 0 à l'autre) que la
   TCS ne voit pas. [A] fig. 9(c), p. 11 et §5.2.
7. **Faire croire que le pli le plus déformé est le plus contraint.** Les 0° se creusent
   le plus (−4,5 µm) et portent le moins (+30 MPa), à cause de E₂₂ ≪ E₁₁.
   [A] p. 9, §5.1 ; [P] p. 163-164.
8. **Lisser d'un seul trait (spline unique) à l'écran comme si ça marchait.** C'est
   précisément ce que [A] écarte : jusqu'à **+475 / −399 MPa** de pics parasites
   ([A] fig. 7(a), p. 9). Si la spline est montrée, elle doit l'être comme **contre-exemple**.
9. **Montrer une électro-érosion « ordinaire » sur composite.** Sans feuillards
   sacrificiels, le fil casse au bout de **2,4 mm** ([P] p. 92). Et si la vitesse est
   représentée, elle est de **0,18 mm/min** ([A] p. 5).
10. **Montrer une recoupe / deuxième passe.** Interdit : elle enlèverait la couche relâchée.
    [A] p. 3, §2.
11. **Montrer la pièce immergée dans un bac d'eau comme pour un métal.** [P] p. 132 :
    l'immersion d'un composite pose un problème (relâchement de contrainte par l'eau) ;
    le statut n'est pas tranché dans les sources → **éviter le plan**.
12. **Une carte 2D avec des « oignons » concentriques ou des motifs 2D riches.** La
    contrainte est **quasi invariante selon la largeur** : la carte est faite de **bandes
    parallèles rectilignes**. [A] p. 6 §4.1.5 et fig. 9(a)(b), p. 11.
13. **Afficher une incertitude chiffrée (« ± 20 MPa », etc.) sur composite.** Aucune des
    deux sources ne la publie. Utiliser à la place la dispersion inter-coupes
    (−70 / −130 MPa) et l'écart aux épaisseurs (24-36 %).
14. **Afficher les pics d'interface (+250 / −250 MPa et au-delà) comme de la contrainte
    réelle.** [P] les identifie comme artefacts de recalage géométrie/déplacement et les
    écarte par le critère ILSS (150 MPa). [P] p. 159-160, p. 189.
15. **Oublier de dire quelle composante est tracée.** Toutes les figures de [A] portent la
    note : « for the 0° ply, the plotted stress is **transverse to fibre** ; for the 90°
    ply, the plotted stress is **along the fibre** ». C'est la même composante σ_yy, mais
    elle ne signifie pas la même chose selon le pli.
16. **Un stratifié non symétrique dessiné comme symétrique (ou l'inverse).**
    [0₄/90₄/0₄/90₄/0₄] est **symétrique** → profil de contrainte symétrique et pas de
    gauchissement global ; le cas asymétrique [0,90] de [P] gauchit (paraboloïde
    hyperbolique, [P] p. 186) et son profil est **linéaire en flexion** dans le pli 90°
    (+95 → −122 MPa en TCS), ce qui est une **autre** histoire ([P] fig. 5-17, p. 184).

---

## 6. Palette de la carte

### 6.1 Ce qui est réellement utilisé dans les sources

**Ni bleu-blanc-rouge divergent, ni matplotlib « jet » : c'est l'arc-en-ciel discret par
bandes d'Abaqus** (rouge = traction, bleu = compression, vert au milieu), avec
dépassements en gris/noir.

- [A] fig. 9(a)(b), p. 11 — 13 bornes, 12 bandes, **pas uniforme de 14,5 MPa** :
  `+44,0 / +29,5 / +15,0 / +0,5 / −14,0 / −28,5 / −43,0 / −57,5 / −72,0 / −86,5 /
  −101,0 / −115,5 / −130,0` MPa. **Le zéro n'est pas centré** (il tombe à la 4ᵉ borne).
- [A] fig. 7(b)(c), p. 9 (épaisseurs nominales) : de **+70 à −190 MPa**.
- [A] fig. 7(a), p. 9 (lissage spline, contre-exemple) : de **+475,2 à −399,0 MPa**.
- [P] fig. 4-15, p. 161 : échelle **−150 à +150 MPa par pas de 25 MPa**, avec deux bandes
  hors gamme annotées **583** (gris) et **−277** (noir) ; vert ≈ 0.
- [P] fig. 5-22, p. 187 (simulation) : **−150 à +150 MPa** par pas de 25 MPa.
- Échelle de **déplacement** (et non de contrainte) de [A] fig. 4(b), p. 6 :
  **−10 à +10 ×10⁻³ mm**, arc-en-ciel bleu→jaune.

### 6.2 Recommandation pour le film

- **Bornes : −130 à +50 MPa**, c'est la gamme réellement couverte par les données de
  référence du §2.5 (min −130, max +42) et elle colle à la fig. 9 de [A].
- **Type d'échelle** : une **divergente centrée sur 0 (bleu → blanc/gris clair → rouge)**
  est préférable pour un champ signé et reste lisible en daltonisme et en niveaux de gris.
  ⚠ **C'est un écart assumé par rapport aux sources** (qui utilisent l'arc-en-ciel Abaqus) :
  si le film veut coller strictement aux figures publiées, utiliser l'arc-en-ciel discret
  d'Abaqus avec les 13 bornes ci-dessus. Dans les deux cas :
  - **0 MPa doit être une couleur neutre identifiable** et marqué sur la barre ;
  - les bornes étant asymétriques (−130 / +50), **ne pas** étirer le bleu et le rouge
    symétriquement autour du milieu de la barre : **ancrer le neutre sur 0** ;
  - **bandes discrètes** (12 à 14 paliers) plutôt qu'un dégradé continu : c'est le choix
    des deux sources et cela évite de suggérer une résolution qu'on n'a pas
    (λ_min ≈ 0,5 mm, [P] p. 118).
- **Légende à afficher sous la carte** (texte proposé, toutes les valeurs sont sourçables) :

  > **σ_yy — contrainte résiduelle normale au plan de coupe (MPa).**
  > Stratifié croisé CFRP [0°₄/90°₄/0°₄/90°₄/0°₄], 20 plis, 5,6 mm.
  > Dans les couches 0° (fibres dans le plan de coupe) σ_yy est **transverse aux fibres** ;
  > dans les couches 90° (fibres normales au plan de coupe) σ_yy est **le long des fibres**.
  > Traction +42 MPa max (cœur de la couche 0° centrale) ; compression −130 MPa max
  > (interfaces avec les couches 0° externes). Théorie classique des stratifiés :
  > +29 / −52 MPa. Zones hachurées : interfaces et extrémités de coupe, non exploitables.
  > Pas d'incertitude formelle publiée sur composite ; dispersion entre deux coupes de la
  > même plaque : −70 à −130 MPa.
  > *D'après Ahmad et al., Composite Structures 383 (2026) 120147.*

---

## 7. Références exactes à citer sous le film

1. **Ahmad B., Zhang X., Guo H., Fitzpatrick M. E., Ayre D.**, « Estimation of residual
   stress in carbon fibre composite laminate using the contour method »,
   *Composite Structures*, vol. **383**, 2026, art. **120147**.
   DOI : 10.1016/j.compstruct.2026.120147. Publication en libre accès (CC BY).
   Affiliations : Centre for Manufacturing and Materials, Coventry University (UK) ;
   School of Aerospace, Transport and Manufacturing, Cranfield University (UK).

2. **Karebasannanavar Ramachandrappa P.**, *Advancing the Contour Method to Characterise
   Residual Stress in Polymer Composites*, thèse de doctorat (PhD), The Open University,
   Milton Keynes (UK), 2024 (travaux menés d'avril 2019 à juillet 2023 ; directeurs :
   F. Hosseinzadeh, P. J. Bouchard, F. Lefebvre, D. Guillon ; partenaire industriel :
   CETIM, France). DOI : 10.21954/ou.ro.00098425 — https://oro.open.ac.uk/98425/
   Licence CC BY-NC-ND 4.0.

*(Ces deux références, et elles seules, ont été lues pour établir ce cahier des charges.
Toute autre citation éventuelle du film devra être vérifiée séparément.)*
