/* Kerf : film de la methode du contour sur un stratifie croise carbone/epoxy.
   Canvas 2D, ES5, sans dependance ni ressource externe.

   Toutes les valeurs numeriques viennent du cahier des charges physique tire de
   Ahmad et al., Composite Structures 383 (2026) 120147 [1], et de la these
   Karebasannanavar Ramachandrappa, The Open University, 2024 [3].
   Les legendes de scene et les etiquettes du canvas sont lues dans le DOM :
   la page anglaise porte les memes classes, avec ses propres textes.

   Balisage attendu :
     figure.movie > .movie-poster (repli sans JavaScript)
                  > .movie-stage > canvas[data-contourmovie]
                  > .movie-caption > .movie-num + .movie-text
                  > .movie-controls > .movie-play, .movie-replay, .movie-bar > 7 .movie-seg
                  > details > ol.movie-captions > 7 li
                  > ul.movie-terms > li[data-k]
   Test : window.KerfContourMovie.seek(s) / pause() / play() / duration, et ?t=12.5 */
(function () {
  "use strict";

  /* ====================================================================
     1. Donnees physiques (spec)
     ==================================================================== */

  var T = 5.6;                               /* epaisseur totale, mm */
  /* cinq couches d'epaisseurs mesurees inegales : 1,2 / 1,0 / 1,2 / 1,0 / 1,2 mm */
  var LAYERS = [
    { z0: 0.0, z1: 1.2, a: 0 },
    { z0: 1.2, z1: 2.2, a: 90 },
    { z0: 2.2, z1: 3.4, a: 0 },
    { z0: 3.4, z1: 4.4, a: 90 },
    { z0: 4.4, z1: 5.6, a: 0 }
  ];

  /* w(z) : deplacement hors plan de la face de coupe, en micrometres, couche par
     couche. Marches franches aux quatre interfaces, plateaux hauts sur les couches
     90 degres (compression, la matiere ressort), rampe jusqu'a -4,45 um aux deux
     faces libres. Crete a crete : 7,3 um. */
  var W_TAB = [
    [[0.00, -4.45], [0.10, -4.45], [0.20, -3.95], [0.30, -3.45], [0.40, -2.95],
     [0.50, -2.50], [0.60, -2.05], [0.70, -1.55], [0.80, -1.10], [0.90, -0.60],
     [1.19, -0.05], [1.20, -0.05]],
    [[1.20, 2.80], [1.40, 2.72], [1.60, 2.62], [1.80, 2.52], [2.00, 2.42],
     [2.19, 2.25], [2.20, 2.25]],
    [[2.20, -0.35], [2.40, -0.45], [2.60, -0.60], [2.80, -0.78], [2.90, -0.90],
     [3.10, -1.05], [3.39, -1.15], [3.40, -1.15]],
    [[3.40, 2.45], [3.60, 2.48], [3.80, 2.52], [4.00, 2.55], [4.20, 2.60],
     [4.39, 2.62], [4.40, 2.62]],
    [[4.40, -0.75], [4.60, -1.10], [4.80, -1.85], [5.00, -2.60], [5.20, -3.35],
     [5.40, -4.05], [5.50, -4.45], [5.60, -4.45]]
  ];

  /* sigma_yy(z) : MPa, coupe numero 2, lissage lineaire incremental, epaisseurs
     mesurees. Minimum -130 MPa aux deux interfaces avec les couches 0 degre
     externes, maximum +42 MPa au coeur de la couche 0 degre centrale, fort
     gradient dans les couches 90 degres (jamais un creneau plat). */
  var S_TAB = [
    [[0.00, 30], [0.20, 32], [0.40, 30], [0.60, 28], [0.80, 28], [1.00, 30],
     [1.15, 28], [1.20, 28]],
    [[1.20, -130], [1.30, -128], [1.40, -110], [1.60, -85], [1.80, -55],
     [2.00, -25], [2.10, -10], [2.20, 5]],
    [[2.20, -3], [2.40, -8], [2.60, 30], [2.80, 28], [3.00, 42], [3.20, 30],
     [3.30, 10], [3.40, -12]],
    [[3.40, -12], [3.60, -18], [3.80, -28], [3.90, -32], [4.10, -50],
     [4.30, -80], [4.40, -130]],
    [[4.40, 30], [4.60, 35], [4.80, 32], [5.00, 30], [5.20, 30], [5.40, 30],
     [5.60, 30]]
  ];

  function interp(tab, z) {
    var n = tab.length;
    if (z <= tab[0][0]) return tab[0][1];
    if (z >= tab[n - 1][0]) return tab[n - 1][1];
    for (var i = 1; i < n; i++) {
      if (z <= tab[i][0]) {
        var a = tab[i - 1], b = tab[i], d = b[0] - a[0];
        return d <= 0 ? b[1] : a[1] + (b[1] - a[1]) * (z - a[0]) / d;
      }
    }
    return tab[n - 1][1];
  }
  function wAt(li, z) { return interp(W_TAB[li], z); }
  function sigAt(li, z) { return interp(S_TAB[li], z); }

  /* Ecart de coupe antisymetrique : basculement dans l'epaisseur (cisaillement) et
     arc le long de la largeur (trajectoire du fil). Les deux faces le portent en
     sens oppose : la moyenne l'annule. Les ecarts symetriques, eux, subsistent. */
  function artef(z, u) {
    return 0.90 * (2 * z / T - 1) + 0.30 * Math.sin(Math.PI * u);
  }

  /* ====================================================================
     2. Echelle de couleur de la carte (scientifique, hors charte)
     ==================================================================== */

  var MAP_MIN = -130, MAP_MAX = 50, MAP_BANDS = 12;   /* pas de 15 MPa, neutre sur 0 */
  var RAMP_NEG = [[0, [235, 231, 224]], [0.25, [176, 196, 216]],
    [0.50, [104, 150, 196]], [0.75, [44, 98, 164]], [1, [18, 52, 112]]];
  var RAMP_POS = [[0, [235, 231, 224]], [0.34, [238, 196, 164]],
    [0.67, [214, 120, 78]], [1, [186, 58, 40]]];

  function ramp(stops, t) {
    t = Math.max(0, Math.min(1, t));
    for (var i = 1; i < stops.length; i++) {
      if (t <= stops[i][0]) {
        var a = stops[i - 1], b = stops[i];
        var p = (t - a[0]) / (b[0] - a[0] || 1);
        return [a[1][0] + (b[1][0] - a[1][0]) * p,
          a[1][1] + (b[1][1] - a[1][1]) * p,
          a[1][2] + (b[1][2] - a[1][2]) * p];
      }
    }
    return stops[stops.length - 1][1];
  }
  function bandCentre(v) {
    var step = (MAP_MAX - MAP_MIN) / MAP_BANDS;
    var k = Math.floor((v - MAP_MIN) / step);
    if (k < 0) k = 0;
    if (k > MAP_BANDS - 1) k = MAP_BANDS - 1;
    return MAP_MIN + step * (k + 0.5);
  }
  function sigRGB(v) {
    var c = bandCentre(v);
    return c < 0 ? ramp(RAMP_NEG, c / MAP_MIN) : ramp(RAMP_POS, c / MAP_MAX);
  }
  function rgbCSS(c) {
    return "rgb(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + ")";
  }

  /* ====================================================================
     3. Geometrie du modele
     ==================================================================== */

  var MM = 0.15;                 /* unites modele par millimetre */
  var HT = T * MM / 2;           /* demi-epaisseur : 0,42 */
  var HZ = 16 * MM;              /* demi-largeur montree : 32 mm de trajet de coupe */
  var LEN = 10 * MM;             /* profondeur d'une moitie : 10 mm */
  var KW = MM * 100 / 1000;      /* un micrometre exagere 100 fois, en unites modele */
  var GAP = 0.42;                /* ecartement des deux moities apres relachement */
  var KERF = 0.25 * MM;          /* largeur du sillon : 0,25 mm */
  var SPLIT = 0.98;              /* decalage vertical des deux faces a la mesure */

  function yOf(z) { return MM * (z - T / 2); }

  /* Feuillards sacrificiels : deux toles minces collees au-dessus et au-dessous,
     debordant en entree et en sortie du fil. */
  var SHIM_X = 1.30, SHIM_H = 0.05, SHIM_OVER = 0.30, SHIM_SLIDE = 0.62;
  /* Bridage symetrique : deux mors longs paralleles au trajet, de part et d'autre. */
  var CLAMP_X = 1.02, CLAMP_HX = 0.26, CLAMP_H = 0.11, CLAMP_SLIDE = 0.62;

  var FACES = [
    { idx: [1, 3, 7, 5], n: [1, 0, 0] },
    { idx: [0, 4, 6, 2], n: [-1, 0, 0] },
    { idx: [2, 6, 7, 3], n: [0, 1, 0] },
    { idx: [0, 1, 5, 4], n: [0, -1, 0] },
    { idx: [4, 5, 7, 6], n: [0, 0, 1] },
    { idx: [0, 2, 3, 1], n: [0, 0, -1] }
  ];
  function boxVerts(c, h) {
    var v = [];
    for (var k = 0; k < 8; k++) {
      v.push([c[0] + (k & 1 ? h[0] : -h[0]),
        c[1] + (k & 2 ? h[1] : -h[1]),
        c[2] + (k & 4 ? h[2] : -h[2])]);
    }
    return v;
  }

  var LIGHT = [-0.34, 0.52, 0.78];
  (function () {
    var n = Math.sqrt(LIGHT[0] * LIGHT[0] + LIGHT[1] * LIGHT[1] + LIGHT[2] * LIGHT[2]);
    LIGHT = [LIGHT[0] / n, LIGHT[1] / n, LIGHT[2] / n];
  })();

  /* ====================================================================
     4. Outils
     ==================================================================== */

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(p) { p = clamp01(p); return p * p * (3 - 2 * p); }
  function lerp(a, b, p) { return a + (b - a) * p; }
  function seg(p, a, b) { return ease(clamp01((p - a) / (b - a))); }
  function mix(c1, c2, p) {
    return [c1[0] + (c2[0] - c1[0]) * p, c1[1] + (c2[1] - c1[1]) * p,
      c1[2] + (c2[2] - c1[2]) * p];
  }
  function lum(c) { return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }
  function parseRGB(s) {
    var m = /rgba?\(([^)]+)\)/.exec(s || "");
    if (m) {
      var p = m[1].split(/[\s,\/]+/);
      return [parseFloat(p[0]) || 0, parseFloat(p[1]) || 0, parseFloat(p[2]) || 0];
    }
    m = /^#([0-9a-f]{3,8})$/i.exec((s || "").trim());
    if (m) {
      var h = m[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16),
        parseInt(h.substr(4, 2), 16)];
    }
    return null;
  }
  /* generateur pseudo aleatoire deterministe : les captures a ?t= sont stables */
  function rnd(seed) {
    var s = (seed * 1103515245 + 12345) & 0x7fffffff;
    return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  }

  /* ====================================================================
     5. Scenario : sept scenes, 43,5 s, puis 1,5 s d'arret sur la carte
     ==================================================================== */

  /* rect = cadre de dessin du modele, en fractions du canvas [x0, y0, x1, y1].
     Les bandes laissees libres accueillent les cartouches, les cotes et l'echelle,
     de sorte qu'aucune annotation ne sorte du canvas. */
  var SCENES = [
    { d: 6.0, yaw: [0.30, 0.56], pitch: [0.36, 0.30],
      r0: [0.04, 0.22, 0.78, 0.94], r1: [0.03, 0.20, 0.79, 0.96] },
    { d: 5.5, yaw: [0.56, 0.76], pitch: [0.30, 0.42],
      r0: [0.04, 0.06, 0.96, 0.94], r1: [0.04, 0.06, 0.96, 0.94] },
    { d: 7.0, yaw: [0.76, 0.62], pitch: [0.42, 0.46],
      r0: [0.04, 0.18, 0.96, 0.95], r1: [0.04, 0.18, 0.96, 0.95] },
    { d: 6.5, yaw: [0.62, 0.92], pitch: [0.46, 0.15],
      r0: [0.04, 0.10, 0.96, 0.94], r1: [0.04, 0.08, 0.96, 0.80] },
    { d: 7.0, yaw: [0.92, 1.00], pitch: [0.15, 0.13],
      r0: [0.04, 0.08, 0.96, 0.80], r1: [0.04, 0.08, 0.96, 0.80] },
    { d: 6.0, yaw: [1.00, 1.18], pitch: [0.13, 0.11],
      r0: [0.04, 0.16, 0.96, 0.86], r1: [0.03, 0.16, 0.97, 0.80] },
    { d: 5.5, yaw: [1.18, 1.525], pitch: [0.11, 0.05],
      r0: [0.02, 0.22, 0.98, 0.80], r1: [0.02, 0.22, 0.98, 0.80] }
  ];
  var TOTAL = 0, T0 = [];
  (function () {
    for (var i = 0; i < SCENES.length; i++) { T0.push(TOTAL); TOTAL += SCENES[i].d; }
  })();
  var HOLD = 1.5;

  function sceneState(t) {
    if (t >= TOTAL) t = TOTAL - 1e-4;
    if (t < 0) t = 0;
    var idx = 0;
    while (idx < SCENES.length - 1 && t >= T0[idx + 1]) idx++;
    var sc = SCENES[idx];
    var p = clamp01((t - T0[idx]) / sc.d);
    var e = ease(p);

    var s = {
      t: t, idx: idx, p: p,
      yaw: lerp(sc.yaw[0], sc.yaw[1], e),
      pitch: lerp(sc.pitch[0], sc.pitch[1], e),
      rect: [lerp(sc.r0[0], sc.r1[0], e), lerp(sc.r0[1], sc.r1[1], e),
        lerp(sc.r0[2], sc.r1[2], e), lerp(sc.r0[3], sc.r1[3], e)],
      gap: 0, amp: 0, art: 0, burst: 0, detail: 0,
      clamp: 0, shim: 0, shimOff: 1, clampOff: 1,
      wire: null, kerf: -9, spark: 0,
      flipB: 0, split: 0, fadeB: 1,
      scan: -9, dots: 0, mesh: 0, meshKind: "fe",
      arrowA: 0, arrowS: 1,
      mapAlpha: 0, bar: 0, hatch: 0, groove: 0,
      panel: 0, panelMode: "w",
      cutOpen: false, tags: 0, cot: 0, plane: 0
    };

    switch (idx) {
      case 0:                                   /* la piece */
        s.cot = seg(p, 0.10, 0.40);
        s.plane = seg(p, 0.48, 0.80);
        s.tags = seg(p, 0.28, 0.55);
        s.detail = seg(p, 0.34, 0.60);
        break;
      case 1:                                   /* preparation */
        s.plane = 1 - seg(p, 0.00, 0.10);
        s.cot = 1 - seg(p, 0.00, 0.12);
        s.clamp = seg(p, 0.02, 0.10);
        s.clampOff = 1 - seg(p, 0.05, 0.50);
        s.shim = seg(p, 0.18, 0.26);
        s.shimOff = 1 - seg(p, 0.22, 0.76);
        s.tags = seg(p, 0.30, 0.46);
        break;
      case 2:                                   /* decoupe */
        s.clamp = 1; s.shim = 1; s.shimOff = 0; s.clampOff = 0;
        var wp = clamp01((p - 0.08) / 0.74);     /* avance lente et reguliere */
        s.wire = -HZ - SHIM_OVER - 0.10 + wp * (2 * (HZ + SHIM_OVER) + 0.20);
        s.kerf = s.wire;
        s.spark = p > 0.06 && p < 0.86 ? 1 : 0;
        s.groove = 1;
        if (p > 0.9) { s.wire = null; s.kerf = HZ + SHIM_OVER + 0.12; }
        break;
      case 3:                                   /* relachement */
        s.kerf = HZ + SHIM_OVER + 0.12;
        s.groove = 1 - seg(p, 0.04, 0.18);
        s.clampOff = seg(p, 0.00, 0.20);
        s.shimOff = seg(p, 0.04, 0.26);
        s.gap = KERF + (GAP - KERF) * seg(p, 0.10, 0.40);
        s.split = seg(p, 0.16, 0.46);
        /* la moitie B est retournee : les deux faces de coupe regardent la camera,
           la symetrie miroir des deux profils devient directement lisible */
        s.flipB = seg(p, 0.34, 0.62);
        s.clamp = 1 - seg(p, 0.34, 0.46);
        s.shim = 1 - seg(p, 0.30, 0.42);
        s.amp = seg(p, 0.34, 0.76);
        s.burst = seg(p, 0.28, 0.52);
        s.cutOpen = true;
        s.tags = seg(p, 0.62, 0.86);
        s.panel = seg(p, 0.50, 0.74);
        s.panelMode = "w";
        break;
      case 4:                                   /* mesure des deux faces */
        s.gap = GAP; s.amp = 1; s.cutOpen = true;
        s.split = 1; s.flipB = 1; s.burst = 1;
        s.art = seg(p, 0.08, 0.30);
        s.scan = -1.08 + 2.2 * seg(p, 0.20, 0.66);
        s.dots = seg(p, 0.22, 0.40);
        s.panel = 1;
        s.panelMode = "ab";
        s.panelMean = seg(p, 0.70, 0.90);
        break;
      case 5:                                   /* calcul */
        s.gap = GAP; s.cutOpen = true;
        s.art = 1 - seg(p, 0.00, 0.20);
        s.burst = 1 - seg(p, 0.10, 0.30);
        s.split = 1 - seg(p, 0.06, 0.36);
        s.flipB = 1;
        s.fadeB = 1 - seg(p, 0.00, 0.16);
        s.dots = 1 - seg(p, 0.00, 0.18);
        s.mesh = seg(p, 0.10, 0.34);
        s.arrowA = seg(p, 0.22, 0.36) * (1 - seg(p, 0.80, 0.96));
        s.arrowS = 1 - 2 * seg(p, 0.40, 0.60);
        s.amp = 1 - seg(p, 0.52, 0.82);
        s.mapAlpha = seg(p, 0.86, 1.0) * 0.5;
        s.bar = seg(p, 0.88, 1.0);
        s.panel = (1 - seg(p, 0.0, 0.16)) * 1;
        s.panelMode = "ab"; s.panelMean = 1;
        break;
      case 6:                                   /* carte */
        s.gap = GAP; s.cutOpen = true; s.fadeB = 0; s.flipB = 0; s.split = 0;
        s.amp = 0;
        s.mesh = 0.5 * (1 - seg(p, 0.0, 0.22));
        s.mapAlpha = 0.5 + 0.5 * seg(p, 0.0, 0.30);
        s.bar = 1;
        s.hatch = seg(p, 0.18, 0.44);
        s.tags = seg(p, 0.30, 0.56);
        break;
    }
    return s;
  }

  /* ====================================================================
     6. Le film
     ==================================================================== */

  var REDUCED = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
  var warned = false;

  function Movie(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.root = canvas.closest ? (canvas.closest(".movie") || canvas.parentElement)
      : canvas.parentElement;
    this.t = 0;
    this.playing = !REDUCED;
    this.inView = true;
    this.cols = 18;

    /* textes : legendes de scene et etiquettes du canvas, lus dans le DOM */
    this.caps = [];
    var lis = this.root.querySelectorAll(".movie-captions > li");
    for (var i = 0; i < lis.length; i++) this.caps.push(lis[i].textContent.trim());
    this.L = {};
    var ts = this.root.querySelectorAll(".movie-terms > li[data-k]");
    for (var j = 0; j < ts.length; j++) {
      this.L[ts[j].getAttribute("data-k")] = ts[j].textContent.trim();
    }

    this.capNum = this.root.querySelector(".movie-num");
    this.capText = this.root.querySelector(".movie-text");
    this.playEl = this.root.querySelector(".movie-play");
    this.replayEl = this.root.querySelector(".movie-replay");
    this.segs = [];
    var sg = this.root.querySelectorAll(".movie-seg");
    for (var k = 0; k < sg.length; k++) this.segs.push(sg[k]);

    /* sonde de style : lit les jetons de surface sans dependre de la
       resolution des variables imbriquees par getComputedStyle */
    this.probe = document.createElement("span");
    this.probe.setAttribute("aria-hidden", "true");
    this.probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;" +
      "visibility:hidden;pointer-events:none";
    this.root.appendChild(this.probe);

    this.readTokens();
    this.buildMapTexture();
    this.resize();

    var qt = null;
    try {
      qt = new URLSearchParams(window.location.search).get("t");
    } catch (e) { qt = null; }
    if (qt !== null && qt !== "") {
      var v = parseFloat(qt);
      if (!isNaN(v)) { this.t = Math.max(0, Math.min(TOTAL + HOLD, v)); this.playing = false; }
    } else if (REDUCED) {
      this.t = TOTAL - 0.05;                    /* derniere image : la carte */
    }
    this.bind();
  }

  Movie.prototype.tok = function (name) {
    this.probe.style.color = "";
    this.probe.style.color = "var(" + name + ")";
    var c = parseRGB(window.getComputedStyle(this.probe).color);
    return c || [128, 128, 128];
  };

  Movie.prototype.readTokens = function () {
    var bg = this.tok("--bg"), fg = this.tok("--fg");
    var fgs = this.tok("--fg-soft"), ln = this.tok("--line");
    this.bg = bg; this.fg = fg; this.fgs = fgs; this.line = ln;
    this.laiton = this.tok("--k-laiton");
    this.cbg = rgbCSS(bg); this.cfg = rgbCSS(fg);
    this.cfgs = rgbCSS(fgs); this.cline = rgbCSS(ln);
    this.claiton = rgbCSS(this.laiton);
    this.dark = lum(bg) < 0.45;
    if (this.dark) {
      this.car0 = mix(bg, fg, 0.12); this.car1 = mix(bg, fg, 0.64);
      this.shm0 = mix(bg, fg, 0.44); this.shm1 = mix(bg, fg, 0.98);
      this.clp0 = mix(bg, fg, 0.06); this.clp1 = mix(bg, fg, 0.40);
    } else {
      this.car0 = mix(fg, bg, 0.05); this.car1 = mix(fg, bg, 0.62);
      this.shm0 = mix(fg, bg, 0.54); this.shm1 = mix(fg, bg, 0.94);
      this.clp0 = mix(fg, bg, 0.18); this.clp1 = mix(fg, bg, 0.52);
    }
  };

  Movie.prototype.carbon = function (s) { return rgbCSS(mix(this.car0, this.car1, clamp01(s))); };
  Movie.prototype.shimC = function (s) { return rgbCSS(mix(this.shm0, this.shm1, clamp01(s))); };
  Movie.prototype.clampC = function (s) { return rgbCSS(mix(this.clp0, this.clp1, clamp01(s))); };

  /* Texture de la carte : sigma_yy ne depend que de l'epaisseur, donc une
     colonne suffit ; les bandes sont paralleles aux plis. */
  Movie.prototype.buildMapTexture = function () {
    var h = 560, w = 6;
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    var g = c.getContext("2d");
    for (var py = 0; py < h; py++) {
      var z = T * (1 - (py + 0.5) / h);
      var li = 0;
      while (li < 4 && z >= LAYERS[li].z1) li++;
      g.fillStyle = rgbCSS(sigRGB(sigAt(li, z)));
      g.fillRect(0, py, w, 1);
    }
    this.mapTex = c;
  };

  Movie.prototype.resize = function () {
    var r = this.canvas.getBoundingClientRect();
    var cw = r.width || this.canvas.clientWidth || 640;
    var ch = r.height || Math.round(cw * 9 / 16);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(2, Math.round(cw * dpr));
    this.canvas.height = Math.max(2, Math.round(ch * dpr));
    this.cw = cw;
    this.k = dpr;
    this.fs = Math.max(11, Math.min(13.5, cw / 56)) * dpr;
    this.wide = cw >= 500;          /* panneau w(z) lateral pleine taille */
    this.mid = cw >= 300;           /* tout le contenu explicatif reste affiche */
    this.cols = cw < 520 ? 12 : cw < 900 ? 16 : 20;
  };

  /* --- projection orthographique ------------------------------------- */
  Movie.prototype.projU = function (p) {
    var cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    var cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    var x1 = p[0] * cy + p[2] * sy;
    var z1 = -p[0] * sy + p[2] * cy;
    return [x1, p[1] * cp - z1 * sp, p[1] * sp + z1 * cp];
  };
  Movie.prototype.project = function (p) {
    var q = this.projU(p);
    return [this.ox + q[0] * this.scale, this.oy - q[1] * this.scale, q[2]];
  };
  Movie.prototype.rotN = function (n) {
    var cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    var cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    var x1 = n[0] * cy + n[2] * sy;
    var z1 = -n[0] * sy + n[2] * cy;
    return [x1, n[1] * cp - z1 * sp, n[1] * sp + z1 * cp];
  };

  /* --- reperes des deux moities --------------------------------------- */
  function mkXform(rot, pos) {
    var c = Math.cos(rot), s = Math.sin(rot);
    return {
      rot: rot,
      p: function (q) {
        return [q[0] * c + q[2] * s + pos[0], q[1] + pos[1], -q[0] * s + q[2] * c + pos[2]];
      },
      n: function (q) { return [q[0] * c + q[2] * s, q[1], -q[0] * s + q[2] * c]; }
    };
  }
  Movie.prototype.halves = function (st) {
    var g = st.gap / 2;
    var a = mkXform(0, [g, st.split * SPLIT, 0]);
    var b = mkXform(Math.PI * (1 - st.flipB),
      [lerp(-g, g, st.flipB), -st.split * SPLIT, 0]);
    return [{ id: 0, sign: 1, x: a, alpha: 1 },
      { id: 1, sign: -1, x: b, alpha: st.fadeB }];
  };

  /* --- cadrage automatique --------------------------------------------
     Tous les coins de tous les solides reellement dessines entrent dans la
     boite englobante, a leur position reelle. Le cadre de dessin (st.rect)
     laisse libres les bandes ou se posent les cartouches et l'echelle. */
  Movie.prototype.fit = function (st, hs) {
    var pts = [], i, h, sx, sy, sz, k;
    var pmin = [1e9, 1e9, 1e9], pmax = [-1e9, -1e9, -1e9];
    for (i = 0; i < hs.length; i++) {
      h = hs[i];
      if (h.alpha < 0.02) continue;
      for (sx = 0; sx <= 1; sx++) {
        for (sy = -1; sy <= 1; sy += 2) {
          for (sz = -1; sz <= 1; sz += 2) {
            var q = h.x.p([sx * LEN, sy * HT, sz * HZ]);
            pts.push(q);
            for (k = 0; k < 3; k++) {
              if (q[k] < pmin[k]) pmin[k] = q[k];
              if (q[k] > pmax[k]) pmax[k] = q[k];
            }
          }
        }
      }
    }
    if (!pts.length) { pts.push([0, 0, 0]); pmin = [0, 0, 0]; pmax = [0, 0, 0]; }
    /* Pendant le fondu d'un organe de montage, son coin est ramene vers le coin
       de piece le plus proche (et non vers l'origine) : a pleine opacite le coin
       reel est pris tel quel, donc le cadre ne sous-estime jamais la scene. */
    function near(q) {
      return [Math.max(pmin[0], Math.min(pmax[0], q[0])),
        Math.max(pmin[1], Math.min(pmax[1], q[1])),
        Math.max(pmin[2], Math.min(pmax[2], q[2]))];
    }
    function push(q, w) {
      if (w > 0.995) { pts.push(q); return; }
      var n = near(q);
      pts.push([n[0] + (q[0] - n[0]) * w, n[1] + (q[1] - n[1]) * w,
        n[2] + (q[2] - n[2]) * w]);
    }
    function corners(c, hh, w) {
      for (var a = -1; a <= 1; a += 2) {
        for (var b = -1; b <= 1; b += 2) {
          for (var d = -1; d <= 1; d += 2) {
            push([c[0] + a * hh[0], c[1] + b * hh[1], c[2] + d * hh[2]], w);
          }
        }
      }
    }
    if (st.shim > 0.01) {
      var sh = HT + SHIM_H + st.shimOff * SHIM_SLIDE;
      for (sy = -1; sy <= 1; sy += 2) {
        corners([0, sy * sh, 0], [SHIM_X, SHIM_H, HZ + SHIM_OVER], st.shim);
      }
    }
    if (st.clamp > 0.01) {
      var ch = HT + SHIM_H * 2 + CLAMP_H / 2 + st.clampOff * CLAMP_SLIDE;
      for (sx = -1; sx <= 1; sx += 2) {
        for (sy = -1; sy <= 1; sy += 2) {
          corners([sx * CLAMP_X, sy * ch, 0],
            [CLAMP_HX, CLAMP_H / 2, HZ * 0.94], st.clamp);
        }
      }
    }
    if (st.wire !== null) {
      corners([0, 0, st.wire], [0, HT + SHIM_H * 2 + 0.34, 0], 1);
    }
    var mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
    for (i = 0; i < pts.length; i++) {
      var u = this.projU(pts[i]);
      if (u[0] < mnx) mnx = u[0];
      if (u[0] > mxx) mxx = u[0];
      if (u[1] < mny) mny = u[1];
      if (u[1] > mxy) mxy = u[1];
    }
    var bw = Math.max(0.05, mxx - mnx), bh = Math.max(0.05, mxy - mny);
    var W = this.canvas.width, H = this.canvas.height;
    var R = st.rect;
    var rx0 = R[0] * W, ry0 = R[1] * H, rx1 = R[2] * W, ry1 = R[3] * H;
    if (st.rectX0 !== undefined) rx0 = st.rectX0 * W;
    if (st.rectX1 !== undefined) rx1 = st.rectX1 * W;
    if (st.rectY1 !== undefined) ry1 = st.rectY1 * H;
    this.scale = Math.min((rx1 - rx0) / bw, (ry1 - ry0) / bh);
    this.ox = (rx0 + rx1) / 2 - (mnx + mxx) / 2 * this.scale;
    this.oy = (ry0 + ry1) / 2 + (mny + mxy) / 2 * this.scale;
    this.modelTop = (ry0 + ry1) / 2 - (mxy - mny) / 2 * this.scale;
    this.modelBottom = (ry0 + ry1) / 2 + (mxy - mny) / 2 * this.scale;
  };

  /* --- primitives de dessin ------------------------------------------- */
  Movie.prototype.poly = function (p) {
    var ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    for (var i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
    ctx.closePath();
  };
  function dom(v) {
    var a = Math.abs(v[0]), b = Math.abs(v[1]), c = Math.abs(v[2]);
    return a >= b && a >= c ? 0 : b >= c ? 1 : 2;
  }
  function mid2(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }

  /* Micro rayures : lignes dans la direction des fibres du pli, points quand les
     fibres sont normales a la face vue. 0 degre = fibres selon X (axe local z),
     90 degres = fibres selon Y (axe local x). */
  Movie.prototype.fibre = function (p, lc, axis, shade) {
    var ctx = this.ctx;
    var d1 = [lc[1][0] - lc[0][0], lc[1][1] - lc[0][1], lc[1][2] - lc[0][2]];
    var d2 = [lc[2][0] - lc[0][0], lc[2][1] - lc[0][1], lc[2][2] - lc[0][2]];
    var a1 = dom(d1), a2 = dom(d2);
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = this.carbon(Math.min(1, shade + 0.5));
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = Math.max(0.7, this.k * 0.7);
    var lenA = Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1]);
    var lenB = Math.hypot(p[3][0] - p[0][0], p[3][1] - p[0][1]);
    var i, t, n;
    if (a1 === axis) {
      n = Math.max(1, Math.min(16, Math.round(lenB / (8 * this.k))));
      ctx.beginPath();
      for (i = 1; i < n; i++) {
        t = i / n;
        var s1 = mid2(p[0], p[3], t), e1 = mid2(p[1], p[2], t);
        ctx.moveTo(s1[0], s1[1]); ctx.lineTo(e1[0], e1[1]);
      }
      ctx.stroke();
    } else if (a2 === axis) {
      n = Math.max(1, Math.min(16, Math.round(lenA / (8 * this.k))));
      ctx.beginPath();
      for (i = 1; i < n; i++) {
        t = i / n;
        var s2 = mid2(p[0], p[1], t), e2 = mid2(p[3], p[2], t);
        ctx.moveTo(s2[0], s2[1]); ctx.lineTo(e2[0], e2[1]);
      }
      ctx.stroke();
    } else {
      var na = Math.max(1, Math.min(20, Math.round(lenA / (9 * this.k))));
      var nb = Math.max(1, Math.min(20, Math.round(lenB / (9 * this.k))));
      var r = Math.max(0.6, this.k * 0.62);
      ctx.globalAlpha = 0.42;
      for (i = 0; i < na; i++) {
        for (var j = 0; j < nb; j++) {
          var u = (i + 0.5) / na, v = (j + 0.5) / nb;
          var q0 = mid2(p[0], p[1], u), q1 = mid2(p[3], p[2], u);
          var q = mid2(q0, q1, v);
          ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 6.2832); ctx.fill();
        }
      }
    }
    ctx.restore();
  };

  Movie.prototype.drawBox = function (lv, xf, opts) {
    var ctx = this.ctx, i;
    var world = [], proj = [];
    for (i = 0; i < 8; i++) { world.push(xf.p(lv[i])); proj.push(this.project(world[i])); }
    for (var f = 0; f < 6; f++) {
      var face = FACES[f];
      if (opts.skip && opts.skip(face.n)) continue;
      var n = this.rotN(xf.n(face.n));
      if (n[2] <= 0) continue;
      var p = [proj[face.idx[0]], proj[face.idx[1]], proj[face.idx[2]], proj[face.idx[3]]];
      var d = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];
      var shade = 0.22 + 0.78 * Math.pow(Math.max(0, d), 1.15);
      var sh2 = opts.bias ? clamp01(shade * opts.bias) : shade;
      var fill = opts.tint.call(this, sh2);
      this.poly(p);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = fill;
      ctx.lineWidth = this.k;
      ctx.stroke();
      if (opts.fibre !== undefined && opts.fibre !== null) {
        this.fibre(p, [lv[face.idx[0]], lv[face.idx[1]], lv[face.idx[3]]], opts.fibre, sh2);
      }
      if (opts.edge) {
        this.poly(p);
        ctx.save();
        ctx.globalAlpha = 0.72;
        ctx.strokeStyle = opts.tint.call(this, clamp01(sh2 * 0.55));
        ctx.lineWidth = Math.max(0.9, this.k * 0.9);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  /* --- face de coupe : grille de facettes par pli ---------------------- */
  Movie.prototype.cutRows = function () {
    if (this.rows) return this.rows;
    var rows = [];
    for (var li = 0; li < 5; li++) {
      var L = LAYERS[li];
      var nr = L.a === 0 ? 6 : 5;
      for (var j = 0; j <= nr; j++) {
        var z = L.z0 + (L.z1 - L.z0) * j / nr;
        rows.push({ li: li, z: z, y: yOf(z), first: j === 0, last: j === nr });
      }
    }
    this.rows = rows;
    return rows;
  };

  Movie.prototype.cutFacePts = function (half, st) {
    var rows = this.cutRows(), NC = this.cols;
    var P = [], W = [];
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r], pr = [], wr = [];
      for (var k = 0; k <= NC; k++) {
        var u = k / NC;
        var zc = -HZ + 2 * HZ * u;
        var wv = wAt(row.li, row.z) + half.sign * st.art * artef(row.z, u);
        var lp = [-(wv * KW * st.amp), row.y, zc];
        var wp = half.x.p(lp);
        wr.push(wp); pr.push(this.project(wp));
      }
      P.push(pr); W.push(wr);
    }
    return { P: P, W: W, rows: rows, NC: NC };
  };

  Movie.prototype.cutVisible = function (half) {
    return this.rotN(half.x.n([-1, 0, 0]))[2] > 0.03;
  };

  /* Jupe de raccord : relie le bord de la face deformee a l'arete de la piece.
     Sans elle, un jour apparait partout ou la matiere rentre. */
  Movie.prototype.drawSkirt = function (half, st, G) {
    if (st.amp < 0.02) return;
    var ctx = this.ctx, NC = G.NC, rows = G.rows, W = G.W;
    var self = this, r, k;
    function flat(rr, kk) {
      return half.x.p([0, rows[rr].y, -HZ + 2 * HZ * kk / NC]);
    }
    var strips = [], last = rows.length - 1;
    for (r = 0; r + 1 < rows.length; r++) {
      strips.push([W[r][0], W[r + 1][0], flat(r + 1, 0), flat(r, 0)]);
      strips.push([W[r][NC], W[r + 1][NC], flat(r + 1, NC), flat(r, NC)]);
    }
    for (k = 1; k < NC - 1; k++) {     /* les colonnes extremes sont deja couvertes
                                          par les bandes laterales : les inclure
                                          produirait un ergot au coin */
      strips.push([W[0][k], W[0][k + 1], flat(0, k + 1), flat(0, k)]);
      strips.push([W[last][k], W[last][k + 1], flat(last, k + 1), flat(last, k)]);
    }
    for (var i = 0; i < strips.length; i++) {
      var q = strips[i];
      var e1 = [q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]];
      var e2 = [q[3][0] - q[0][0], q[3][1] - q[0][1], q[3][2] - q[0][2]];
      var nx = e1[1] * e2[2] - e1[2] * e2[1];
      var ny = e1[2] * e2[0] - e1[0] * e2[2];
      var nz = e1[0] * e2[1] - e1[1] * e2[0];
      var nl = Math.hypot(nx, ny, nz);
      if (!nl) continue;
      var n = this.rotN([nx / nl, ny / nl, nz / nl]);
      if (n[2] < 0) n = [-n[0], -n[1], -n[2]];
      var d = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];
      var shade = 0.22 + 0.58 * Math.pow(Math.max(0, d), 1.15);
      var p = [this.project(q[0]), this.project(q[1]), this.project(q[2]), this.project(q[3])];
      var ar = Math.abs((p[1][0] - p[0][0]) * (p[3][1] - p[0][1]) -
        (p[3][0] - p[0][0]) * (p[1][1] - p[0][1]));
      if (ar < 0.5) continue;          /* facette vue par la tranche */
      this.poly(p);
      ctx.fillStyle = this.carbon(shade);
      ctx.fill();
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = this.k;
      ctx.stroke();
    }
  };

  Movie.prototype.drawCutFace = function (half, st, G) {
    var ctx = this.ctx, NC = G.NC, rows = G.rows;
    var P = G.P, W = G.W;
    var outN = half.x.n([-1, 0, 0]);
    this.drawSkirt(half, st, G);
    /* Face redevenue plane : un seul quadrilatere par couche, donc aucune
       couture de facette ne transparait sous la carte pendant le fondu. */
    if (st.amp < 0.02) {
      var nf = this.rotN(outN);
      var df = nf[0] * LIGHT[0] + nf[1] * LIGHT[1] + nf[2] * LIGHT[2];
      var shf = 0.26 + 0.74 * Math.pow(Math.max(0, df), 1.15);
      for (var li = 0; li < 5; li++) {
        var L = LAYERS[li];
        var q = [this.project(half.x.p([0, yOf(L.z1), -HZ])),
          this.project(half.x.p([0, yOf(L.z1), HZ])),
          this.project(half.x.p([0, yOf(L.z0), HZ])),
          this.project(half.x.p([0, yOf(L.z0), -HZ]))];
        this.poly(q);
        ctx.fillStyle = this.carbon(shf * (L.a === 0 ? 0.92 : 1) * 0.96);
        ctx.fill();
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = this.k;
        ctx.stroke();
        if (st.mapAlpha < 0.01) {
          /* 0 degre : fibres couchees dans le plan de coupe, donc des rayures ;
             90 degres : bouts de fibres normaux a la face, donc des points. */
          this.fibre(q, [[0, 0, -HZ], [0, 0, HZ], [0, 1, -HZ]],
            L.a === 0 ? 2 : 0, shf);
        }
      }
      this.cutFaceEdges(st, G);
      return;
    }
    for (var r = 0; r + 1 < rows.length; r++) {
      var riser = rows[r].last && rows[r + 1].first;
      for (var k = 0; k < NC; k++) {
        var p00 = P[r][k], p10 = P[r][k + 1], p11 = P[r + 1][k + 1], p01 = P[r + 1][k];
        var o = W[r][k], a = W[r][k + 1], b = W[r + 1][k];
        var e1 = [a[0] - o[0], a[1] - o[1], a[2] - o[2]];
        var e2 = [b[0] - o[0], b[1] - o[1], b[2] - o[2]];
        var nx = e1[1] * e2[2] - e1[2] * e2[1];
        var ny = e1[2] * e2[0] - e1[0] * e2[2];
        var nz = e1[0] * e2[1] - e1[1] * e2[0];
        var nl = Math.hypot(nx, ny, nz) || 1;
        var sg = (nx * outN[0] + ny * outN[1] + nz * outN[2]) < 0 ? -1 : 1;
        var n = this.rotN([sg * nx / nl, sg * ny / nl, sg * nz / nl]);
        var d = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];
        var shade = 0.26 + 0.74 * Math.pow(Math.max(0, d), 1.15);
        if (riser) shade = 0.26 + 0.34 * shade;
        var fill = this.carbon(shade * 0.96);
        this.poly([p00, p10, p11, p01]);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = fill;
        ctx.lineWidth = this.k;
        ctx.stroke();
      }
    }
    this.cutFaceEdges(st, G);
    /* les deux bords de la face suivent w(z) : c'est la lecture directe du profil */
    if (st.amp > 0.05) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = this.carbon(0.0);
      ctx.lineWidth = Math.max(1.4, this.k * 1.6);
      ctx.lineJoin = "round";
      var cc = [0, NC];
      for (var e = 0; e < 2; e++) {
        ctx.beginPath();
        for (var rr = 0; rr < rows.length; rr++) {
          if (rr === 0) ctx.moveTo(P[0][cc[e]][0], P[0][cc[e]][1]);
          else ctx.lineTo(P[rr][cc[e]][0], P[rr][cc[e]][1]);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  /* interfaces de pli : la structure reste lisible meme face plane */
  Movie.prototype.cutFaceEdges = function (st, G) {
    var a = 0.55 * (1 - Math.min(1, st.mesh * 1.6));
    if (a <= 0.02) return;
    var ctx = this.ctx, NC = G.NC, rows = G.rows, P = G.P;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = this.carbon(0.02);
    ctx.lineWidth = Math.max(0.9, this.k * 0.9);
    ctx.beginPath();
    for (var r2 = 0; r2 < rows.length; r2++) {
      if (!rows[r2].first && !rows[r2].last) continue;
      for (var k2 = 0; k2 <= NC; k2++) {
        if (k2 === 0) ctx.moveTo(P[r2][0][0], P[r2][0][1]);
        else ctx.lineTo(P[r2][k2][0], P[r2][k2][1]);
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  /* maillage elements finis : toutes les lignes dans l'epaisseur, une colonne sur
     deux en largeur ; le maillage suit chaque interface de pli */
  Movie.prototype.drawMesh = function (st, G) {
    var ctx = this.ctx, NC = G.NC, rows = G.rows, P = G.P;
    ctx.save();
    ctx.globalAlpha = 0.55 * st.mesh;
    ctx.strokeStyle = this.cbg;
    ctx.lineWidth = Math.max(0.7, this.k * 0.7);
    var r, k;
    ctx.beginPath();
    for (r = 0; r < rows.length; r++) {
      for (k = 0; k <= NC; k++) {
        if (k === 0) ctx.moveTo(P[r][0][0], P[r][0][1]);
        else ctx.lineTo(P[r][k][0], P[r][k][1]);
      }
    }
    for (k = 0; k <= NC; k += 2) {
      for (r = 0; r < rows.length; r++) {
        if (r === 0) ctx.moveTo(P[0][k][0], P[0][k][1]);
        else ctx.lineTo(P[r][k][0], P[r][k][1]);
      }
    }
    ctx.stroke();
    /* interfaces de pli : trait plus marque */
    ctx.globalAlpha = 0.85 * st.mesh;
    ctx.lineWidth = Math.max(1, this.k * 1.2);
    ctx.beginPath();
    for (r = 0; r < rows.length; r++) {
      if (!rows[r].first && !rows[r].last) continue;
      for (k = 0; k <= NC; k++) {
        if (k === 0) ctx.moveTo(P[r][0][0], P[r][0][1]);
        else ctx.lineTo(P[r][k][0], P[r][k][1]);
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  /* points de mesure deja releves, derriere le faisceau */
  Movie.prototype.drawDots = function (st, G) {
    var ctx = this.ctx, NC = G.NC, rows = G.rows, P = G.P;
    ctx.save();
    ctx.globalAlpha = 0.9 * st.dots;
    ctx.fillStyle = this.cbg;
    var rr = Math.max(0.8, this.k * 0.8);
    var dy = Math.abs(P[rows.length - 1][0][1] - P[0][0][1]) / (rows.length - 1);
    var dx = Math.abs(P[0][NC][0] - P[0][0][0]) / NC;
    var sr = Math.max(1, Math.ceil(5 * this.k / Math.max(1, dy)));
    var sk = Math.max(1, Math.ceil(5 * this.k / Math.max(1, dx)));
    for (var r = 0; r < rows.length; r += sr) {
      for (var k = 0; k <= NC; k += sk) {
        var u = -1 + 2 * k / NC;
        if (u > st.scan - 0.03) continue;
        ctx.beginPath();
        ctx.arc(P[r][k][0], P[r][k][1], rr, 0, 6.2832);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  /* faisceau de mesure : trois passes, il balaie la largeur des faces */
  Movie.prototype.drawScan = function (half, st, G) {
    if (st.scan < -1.02 || st.scan > 1.06) return;
    var ctx = this.ctx, rows = G.rows;
    var u = (st.scan + 1) / 2;
    if (u < 0 || u > 1) return;
    var pts = [];
    for (var r = 0; r < rows.length; r++) {
      var wv = wAt(rows[r].li, rows[r].z) + half.sign * st.art * artef(rows[r].z, u);
      pts.push(this.project(half.x.p([-(wv * KW * st.amp) - 0.012, rows[r].y,
        -HZ + 2 * HZ * u])));
    }
    var passes = [[7, 0.14], [3, 0.42], [1.1, 0.95]];
    ctx.save();
    ctx.lineCap = "round";
    for (var i = 0; i < passes.length; i++) {
      ctx.globalAlpha = passes[i][1];
      ctx.strokeStyle = i === 2 ? this.cbg : this.claiton;
      ctx.lineWidth = Math.max(1, this.k) * passes[i][0];
      ctx.beginPath();
      for (var j = 0; j < pts.length; j++) {
        if (j === 0) ctx.moveTo(pts[j][0], pts[j][1]); else ctx.lineTo(pts[j][0], pts[j][1]);
      }
      ctx.stroke();
    }
    ctx.restore();
  };

  /* fleches de deplacement : mesure vers l'exterieur, puis signe inverse */
  Movie.prototype.drawArrows = function (half, st) {
    var ctx = this.ctx;
    var cols = this.wide ? [0.24, 0.5, 0.76] : [0.5];
    var lw = Math.max(2, this.k * 2.2);
    var head = Math.max(6, this.k * 7);
    ctx.save();
    ctx.globalAlpha = st.arrowA;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (var li = 0; li < 5; li++) {
      var L = LAYERS[li];
      var z = (L.z0 + L.z1) / 2;
      var wv = wAt(li, z);
      for (var c = 0; c < cols.length; c++) {
        var u = cols[c];
        var zc = -HZ + 2 * HZ * u;
        var x0 = -(wv * KW * st.amp) - 0.01;
        var len = -st.arrowS * wv * KW * 7.0;
        var a = this.project(half.x.p([x0, yOf(z), zc]));
        var b = this.project(half.x.p([x0 + len, yOf(z), zc]));
        var dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.hypot(dx, dy);
        if (dl < 3) continue;
        dx /= dl; dy /= dl;
        var hd = Math.min(head, dl * 0.45);
        ctx.strokeStyle = this.cbg;
        ctx.fillStyle = this.cbg;
        ctx.lineWidth = lw + 2 * this.k;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        ctx.strokeStyle = this.claiton;
        ctx.fillStyle = this.claiton;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0] - dx * hd * 0.7, b[1] - dy * hd * 0.7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(b[0], b[1]);
        ctx.lineTo(b[0] - dx * hd - dy * hd * 0.46, b[1] - dy * hd + dx * hd * 0.46);
        ctx.lineTo(b[0] - dx * hd + dy * hd * 0.46, b[1] - dy * hd - dx * hd * 0.46);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  };

  /* Marques de fibres par-dessus la carte : rayures dans les couches 0 degre
     (fibres couchees dans le plan de coupe), points dans les couches 90 degres
     (bouts de fibres normaux a la face). */
  Movie.prototype.drawFaceFibres = function (half, alpha) {
    var ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    for (var li = 0; li < 5; li++) {
      var L = LAYERS[li];
      var q = [this.project(half.x.p([0, yOf(L.z1), -HZ])),
        this.project(half.x.p([0, yOf(L.z1), HZ])),
        this.project(half.x.p([0, yOf(L.z0), HZ])),
        this.project(half.x.p([0, yOf(L.z0), -HZ]))];
      this.fibre(q, [[0, 0, -HZ], [0, 0, HZ], [0, 1, -HZ]], L.a === 0 ? 2 : 0, 0.0);
    }
    ctx.restore();
  };

  /* carte sigma_yy plaquee sur la face plane */
  Movie.prototype.paintMap = function (half, alpha) {
    var ctx = this.ctx, tex = this.mapTex;
    var o = this.project(half.x.p([0, HT, -HZ]));
    var pu = this.project(half.x.p([0, HT, HZ]));
    var pv = this.project(half.x.p([0, -HT, -HZ]));
    var p1 = this.project(half.x.p([0, -HT, HZ]));
    ctx.save();
    ctx.globalAlpha = alpha;
    this.poly([o, pu, p1, pv]);
    ctx.clip();
    ctx.setTransform((pu[0] - o[0]) / tex.width, (pu[1] - o[1]) / tex.width,
      (pv[0] - o[0]) / tex.height, (pv[1] - o[1]) / tex.height, o[0], o[1]);
    ctx.drawImage(tex, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.restore();
  };

  /* bandes hachurees : interfaces, extremites du trajet, faces libres */
  Movie.prototype.hatchQuad = function (half, z0, z1, u0, u1, alpha) {
    var ctx = this.ctx;
    var p = [
      this.project(half.x.p([-0.004, yOf(z1), -HZ + 2 * HZ * u0])),
      this.project(half.x.p([-0.004, yOf(z1), -HZ + 2 * HZ * u1])),
      this.project(half.x.p([-0.004, yOf(z0), -HZ + 2 * HZ * u1])),
      this.project(half.x.p([-0.004, yOf(z0), -HZ + 2 * HZ * u0]))
    ];
    var mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
    for (var i = 0; i < 4; i++) {
      mnx = Math.min(mnx, p[i][0]); mxx = Math.max(mxx, p[i][0]);
      mny = Math.min(mny, p[i][1]); mxy = Math.max(mxy, p[i][1]);
    }
    ctx.save();
    this.poly(p);
    ctx.clip();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = this.dark ? "rgb(20,18,16)" : "rgb(26,23,20)";
    ctx.lineWidth = Math.max(0.8, this.k * 0.8);
    var stp = 9 * this.k;
    var span = mxy - mny;
    var x0 = Math.floor((mnx - span) / stp) * stp;   /* phase commune a tout l'ecran */
    ctx.beginPath();
    for (var x = x0; x < mxx + 2; x += stp) {
      ctx.moveTo(x, mxy); ctx.lineTo(x + span, mny);
    }
    ctx.stroke();
    ctx.restore();
  };

  Movie.prototype.drawHatch = function (half, a) {
    var uEnd = 7 / 32;                  /* 1,25 fois l'epaisseur a chaque extremite */
    var e = 0.09;                       /* quelques dixiemes de mm autour des interfaces */
    this.hatchQuad(half, 0, T, 0, uEnd, a);
    this.hatchQuad(half, 0, T, 1 - uEnd, 1, a);
    this.hatchQuad(half, 0, e, uEnd, 1 - uEnd, a);
    this.hatchQuad(half, T - e, T, uEnd, 1 - uEnd, a);
    var zi = [1.2, 2.2, 3.4, 4.4];
    for (var i = 0; i < 4; i++) this.hatchQuad(half, zi[i] - e, zi[i] + e, uEnd, 1 - uEnd, a);
  };

  /* --- fil et sillon --------------------------------------------------- */
  Movie.prototype.drawKerf = function (st) {
    if (st.kerf < -8 || !st.groove) return;
    var ctx = this.ctx;
    var on = st.shim > 0.5;
    var z0 = -HZ - (on ? SHIM_OVER : 0);
    var z1 = Math.min(st.kerf, HZ + (on ? SHIM_OVER : 0));
    if (z1 <= z0) return;
    var yTop = HT + (on ? SHIM_H * 2 + st.shimOff * SHIM_SLIDE : 0) + 0.003;
    var hw = KERF / 2 + 0.006;
    var p = [
      this.project([-hw, yTop, z0]), this.project([hw, yTop, z0]),
      this.project([hw, yTop, z1]), this.project([-hw, yTop, z1])
    ];
    if (this.rotN([0, 1, 0])[2] <= 0) return;
    ctx.save();
    this.poly(p);
    ctx.fillStyle = this.dark ? "rgb(14,13,12)" : "rgb(26,23,20)";
    ctx.globalAlpha = 0.92 * Math.min(1, st.groove);
    ctx.fill();
    ctx.restore();
  };

  Movie.prototype.drawWire = function (st) {
    if (st.wire === null) return;
    var ctx = this.ctx;
    var yb = -HT - SHIM_H * 2 - 0.30, yt = HT + SHIM_H * 2 + 0.34;
    var pb = this.project([0, yb, st.wire]);
    var pm = this.project([0, HT + SHIM_H * 2, st.wire]);
    var pt = this.project([0, yt, st.wire]);
    var lai = this.laiton;
    var core = rgbCSS(mix(lai, [255, 250, 240], 0.6));
    var passes = [[13, 0.22, this.claiton], [5.0, 0.70, this.claiton], [1.8, 1.0, core]];
    ctx.save();
    ctx.lineCap = "round";
    for (var i = 0; i < passes.length; i++) {
      ctx.strokeStyle = passes[i][2];
      ctx.lineWidth = Math.max(0.9, this.k) * passes[i][0];
      ctx.globalAlpha = passes[i][1] * 0.8;
      ctx.beginPath(); ctx.moveTo(pb[0], pb[1]); ctx.lineTo(pm[0], pm[1]); ctx.stroke();
      ctx.globalAlpha = passes[i][1];
      ctx.beginPath(); ctx.moveTo(pm[0], pm[1]); ctx.lineTo(pt[0], pt[1]); ctx.stroke();
    }
    /* etincelles discretes, deterministes */
    if (st.spark) {
      var r = rnd(Math.floor(st.t * 30));
      ctx.globalAlpha = 1;
      for (var s = 0; s < 6; s++) {
        var yy = -HT + 2 * HT * r();
        var sp = this.project([(r() - 0.5) * 0.10, yy, st.wire + (r() - 0.5) * 0.10]);
        ctx.fillStyle = rgbCSS(mix(lai, [255, 236, 196], r() * 0.6));
        ctx.globalAlpha = 0.55 + 0.45 * r();
        ctx.beginPath();
        ctx.arc(sp[0], sp[1], Math.max(1.2, this.k * 1.5) * (0.5 + r()), 0, 6.2832);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  /* --- textes et panneaux (2D, par dessus la scene) -------------------- */
  Movie.prototype.setFont = function (mul, weight) {
    this.ctx.font = (weight || 500) + " " +
      (Math.round(this.fs * (mul || 1) * 10) / 10) +
      'px "JetBrains Mono", Menlo, Consolas, monospace';
  };
  Movie.prototype.fmt = function (v, nd) {
    var s = v.toFixed(nd === undefined ? 1 : nd);
    return this.dec === "." ? s : s.replace(".", this.dec);
  };
  /* Rectangles deja occupes par un cartouche pendant l'image courante :
     un nouveau cartouche est decale tant qu'il en recouvre un. */
  function overlap(a, b) {
    return a[0] < b[0] + b[2] && a[0] + a[2] > b[0] &&
      a[1] < b[1] + b[3] && a[1] + a[3] > b[1];
  }
  Movie.prototype.tbox = function (lines, x, y, o) {
    o = o || {};
    var ctx = this.ctx, mul = o.mul || 1, i;
    this.setFont(mul, o.weight);
    var lh = this.fs * mul * 1.42;
    var w = 0;
    for (i = 0; i < lines.length; i++) w = Math.max(w, ctx.measureText(lines[i]).width);
    var pad = this.fs * 0.52;
    var bw = w + pad * 2, bh = lh * lines.length + pad * 1.1;
    var bx = o.align === "right" ? x - bw : o.align === "center" ? x - bw / 2 : x;
    var by = o.vAlign === "bottom" ? y - bh : o.vAlign === "middle" ? y - bh / 2 : y;
    var W = this.canvas.width, H = this.canvas.height, m = this.fs * 0.3;
    var xmax = (this.boxMaxX === undefined ? W : this.boxMaxX);
    /* jamais hors du canvas, jamais sous le panneau lateral */
    bx = Math.max(m, Math.min(Math.max(m, xmax - bw - m), bx));
    by = Math.max(m, Math.min(H - bh - m, by));
    /* jamais par dessus un autre cartouche */
    if (this.slots) {
      var gap = this.fs * 0.35, tries = 0, moved = true;
      while (moved && tries < 14) {
        moved = false; tries++;
        for (i = 0; i < this.slots.length; i++) {
          if (overlap([bx, by, bw, bh], this.slots[i])) {
            var down = this.slots[i][1] + this.slots[i][3] + gap;
            var up = this.slots[i][1] - bh - gap;
            by = (down + bh <= H - m) ? down : (up >= m ? up : down);
            by = Math.max(m, Math.min(H - bh - m, by));
            moved = true;
          }
        }
      }
      this.slots.push([bx, by, bw, bh]);
    }
    ctx.save();
    if (o.bg !== false) {
      ctx.globalAlpha = (o.alpha === undefined ? 1 : o.alpha) * 0.9;
      ctx.fillStyle = this.cbg;
      ctx.fillRect(bx, by, bw, bh);
      ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
      ctx.strokeStyle = o.border || this.cline;
      ctx.lineWidth = Math.max(1, this.k);
      ctx.strokeRect(bx + 0.5 * this.k, by + 0.5 * this.k, bw - this.k, bh - this.k);
    }
    ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    for (i = 0; i < lines.length; i++) {
      ctx.fillStyle = (o.colors && o.colors[i]) || o.color || this.cfgs;
      ctx.fillText(lines[i], bx + pad, by + pad * 0.55 + lh * (i + 0.76));
    }
    ctx.restore();
    return [bx, by, bw, bh];
  };
  /* etiquette reliee a un point de la scene par un trait fin */
  Movie.prototype.tag = function (lines, worldPt, dx, dy, o) {
    o = o || {};
    var ctx = this.ctx;
    var a = this.project(worldPt);
    var bx = a[0] + dx * this.fs, by = a[1] + dy * this.fs;
    var r = this.tbox(lines, bx, by, o);
    /* le trait de rappel est trace apres coup, vers la position finale du cartouche */
    var tx = Math.max(r[0], Math.min(r[0] + r[2], a[0]));
    var ty = a[1] < r[1] ? r[1] : (a[1] > r[1] + r[3] ? r[1] + r[3] : a[1]);
    ctx.save();
    ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    ctx.strokeStyle = this.cline;
    ctx.lineWidth = Math.max(1, this.k);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.fillStyle = this.cfg;
    ctx.beginPath(); ctx.arc(a[0], a[1], Math.max(1.4, this.k * 1.6), 0, 6.2832); ctx.fill();
    ctx.restore();
    return r;
  };

  /* mention obligatoire pendant toute la phase de deformation */
  Movie.prototype.drawExag = function (st) {
    var pad = this.fs * 1.0;
    var lines = [this.L.exag, this.wide ? this.L.amp : this.L.ampShort];
    var cols = [this.cfg, this.cfgs];
    if (st.burst > 0.4) { lines.push(this.L.burst); cols.push(this.cfgs); }
    this.tbox(lines, pad, this.canvas.height - pad, {
      vAlign: "bottom", alpha: Math.min(1, st.amp * 3),
      colors: cols
    });
  };

  /* barre de l'echelle scientifique, bornes -130 a +50 MPa, douze paliers */
  Movie.prototype.drawBar = function (st) {
    var ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    var pad = this.fs * 1.0;
    var bw = Math.min(W * 0.74, W - 2 * pad);
    var bh = Math.max(6, this.fs * 0.8);
    var bx = (W - bw) / 2;
    var by = st.barY !== undefined ? st.barY : H - pad - this.fs * 2.1 - bh;
    ctx.save();
    ctx.globalAlpha = st.bar;
    var i;
    for (i = 0; i < MAP_BANDS; i++) {
      var v = MAP_MIN + (MAP_MAX - MAP_MIN) * (i + 0.5) / MAP_BANDS;
      ctx.fillStyle = rgbCSS(sigRGB(v));
      ctx.fillRect(bx + bw * i / MAP_BANDS - 0.4, by, bw / MAP_BANDS + 0.8, bh);
    }
    ctx.strokeStyle = this.cline;
    ctx.lineWidth = Math.max(1, this.k);
    ctx.strokeRect(bx + 0.5 * this.k, by + 0.5 * this.k, bw - this.k, bh - this.k);
    this.setFont(0.82);
    ctx.textBaseline = "alphabetic";
    var ticks = this.mid ? [-130, -100, -50, 0, 50] : [-130, 0, 50];
    for (i = 0; i < ticks.length; i++) {
      var tv = ticks[i];
      var tx = bx + bw * (tv - MAP_MIN) / (MAP_MAX - MAP_MIN);
      var zero = tv === 0;
      ctx.strokeStyle = zero ? this.cfg : this.cline;
      ctx.lineWidth = Math.max(1, this.k * (zero ? 1.6 : 1));
      ctx.beginPath();
      ctx.moveTo(tx, by); ctx.lineTo(tx, by + bh + this.fs * 0.35);
      ctx.stroke();
      ctx.textAlign = i === 0 ? "left" : i === ticks.length - 1 ? "right" : "center";
      ctx.fillStyle = zero ? this.cfg : this.cfgs;
      ctx.fillText((tv > 0 ? "+" : tv < 0 ? "−" : "") + Math.abs(tv),
        tx, by + bh + this.fs * 1.5);
    }
    this.setFont(0.86);
    ctx.textAlign = "left";
    ctx.fillStyle = this.cfg;
    ctx.fillText(this.L.sig, bx, by - this.fs * 0.55);
    ctx.restore();
  };

  /* Profil sigma_yy(z) sous la carte : le meme trace que la figure publiee,
     la mesure et le creneau de la theorie classique des stratifies. */
  Movie.prototype.drawSigmaPlot = function (st) {
    var ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    var top = st.barY + this.fs * 3.4;
    var bot = H - this.fs * 1.0;
    if (bot - top < this.fs * 6) return;
    var gw = Math.min(W * 0.66, W - this.fs * 2);
    var gx = (W - gw) / 2;
    var ml = this.fs * 3.2, mr = this.fs * 0.6, mt = this.fs * 1.4, mb = this.fs * 1.9;
    var ax = gx + ml, ay = top + mt;
    var aw = gw - ml - mr, ah = (bot - top) - mt - mb;
    if (ah < this.fs * 3) return;
    function X(z) { return ax + z / T * aw; }
    function Y(v) { return ay + ah - (v - MAP_MIN) / (MAP_MAX - MAP_MIN) * ah; }
    var i, li, j, z;
    ctx.save();
    ctx.globalAlpha = st.bar;
    /* interfaces de pli */
    ctx.strokeStyle = this.cline;
    ctx.lineWidth = Math.max(1, this.k);
    ctx.beginPath();
    var zi = [0, 1.2, 2.2, 3.4, 4.4, 5.6];
    for (i = 0; i < zi.length; i++) { ctx.moveTo(X(zi[i]), ay); ctx.lineTo(X(zi[i]), ay + ah); }
    ctx.moveTo(ax, Y(0)); ctx.lineTo(ax + aw, Y(0));
    ctx.stroke();
    /* creneau de la theorie classique des stratifies */
    ctx.strokeStyle = this.cfgs;
    ctx.lineWidth = Math.max(1, this.k * 1.1);
    if (ctx.setLineDash) ctx.setLineDash([4 * this.k, 3 * this.k]);
    ctx.beginPath();
    for (li = 0; li < 5; li++) {
      var vc = LAYERS[li].a === 0 ? 29 : -52;
      if (li === 0) ctx.moveTo(X(LAYERS[li].z0), Y(vc));
      else ctx.lineTo(X(LAYERS[li].z0), Y(vc));
      ctx.lineTo(X(LAYERS[li].z1), Y(vc));
    }
    ctx.stroke();
    if (ctx.setLineDash) ctx.setLineDash([]);
    /* profil mesure, couche par couche */
    ctx.strokeStyle = this.cfg;
    ctx.lineWidth = Math.max(1.6, this.k * 1.8);
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (li = 0; li < 5; li++) {
      var L = LAYERS[li];
      for (j = 0; j <= 12; j++) {
        z = L.z0 + (L.z1 - L.z0) * j / 12;
        if (li === 0 && j === 0) ctx.moveTo(X(z), Y(sigAt(li, z)));
        else ctx.lineTo(X(z), Y(sigAt(li, z)));
      }
    }
    ctx.stroke();
    /* graduations */
    this.setFont(0.7);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = this.cfgs;
    var yt = [50, 0, -130];
    for (i = 0; i < yt.length; i++) {
      ctx.fillText((yt[i] > 0 ? "+" : yt[i] < 0 ? "\u2212" : "") + Math.abs(yt[i]),
        ax - this.fs * 0.5, Y(yt[i]));
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(this.fmt(0), X(0), ay + ah + this.fs * 1.25);
    ctx.fillText(this.fmt(T), X(T), ay + ah + this.fs * 1.25);
    ctx.textAlign = "left";
    var lx = ax + this.fs * 0.5, ly = ay + this.fs * 0.9;
    var sw = this.fs * 1.4;
    ctx.strokeStyle = this.cfg;
    ctx.lineWidth = Math.max(1.6, this.k * 1.8);
    ctx.beginPath();
    ctx.moveTo(lx, ly - this.fs * 0.25); ctx.lineTo(lx + sw, ly - this.fs * 0.25);
    ctx.stroke();
    ctx.fillStyle = this.cfg;
    ctx.fillText(this.L.meas, lx + sw + this.fs * 0.4, ly);
    var lx2 = lx + sw + this.fs * 0.8 + ctx.measureText(this.L.meas).width;
    ctx.strokeStyle = this.cfgs;
    ctx.lineWidth = Math.max(1, this.k * 1.1);
    if (ctx.setLineDash) ctx.setLineDash([4 * this.k, 3 * this.k]);
    ctx.beginPath();
    ctx.moveTo(lx2, ly - this.fs * 0.25); ctx.lineTo(lx2 + sw, ly - this.fs * 0.25);
    ctx.stroke();
    if (ctx.setLineDash) ctx.setLineDash([]);
    ctx.fillStyle = this.cfgs;
    ctx.fillText(this.L.cltShort, lx2 + sw + this.fs * 0.4, ly);
    ctx.restore();
  };

  Movie.prototype.panelRect = function () {
    var W = this.canvas.width, H = this.canvas.height, pad = this.fs * 0.8;
    var pw = this.wide ? Math.min(W * 0.30, this.fs * 17) : W * 0.44;
    var ph = Math.min(H * 0.86, this.fs * 21);
    return [W - pad - pw, (H - ph) / 2, pw, ph];
  };

  /* panneau de profil w(z) : creneaux, puis les deux faces et leur moyenne */
  Movie.prototype.drawPanel = function (st) {
    var ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    var narrow = !this.wide;
    var R = this.panelRect();
    var px = R[0], py = R[1], pw = R[2], ph = R[3];
    ctx.save();
    ctx.globalAlpha = st.panel;
    ctx.fillStyle = this.cbg;
    ctx.globalAlpha = st.panel * 0.92;
    ctx.fillRect(px, py, pw, ph);
    ctx.globalAlpha = st.panel;
    ctx.strokeStyle = this.cline;
    ctx.lineWidth = Math.max(1, this.k);
    ctx.strokeRect(px + 0.5 * this.k, py + 0.5 * this.k, pw - this.k, ph - this.k);

    var ml = this.fs * (narrow ? 2.2 : 2.6), mr = this.fs * 0.9;
    var mt = this.fs * 2.2, mb = this.fs * 4.9;
    var ax = px + ml, ay = py + mt, aw = pw - ml - mr, ah = ph - mt - mb;
    var WMIN = -5.2, WMAX = 3.6;
    var self = this;
    function wx(v) { return ax + (v - WMIN) / (WMAX - WMIN) * aw; }
    function zy(z) { return ay + ah - (z / T) * ah; }

    this.setFont(0.82);
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = this.cfg;
    ctx.fillText(this.L.prof, px + this.fs * 0.6, py + this.fs * 1.3);

    /* interfaces de pli et reperes d'orientation */
    ctx.strokeStyle = this.cline;
    ctx.lineWidth = Math.max(1, this.k);
    var i, zi = [0, 1.2, 2.2, 3.4, 4.4, 5.6];
    ctx.beginPath();
    for (i = 0; i < zi.length; i++) { ctx.moveTo(ax, zy(zi[i])); ctx.lineTo(ax + aw, zy(zi[i])); }
    ctx.stroke();
    this.setFont(0.72);
    ctx.textAlign = "right";
    ctx.fillStyle = this.cfgs;
    var zl = narrow ? [0, 5.6] : zi;
    for (i = 0; i < zl.length; i++) {
      ctx.fillText(this.fmt(zl[i]), ax - this.fs * 1.4, zy(zl[i]) + this.fs * 0.26);
    }
    ctx.textAlign = "left";
    for (i = 0; i < 5; i++) {
      ctx.fillStyle = this.cfg;
      ctx.fillText(LAYERS[i].a === 0 ? "0°" : "90°",
        ax - this.fs * (narrow ? 1.05 : 1.25),
        zy((LAYERS[i].z0 + LAYERS[i].z1) / 2) + this.fs * 0.26);
    }
    /* zero */
    ctx.strokeStyle = this.cfgs;
    ctx.setLineDash([3 * this.k, 3 * this.k]);
    ctx.beginPath(); ctx.moveTo(wx(0), ay); ctx.lineTo(wx(0), ay + ah); ctx.stroke();
    ctx.setLineDash([]);

    function curve(off, style, lw, alpha) {
      ctx.save();
      ctx.globalAlpha = st.panel * alpha;
      ctx.strokeStyle = style;
      ctx.lineWidth = lw;
      if (ctx.setLineDash) ctx.setLineDash(off === 2 ? [4 * self.k, 3 * self.k] : []);
      ctx.beginPath();
      var started = false;
      for (var li = 0; li < 5; li++) {
        var L = LAYERS[li], n = 10;
        for (var j = 0; j <= n; j++) {
          var z = L.z0 + (L.z1 - L.z0) * j / n;
          var v = wAt(li, z);
          if (off === 1) v += st.art * artef(z, 0.5);
          if (off === 2) v -= st.art * artef(z, 0.5);
          var X = wx(v), Y = zy(z);
          if (!started) { ctx.moveTo(X, Y); started = true; } else ctx.lineTo(X, Y);
        }
      }
      ctx.stroke();
      if (ctx.setLineDash) ctx.setLineDash([]);
      ctx.restore();
    }
    if (st.panelMode === "ab") {
      curve(1, this.cfgs, Math.max(1, this.k * 1.2), 1);
      curve(2, this.cfgs, Math.max(1, this.k * 1.2), 1);
      if (st.panelMean > 0.01) curve(0, this.cfg, Math.max(1.8, this.k * 2.2), st.panelMean);
    } else {
      curve(0, this.cfg, Math.max(1.8, this.k * 2.2), 1);
    }

    /* les deux extrema sont poses sous leur abscisse reelle, avec leur repere */
    this.setFont(0.72);
    ctx.strokeStyle = this.cfgs;
    ctx.lineWidth = Math.max(1, this.k);
    ctx.beginPath();
    ctx.moveTo(wx(-4.45), ay + ah); ctx.lineTo(wx(-4.45), ay + ah + this.fs * 0.4);
    ctx.moveTo(wx(2.80), ay + ah); ctx.lineTo(wx(2.80), ay + ah + this.fs * 0.4);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = this.cfgs;
    ctx.fillText("−4,45".replace(",", this.dec), wx(-4.45), ay + ah + this.fs * 1.45);
    ctx.fillText("+2,80".replace(",", this.dec), wx(2.80), ay + ah + this.fs * 1.45);
    ctx.fillStyle = this.cfg;
    var leg = st.panelMode === "ab"
      ? this.L.faceA + " / " + this.L.faceB + (st.panelMean > 0.5 ? " / " + this.L.mean : "")
      : this.L.um;
    var legY = py + ph - this.fs * 0.8;
    if (st.panelMode === "ab") {
      ctx.fillText(leg, px + pw / 2, legY - this.fs * 1.2);
      ctx.fillStyle = this.cfgs;
      this.setFont(0.68);
      ctx.fillText(this.L.sketch, px + pw / 2, legY);
    } else {
      ctx.fillText(leg, px + pw / 2, legY);
    }
    ctx.restore();
  };

  /* cotes de l'empilement, le long de l'arete de la tranche */
  Movie.prototype.drawCotes = function (st) {
    if (st.cot < 0.02) return;
    var ctx = this.ctx, i;
    var g = st.gap / 2;
    var zs = [0, 1.2, 2.2, 3.4, 4.4, 5.6];
    var pts = [];
    for (i = 0; i < zs.length; i++) pts.push(this.project([LEN + g, yOf(zs[i]), HZ]));
    var dx = this.fs * 1.3;
    ctx.save();
    ctx.globalAlpha = st.cot;
    ctx.strokeStyle = this.cfgs;
    ctx.lineWidth = Math.max(1, this.k);
    ctx.beginPath();
    ctx.moveTo(pts[0][0] + dx, pts[0][1]);
    ctx.lineTo(pts[5][0] + dx, pts[5][1]);
    for (i = 0; i < pts.length; i++) {
      ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[i][0] + dx * 1.35, pts[i][1]);
    }
    ctx.stroke();
    this.setFont(0.78);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = this.cfg;
    for (i = 0; i < 5; i++) {
      var my = (pts[i][1] + pts[i + 1][1]) / 2;
      var mx = (pts[i][0] + pts[i + 1][0]) / 2 + dx * 1.55;
      ctx.fillText(this.fmt(LAYERS[i].z1 - LAYERS[i].z0), mx, my);
    }
    ctx.textBaseline = "alphabetic";
    ctx.restore();
    var ex = dx * 4.4;
    ctx.save();
    ctx.globalAlpha = st.cot;
    ctx.strokeStyle = this.cfgs;
    ctx.lineWidth = Math.max(1, this.k);
    ctx.beginPath();
    ctx.moveTo(pts[0][0] + ex, pts[0][1]);
    ctx.lineTo(pts[5][0] + ex, pts[5][1]);
    ctx.moveTo(pts[0][0] + ex - this.fs * 0.35, pts[0][1]);
    ctx.lineTo(pts[0][0] + ex + this.fs * 0.35, pts[0][1]);
    ctx.moveTo(pts[5][0] + ex - this.fs * 0.35, pts[5][1]);
    ctx.lineTo(pts[5][0] + ex + this.fs * 0.35, pts[5][1]);
    ctx.stroke();
    ctx.restore();
    this.tbox([this.L.total], (pts[0][0] + pts[5][0]) / 2 + ex + this.fs * 0.5,
      (pts[0][1] + pts[5][1]) / 2,
      { vAlign: "middle", alpha: st.cot, mul: 0.82, color: this.cfg });
  };

  /* plan de coupe a venir : normale Y, il relache sigma_yy */
  Movie.prototype.drawPlane = function (st) {
    if (st.plane < 0.02) return;
    var ctx = this.ctx;
    var hy = HT * 1.7, hz = HZ * 1.04;
    var p = [this.project([0, hy, -hz]), this.project([0, hy, hz]),
      this.project([0, -hy, hz]), this.project([0, -hy, -hz])];
    ctx.save();
    ctx.globalAlpha = 0.16 * st.plane;
    this.poly(p);
    ctx.fillStyle = this.cfg;
    ctx.fill();
    ctx.globalAlpha = 0.8 * st.plane;
    ctx.strokeStyle = this.cfg;
    ctx.lineWidth = Math.max(1, this.k * 1.2);
    if (ctx.setLineDash) ctx.setLineDash([5 * this.k, 4 * this.k]);
    this.poly(p);
    ctx.stroke();
    if (ctx.setLineDash) ctx.setLineDash([]);
    ctx.restore();
    this.tag([this.L.cut, this.L.rel], [0, hy * 0.55, -hz * 0.5], -1.0, -3.2,
      { align: "right", vAlign: "bottom", alpha: st.plane, mul: 0.82,
        colors: [this.cfg, this.cfgs] });
  };

  /* ====================================================================
     7. Rendu d'une image
     ==================================================================== */

  Movie.prototype.render = function () {
    if (!this.canvas.width || !this.canvas.height) this.resize();
    var ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    var st = sceneState(this.t);
    var self = this;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.cbg;
    ctx.fillRect(0, 0, W, H);
    this.slots = [];

    this.yaw = st.yaw;
    this.pitch = st.pitch;
    var hs = this.halves(st);
    /* le panneau w(z) existe a toutes les largeurs ; il occupe une bande plus
       large quand le canvas est etroit, et la vue 3D lui cede la place */
    var panelOn = st.panel > 0.01;
    this.boxMaxX = W;
    if (panelOn) {
      var pr = this.panelRect();
      st.rectX1 = st.rect[2] - (st.rect[2] - (pr[0] - this.fs * 0.9) / W) * st.panel;
      if (st.panel > 0.5) {
        this.boxMaxX = pr[0] - this.fs * 0.5;
        this.slots.push([pr[0] - this.fs * 0.5, 0, W - pr[0] + this.fs * 0.5, H]);
      }
    }
    this.fit(st, hs);
    /* scene 7 : la carte et son echelle sont centrees ensemble dans le canvas */
    if (st.idx === 6) {
      var barH = Math.max(6, this.fs * 0.8);
      var below = this.fs * 3.2 + barH + this.fs * 1.9 +
        (this.wide ? this.fs * 3.4 + this.fs * 9.5 : 0);
      var grpTop = this.modelTop - this.fs * 0.4;
      var grpBot = this.modelBottom + below;
      var shift = (H - (grpBot - grpTop)) / 2 - grpTop;
      this.oy += shift;
      this.modelTop += shift;
      this.modelBottom += shift;
    }

    /* liste des solides, triee par profondeur */
    var items = [], i, hi;
    var whole = !st.cutOpen;      /* piece entiere : une seule serie de couches */
    if (whole) {
      for (i = 0; i < 5; i++) {
        (function (li) {
          var L = LAYERS[li];
          var y0 = yOf(L.z0), y1 = yOf(L.z1);
          var lv = boxVerts([0, (y0 + y1) / 2, 0], [LEN, (y1 - y0) / 2, HZ]);
          var xf = mkXform(0, [0, 0, 0]);
          items.push({
            c: [0, (y0 + y1) / 2, 0], a: 1, pri: 2,
            draw: function () {
              self.drawBox(lv, xf, {
                tint: self.carbon, fibre: L.a === 0 ? 2 : 0, edge: true,
                bias: L.a === 0 ? 0.94 : 1.06,
                skip: function (n) {
                  if (n[1] === 1 && li < 4) return true;
                  if (n[1] === -1 && li > 0) return true;
                  return false;
                }
              });
            }
          });
        })(i);
      }
    }
    for (hi = 0; hi < hs.length && !whole; hi++) {
      var h = hs[hi];
      if (h.alpha < 0.02) continue;
      for (i = 0; i < 5; i++) {
        (function (h, li) {
          var L = LAYERS[li];
          var y0 = yOf(L.z0), y1 = yOf(L.z1);
          var lv = boxVerts([LEN / 2, (y0 + y1) / 2, 0], [LEN / 2, (y1 - y0) / 2, HZ]);
          items.push({
            c: h.x.p([LEN / 2, (y0 + y1) / 2, 0]), a: h.alpha, pri: 2,
            draw: function () {
              self.drawBox(lv, h.x, {
                tint: self.carbon,
                fibre: L.a === 0 ? 2 : 0,
                edge: true,
                bias: L.a === 0 ? 0.94 : 1.06,
                skip: function (n) {
                  if (n[0] === -1) return true;
                  if (n[1] === 1 && li < 4) return true;
                  if (n[1] === -1 && li > 0) return true;
                  return false;
                }
              });
            }
          });
        })(h, i);
      }
      if (st.cutOpen && this.cutVisible(h)) {
        (function (h) {
          var G = self.cutFacePts(h, st);
          items.push({
            c: h.x.p([0, 0, 0]), a: h.alpha, pri: 2,
            draw: function () {
              self.drawCutFace(h, st, G);
              if (st.mapAlpha > 0.01 && st.amp < 0.02) {
                self.paintMap(h, st.mapAlpha);
                if (st.mesh < 0.3) self.drawFaceFibres(h, 0.20 * st.mapAlpha);
              }
              if (st.hatch > 0.01) self.drawHatch(h, st.hatch * 0.30);
              if (st.mesh > 0.01) self.drawMesh(st, G);
              if (st.dots > 0.01 && st.scan > -8) self.drawDots(st, G);
              if (st.scan > -8) self.drawScan(h, st, G);
              if (st.arrowA > 0.01) self.drawArrows(h, st);
            }
          });
        })(h);
      }
    }
    /* feuillards sacrificiels */
    if (st.shim > 0.02) {
      for (i = -1; i <= 1; i += 2) {
        (function (s) {
          var cy = s * (HT + SHIM_H + st.shimOff * SHIM_SLIDE);
          var lv = boxVerts([0, cy, 0], [SHIM_X, SHIM_H, HZ + SHIM_OVER]);
          var xf = mkXform(0, [0, 0, 0]);
          items.push({
            c: [0, cy, 0], a: st.shim, pri: s > 0 ? 3 : 1,
            draw: function () { self.drawBox(lv, xf, { tint: self.shimC, edge: true }); }
          });
        })(i);
      }
    }
    /* bridage symetrique : deux mors longs de part et d'autre du trajet */
    if (st.clamp > 0.02) {
      for (i = -1; i <= 1; i += 2) {
        for (var j = -1; j <= 1; j += 2) {
          (function (sx, sy) {
            var cy = sy * (HT + SHIM_H * 2 + CLAMP_H / 2 + st.clampOff * CLAMP_SLIDE);
            var lv = boxVerts([sx * CLAMP_X, cy, 0], [CLAMP_HX, CLAMP_H / 2, HZ * 0.94]);
            var xf = mkXform(0, [0, 0, 0]);
            items.push({
              c: [sx * CLAMP_X, cy, 0], a: st.clamp, pri: sy > 0 ? 4 : 0,
              draw: function () { self.drawBox(lv, xf, { tint: self.clampC, edge: true }); }
            });
          })(i, j);
        }
      }
    }
    items.sort(function (a, b) {
      return (a.pri - b.pri) || (self.projU(a.c)[2] - self.projU(b.c)[2]);
    });
    for (i = 0; i < items.length; i++) {
      if (items[i].a < 0.995) { ctx.save(); ctx.globalAlpha = items[i].a; }
      items[i].draw();
      if (items[i].a < 0.995) ctx.restore();
    }

    this.drawKerf(st);
    this.drawWire(st);
    this.drawPlane(st);
    this.drawCotes(st);
    if (st.bar > 0.01) {
      st.barY = this.modelBottom + this.fs * 3.2;
      this.slots.push([0, st.barY - this.fs * 1.6, W,
        H - (st.barY - this.fs * 1.6)]);
    }
    this.annotate(st, hs);
    if (st.bar > 0.01) {
      this.drawBar(st);
      if (st.idx === 6 && this.wide) this.drawSigmaPlot(st);
    }
    if (panelOn) this.drawPanel(st);
    if (st.amp > 0.02) this.drawExag(st);
    this.ui(st);
  };

  /* ====================================================================
     8. Annotations, scene par scene
     ==================================================================== */

  Movie.prototype.annotate = function (st, hs) {
    var L = this.L, pad = this.fs * 1.0, W = this.canvas.width, H = this.canvas.height, ctx2;
    var A = hs[0], B = hs[1];
    var g = st.gap / 2;
    switch (st.idx) {
      case 0:
        if (st.cot > 0.02) {
          this.tbox([L.stack, L.plies], pad, pad,
            { alpha: st.cot, mul: 0.86, colors: [this.cfg, this.cfgs] });
        }
        if (st.tags > 0.02) {
          this.tbox([L.fx, L.fy], pad, pad + this.fs * 3.6,
            { alpha: st.tags, mul: 0.8, colors: [this.cfgs, this.cfgs] });
        }
        if (st.detail > 0.02) {
          this.tbox([L.detail], pad, H - pad,
            { vAlign: "bottom", alpha: st.detail, mul: 0.76, color: this.cfgs });
        }
        break;
      case 1:
        if (st.shim > 0.15) {
          this.tag([L.shiml], [SHIM_X * 0.3, HT + SHIM_H * 2 + st.shimOff * SHIM_SLIDE,
            HZ + SHIM_OVER * 0.9], 1.4, 3.0,
            { alpha: st.shim, mul: 0.8, color: this.cfg });
        }
        if (st.clamp > 0.15) {
          this.tag([L.clampl], [-CLAMP_X, HT + SHIM_H * 2 + CLAMP_H +
            st.clampOff * CLAMP_SLIDE, -HZ * 0.55], -1.4, -2.6,
            { align: "right", alpha: st.clamp, mul: 0.8, color: this.cfg });
        }
        break;
      case 2:
        this.tbox([L.wirel, L.speed], pad, pad,
          { mul: 0.84, colors: [this.cfg, this.cfgs] });
        if (st.kerf > -HZ) {
          var kz = Math.max(-HZ, Math.min(HZ * 0.2, st.kerf - HZ * 0.85));
          this.tag([L.kerfl], [0, HT + SHIM_H * 2, kz], -1.4, 3.0,
            { align: "right", mul: 0.78, color: this.cfg });
        }
        break;
      case 3:
        if (st.tags > 0.02 && this.wide && this.cutVisible(A)) {
          var z90 = 1.7, z0 = 0.45;
          this.tag([L.comp], A.x.p([-(wAt(1, z90) * KW * st.amp) - 0.01, yOf(z90),
            -HZ + 2 * HZ * 0.30]), -0.6, -7.6,
            { align: "right", vAlign: "bottom", alpha: st.tags, mul: 0.78, color: this.cfg });
          this.tag([L.tens], A.x.p([-(wAt(0, z0) * KW * st.amp) - 0.01, yOf(z0),
            -HZ + 2 * HZ * 0.62]), 0.8, 4.2,
            { alpha: st.tags, mul: 0.78, color: this.cfg });
        } else if (st.tags > 0.02) {
          /* canvas etroit : les deux signes tiennent dans un seul cartouche */
          this.tbox([L.comp, L.tens], pad, pad,
            { alpha: st.tags, mul: 0.74, colors: [this.cfg, this.cfg] });
        }
        break;
      case 4:
        this.tbox([L.step], pad, pad, { mul: 0.82, color: this.cfgs });
        if (st.flipB > 0.75) {
          var pa = this.project(A.x.p([0, HT, -HZ]));
          var pbb = this.project(B.x.p([0, HT, -HZ]));
          this.tbox([L.faceA], pa[0] + this.fs * 0.5, pa[1] - this.fs * 0.6,
            { vAlign: "bottom", mul: 0.78, color: this.cfg });
          this.tbox([L.faceB], pbb[0] + this.fs * 0.5, pbb[1] - this.fs * 0.6,
            { vAlign: "bottom", mul: 0.78, color: this.cfg });
        }
        break;
      case 5:
        this.tbox([L.meshl, L.props], pad, pad,
          { mul: 0.82, colors: [this.cfg, this.cfgs] });
        if (st.arrowA > 0.15) {
          this.tbox([st.arrowS > 0 ? L.measured : L.invl], W - pad, H - pad,
            { align: "right", vAlign: "bottom", mul: 0.84, color: this.cfg });
        } else if (st.amp < 0.35) {
          this.tbox([L.flatl], W - pad, H - pad,
            { align: "right", vAlign: "bottom", mul: 0.84, color: this.cfg });
        }
        break;
      case 6:
        this.tbox(this.wide ? [L.note0, L.note90, L.artef] : [L.note0, L.note90],
          pad, pad, { mul: 0.78, colors: [this.cfgs, this.cfgs, this.cfgs] });
        if (this.wide) {
          this.tbox([L.clt, L.disp], W - pad, pad,
            { align: "right", mul: 0.78, colors: [this.cfgs, this.cfgs] });
        }
        if (st.tags > 0.02) {
          this.setFont(0.72);
          ctx2 = this.ctx;
          ctx2.save();
          ctx2.globalAlpha = st.tags;
          ctx2.textAlign = "left";
          ctx2.textBaseline = "middle";
          ctx2.fillStyle = this.cfg;
          for (var li = 0; li < 5; li++) {
            var pl = this.project(A.x.p([-0.02, yOf((LAYERS[li].z0 + LAYERS[li].z1) / 2),
              -HZ + 2 * HZ * 0.018]));
            ctx2.fillText(LAYERS[li].a === 0 ? "0\u00b0" : "90\u00b0", pl[0], pl[1]);
          }
          ctx2.restore();
          ctx2.textBaseline = "alphabetic";
        }
        if (st.tags > 0.02 && this.cutVisible(A)) {
          this.tag([L.minc], A.x.p([-0.01, yOf(1.2), -HZ + 2 * HZ * 0.32]), -0.8, 3.6,
            { align: "right", alpha: st.tags, mul: 0.8, color: this.cfg });
          this.tag([L.maxt], A.x.p([-0.01, yOf(3.0), -HZ + 2 * HZ * 0.68]), 0.8, -3.6,
            { vAlign: "bottom", alpha: st.tags, mul: 0.8, color: this.cfg });
        }
        break;
    }
  };

  /* ====================================================================
     9. Interface
     ==================================================================== */

  Movie.prototype.ui = function (st) {
    if (this.capNum) {
      var num = (st.idx + 1 < 10 ? "0" : "") + (st.idx + 1);
      if (this.capNum.textContent !== num) this.capNum.textContent = num;
    }
    if (this.capText && this.caps[st.idx] && this.capText.textContent !== this.caps[st.idx]) {
      this.capText.textContent = this.caps[st.idx];
    }
    for (var i = 0; i < this.segs.length; i++) {
      var f = this.segs[i].querySelector(".movie-fill");
      if (!f) continue;
      var pc = i < st.idx ? 100 : i === st.idx ? Math.round(st.p * 100) : 0;
      var want = pc + "%";
      if (f.style.width !== want) f.style.width = want;
      var cur = i === st.idx ? "true" : "false";
      if (this.segs[i].getAttribute("aria-current") !== cur) {
        this.segs[i].setAttribute("aria-current", i === st.idx ? "true" : "false");
      }
    }
    if (this.playEl) {
      var pressed = this.playing ? "true" : "false";
      if (this.playEl.getAttribute("aria-pressed") !== pressed) {
        this.playEl.setAttribute("aria-pressed", pressed);
        var lab = this.playing
          ? (this.playEl.getAttribute("data-label-pause") || "Pause")
          : (this.playEl.getAttribute("data-label-play") || "Play");
        this.playEl.textContent = lab;
      }
    }
  };

  Movie.prototype.safeRender = function () {
    try {
      this.render();
    } catch (e) {
      if (!warned) {
        warned = true;
        if (window.console && console.warn) console.warn("contourmovie", e);
      }
    }
  };

  Movie.prototype.seek = function (s) {
    this.t = Math.max(0, Math.min(TOTAL + HOLD, s || 0));
    this.safeRender();
  };

  Movie.prototype.bind = function () {
    var self = this;
    if (this.playEl) {
      this.playEl.addEventListener("click", function () {
        self.playing = !self.playing;
        self.safeRender();
      });
    }
    if (this.replayEl) {
      this.replayEl.addEventListener("click", function () {
        self.t = 0; self.playing = true;
        self.safeRender();
      });
    }
    this.segs.forEach(function (seg, i) {
      seg.addEventListener("click", function () { self.seek(T0[i] + 0.02); });
    });
    var bar = this.root.querySelector(".movie-bar");
    if (bar) {
      bar.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        var cur = self.segs.indexOf(document.activeElement);
        if (cur < 0) return;
        var n = Math.max(0, Math.min(self.segs.length - 1, cur + d));
        e.preventDefault();
        self.segs[n].focus();
        self.seek(T0[n] + 0.02);
      });
    }
  };

  /* ====================================================================
     10. Mise en route
     ==================================================================== */

  function init() {
    var list = document.querySelectorAll("canvas[data-contourmovie]");
    if (!list.length) return;
    var movies = [];
    for (var i = 0; i < list.length; i++) {
      var m = new Movie(list[i]);
      m.dec = m.L.dec || ",";
      m.safeRender();
      movies.push(m);
    }

    function each(fn) { for (var j = 0; j < movies.length; j++) fn(movies[j]); }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        for (var e = 0; e < entries.length; e++) {
          var en = entries[e];
          each(function (m) { if (m.canvas === en.target) m.inView = en.isIntersecting; });
        }
      }, { rootMargin: "80px" });
      each(function (m) { io.observe(m.canvas); });
    }

    function refresh() { each(function (m) { m.resize(); m.safeRender(); }); }
    if ("ResizeObserver" in window) {
      var ro = new ResizeObserver(function () { refresh(); });
      each(function (m) { ro.observe(m.canvas); });
    } else {
      var rt = null;
      window.addEventListener("resize", function () {
        clearTimeout(rt);
        rt = setTimeout(refresh, 150);
      });
    }

    /* mode sombre au defilement : les jetons de surface changent sur body */
    if (window.MutationObserver) {
      new MutationObserver(function () {
        each(function (m) { m.readTokens(); m.safeRender(); });
      }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }

    var last = 0;
    function loop(ts) {
      requestAnimationFrame(loop);
      if (ts - last < 32) return;                 /* environ 30 images par seconde */
      var dt = Math.min(ts - last, 200) / 1000;
      last = ts;
      each(function (m) {
        if (!m.playing || !m.inView) return;
        m.t += dt;
        if (m.t > TOTAL + HOLD) m.t = 0;
        m.safeRender();
      });
    }
    requestAnimationFrame(loop);

    var m0 = movies[0];
    window.KerfContourMovie = {
      duration: TOTAL,
      seek: function (s) { m0.playing = false; m0.seek(s); },
      pause: function () { m0.playing = false; m0.safeRender(); },
      play: function () { m0.playing = true; m0.safeRender(); }
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
