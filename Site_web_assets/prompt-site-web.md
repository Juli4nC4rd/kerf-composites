# Prompt de lancement du site Kerf (à coller dans l'agent CLI)

Adapter les deux premiers paragraphes au chemin réel de la trame et au générateur utilisé. Le reste est à conserver tel quel.

---

Tu vas construire le site statique de **Kerf** (dénomination sociale Kerf Composites, domaine kerf-composites.fr), une société de mesure de contraintes résiduelles **dans les composites**, par méthode du contour. Le site sera hébergé sur GitHub Pages ou Cloudflare Pages, sans base de données, sans tracking, sans dépendance JavaScript autre que ce qui est strictement nécessaire.

Point de départ : réutilise la **mécanique** de la trame de site située dans `<CHEMIN_DE_LA_TRAME>` (structure des dossiers, générateur, gestion du bilingue, build). Ne réutilise **aucun** élément d'identité de cette trame : ni couleurs, ni polices, ni logo, ni textes, ni images. L'identité de Kerf est définie dans `charte-graphique-kerf.md` et les fichiers `logos/` fournis à côté ; applique-la strictement, y compris les jetons CSS de la section 7, la règle « un seul accent laiton par bloc », les angles droits, l'absence d'ombres et de dégradés.

Règles de contenu, non négociables :
- Le site parle exclusivement de composites. N'écris jamais les mots « métaux », « métallique », « DRX », « diffraction », « perçage incrémental », « hole drilling », « slitting ».
- Aucun chiffre inventé. Les seules valeurs autorisées sont celles listées dans `contenu-site.md` (elles proviennent de publications citées). Pour tout autre chiffre, mets un marqueur `[À COMPLÉTER]`.
- Le logiciel de traitement n'est jamais présenté comme un produit ; on vend des résultats de mesure et une méthodologie.
- Pas de superlatifs, pas de jargon marketing. Phrases courtes, voix active.
- Un seul appel à l'action par page : « Discuter d'un cas », lien vers la page Contact.
- Ne pas utiliser de tirets cadratins dans les textes ; utiliser deux-points, virgules ou parenthèses.
- Chaque page existe en français (par défaut) et en anglais, avec un sélecteur de langue discret dans l'en-tête et les balises `hreflang`.

Pages à produire :
1. **Accueil** : titre en une phrase (mesurer les contraintes résiduelles dans l'épaisseur des composites), chapô de deux phrases sur ce que la mesure permet de décider, trois blocs « ce que ça change » (valider un procédé, expliquer une distorsion, recaler un jumeau numérique), une image de carte de contraintes avec la mention `[IMAGE À FOURNIR]`, l'appel à l'action.
2. **Méthode** : la méthode du contour expliquée en quatre étapes (découpe fil, mesure des deux surfaces, calcul, carte), puis les adaptations aux composites (découpe électro-érosion avec feuillards sacrificiels, traitement pli par pli, épaisseurs de plis réelles, montages sacrificiels pour les sections variables), puis ce que contient un rapport (carte annotée, méthode de correction, incertitude, bandes d'artefact). Références bibliographiques en bas de page.
3. **Applications** : quatre cas d'usage rédigés du point de vue du client : validation d'un cycle de cuisson ou d'un procédé, réparation et remanufacturing, pièces épaisses et sections variables, données pour jumeaux numériques. Chaque cas se termine par la question à laquelle la mesure répond.
4. **Références** : parcours du fondateur (méthode du contour sur pièces aéronautiques, références IRT Jules Verne et Safran), publications et communications `[À COMPLÉTER]`, projets collaboratifs `[À COMPLÉTER]`. Pas de logos de clients sans autorisation écrite.
5. **Contact** : formulaire minimal (nom, organisation, e-mail, message, pièce jointe facultative) via un service sans serveur (Formspree ou équivalent) ou simple lien mailto, adresse postale de la société, mention du délai de réponse.
6. **Mentions légales** et **Politique de confidentialité** : dénomination, forme, capital, siège, RCS `[À COMPLÉTER après immatriculation]`, directeur de publication, hébergeur, absence de cookies de suivi, traitement des données du formulaire.

Contraintes techniques :
- HTML sémantique, CSS dans un seul fichier construit à partir des jetons de la charte, polices auto-hébergées en woff2 (Archivo 500/700/800, JetBrains Mono 400/500) avec `font-display: swap`.
- Score Lighthouse visé : 100 en accessibilité et bonnes pratiques, 95 et plus en performance. Contraste vérifié sur chaque combinaison de la charte.
- Responsive de 360 px à 1 440 px ; largeur de contenu maximale 1 120 px ; gouttière 24 px.
- Favicon depuis `logos/kerf-favicon.svg` (plus un PNG 32 et 180 px), balises Open Graph avec le logo sur fond encre.
- `sitemap.xml`, `robots.txt`, `hreflang`, titres et descriptions uniques par page.
- Aucune ressource externe au chargement (pas de CDN, pas de Google Fonts en ligne, pas d'analytics).

Livrables attendus : l'arborescence complète du site, le fichier CSS, les pages FR et EN, un `README` expliquant comment ajouter une page et publier, et une capture d'écran de chaque page à 1 280 px et à 390 px. Avant de livrer, vérifie par grep que les mots interdits n'apparaissent nulle part et que chaque chiffre du site figure dans `contenu-site.md`.

---

## contenu-site.md (valeurs autorisées, à fournir avec le prompt)

- Méthode du contour : incertitude interlaboratoire inférieure à 20 MPa sur métaux (à formuler sur le site comme « établie depuis vingt ans, validée par diffraction de neutrons », sans mentionner les métaux).
- Découpe électro-érosion à fil sur CFRP démontrée sans fissuration ni délaminage : Ahmad, Zhang, Guo, Fitzpatrick, Ayre, Composite Structures 383 (2026) 120147.
- Épaisseurs de plis mesurées plutôt que nominales : écart de 24 à 36 % sur les pics de contrainte (même source).
- Écart simulation thermo-élastique / mesure contour sur stratifié croisé : pic de −72 MPa simulé contre −100 à −150 MPa mesuré : Praveen K.R. et al., Open University / CETIM, ICRS11 2022 et Composites Part B 299 (2025) 112422.
- Résolution spatiale sur stratifié : de l'ordre de 0,35 à 0,5 mm (Praveen K.R., thèse Open University 2024).
- Disponibilité et prix : ne pas afficher sur le site.
