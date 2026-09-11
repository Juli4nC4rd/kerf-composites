# Site Kerf (kerf-composites.fr)

Site statique de **Kerf Composites** : mesure des contraintes résiduelles dans les composites par la méthode du contour.
HTML et CSS purs, un petit script sans dépendance (`assets/js/main.js`), aucune ressource externe au chargement, aucun cookie.
La mécanique est celle de la trame Mat-In-Méca (une page = un fichier HTML complet, en-tête et pied de page dupliqués volontairement, pas de build) ; l'identité est celle de la charte Kerf (`Site_web_assets/charte-graphique-kerf.md`).

## Arborescence

```
index.html                 Accueil (FR)            en/index.html         Home (EN)
methode.html               Méthode                 en/method.html
applications.html          Applications            en/applications.html
references.html            Références              en/references.html
contact.html               Contact (formulaire)    en/contact.html
mentions-legales.html      Mentions légales        en/legal-notice.html
confidentialite.html       Confidentialité         en/privacy.html
merci.html                 Page après envoi        en/thank-you.html
404.html                   Page introuvable (liens absolus, servie par l'hébergeur)
assets/css/main.css        Feuille de style unique, jetons de la charte en tête
assets/js/main.js          Menu mobile, mode sombre au défilement, apparitions, ouverture du kerf (héros)
assets/fonts/              Archivo (500 à 800) et JetBrains Mono (400 à 500), woff2 variables, licence OFL
assets/img/                Logos SVG, favicon SVG + PNG 32, apple-touch-icon 180, og.png 1200×630
sitemap.xml, robots.txt
docs/screenshots/          Capture de chaque page à 1280 px et 390 px
docs/lighthouse/           Rapports Lighthouse
Site_web_assets/           Kit de départ (charte, prompt, logos)
```

Le logo est inséré en SVG inline dans l'en-tête et le pied de page : le mot KERF y est du texte composé en Archivo, la police chargée par la page.
Pour tout autre usage (impression, réseaux sociaux), convertir le texte en tracés dans les fichiers de `Site_web_assets/kerf-charte/logos/`.

## Choix graphiques v1.1 (retours du 10 septembre 2026)

Compléments à la charte v1, ajoutés en jetons dans `main.css` :

- `--k-fonce` #2b2723 : gris foncé chaud pour tous les fonds sombres, à la place du quasi-noir encre ; `--k-fonce-2` #1f1c19 pour les blocs sombres quand la page est elle-même en mode sombre.
- `--k-dore` #e6c98a : doré léger, valeurs et numéros sur fond sombre ; `--k-dore-clair` #ece2cb : fond discret des encadrés « question ».
- Hiérarchie typographique élargie : titre de page 48 à 84 px, titre de section 32 à 44 px, sous-titre 22 px, chapô 22 px, texte 16 px.
- **Mode sombre au défilement** : dès que le héros sort de l'écran, `body` reçoit la classe `is-dark` et les jetons de surface (`--bg`, `--fg`, `--fg-soft`, `--line`) basculent. Tout composant doit utiliser ces jetons de surface, pas les couleurs brutes, pour suivre la bascule. Sans JavaScript, le site reste en mode clair.
- Menu mobile : bouton trois traits sous 900 px, panneau sous l'en-tête collant, fermeture par Échap ou clic à l'extérieur. Sans JavaScript, la navigation s'affiche en ligne.
- Animations : apparition des blocs (`.reveal`) et ouverture du kerf dans le héros de l'accueil ; toutes désactivées avec `prefers-reduced-motion`.

## Prévisualiser

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Ajouter une page

1. Copier la page FR la plus proche (par exemple `applications.html`) et sa jumelle EN dans `en/`.
2. Modifier `<title>`, `<meta name="description">`, `canonical`, les trois `hreflang` (FR, EN, x-default) et le lien `EN`/`FR` de l'en-tête.
3. Placer `aria-current="page"` sur l'entrée de navigation correspondante, dans l'en-tête, si la page entre dans le menu.
4. Ajouter les deux URL dans `sitemap.xml` (une entrée par langue, avec les liens `xhtml:link`).
5. Respecter les règles de contenu : composites uniquement, aucun chiffre hors des valeurs sourcées, un seul « Discuter d'un cas » par page, pas de tiret cadratin.

## Publier

- **GitHub Pages** : dépôt poussé sur `main`, Settings → Pages → source « Deploy from a branch », dossier `/ (root)`. Domaine personnalisé `kerf-composites.fr` (fichier `CNAME` à ajouter, DNS A/AAAA vers GitHub Pages, HTTPS forcé).
- **Cloudflare Pages** : projet connecté au dépôt, commande de build vide, répertoire de sortie `/`.

## Avant mise en ligne

Les points restants sont marqués `[À COMPLÉTER]` ou `[IMAGE À FOURNIR]` dans les pages (`grep -rn "À COMPLÉTER\|IMAGE À FOURNIR" *.html en/*.html`) :

- image de carte de contraintes sur l'accueil ;
- identifiant Formspree dans l'attribut `action` des deux formulaires (`FORMSPREE_ID`) ; l'envoi de pièces jointes dépend de l'offre Formspree choisie ;
- adresse e-mail `contact@kerf-composites.fr` à activer ;
- références : année de début de pratique, périmètre citable IRT Jules Verne et Safran, publications, projets collaboratifs ;
- mentions légales : RCS, SIREN, TVA après immatriculation, hébergeur retenu ;
- confidentialité : nom du prestataire de formulaire, durée de conservation.

## Vérifications faites avant livraison

- Mots interdits absents (métaux, métallique, DRX, diffraction, perçage incrémental, hole drilling, slitting, superlatifs) et aucun tiret cadratin.
- Chiffres : uniquement les valeurs de `contenu-site.md` (section basse de `Site_web_assets/prompt-site-web.md`), plus le capital social, le code postal du siège et l'année de la référence Prime en bibliographie.
- Contrastes : vérifiés en mode clair et en mode sombre (Lighthouse sur une copie de l'accueil forcée en `is-dark`) ; le laiton n'est utilisé sur papier que pour des éléments non textuels (filets, soulignements, numéros de grande taille).
