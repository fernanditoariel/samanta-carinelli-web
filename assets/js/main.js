// Samanta Carinelli — light progressive enhancement only.
(function () {
  "use strict";

  var yr = document.getElementById("yr");
  if (yr) yr.textContent = String(new Date().getFullYear());

  // A direct link like #entrevistas fights with the browser's own "keep the
  // anchor in view while the page keeps loading" behavior: lazy-loaded images
  // and the YouTube iframe near the target keep shifting the layout as they
  // come into view, so the browser's native jump (and a single manual retry)
  // can overshoot. Take over entirely: drop the hash so the browser stops
  // chasing it, then keep re-aligning to the target every frame for a bit
  // after load, until layout has actually settled.
  var initialHash = location.hash;
  if (initialHash) {
    var cleanUrl = location.pathname + location.search;
    history.replaceState(null, "", cleanUrl);
    var hashTarget = null;
    var userScrolled = false;
    ["wheel", "touchstart", "keydown"].forEach(function (evt) {
      window.addEventListener(evt, function () { userScrolled = true; }, { passive: true, once: true });
    });
    var alignToHash = function () {
      if (userScrolled) return;
      hashTarget = hashTarget || document.querySelector(initialHash);
      if (hashTarget) hashTarget.scrollIntoView({ behavior: "instant", block: "start" });
    };
    window.addEventListener("load", function () {
      alignToHash();
      history.replaceState(null, "", cleanUrl + initialHash);
      var settleUntil = Date.now() + 2000;
      (function tick() {
        alignToHash();
        if (Date.now() < settleUntil) requestAnimationFrame(tick);
      })();
    });
  }

  var hasIO = "IntersectionObserver" in window;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Background video in the Pilates philosophy section stays still for reduced motion.
  var philosophyVideo = document.querySelector(".philosophy__video");
  if (philosophyVideo && reduce) {
    philosophyVideo.pause();
    philosophyVideo.removeAttribute("autoplay");
  }

  // Sticky nav goes solid once you scroll past the top.
  var nav = document.getElementById("nav");
  if (nav && hasIO) {
    var sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      nav.classList.toggle("scrolled", !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  // Mobile menu toggle.
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navDrawer");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.innerHTML = open
        ? '<i class="ph ph-x" aria-hidden="true"></i>'
        : '<i class="ph ph-list" aria-hidden="true"></i>';
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = '<i class="ph ph-list" aria-hidden="true"></i>';
      });
    });
  }

  // Scroll reveal — skipped when the user prefers reduced motion.
  var targets = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  var revealAll = function () { targets.forEach(function (el) { el.classList.add("in"); }); };

  if (reduce || !hasIO) {
    revealAll();
  } else {
    var reveal = function (el) { el.classList.add("in"); };
    var vh = window.innerHeight || document.documentElement.clientHeight;
    targets.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh + 600) reveal(el);
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" }
    );
    targets.forEach(function (el) {
      if (!el.classList.contains("in")) io.observe(el);
    });
    window.addEventListener("load", function () { setTimeout(revealAll, 2500); });
  }
})();
