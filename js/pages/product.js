/*
 * Product page: product.html?id=<product id>.
 */
(function () {
  "use strict";
  const { h, t, loc, catalog } = Shop;
  const site = Shop.site;
  const main = document.getElementById("main");
  const p = catalog.get(new URLSearchParams(location.search).get("id"));

  if (!p) {
    Shop.setMeta(t("pages.notFound.title"));
    main.replaceChildren(
      h(
        "div",
        { class: "empty-state" },
        h("h1", null, t("product.notFound")),
        h("p", null, t("product.notFoundBody")),
        h("a", { class: "arrow-link", href: site.features.shop ? "shop.html" : "index.html" }, t("product.backToShop")),
      ),
    );
    return;
  }

  const name = loc(p.name);
  const category = catalog.category(p.category);
  Shop.setMeta(name, loc(p.summary));

  // Start on the first variant that's in stock.
  let variant = p.variants ? p.variants.options.find((o) => !catalog.soldOut(p, o)) || p.variants.options[0] : null;

  /* ---------- gallery ---------- */

  const images = p.images && p.images.length ? p.images : [{}];
  const slides = images.map((img, i) =>
    h("figure", { class: "gallery__slide" }, Shop.media(img, { label: loc(img.alt) || name, eager: i === 0, sizes: "(min-width: 900px) 60vw, 100vw" })),
  );
  const track = h("div", { class: "gallery__track", tabindex: "0", role: "region", "aria-label": t("product.gallery") }, slides);
  const count = h("p", { class: "gallery__count", "aria-hidden": "true" });
  const thumbs = images.map((img, i) =>
    h(
      "button",
      { type: "button", class: "gallery__thumb", "aria-label": t("product.showImage", { n: i + 1 }), onclick: () => show(i) },
      Shop.media(img, { label: "", alt: "" }),
    ),
  );

  function show(i) {
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: smooth ? "smooth" : "auto" });
    mark(i);
  }
  function mark(i) {
    count.textContent = t("product.imageCount", { n: i + 1, total: images.length });
    thumbs.forEach((b, j) => b.setAttribute("aria-current", String(i === j)));
  }
  // Swiping (or scrolling) the track updates the counter and thumbnails.
  track.addEventListener("scroll", () => mark(Math.round(track.scrollLeft / track.clientWidth)), { passive: true });
  mark(0);

  const gallery = h(
    "div",
    { class: "pdp__gallery gallery" + (images.length > 1 ? "" : " is-single") },
    track,
    images.length > 1 && [count, h("div", { class: "gallery__thumbs" }, thumbs)],
  );

  /* ---------- buying ---------- */

  // Checkout mode "links": buying goes straight to the product's payment link (Stripe / Mollie).
  const linkMode = site.shop.checkout.mode === "links";
  const priceSlot = h("p", { class: "pdp__price" });
  const stockLine = h("p", { class: "buy__stock" });
  const qtyId = "qty-" + p.id;
  const qty = Shop.qty({ id: qtyId, value: 1, onChange: updateButton });
  const button = h("button", { type: "submit", class: "button button--block buy__submit" });

  function update() {
    const soldOut = catalog.soldOut(p, variant);
    priceSlot.replaceChildren(Shop.priceBlock(p, variant));
    stockLine.textContent = catalog.stockNote(p, variant, true);
    stockLine.classList.toggle("is-low", (catalog.stock(p, variant) ?? 99) <= 3);
    qty.setMax(catalog.stock(p, variant));
    button.disabled = soldOut;
    updateButton();
  }
  function updateButton() {
    const price = Shop.money(catalog.price(p, variant) * (linkMode ? 1 : qty.value()));
    button.textContent = catalog.soldOut(p, variant)
      ? t("product.soldOut")
      : t(linkMode ? "product.buyNow" : "product.addToCartPrice", { price });
  }

  const variantPicker =
    p.variants &&
    h(
      "fieldset",
      { class: "variants" },
      h("legend", { class: "field-label" }, loc(p.variants.label)),
      h(
        "div",
        { class: "variants__options" },
        p.variants.options.map((o) => {
          const out = catalog.soldOut(p, o);
          return h(
            "label",
            { class: "variant" + (out ? " is-soldout" : "") },
            h("input", {
              type: "radio",
              name: "variant",
              value: o.id,
              checked: o === variant,
              disabled: out,
              onchange: () => {
                variant = o;
                update();
              },
            }),
            h("span", { class: "variant__name" }, loc(o.name)),
            out && h("span", { class: "visually-hidden" }, ", " + t("stock.soldOut")),
          );
        }),
      ),
    );

  const form = h(
    "form",
    {
      class: "buy",
      onsubmit: (e) => {
        e.preventDefault();
        if (catalog.soldOut(p, variant)) return;
        if (linkMode) {
          const url = (variant && variant.paymentLink) || p.paymentLink;
          if (url) location.href = url;
          else {
            console.warn("[shop] checkout mode is 'links' but product '" + p.id + "' has no paymentLink; sending the visitor to contact.");
            location.href = "contact.html";
          }
          return;
        }
        Shop.cart.add(p.id, variant && variant.id, qty.value());
        Shop.announce(t("cart.added", { name }));
        Shop.cart.open();
      },
    },
    variantPicker,
    !linkMode && h("div", { class: "buy__qty" }, h("label", { class: "field-label", for: qtyId }, t("product.quantity")), qty),
    button,
    stockLine,
  );

  /* ---------- details ---------- */

  const details =
    p.details &&
    p.details.length > 0 &&
    h(
      "section",
      { class: "pdp__details", "aria-labelledby": "details-title" },
      h("h2", { class: "field-label", id: "details-title" }, t("product.details")),
      h(
        "dl",
        { class: "details" },
        p.details.map((d) => h("div", null, h("dt", null, loc(d.label)), h("dd", null, loc(d.value)))),
      ),
    );

  const info = h(
    "div",
    { class: "pdp__info" },
    h(
      "nav",
      { class: "crumbs", "aria-label": "Breadcrumb" },
      h(
        "ol",
        { role: "list" },
        h("li", null, h("a", { href: "shop.html" }, t("nav.shop"))),
        category && h("li", null, h("a", { href: "shop.html?cat=" + encodeURIComponent(category.id) }, loc(category.name))),
      ),
    ),
    h("h1", { class: "pdp__name" }, name),
    priceSlot,
    h("p", { class: "pdp__summary" }, loc(p.summary)),
    site.features.shop && form,
    h("p", { class: "pdp__dispatch" }, t("product.dispatch", { days: site.shop.dispatchDays })),
    h("div", { class: "pdp__description prose" }, h("p", null, loc(p.description))),
    details,
  );

  /* ---------- related: same category first, then the rest ---------- */

  const related = [...catalog.inCategory(p.category), ...catalog.products]
    .filter((x, i, arr) => x !== p && arr.indexOf(x) === i && !catalog.soldOut(x))
    .slice(0, 4);

  main.replaceChildren(
    h("div", { class: "pdp" }, gallery, info),
    related.length > 0 &&
      h(
        "section",
        { class: "related", "aria-labelledby": "related-title" },
        h("h2", { class: "section-title", id: "related-title" }, t("product.related")),
        h("div", { class: "related__grid" }, related.map((r) => Shop.productCard(r))),
      ),
  );
  update();

  /* ---------- structured data for search engines ---------- */

  const stock = catalog.stock(p, variant);
  document.head.append(
    h(
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description: loc(p.description),
        image: images.filter((i) => i.src).map((i) => new URL(i.src, site.url + "/").href),
        brand: { "@type": "Brand", name: site.name },
        offers: {
          "@type": "Offer",
          price: (catalog.price(p, variant) / 100).toFixed(2),
          priceCurrency: site.shop.currency,
          availability: "https://schema.org/" + (stock === 0 ? "OutOfStock" : "InStock"),
          url: site.url + "/" + Shop.productUrl(p),
        },
      }),
    ),
  );
})();
