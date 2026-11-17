/*
 * Product lookups, prices and stock, images (or their placeholders) and the product card.
 */
(function () {
  "use strict";
  const { h, t, loc } = Shop;
  const data = window.CATALOG;
  const byId = new Map(data.products.map((p) => [p.id, p]));

  const catalog = (Shop.catalog = {
    categories: data.categories,
    products: data.products,
    get: (id) => byId.get(id),
    category: (id) => data.categories.find((c) => c.id === id),
    inCategory: (id) => data.products.filter((p) => p.category === id),

    variant(p, id) {
      return p.variants ? p.variants.options.find((o) => o.id === id) || null : null;
    },

    /** Price actually paid. A variant's own price wins; otherwise the sale price if there is one. */
    price(p, v) {
      if (v && v.price != null) return v.price;
      return p.salePrice != null ? p.salePrice : p.price;
    },

    /** The struck-through price, or null when the item isn't reduced. */
    wasPrice(p, v) {
      if (v && v.price != null) return null;
      return p.salePrice != null ? p.price : null;
    },

    /** Lowest price over all variants, for "from € 14,50" on cards. */
    fromPrice(p) {
      if (!p.variants) return null;
      const prices = p.variants.options.map((o) => catalog.price(p, o));
      const min = Math.min(...prices);
      return min === Math.max(...prices) ? null : min;
    },

    /** Stock as a number, or null for unlimited / made to order. Without a variant: the sum of all. */
    stock(p, v) {
      if (v) return v.stock === undefined ? p.stock : v.stock;
      if (p.variants && p.variants.options.some((o) => o.stock !== undefined)) {
        const s = p.variants.options.map((o) => (o.stock === undefined ? p.stock : o.stock));
        return s.includes(null) ? null : s.reduce((a, b) => a + b, 0);
      }
      return p.stock;
    },

    soldOut(p, v) {
      return catalog.stock(p, v) === 0;
    },

    /** "3 left", "sold out", "made to order" or "" when there's nothing worth saying. */
    stockNote(p, v, long) {
      const s = catalog.stock(p, v);
      if (s === 0) return t("stock.soldOut");
      if (s === null) return p.madeToOrder ? t("stock.madeToOrder") : "";
      if (s <= 3) return t(long ? "stock.leftLong" : "stock.left", { count: s });
      return long ? t("stock.inStock") : "";
    },
  });

  /**
   * An image, or a placeholder in the given tone when there's no src yet.
   * Placeholders show what the photo is of and its aspect ratio, like a layout sketch.
   */
  Shop.media = function (img, opts) {
    opts = opts || {};
    img = img || {};
    const ratio = img.ratio || opts.ratio || "4/5";
    const cls = "media" + (opts.className ? " " + opts.className : "");
    const alt = opts.alt != null ? opts.alt : loc(img.alt);
    if (img.src) {
      const [rw, rh] = ratio.split("/").map(Number);
      return h(
        "div",
        { class: cls, style: "--ratio:" + ratio },
        h("img", {
          src: img.src,
          srcset: img.srcset,
          sizes: img.srcset ? opts.sizes || "100vw" : null,
          alt,
          width: img.width || rw * 300,
          height: img.height || rh * 300,
          loading: opts.eager ? "eager" : "lazy",
          decoding: "async",
        }),
      );
    }
    return h(
      "div",
      {
        class: cls + " media--ph",
        style: "--ratio:" + ratio,
        dataset: { tone: img.tone || "wax" },
        role: alt ? "img" : null,
        "aria-label": alt || null,
      },
      h("span", { class: "ph__label", "aria-hidden": "true" }, opts.label || alt),
      h("span", { class: "ph__ratio", "aria-hidden": "true" }, ratio.replace("/", ":")),
    );
  };

  /** Price block for cards and the product page: "from", sale and normal prices. */
  Shop.priceBlock = function (p, v) {
    const was = catalog.wasPrice(p, v);
    const from = v ? null : catalog.fromPrice(p);
    return h(
      "span",
      { class: "price-block" + (was ? " is-sale" : "") },
      from != null && h("span", { class: "price-block__from" }, t("price.from") + " "),
      was != null && [Shop.price(was, { was: true }), " "],
      Shop.price(from != null ? from : catalog.price(p, v)),
    );
  };

  /**
   * A price list grouped by category: for businesses without a shop (barber, bakery, studio),
   * and for the home "pricelist" section. Products are listed with summary and price, no cart.
   */
  Shop.priceList = function (opts) {
    opts = opts || {};
    const Heading = opts.heading || "h3";
    return h(
      "div",
      { class: "pricelist" },
      catalog.categories
        .filter((c) => !opts.only || c.id === opts.only)
        .map((c) =>
          h(
            "section",
            { class: "pricelist__group" },
            h(Heading, { class: "pricelist__title" }, loc(c.name)),
            c.note && h("p", { class: "pricelist__note" }, loc(c.note)),
            h(
              "ul",
              { class: "pricelist__items", role: "list" },
              catalog.inCategory(c.id).map((p) =>
                h(
                  "li",
                  { class: "pricelist__item" + (catalog.soldOut(p) ? " is-soldout" : "") },
                  h("span", { class: "pricelist__name" }, loc(p.name)),
                  h("span", { class: "pricelist__price" }, Shop.priceBlock(p)),
                  p.summary && h("span", { class: "pricelist__summary" }, loc(p.summary)),
                ),
              ),
            ),
          ),
        ),
    );
  };

  Shop.productUrl = (p) => "product.html?id=" + encodeURIComponent(p.id);

  Shop.productCard = function (p, opts) {
    opts = opts || {};
    const href = Shop.productUrl(p);
    const name = loc(p.name);
    const images = p.images || [];
    const soldOut = catalog.soldOut(p);
    const note = catalog.stockNote(p);
    const isNew = (p.tags || []).includes("new");
    const Heading = opts.heading || "h3";
    return h(
      "article",
      { class: "card" + (soldOut ? " is-soldout" : "") + (images[1] ? " has-alt" : "") },
      // The image link is hidden from screen readers and tab order; the name link below is the real one.
      h(
        "a",
        { href, class: "card__media", tabindex: "-1", "aria-hidden": "true" },
        Shop.media(images[0], { label: name, alt: "", eager: opts.eager }),
        images[1] && Shop.media(images[1], { label: name, alt: "", className: "media--alt" }),
        isNew && !soldOut && h("span", { class: "card__flag" }, t("stock.new")),
      ),
      h(
        "div",
        { class: "card__body" },
        h(Heading, { class: "card__name" }, h("a", { href }, name)),
        h("p", { class: "card__meta" }, Shop.priceBlock(p), note && h("span", { class: "card__note" }, note)),
      ),
    );
  };
})();
