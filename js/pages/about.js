/*
 * About: text from content/<lang>.js (about.*), photos from site.images.about / about2.
 */
(function () {
  "use strict";
  const { h, t } = Shop;
  const site = Shop.site;
  const main = document.getElementById("main");
  const raw = (k) => Shop.raw("about." + k) || [];

  main.replaceChildren(
    h(
      "div",
      { class: "about" },
      h("p", { class: "about__kicker" }, t("about.title")),
      h("h1", { class: "about__line", rich: t("about.line") }),
      h("div", { class: "about__media" }, Shop.media(site.images.about, { label: t("about.imageLabel"), alt: t("about.imageLabel"), eager: true })),
      h("div", { class: "about__body prose" }, raw("body").map((p) => h("p", { rich: Shop.fill(p) }))),
      h("div", { class: "about__media2" }, Shop.media(site.images.about2, { label: t("about.image2Label"), alt: t("about.image2Label") })),
      h(
        "section",
        { class: "about__facts", "aria-labelledby": "facts-title" },
        h("h2", { class: "field-label", id: "facts-title" }, t("about.factsTitle")),
        h("dl", { class: "details" }, raw("facts").map((f) => h("div", null, h("dt", null, f.label), h("dd", null, f.value)))),
      ),
      h(
        "section",
        { class: "about__people", "aria-labelledby": "people-title" },
        h("h2", { class: "field-label", id: "people-title" }, t("about.peopleTitle")),
        h("ul", { role: "list" }, raw("people").map((p) => h("li", null, h("span", { class: "about__name" }, p.name), h("span", { class: "about__role" }, p.role)))),
      ),
      h("a", { class: "arrow-link about__cta", href: "contact.html" }, t("about.cta")),
    ),
  );
})();
