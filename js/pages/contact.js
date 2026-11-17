/*
 * Contact: details, opening hours, a form (to forms.contact, or the visitor's email app),
 * and a map that only loads from OpenStreetMap after a click.
 */
(function () {
  "use strict";
  const { h, t } = Shop;
  const site = Shop.site;
  const main = document.getElementById("main");
  const a = site.address;
  const c = site.contact;

  /* details */
  const details = h(
    "div",
    { class: "contact__details" },
    h("address", { class: "contact__block" }, h("span", { rich: site.name }), h("br"), h("span", { rich: a.street }), h("br"), h("span", { rich: a.postcode + " " + a.city })),
    a.routeUrl && h("a", { class: "arrow-link", href: a.routeUrl, rel: "noopener", target: "_blank" }, t("home.visit.route")),
    h(
      "ul",
      { class: "contact__list", role: "list" },
      h("li", null, h("a", { href: "mailto:" + c.email, rich: c.email })),
      c.phone && h("li", null, h("a", { href: "tel:" + c.phone.replace(/[^\d+]/g, ""), rich: c.phone })),
      c.whatsapp && h("li", null, h("a", { href: "https://wa.me/" + c.whatsapp.replace(/\D/g, ""), rel: "noopener" }, "WhatsApp")),
    ),
  );

  /* opening hours */
  let hours = null;
  if (site.features.openingHours) {
    const today = Shop.hours.today();
    const s = Shop.hours.status();
    hours = h(
      "section",
      { class: "contact__hours", "aria-labelledby": "hours-title" },
      h("h2", { class: "field-label", id: "hours-title" }, t("hours.title")),
      h("p", { class: "status" + (s.open ? " is-open" : "") }, h("span", { class: "status__dot", "aria-hidden": "true" }), s.text),
      h(
        "table",
        { class: "hours" },
        h(
          "tbody",
          null,
          Shop.hours.DAYS.map((d, i) => {
            const hrs = site.hours[d];
            return h("tr", { class: (i === today ? "is-today" : "") + (hrs ? "" : " is-closed") }, h("th", { scope: "row" }, Shop.hours.dayName(i)), h("td", null, hrs ? hrs[0] + "–" + hrs[1] : t("hours.closedDay")));
          }),
        ),
      ),
    );
  }

  /* form */
  const status = Shop.formStatus();
  const submit = h("button", { type: "submit", class: "button" }, t("form.send"));
  const form = h(
    "form",
    { class: "contact__form", novalidate: true, "aria-labelledby": "form-title" },
    h("h2", { class: "contact__form-title", id: "form-title" }, t("contact.formTitle")),
    h(
      "div",
      { class: "field-row" },
      Shop.field({ name: "name", label: t("contact.name"), required: true, autocomplete: "name" }),
      Shop.field({ name: "email", label: t("contact.email"), type: "email", required: true, autocomplete: "email" }),
    ),
    Shop.field({ name: "message", label: t("contact.message"), required: true, rows: 6 }),
    submit,
    status,
  );
  Shop.liveValidation(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    if (!Shop.validate(form)) return;
    const data = Shop.formData(form);
    submit.disabled = true;
    try {
      const how = await Shop.send(site.forms.contact, { ...data, _subject: site.name + ": " + data.name }, { to: c.email, subject: site.name + ": " + data.name, body: data.message + "\n\n" + data.name + "\n" + data.email });
      status.textContent = how === "sent" ? t("form.sent") : t("form.mailtoOpened");
      if (how === "sent") form.reset();
    } catch (err) {
      console.error(err);
      status.textContent = t("form.failed");
    }
    submit.disabled = false;
  });

  /* map: nothing is requested from OpenStreetMap until the button is pressed */
  let map = null;
  if (site.features.map && a.lat && a.lng) {
    const d = 0.004;
    const src =
      "https://www.openstreetmap.org/export/embed.html?bbox=" +
      [a.lng - d * 1.6, a.lat - d, a.lng + d * 1.6, a.lat + d].join(",") +
      "&layer=mapnik&marker=" + a.lat + "," + a.lng;
    const button = h("button", { type: "button", class: "button" }, t("contact.mapButton"));
    map = h("div", { class: "contact__map" }, h("div", { class: "contact__map-gate" }, button, h("p", null, t("contact.mapNote"))));
    button.addEventListener("click", () => {
      map.replaceChildren(h("iframe", { src, title: t("contact.mapTitle"), loading: "lazy", referrerpolicy: "no-referrer" }));
    });
  }

  main.replaceChildren(
    h("div", { class: "page-head" }, h("h1", { class: "page-title" }, t("contact.title")), h("p", { class: "page-intro" }, t("contact.lead"))),
    h("div", { class: "contact" }, h("div", { class: "contact__side" }, details, hours), form),
    map,
  );
})();
