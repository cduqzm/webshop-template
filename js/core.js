/*
 * The Shop namespace: text lookup, a small DOM builder, money, opening hours and storage.
 * Every other script adds to window.Shop.
 */
(function () {
  "use strict";
  const site = window.SITE;
  const all = window.CONTENT;
  const fallbackLang = site.languages[0];
  const lang = document.documentElement.lang;
  const text = all[lang] || all[fallbackLang];

  const Shop = (window.Shop = window.Shop || {});
  Shop.site = site;
  Shop.lang = lang;
  Shop.locale = text.meta.locale;

  /* ---------- lookups ---------- */

  function get(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  // Replaces {var} with vars.var and {site.x.y} with values from config/site.js.
  function fill(str, vars) {
    return String(str).replace(/\{([\w.]+)\}/g, (match, key) => {
      if (key.startsWith("site.")) {
        const v = get(site, key.slice(5));
        return v == null ? match : v;
      }
      return vars && vars[key] != null ? vars[key] : match;
    });
  }

  /** Text for a key in the current language. vars.count picks between { one, other }. */
  Shop.t = function (key, vars) {
    let v = get(text, key);
    if (v == null) v = get(all[fallbackLang], key);
    if (v == null) {
      console.warn("[text] missing:", key);
      return key;
    }
    if (typeof v === "object") v = vars && vars.count === 1 ? v.one : v.other;
    return fill(v, vars);
  };

  /** The raw value at a key (for lists and objects, like FAQ items), with the default language as fallback. */
  Shop.raw = function (key) {
    const v = get(text, key);
    return v != null ? v : get(all[fallbackLang], key);
  };

  /** Fills {variables} in a string that didn't come through Shop.t (e.g. items from Shop.raw). */
  Shop.fill = fill;

  /** A multilingual value from data ({ nl, en } or a plain string) in the current language. */
  Shop.loc = function (v) {
    if (v == null) return "";
    if (typeof v !== "object") return String(v);
    return v[lang] ?? v[fallbackLang] ?? Object.values(v)[0];
  };

  /** Turns *emphasis*, [[placeholders]] and line breaks into DOM nodes. Never parses HTML. */
  Shop.rich = function (str) {
    const frag = document.createDocumentFragment();
    const re = /\*([^*]+)\*|(\[\[[^\]]*\]\])|\n/g;
    let last = 0;
    let m;
    str = String(str);
    while ((m = re.exec(str))) {
      if (m.index > last) frag.append(str.slice(last, m.index));
      if (m[1] != null) frag.append(Shop.h("em", null, Shop.rich(m[1])));
      else if (m[2] != null) frag.append(Shop.h("mark", { class: "todo", title: "Placeholder" }, m[2]));
      else frag.append(document.createElement("br"));
      last = re.lastIndex;
    }
    if (last < str.length) frag.append(str.slice(last));
    return frag;
  };

  /* ---------- DOM ---------- */

  /**
   * h("a", { href: "/", class: "x", onclick: fn }, "text", childNode, [more])
   * Special attributes: text, rich (runs Shop.rich), style (css text), dataset.
   */
  Shop.h = function (tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "rich") el.append(Shop.rich(v));
      else if (k === "style") el.style.cssText = v;
      else if (k === "dataset") Object.assign(el.dataset, v);
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : String(kid));
    }
    return el;
  };

  /** Fills data-t, data-t-attr and data-site elements inside root. */
  Shop.applyText = function (root) {
    root = root || document;
    root.querySelectorAll("[data-t]").forEach((el) => {
      el.replaceChildren(Shop.rich(Shop.t(el.dataset.t)));
    });
    root.querySelectorAll("[data-t-attr]").forEach((el) => {
      el.dataset.tAttr.split(",").forEach((pair) => {
        const [attr, key] = pair.split("=").map((s) => s.trim());
        el.setAttribute(attr, Shop.t(key));
      });
    });
    root.querySelectorAll("[data-site]").forEach((el) => {
      el.replaceChildren(Shop.rich(String(get(site, el.dataset.site) ?? "")));
    });
  };

  Shop.setMeta = function (title, description) {
    document.title = title ? title + " · " + site.name : site.name;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) meta = document.head.appendChild(Shop.h("meta", { name: "description" }));
    if (description) meta.content = description;
  };

  // One polite live region for messages like "added to basket".
  let live;
  Shop.announce = function (message) {
    if (!live) live = document.body.appendChild(Shop.h("div", { class: "visually-hidden", "aria-live": "polite" }));
    live.textContent = "";
    setTimeout(() => (live.textContent = message), 50);
  };

  /* ---------- storage ---------- */

  Shop.store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(site.id + ":" + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(site.id + ":" + key, JSON.stringify(value));
      } catch (e) {
        /* storage full or blocked: the cart just won't persist */
      }
    },
  };

  /** Switches language by saving the choice and reloading without ?lang= in the URL. */
  Shop.setLanguage = function (code) {
    try {
      localStorage.setItem(site.id + ":lang", code);
    } catch (e) {
      /* ignore */
    }
    const url = new URL(location.href);
    url.searchParams.delete("lang");
    if (url.href === location.href) location.reload();
    else location.replace(url.href);
  };

  /* ---------- money ---------- */

  const money = new Intl.NumberFormat(Shop.locale, { style: "currency", currency: site.shop.currency });
  const moneyWhole = new Intl.NumberFormat(Shop.locale, {
    style: "currency",
    currency: site.shop.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  /** 1850 → "€ 18,50" (nl) / "€18.50" (en). Whole amounts: "€ 18,-" (nl) / "€18" (en). */
  Shop.money = function (cents) {
    if (cents % 100 === 0) return moneyWhole.format(cents / 100) + (text.meta.wholePriceDash ? ",-" : "");
    return money.format(cents / 100);
  };

  /** A price as an element, with the currency sign in its own span so presets can style it. */
  Shop.price = function (cents, opts) {
    opts = opts || {};
    const str = Shop.money(cents);
    const sign = money.formatToParts(0).find((p) => p.type === "currency").value;
    const num = str.replace(sign, "").trim();
    const signFirst = str.indexOf(sign) < str.indexOf(num.charAt(0));
    // Keep whatever space Intl puts between sign and number ("€ 18,50" in Dutch, "€18.50" in English).
    const space = /\s/.test(str) ? " " : "";
    const parts = [Shop.h("span", { class: "price__sign" }, sign), space, Shop.h("span", { class: "price__num" }, num)];
    return Shop.h(
      opts.was ? "s" : "span",
      { class: "price" + (opts.was ? " price--was" : "") + (opts.className ? " " + opts.className : "") },
      signFirst ? parts : parts.reverse(),
    );
  };

  /* ---------- opening hours ---------- */

  const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  /** Current weekday (0 = monday) and minutes past midnight, in the business's time zone. */
  function now() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: site.timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const part = (type) => parts.find((p) => p.type === type).value;
    return { day: DAYS.indexOf(part("weekday").toLowerCase().slice(0, 3)), minutes: toMinutes(part("hour") + ":" + part("minute")) };
  }

  Shop.hours = {
    DAYS,
    /** Weekday name in the current language; 1 January 2024 was a Monday. */
    dayName(i, style) {
      return new Intl.DateTimeFormat(Shop.locale, { weekday: style || "long", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 1 + i)));
    },
    today() {
      return now().day;
    },
    /** { open, text } e.g. { open: true, text: "Nu open, tot 17:00" } */
    status() {
      const n = now();
      const today = site.hours[DAYS[n.day]];
      if (today && n.minutes >= toMinutes(today[0]) && n.minutes < toMinutes(today[1])) {
        return { open: true, text: Shop.t("hours.openUntil", { time: today[1] }) };
      }
      if (today && n.minutes < toMinutes(today[0])) {
        return { open: false, text: Shop.t("hours.opensToday", { time: today[0] }) };
      }
      for (let i = 1; i <= 7; i++) {
        const d = (n.day + i) % 7;
        const h = site.hours[DAYS[d]];
        if (h) {
          const key = i === 1 ? "hours.opensTomorrow" : "hours.opensOn";
          return { open: false, text: Shop.t(key, { day: Shop.hours.dayName(d), time: h[0] }) };
        }
      }
      return { open: false, text: Shop.t("hours.closed") };
    },
  };

  /* ---------- checks for whoever sets up a new client ---------- */

  // Warns in the console when the accent colour is hard to read on the background (WCAG AA).
  Shop.checkContrast = function () {
    const css = getComputedStyle(document.documentElement);
    const rgb = (c) => {
      const probe = document.body.appendChild(Shop.h("i", { style: "color:" + c + ";display:none" }));
      const v = getComputedStyle(probe).color.match(/[\d.]+/g).slice(0, 3).map(Number);
      probe.remove();
      return v;
    };
    const lum = ([r, g, b]) => {
      const f = (x) => ((x /= 255) <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    // --accent-ink is the accent as used for text; that's the one that has to be readable.
    const a = lum(rgb(css.getPropertyValue("--accent-ink").trim() || css.getPropertyValue("--accent").trim()));
    const b = lum(rgb(css.getPropertyValue("--paper").trim()));
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    if (ratio < 4.5) {
      console.warn("[theme] accent text on background contrast is " + ratio.toFixed(2) + ":1; AA needs 4.5:1. Pick a darker accent, or set theme.accentText in config/site.js.");
    }
  };
})();
