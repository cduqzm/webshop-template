/*
 * Privacy, terms, and shipping & returns. Which one depends on <body data-page="privacy|terms|shipping">;
 * the text lives in content/<lang>.js under legal.<page>.
 */
(function () {
  "use strict";
  const { h, t } = Shop;
  const site = Shop.site;
  const page = document.body.dataset.page;
  const doc = Shop.raw("legal." + page);
  const main = document.getElementById("main");
  if (!doc) return;

  // Values the shipping page needs that aren't plain config fields.
  const vars = {
    shippingCost: Shop.money(site.shop.shippingCost),
    freeFrom: site.shop.freeShippingFrom != null ? Shop.money(site.shop.freeShippingFrom) : "—",
  };

  main.replaceChildren(
    h(
      "article",
      { class: "legal" },
      h("p", { class: "legal__note", rich: t("legal.templateNote") }),
      h("h1", { class: "page-title" }, doc.title),
      h("p", { class: "legal__updated", rich: t("legal.updated") }),
      h(
        "div",
        { class: "legal__body prose" },
        doc.sections.map((s) => [h("h2", null, s.h), s.p.map((p) => h("p", { rich: Shop.fill(p, vars) }))]),
      ),
    ),
  );
})();
