/*
 * Cart page with checkout. There's no backend, so an order is sent as a message:
 *   checkout.mode "email"    → to the form service in checkout.formEndpoint, or the visitor's email app
 *   checkout.mode "whatsapp" → a prefilled WhatsApp message to contact.whatsapp
 * After sending, the order is kept in sessionStorage so confirm.html can show it, and the cart is emptied.
 *
 * PLUGGING IN REAL PAYMENTS LATER: replace placeOrder() below with a call to your own small server
 * function (e.g. a Vercel/Netlify function) that creates a Mollie or Stripe Checkout payment and returns
 * its URL; then redirect to that URL. Set the payment's return URL to confirm.html?paid=1. See README.
 */
(function () {
  "use strict";
  const { h, t, loc, catalog } = Shop;
  const site = Shop.site;
  const main = document.getElementById("main");
  const mode = site.shop.checkout.mode === "whatsapp" ? "whatsapp" : "email";

  if (!site.features.shop) {
    location.replace("index.html");
    return;
  }

  /* ---------- order text, shared by email and WhatsApp ---------- */

  function orderNumber() {
    const initials = site.name.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 3);
    const d = new Date();
    const date = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    return initials + "-" + date + "-" + String(Math.floor(Math.random() * 900) + 100);
  }

  function orderText(order) {
    const c = order.customer;
    const rows = [
      t("checkout.orderIntro"),
      "",
      t("checkout.order") + " " + order.number,
      "",
      ...order.lines.map((l) => l.qty + " × " + l.name + (l.variant ? " (" + l.variant + ")" : "") + " — " + Shop.money(l.total)),
      "",
      t("cart.subtotal") + ": " + Shop.money(order.subtotal),
      t("cart.shipping") + ": " + (order.pickup ? t("cart.pickup") : order.shipping ? Shop.money(order.shipping) : t("cart.shippingFree")),
      t("cart.total") + ": " + Shop.money(order.total),
      "",
      t("checkout.name") + ": " + c.name,
      t("checkout.email") + ": " + c.email,
      c.phone && t("checkout.phone") + ": " + c.phone,
      order.pickup ? t("checkout.pickup") : t("checkout.deliver") + ": " + [c.street, c.postcode + " " + c.city, c.country].filter(Boolean).join(", "),
      c.note && t("checkout.note") + ": " + c.note,
    ];
    return rows.filter((r) => r !== null && r !== undefined && r !== false).join("\n");
  }

  /* ---------- layout ---------- */

  const linesEl = h("ul", { class: "lines lines--page", role: "list" });
  const summaryEl = h("div", { class: "cart-page__summary" });
  let pickup = false;

  function renderLines() {
    const lines = Shop.cart.lines();
    if (!lines.length) {
      const first = catalog.categories[0];
      main.replaceChildren(
        h("div", { class: "page-head" }, h("h1", { class: "page-title" }, t("cart.title"))),
        h("div", { class: "empty-state" }, h("p", { class: "empty-state__text" }, t("cart.empty")), first && h("a", { class: "arrow-link", href: "shop.html?cat=" + first.id }, t("cart.emptyLink"))),
      );
      return false;
    }
    const focused = linesEl.contains(document.activeElement) ? document.activeElement.dataset.focus : null;
    linesEl.replaceChildren(...lines.map(Shop.cartLineView));
    summaryEl.replaceChildren(Shop.cartSummary({ pickup }));
    if (focused) {
      const el = linesEl.querySelector('[data-focus="' + CSS.escape(focused) + '"]');
      if (el && !el.disabled) el.focus();
    }
    return true;
  }

  /* ---------- checkout form ---------- */

  const status = Shop.formStatus();
  const submit = h("button", { type: "submit", class: "button button--block" }, t(mode === "whatsapp" ? "checkout.submitWhatsapp" : "checkout.submitEmail"));

  const address = h(
    "div",
    { class: "checkout__address" },
    Shop.field({ name: "street", label: t("checkout.street"), required: true, autocomplete: "street-address" }),
    h(
      "div",
      { class: "field-row" },
      Shop.field({ name: "postcode", label: t("checkout.postcode"), required: true, autocomplete: "postal-code" }),
      Shop.field({ name: "city", label: t("checkout.city"), required: true, autocomplete: "address-level2" }),
    ),
    Shop.field({ name: "country", label: t("checkout.country"), required: true, autocomplete: "country-name", value: Shop.lang === "nl" ? "Nederland" : "Netherlands" }),
  );
  const pickupNote = h("p", { class: "checkout__pickup-note", hidden: true }, t("checkout.pickupNote"));

  function setPickup(value) {
    pickup = value;
    address.hidden = pickup;
    pickupNote.hidden = !pickup;
    summaryEl.replaceChildren(Shop.cartSummary({ pickup }));
  }

  const termsId = "f-agree";
  const form = h(
    "form",
    { class: "checkout", id: "checkout", novalidate: true, "aria-labelledby": "checkout-title" },
    h("h2", { class: "checkout__title", id: "checkout-title" }, t("checkout.title")),
    h(
      "fieldset",
      { class: "checkout__group" },
      h("legend", { class: "field-label" }, t("checkout.yourDetails")),
      Shop.field({ name: "name", label: t("checkout.name"), required: true, autocomplete: "name" }),
      Shop.field({ name: "email", label: t("checkout.email"), type: "email", required: true, autocomplete: "email" }),
      Shop.field({ name: "phone", label: t("checkout.phone"), type: "tel", autocomplete: "tel", hint: t("checkout.phoneHint") }),
    ),
    h(
      "fieldset",
      { class: "checkout__group" },
      h("legend", { class: "field-label" }, t("checkout.delivery")),
      h(
        "div",
        { class: "choice-row" },
        h("label", { class: "choice" }, h("input", { type: "radio", name: "delivery", value: "deliver", checked: true, onchange: () => setPickup(false) }), h("span", null, t("checkout.deliver"))),
        h("label", { class: "choice" }, h("input", { type: "radio", name: "delivery", value: "pickup", onchange: () => setPickup(true) }), h("span", null, t("checkout.pickup"))),
      ),
      address,
      pickupNote,
    ),
    Shop.field({ name: "note", label: t("checkout.note"), rows: 3, hint: t("checkout.noteHint") }),
    h(
      "div",
      { class: "field field--check" },
      h(
        "label",
        { class: "check", for: termsId },
        h("input", { type: "checkbox", id: termsId, name: "agree", required: true, "aria-describedby": termsId + "-error" }),
        h("span", null, t("checkout.agreeBefore"), h("a", { href: "terms.html", target: "_blank" }, t("checkout.agreeLink")), t("checkout.agreeAfter")),
      ),
      h("p", { class: "field__error", id: termsId + "-error" }),
    ),
    h("p", { class: "checkout__mode" }, t(mode === "whatsapp" ? "checkout.modeWhatsapp" : "checkout.modeEmail")),
    submit,
    status,
  );
  Shop.liveValidation(form);

  async function placeOrder(order) {
    const text = orderText(order);
    const subject = t("checkout.orderSubject", { number: order.number });
    if (mode === "whatsapp") {
      const url = "https://wa.me/" + site.contact.whatsapp.replace(/\D/g, "") + "?text=" + encodeURIComponent(text);
      order.retry = url;
      window.open(url, "_blank", "noopener");
      return "whatsapp";
    }
    order.retry = "mailto:" + site.contact.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
    const result = await Shop.send(
      site.shop.checkout.formEndpoint,
      { _subject: subject, number: order.number, name: order.customer.name, email: order.customer.email, order: text, total: Shop.money(order.total) },
      { to: site.contact.email, subject, body: text },
    );
    return result === "sent" ? "email" : "mailto";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    if (!Shop.validate(form)) return;

    const data = Shop.formData(form);
    const tot = Shop.cart.totals({ pickup });
    const order = {
      number: orderNumber(),
      pickup,
      lines: Shop.cart.lines().map((l) => ({ name: loc(l.p.name), variant: l.v ? loc(l.p.variants.label) + ": " + loc(l.v.name) : "", qty: l.qty, total: l.total })),
      subtotal: tot.subtotal,
      shipping: tot.shipping,
      total: tot.total,
      customer: data,
    };

    submit.disabled = true;
    submit.textContent = t("checkout.sending");
    try {
      const how = await placeOrder(order);
      try {
        sessionStorage.setItem(site.id + ":lastOrder", JSON.stringify(order));
      } catch (err) {
        /* confirm page will show a shorter message */
      }
      // confirm.html empties the cart; doing it here would flash "your basket is empty" first.
      // Give the email app / WhatsApp a moment to open before leaving the page.
      setTimeout(() => location.assign("confirm.html?mode=" + how), how === "email" ? 0 : 700);
    } catch (err) {
      console.error(err);
      status.textContent = t("checkout.failed");
      submit.disabled = false;
      submit.textContent = t(mode === "whatsapp" ? "checkout.submitWhatsapp" : "checkout.submitEmail");
    }
  });

  /* ---------- page ---------- */

  if (renderLines()) {
    main.replaceChildren(
      h("div", { class: "page-head" }, h("h1", { class: "page-title" }, t("cart.title"))),
      h("div", { class: "cart-page" }, h("div", { class: "cart-page__lines" }, linesEl, summaryEl), form),
    );
    if (location.hash === "#checkout") form.scrollIntoView();
  }
  // Re-render the lines when quantities change, but leave the form (and what's typed in it) alone.
  Shop.cart.onChange(renderLines);
})();
