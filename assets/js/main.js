/* Kerf : menu mobile, mode sombre au défilement, apparitions, ouverture du kerf dans le héros. Sans dépendance. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Menu mobile */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
  }

  /* Mode sombre une fois le héros dépassé : on entre dans le corps du métier */
  var hero = document.querySelector(".hero");
  if (hero && "IntersectionObserver" in window) {
    var header = document.querySelector(".site-header");
    var offset = header ? header.offsetHeight : 0;
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      var below = e.boundingClientRect.bottom <= offset;
      document.body.classList.toggle("is-dark", !e.isIntersecting && below);
    }, { rootMargin: "-" + offset + "px 0px 0px 0px", threshold: 0 }).observe(hero);
  }

  /* Apparition des blocs au défilement */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  /* Héros : les deux moitiés se décalent d'un cran et le kerf s'ouvre */
  var art = document.querySelector(".hero-art");
  if (art) {
    requestAnimationFrame(function () { requestAnimationFrame(function () { art.classList.add("is-cut"); }); });
  }
})();
