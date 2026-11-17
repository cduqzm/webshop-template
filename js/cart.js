/*
 * The cart: lines saved in localStorage, totals, a quantity control, and the drawer.
 */
(function () {
  "use strict";
  const { h, t, loc, catalog } = Shop;
  const site = Shop.site;
  const STORE_KEY = "cart";
  const listeners = [];

  const keyOf = (id, v) => (v ? id + "::" + v : id);
  // Drop lines for products that no longer exist (e.g. removed from products.js).
  const clean = (list) => (Array.isArray(list) ? list : []).filter((i) => catalog.get(i.id) && i.qty > 0);

  let items = clean(Shop.store.get(STORE_KEY, []));

  function changed() {
    Shop.store.set(STORE_KEY, items);
    listeners.forEach((fn) => fn());
  }

  const cart = (Shop.cart = {
    onChange: (fn) => listeners.push(fn),

    lines() {
      return items.map((i) => {
        const p = catalog.get(i.id);
        const v = catalog.variant(p, i.v);
        const unit = catalog.price(p, v);
        return { key: keyOf(i.id, i.v), p, v, qty: i.qty, unit, total: unit * i.qty, max: catalog.stock(p, v) };
      });
    },

    count: () => items.reduce((n, i) => n + i.qty, 0),

    add(id, variantId, qty) {
      const p = catalog.get(id);
      const max = catalog.stock(p, catalog.variant(p, variantId));
      let line = items.find((i) => keyOf(i.id, i.v) === keyOf(id, variantId));
      if (!line) items.push((line = { id, v: variantId || null, qty: 0 }));
      line.qty += qty || 1;
      if (max != null) line.qty = Math.min(line.qty, max);
      items = clean(items);
      changed();
    },

    setQty(key, qty) {
      const line = items.find((i) => keyOf(i.id, i.v) === key);
      if (!line) return;
      line.qty = qty;
      items = clean(items);
      changed();
    },

    remove(key) {
      items = items.filter((i) => keyOf(i.id, i.v) !== key);
      changed();
    },

    clear() {
      items = [];
      changed();
    },

    /** opts.pickup: collecting from the shop, so no shipping. */
    totals(opts) {
      const pickup = !!(opts && opts.pickup);
      const subtotal = cart.lines().reduce((n, l) => n + l.total, 0);
      const free = site.shop.freeShippingFrom;
      const isFree = pickup || (free != null && subtotal >= free);
      const shipping = subtotal === 0 || isFree ? 0 : site.shop.shippingCost;
      return {
        subtotal,
        shipping,
        pickup,
        isFree,
        untilFree: pickup || free == null || isFree ? null : free - subtotal,
        total: subtotal + shipping,
      };
    },
  });

  // Keep several open tabs in sync.
  window.addEventListener("storage", (e) => {
    if (e.key !== site.id + ":" + STORE_KEY) return;
    items = clean(Shop.store.get(STORE_KEY, []));
    listeners.forEach((fn) => fn());
  });

  /* ---------- quantity control (also used on the product page) ---------- */

  Shop.qty = function (opts) {
    let max = opts.max == null ? null : opts.max;
    const min = 1;
    const input = h("input", {
      class: "qty__input",
      type: "number",
      inputmode: "numeric",
      min,
      value: opts.value || 1,
      "aria-label": opts.label || t("product.quantity"),
      id: opts.id,
      dataset: opts.focusKey ? { focus: opts.focusKey + ":input" } : null,
    });
    const dec = h("button", { type: "button", class: "qty__btn", "aria-label": t("product.decrease"), dataset: opts.focusKey ? { focus: opts.focusKey + ":dec" } : null }, "−");
    const inc = h("button", { type: "button", class: "qty__btn", "aria-label": t("product.increase"), dataset: opts.focusKey ? { focus: opts.focusKey + ":inc" } : null }, "+");

    function set(n, notify) {
      n = Number.isFinite(n) ? n : min;
      n = Math.max(min, max != null ? Math.min(max, n) : n);
      input.value = n;
      input.max = max == null ? "" : max;
      dec.disabled = n <= min;
      inc.disabled = max != null && n >= max;
      if (notify && opts.onChange) opts.onChange(n);
    }
    dec.addEventListener("click", () => set(+input.value - 1, true));
    inc.addEventListener("click", () => set(+input.value + 1, true));
    input.addEventListener("change", () => set(parseInt(input.value, 10), true));
    set(+input.value, false);

    const el = h("div", { class: "qty" }, dec, input, inc);
    el.value = () => +input.value;
    el.setMax = (m) => {
      max = m == null ? null : Math.max(min, m);
      set(+input.value, false);
    };
    return el;
  };

  /* ---------- drawer ---------- */

  let dialog;
  let body;
  let foot;
  let title;

  function lineView(l) {
    const name = loc(l.p.name);
    const href = Shop.productUrl(l.p);
    return h(
      "li",
      { class: "line" },
      h("a", { class: "line__media", href, tabindex: "-1", "aria-hidden": "true" }, Shop.media(l.p.images && l.p.images[0], { label: name, alt: "" })),
      h(
        "div",
        { class: "line__info" },
        h("p", { class: "line__name" }, h("a", { href }, name)),
        l.v && h("p", { class: "line__variant" }, loc(l.p.variants.label) + ": " + loc(l.v.name)),
        h(
          "div",
          { class: "line__actions" },
          Shop.qty({
            value: l.qty,
            max: l.max,
            label: t("cart.quantityOf", { name }),
            focusKey: l.key,
            onChange: (n) => cart.setQty(l.key, n),
          }),
          h("button", { type: "button", class: "line__remove", "aria-label": t("cart.removeItem", { name }), dataset: { focus: l.key + ":rm" }, onclick: () => cart.remove(l.key) }, t("cart.remove")),
        ),
      ),
      h("p", { class: "line__total" }, Shop.price(l.total)),
    );
  }

  Shop.cartSummary = function (opts) {
    const tot = cart.totals(opts);
    const shipping = tot.pickup ? t("cart.pickup") : tot.shipping === 0 ? t("cart.shippingFree") : Shop.price(tot.shipping);
    const note = tot.pickup ? "" : tot.untilFree != null ? t("cart.untilFree", { amount: Shop.money(tot.untilFree) }) + " " : t("cart.freeReached") + " ";
    return h(
      "div",
      { class: "summary" },
      h(
        "dl",
        { class: "summary__rows" },
        h("div", null, h("dt", null, t("cart.subtotal")), h("dd", null, Shop.price(tot.subtotal))),
        h("div", null, h("dt", null, t("cart.shipping")), h("dd", null, shipping)),
        h("div", { class: "summary__total" }, h("dt", null, t("cart.total")), h("dd", null, Shop.price(tot.total))),
      ),
      h("p", { class: "summary__note" }, note, t("cart.vat")),
    );
  };

  Shop.cartLineView = lineView;

  function render() {
    if (!dialog) return;
    // Re-rendering replaces the buttons; remember which one had focus and give it back.
    const focused = document.activeElement && dialog.contains(document.activeElement) ? document.activeElement.dataset.focus : null;
    const lines = cart.lines();
    title.replaceChildren(t("cart.title"), " ", h("span", { class: "drawer__count" }, t("cart.count", { count: cart.count() })));

    if (!lines.length) {
      const first = catalog.categories[0];
      body.replaceChildren(
        h("div", { class: "drawer__empty" }, h("p", null, t("cart.empty")), first && h("a", { class: "arrow-link", href: "shop.html?cat=" + first.id }, t("cart.emptyLink"))),
      );
      foot.replaceChildren();
    } else {
      body.replaceChildren(h("ul", { class: "lines", role: "list" }, lines.map(lineView)));
      foot.replaceChildren(
        Shop.cartSummary(),
        h("a", { class: "button button--block", href: "cart.html#checkout" }, t("cart.checkout")),
        h("a", { class: "drawer__secondary", href: "cart.html" }, t("cart.view")),
      );
    }
    if (focused) {
      const el = dialog.querySelector('[data-focus="' + CSS.escape(focused) + '"]');
      (el && !el.disabled ? el : dialog.querySelector(".drawer__close")).focus();
    }
  }

  function build() {
    title = h("h2", { class: "drawer__title", id: "drawer-title" });
    body = h("div", { class: "drawer__body" });
    foot = h("div", { class: "drawer__foot" });
    dialog = h(
      "dialog",
      { class: "drawer", "aria-labelledby": "drawer-title" },
      h(
        "div",
        { class: "drawer__panel" },
        h("div", { class: "drawer__head" }, title, h("button", { type: "button", class: "drawer__close", onclick: () => cart.close() }, t("nav.close"))),
        body,
        foot,
      ),
    );
    // A click on the backdrop (the dialog itself, outside the panel) closes it.
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) cart.close();
    });
    document.body.append(dialog);
    render();
  }

  // <dialog> with showModal() gives us the focus trap, Escape to close and inert background for free.
  cart.open = function () {
    if (!dialog) build();
    if (dialog.open) return;
    render();
    dialog.showModal();
    document.documentElement.classList.add("is-locked");
  };
  cart.close = function () {
    if (!dialog || !dialog.open) return;
    dialog.classList.add("is-closing");
    const done = () => {
      dialog.classList.remove("is-closing");
      dialog.close();
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) done();
    else setTimeout(done, 220);
  };

  cart.onChange(render);
  document.addEventListener("DOMContentLoaded", () => {
    if (!dialog) build();
    dialog.addEventListener("close", () => document.documentElement.classList.remove("is-locked"));
  });
})();
