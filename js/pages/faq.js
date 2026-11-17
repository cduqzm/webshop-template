/*
 * FAQ: questions from content/<lang>.js (faq.items), as real <details> elements.
 */
(function () {
  "use strict";
  const { h, t } = Shop;
  const main = document.getElementById("main");
  const items = Shop.raw("faq.items") || [];

  main.replaceChildren(
    h("div", { class: "page-head" }, h("h1", { class: "page-title" }, t("faq.title")), h("p", { class: "page-intro", rich: t("faq.lead") })),
    h(
      "div",
      { class: "faq" },
      items.map((item, i) =>
        h(
          "details",
          { class: "faq__item", open: i === 0 },
          h("summary", { class: "faq__q" }, h("span", { class: "faq__num", "aria-hidden": "true" }, String(i + 1).padStart(2, "0")), h("span", null, Shop.fill(item.q))),
          h("div", { class: "faq__a" }, h("p", { rich: Shop.fill(item.a) })),
        ),
      ),
    ),
  );
})();
