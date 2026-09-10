# Site Kerf (kerf-composites.fr)

Site statique de **Kerf Composites** : mesure des contraintes résiduelles dans les composites par la méthode du contour.
HTML et CSS purs, aucun JavaScript, aucune ressource externe au chargement, aucun cookie.
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
assets/fonts/              Archivo (500 à 800) et JetBrains Mono (400 à 500), woff2 variables, licence OFL
assets/img/                Logos SVG, favicon SVG + PNG 32, apple-touch-icon 180, og.png 1200×630
sitemap.xml, robots.txt
docs/screenshots/          Capture de chaque page à 1280 px et 390 px
docs/lighthouse/           Rapports Lighthouse
Site_web_assets/           Kit de départ (charte, prompt, logos)
```

Le logo est inséré en SVG inline dans l'en-tête et le pied de page : le mot KERF y est du texte composé en Archivo, la police chargée par la page.
Pour tout autre usage (impression, réseaux sociaux), convertir le texte en tracés dans les fichiers de `Site_web_assets/kerf-charte/logos/`.

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
- Contrastes : encre sur papier et papier sur encre pour tout le texte ; le laiton n'est utilisé sur papier que pour des éléments non textuels (filets, soulignements, numéros de grande taille).
