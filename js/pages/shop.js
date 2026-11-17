/*
 * Shop: category filter and sort, kept in the URL (shop.html?cat=kaarsen&sort=price-asc).
 * With features.shop off, this page shows a price list instead ("what we offer").
 */
(function () {
  "use strict";
  const { h, t, loc, catalog } = Shop;
  const site = Shop.site;
  const main = document.getElementById("main");
  const params = new URLSearchParams(location.search);

  if (!site.features.shop) {
    Shop.setMeta(t("pages.offer.title"), t("pages.offer.description"));
    main.replaceChildren(
      h("div", { class: "page-head" }, h("h1", { class: "page-title" }, t("shop.offerTitle"))),
      h("div", { class: "offer" }, Shop.priceList({ heading: "h2" }), h("p", { class: "pricelist__vat" }, t("pricelist.note"))),
    );
    return;
  }

  const SORTS = {
    new: { key: "shop.sortNew", fn: (a, b) => (b.added || "").localeCompare(a.added || "") },
    "price-asc": { key: "shop.sortPriceAsc", fn: (a, b) => catalog.price(a) - catalog.price(b) },
    "price-desc": { key: "shop.sortPriceDesc", fn: (a, b) => catalog.price(b) - catalog.price(a) },
  };
  let cat = catalog.category(params.get("cat")) ? params.get("cat") : null;
  let sort = SORTS[params.get("sort")] ? params.get("sort") : "new";

  const title = h("h1", { class: "page-title" });
  const intro = h("p", { class: "page-intro" });
  const count = h("p", { class: "shop__count", "aria-live": "polite" });
  const grid = h("div", { class: "shop__grid" });

  const filterButtons = [{ id: null, name: t("shop.all"), n: catalog.products.length }]
    .concat(catalog.categories.map((c) => ({ id: c.id, name: loc(c.name), n: catalog.inCategory(c.id).length })))
    .map((f) =>
      h(
        "button",
        { type: "button", class: "filter", dataset: { cat: f.id || "" }, onclick: () => setCategory(f.id) },
        h("span", { class: "filter__name" }, f.name),
        h("span", { class: "filter__n" }, String(f.n)),
      ),
    );

  const sortId = "shop-sort";
  const sortSelect = h(
    "select",
    { id: sortId, class: "select", onchange: (e) => ((sort = e.target.value), render()) },
    Object.entries(SORTS).map(([value, s]) => h("option", { value, selected: value === sort }, t(s.key))),
  );

  function setCategory(id) {
    cat = id;
    render();
  }

  function render() {
    const category = cat && catalog.category(cat);
    title.textContent = category ? loc(category.name) : t("shop.title");
    intro.textContent = category ? loc(category.note) : t("shop.intro");
    filterButtons.forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.cat || null) === cat)));

    // Sold-out items always go last, whatever the sort.
    const items = (cat ? catalog.inCategory(cat) : catalog.products.slice()).sort(
      (a, b) => catalog.soldOut(a) - catalog.soldOut(b) || SORTS[sort].fn(a, b),
    );
    count.textContent = t("shop.count", { count: items.length });
    grid.replaceChildren(
      ...(items.length
        ? items.map((p, i) => Shop.productCard(p, { eager: i < 4, heading: "h2" }))
        : [h("div", { class: "shop__empty" }, h("p", null, t("shop.empty")), h("button", { type: "button", class: "arrow-link", onclick: () => setCategory(null) }, t("shop.emptyLink")))]),
    );

    const url = new URL(location.href);
    cat ? url.searchParams.set("cat", cat) : url.searchParams.delete("cat");
    sort !== "new" ? url.searchParams.set("sort", sort) : url.searchParams.delete("sort");
    history.replaceState(null, "", url);
    Shop.setMeta(category ? loc(category.name) : t("pages.shop.title"), category ? loc(category.note) : t("pages.shop.description"));
  }

  main.replaceChildren(
    h("div", { class: "page-head" }, title, intro),
    h(
      "div",
      { class: "shop__bar" },
      h("div", { class: "shop__filters", role: "group", "aria-label": t("shop.filter") }, filterButtons),
      h("div", { class: "shop__sort" }, h("label", { for: sortId, class: "field-label" }, t("shop.sort")), sortSelect),
    ),
    count,
    grid,
  );
  render();
})();
