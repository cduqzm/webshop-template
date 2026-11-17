/*
 * Header, mobile menu and footer, built once from config. Also fills all data-t text on the page
 * and removes elements whose feature is switched off (data-feature="shop", or "!shop" for the opposite).
 */
(function () {
  "use strict";
  const { h, t, loc } = Shop;
  const site = Shop.site;
  const features = site.features;
  const page = document.body.dataset.page;

  /* ---------- feature switches ---------- */

  document.querySelectorAll("[data-feature]").forEach((el) => {
    const name = el.dataset.feature.replace("!", "");
    const wanted = !el.dataset.feature.startsWith("!");
    if (!!features[name] !== wanted) el.remove();
  });

  /* ---------- pieces ---------- */

  function navItems() {
    return [
      // Without a shop, the same page becomes a price list ("what we offer").
      Shop.catalog.products.length > 0 && { page: "shop", href: "shop.html", key: features.shop ? "nav.shop" : "nav.offer" },
      { page: "about", href: "about.html", key: "nav.about" },
      features.blog && { page: "blog", href: "blog.html", key: "nav.blog" },
      { page: "contact", href: "contact.html", key: "nav.contact" },
      features.booking && site.booking.url && { href: site.booking.url, key: "nav.booking", external: true },
    ].filter(Boolean);
  }

  function navLink(item) {
    return h(
      "a",
      {
        href: item.href,
        "aria-current": item.page === page ? "page" : null,
        rel: item.external ? "noopener" : null,
        target: item.external ? "_blank" : null,
      },
      t(item.key),
    );
  }

  function wordmark() {
    return h(
      "a",
      { class: "wordmark", href: "index.html", "aria-current": page === "home" ? "page" : null },
      site.logo ? h("img", { src: site.logo, alt: site.name, height: 32 }) : site.name,
    );
  }

  function languageSwitch() {
    if (site.languages.length < 2) return null;
    return h(
      "div",
      { class: "lang", role: "group", "aria-label": t("nav.language") },
      site.languages.map((code, i) => {
        const meta = window.CONTENT[code].meta;
        return [
          i > 0 && h("span", { class: "lang__sep", "aria-hidden": "true" }, "/"),
          h(
            "button",
            {
              type: "button",
              lang: code,
              "aria-pressed": String(code === Shop.lang),
              "aria-label": meta.name,
              onclick: () => code !== Shop.lang && Shop.setLanguage(code),
            },
            meta.label,
          ),
        ];
      }),
    );
  }

  function cartButton() {
    // No cart without a shop, and none in "links" mode where every product has its own payment link.
    if (!features.shop || site.shop.checkout.mode === "links") return null;
    const count = h("span", { class: "cart-button__count" });
    const btn = h("button", { type: "button", class: "cart-button", "aria-haspopup": "dialog", onclick: () => Shop.cart.open() }, h("span", { class: "cart-button__label" }, t("nav.cart")), " ", count);
    const update = () => {
      const n = Shop.cart.count();
      count.textContent = "(" + n + ")";
      btn.setAttribute("aria-label", t("nav.cart") + ", " + t("cart.count", { count: n }));
      btn.classList.toggle("has-items", n > 0);
    };
    Shop.cart.onChange(update);
    update();
    return btn;
  }

  function hoursStatus() {
    if (!features.openingHours) return null;
    const s = Shop.hours.status();
    return h("p", { class: "status" + (s.open ? " is-open" : "") }, h("span", { class: "status__dot", "aria-hidden": "true" }), s.text);
  }

  /* ---------- mobile menu ---------- */

  let menu;
  function openMenu() {
    if (!menu) {
      menu = h(
        "dialog",
        { class: "menu", "aria-label": t("nav.main") },
        h(
          "div",
          { class: "menu__panel" },
          h("div", { class: "menu__head" }, wordmark(), h("button", { type: "button", class: "menu__close", onclick: () => menu.close() }, t("nav.close"))),
          h("nav", { class: "menu__nav", "aria-label": t("nav.main") }, h("ul", { role: "list" }, [{ page: "home", href: "index.html", key: "nav.home" }, ...navItems()].map((i) => h("li", null, navLink(i))))),
          h("div", { class: "menu__foot" }, hoursStatus(), languageSwitch()),
        ),
      );
      document.body.append(menu);
      menu.addEventListener("close", () => document.documentElement.classList.remove("is-locked"));
    }
    menu.showModal();
    document.documentElement.classList.add("is-locked");
  }

  /* ---------- header ---------- */

  const header = document.getElementById("site-header");
  if (header) {
    header.className = "site-header";
    header.replaceChildren(
      h("a", { class: "skip-link", href: "#main" }, t("nav.skip")),
      h(
        "div",
        { class: "site-header__inner" },
        wordmark(),
        h("nav", { class: "site-nav", "aria-label": t("nav.main") }, h("ul", { role: "list" }, navItems().map((i) => h("li", null, navLink(i))))),
        h(
          "div",
          { class: "site-header__tools" },
          languageSwitch(),
          cartButton(),
          h("button", { type: "button", class: "menu-button", "aria-haspopup": "dialog", onclick: openMenu }, t("nav.menu")),
        ),
      ),
    );
  }

  /* ---------- footer ---------- */

  function list(items) {
    return h("ul", { role: "list" }, items.filter(Boolean).map((i) => h("li", null, i)));
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    const a = site.address;
    const c = site.contact;
    footer.className = "site-footer";
    footer.replaceChildren(
      h(
        "div",
        { class: "site-footer__grid" },
        h(
          "div",
          { class: "site-footer__about" },
          h("p", { class: "site-footer__made", rich: t("footer.made") }),
          h("address", null, h("span", { rich: a.street }), h("br"), h("span", { rich: a.postcode + " " + a.city })),
          hoursStatus(),
        ),
        features.shop &&
          h(
            "div",
            { class: "site-footer__col" },
            h("h2", null, t("footer.shop")),
            list(Shop.catalog.categories.map((cat) => h("a", { href: "shop.html?cat=" + cat.id }, loc(cat.name)))),
          ),
        !features.shop &&
          Shop.catalog.products.length > 0 &&
          h("div", { class: "site-footer__col" }, h("h2", null, t("nav.offer")), list([h("a", { href: "shop.html" }, t("pricelist.title"))])),
        h(
          "div",
          { class: "site-footer__col" },
          h("h2", null, t("footer.info")),
          list([
            h("a", { href: "about.html" }, t("nav.about")),
            h("a", { href: "contact.html" }, t("nav.contact")),
            features.faq && h("a", { href: "faq.html" }, t("nav.faq")),
            features.shop && h("a", { href: "shipping.html" }, t("footer.shipping")),
            h("a", { href: "terms.html" }, t("footer.terms")),
            h("a", { href: "privacy.html" }, t("footer.privacy")),
          ]),
        ),
        h(
          "div",
          { class: "site-footer__col" },
          h("h2", null, t("footer.follow")),
          list([
            ...site.socials.map((s) => h("a", { href: s.url, rel: "noopener" }, s.label)),
            h("a", { href: "mailto:" + c.email, rich: c.email }),
          ]),
        ),
      ),
      h("p", { class: "site-footer__mark", "aria-hidden": "true" }, site.name),
      h(
        "div",
        { class: "site-footer__legal" },
        h(
          "p",
          null,
          h("span", { rich: site.business.legalName }),
          h("span", { rich: t("footer.kvk") + " " + site.business.kvk }),
          h("span", { rich: t("footer.btw") + " " + site.business.btw }),
          h("span", null, "© " + new Date().getFullYear()),
        ),
        languageSwitch(),
      ),
    );
  }

  /* ---------- consent: only when analytics is switched on ---------- */

  // With analytics off (the default) nothing is tracked and no banner is needed.
  if (features.analytics && site.analytics && site.analytics.src) {
    const load = () => document.head.append(h("script", { src: site.analytics.src, defer: true, ...(site.analytics.attrs || {}) }));
    const choice = Shop.store.get("consent", null);
    if (choice === "yes") load();
    else if (choice === null) {
      const banner = h(
        "section",
        { class: "consent", "aria-label": t("consent.more") },
        h("p", null, t("consent.text"), " ", h("a", { href: "privacy.html" }, t("consent.more"))),
        h(
          "div",
          { class: "consent__actions" },
          h("button", { type: "button", class: "button", onclick: () => decide("yes") }, t("consent.accept")),
          h("button", { type: "button", class: "button button--quiet", onclick: () => decide("no") }, t("consent.decline")),
        ),
      );
      const decide = (value) => {
        Shop.store.set("consent", value);
        if (value === "yes") load();
        banner.remove();
      };
      document.body.append(banner);
    }
  }

  /* ---------- text, meta, checks ---------- */

  Shop.applyText(document);
  const pageText = window.CONTENT[Shop.lang].pages[page];
  if (pageText && page !== "product" && page !== "post") Shop.setMeta(t("pages." + page + ".title"), t("pages." + page + ".description"));
  if (location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1") Shop.checkContrast();
})();
