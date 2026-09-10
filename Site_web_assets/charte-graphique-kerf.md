# Charte graphique Kerf (version 1, septembre 2026)

Marque : **Kerf**. Dénomination sociale : Kerf Composites. Domaine : kerf-composites.fr. Périmètre : contraintes résiduelles dans les composites, uniquement.

## 1. Idée directrice

Le nom désigne la largeur de la fente laissée par le fil de découpe. Le symbole est un stratifié croisé (plis pleins et plis hachurés à 45°) fendu par un trait laiton, dont les deux moitiés se décalent d'un cran : la pièce se relâche, la mesure commence là. Tout le reste de l'identité découle de ce geste : austère, précis, industriel, avec une seule couleur chaude.

## 2. Couleurs

| Rôle | Nom | Hex | Usage |
| --- | --- | --- | --- |
| Primaire | Encre | #1A1714 | Texte, fonds sombres, symbole sur fond clair |
| Fond | Papier | #F4F1EC | Fond de page, symbole sur fond sombre |
| Accent | Laiton | #C8923A | Le trait du fil, liens, un seul élément par écran |
| Secondaire | Acier | #8A8580 | Texte secondaire, légendes, filets |
| Filet | Sable | #D9D4CC | Bordures, séparateurs (dérivé, non contractuel) |
| Texte courant | Encre douce | #3A3630 | Paragraphes longs sur fond papier |

Règles : le laiton est rare, jamais en aplat de fond, jamais sur plus d'un élément par bloc. Pas de dégradés. Pas d'autre couleur, y compris pour les cartes de contraintes présentées sur le site (les cartes réelles gardent leur échelle scientifique, elles sont montrées comme des images et non stylisées).

Contrastes vérifiés : Encre sur Papier 15,8:1 ; Papier sur Encre 15,8:1 ; Laiton sur Encre 6,2:1 (texte à partir de 14 px) ; Laiton sur Papier 2,9:1 (réservé aux éléments non textuels ou aux titres de grande taille).

## 3. Typographie

- **Archivo** (Google Fonts), graisses 500, 700, 800. Titres en 800, interlettrage -0,02 em. Texte courant en 500. Substitution : Helvetica Neue, Arial, sans-serif.
- **JetBrains Mono** (Google Fonts), graisses 400, 500. Valeurs numériques, unités, étiquettes en capitales espacées (letter-spacing 0,16 em), code, légendes techniques. Substitution : Menlo, Consolas, monospace.
- Échelle : 12 (étiquettes), 14 (légendes), 16 (texte, minimum), 20 (chapô), 30 (titres de section), 44 à 64 (titre de page). Interligne 1,5 pour le texte, 1,1 pour les titres.
- Pas d'italique. Pas de soulignement hors liens.

## 4. Logo

Fichiers fournis dans `logos/` :
- `kerf-logo-encre.svg` : symbole + mot KERF, pour fond clair.
- `kerf-logo-papier.svg` : idem, pour fond sombre.
- `kerf-symbole-encre.svg`, `kerf-symbole-papier.svg` : symbole seul.
- `kerf-favicon.svg` : version sans hachures sur carré encre, pour 16 à 32 px.

Règles : zone de protection égale à la largeur de la fente laiton multipliée par quatre, tout autour. Taille minimale du logo complet : 120 px de large (30 mm en impression). En dessous de 24 px, le favicon sans hachures remplace le symbole. Ne jamais recolorer le trait laiton, ne jamais redresser les deux moitiés (le décalage est le sens du logo), ne jamais placer le logo sur une photo sans aplat encre ou papier derrière. Le mot KERF est composé en Archivo 800 ; pour l'impression, convertir le texte en tracés.

Signature sous le logo, quand elle est utile : « contraintes résiduelles · composites » en JetBrains Mono 12 px, laiton, letter-spacing 0,08 em. En anglais : « residual stress · composites ».

## 5. Mise en page

- Grille 12 colonnes, gouttière 24 px, largeur de contenu maximale 1 120 px, texte courant limité à 68 caractères par ligne.
- Espacement en multiples de 8 px ; sections séparées par 96 px sur écran large, 56 px sur mobile.
- Angles droits partout (rayon 0). Pas d'ombres portées. Les blocs se distinguent par un filet Sable de 1 px ou par un aplat Encre.
- Motif décoratif autorisé : les hachures à 45° du symbole, en filet fin, sur une bande ou un fond de section, à faible contraste (Sable sur Papier). Jamais sur du texte.
- Images : photos de pièces, surfaces de coupe et cartes de contraintes, en couleurs réelles, cadrées serré, jamais de banque d'images générique.

## 6. Ton et rédaction

- Phrases courtes, voix active, vocabulaire d'ingénieur. Français et anglais, chaque page dans les deux langues.
- Ne jamais inventer un chiffre : toute valeur affichée est sourcée (publication ou mesure propre) et accompagnée de son incertitude.
- Dire « composites » partout ; ne jamais mentionner les métaux, la DRX ni le perçage incrémental.
- Parler de résultats et de méthodologie ; ne jamais présenter le logiciel comme un produit.
- Pas de superlatifs (« leader », « unique », « révolutionnaire »). L'argument, c'est ce que la mesure permet de décider.
- Un seul appel à l'action par page : « Discuter d'un cas ».

## 7. Jetons CSS

```css
:root {
  --k-encre: #1a1714;
  --k-encre-douce: #3a3630;
  --k-papier: #f4f1ec;
  --k-laiton: #c8923a;
  --k-acier: #8a8580;
  --k-sable: #d9d4cc;
  --k-font-sans: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --k-font-mono: "JetBrains Mono", Menlo, Consolas, monospace;
  --k-radius: 0;
  --k-gutter: 24px;
  --k-content: 1120px;
  --k-section: 96px;
}
body { background: var(--k-papier); color: var(--k-encre); font-family: var(--k-font-sans); font-weight: 500; line-height: 1.5; }
h1, h2, h3 { font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; }
a { color: var(--k-laiton); text-decoration: underline; text-underline-offset: 3px; }
.label { font-family: var(--k-font-mono); font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--k-acier); }
.value { font-family: var(--k-font-mono); }
.dark { background: var(--k-encre); color: var(--k-papier); }
.rule { border: 1px solid var(--k-sable); }
```

Chargement des polices : `https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=JetBrains+Mono:wght@400;500&display=swap`. Pour un site sans dépendance externe, auto-héberger les deux familles en woff2.
