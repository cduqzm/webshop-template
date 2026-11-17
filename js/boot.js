/*
 * Runs in <head>, before the page is drawn. Picks the language and preset, loads the preset's CSS
 * and applies colour/font overrides from config/site.js. Keep this file small.
 */
(function () {
  "use strict";
  var site = window.SITE;
  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  // To add a preset: create presets/<name>.css and list it here with the fonts it needs first.
  // Preloading those fonts avoids text jumping when they arrive.
  var PRELOAD = {
    atelier: ["newsreader.woff2", "schibsted-grotesk.woff2"],
    market: ["archivo.woff2"],
    workshop: ["plex-mono-400.woff2", "plex-sans.woff2"],
    nocturne: ["bodoni-moda.woff2", "hanken-grotesk.woff2"],
    bloom: ["cormorant.woff2", "jost.woff2"],
    corner: ["young-serif.woff2", "rethink-sans.woff2"],
    gallery: ["instrument-sans.woff2"],
  };
  var PRESETS = Object.keys(PRELOAD);

  function saved(key) {
    try { return localStorage.getItem(site.id + ":" + key); } catch (e) { return null; }
  }
  function save(key, value) {
    try { localStorage.setItem(site.id + ":" + key, value); } catch (e) { /* private mode: fine */ }
  }

  // Language: ?lang= → saved choice → browser language → first in config.
  var langs = site.languages;
  var lang = params.get("lang");
  if (langs.indexOf(lang) >= 0) save("lang", lang);
  else lang = saved("lang");
  if (langs.indexOf(lang) < 0) {
    lang = null;
    (navigator.languages || [navigator.language]).some(function (l) {
      var code = String(l).slice(0, 2).toLowerCase();
      if (langs.indexOf(code) >= 0) { lang = code; return true; }
      return false;
    });
  }
  if (!lang) lang = langs[0];
  root.lang = lang;

  // Preset: config, or ?preset= (used by presets.html to show the options side by side).
  var preset = params.get("preset");
  if (PRESETS.indexOf(preset) < 0) preset = site.theme.preset;
  root.setAttribute("data-preset", preset);

  // document.write keeps the stylesheet render-blocking, so the page never flashes unstyled.
  var tags = '<link rel="stylesheet" href="presets/' + preset + '.css">';
  (PRELOAD[preset] || []).forEach(function (file) {
    tags += '<link rel="preload" href="assets/fonts/' + file + '" as="font" type="font/woff2" crossorigin>';
  });
  // The text files for every language in config, so adding a language is: add content/xx.js + list it in site.js.
  langs.forEach(function (code) {
    tags += '<script src="content/' + code + '.js"><\/script>';
  });
  document.write(tags);

  var theme = site.theme;
  var vars = { accent: "--accent", background: "--paper", text: "--ink", fontDisplay: "--font-display", fontText: "--font-text" };
  Object.keys(vars).forEach(function (key) {
    if (theme[key]) root.style.setProperty(vars[key], theme[key]);
  });
  // A custom accent is also used for accent-coloured text (some presets have a darker text variant).
  if (theme.accent) root.style.setProperty("--accent-ink", theme.accentText || theme.accent);

  root.classList.add("js");
})();
