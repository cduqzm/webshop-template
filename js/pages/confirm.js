/*
 * Order confirmation: confirm.html?mode=email|mailto|whatsapp, or ?paid=1 when a payment provider
 * (Stripe Payment Link, Mollie) sends the customer back after paying.
 */
(function () {
  "use strict";
  const { h, t } = Shop;
  const site = Shop.site;
  const main = document.getElementById("main");
  const params = new URLSearchParams(location.search);
  const mode = params.has("paid") ? "paid" : ["email", "mailto", "whatsapp"].includes(params.get("mode")) ? params.get("mode") : "email";

  let order = null;
  try {
    order = JSON.parse(sessionStorage.getItem(site.id + ":lastOrder"));
  } catch (e) {
    /* no order: show the general message */
  }
  if (order || mode === "paid") Shop.cart.clear();

  const summary =
    order &&
    h(
      "section",
      { class: "confirm__order", "aria-labelledby": "order-title" },
      h("h2", { class: "field-label", id: "order-title" }, t("confirm.summary")),
      h(
        "ul",
        { class: "confirm__lines", role: "list" },
        order.lines.map((l) => h("li", null, h("span", null, l.qty + " × " + l.name + (l.variant ? " · " + l.variant : "")), Shop.price(l.total))),
      ),
      h(
        "dl",
        { class: "summary__rows" },
        h("div", null, h("dt", null, t("cart.shipping")), h("dd", null, order.pickup ? t("cart.pickup") : order.shipping ? Shop.price(order.shipping) : t("cart.shippingFree"))),
        h("div", { class: "summary__total" }, h("dt", null, t("cart.total")), h("dd", null, Shop.price(order.total))),
      ),
    );

  main.replaceChildren(
    h(
      "div",
      { class: "confirm" },
      h("h1", { class: "page-title" }, t("confirm.title")),
      order && h("p", { class: "confirm__number" }, t("confirm.number") + " ", h("strong", null, order.number)),
      h("p", { class: "confirm__text", rich: t("confirm." + mode) }),
      order && order.retry && (mode === "mailto" || mode === "whatsapp") && h("a", { class: "arrow-link", href: order.retry, target: mode === "whatsapp" ? "_blank" : null, rel: "noopener" }, mode === "whatsapp" ? "WhatsApp" : site.contact.email.replace(/\[\[|\]\]/g, "")),
      summary,
      h("a", { class: "arrow-link", href: "shop.html" }, t("confirm.back")),
    ),
  );
})();
