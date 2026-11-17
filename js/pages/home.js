/*
 * Home: orders the sections from config and fills the parts that come from data.
 */
(function () {
  "use strict";
  const { h, t, loc, catalog } = Shop;
  const site = Shop.site;
  const main = document.getElementById("main");
  const slot = (name) => main.querySelector('[data-slot="' + name + '"]');
  const fill = (name, ...kids) => {
    const el = slot(name);
    if (el) el.replaceChildren(...kids.flat().filter(Boolean));
  };

  // Sections: drop the ones not listed in site.home, then append in the listed order.
  main.querySelectorAll("[data-section]").forEach((s) => {
    if (!site.home.includes(s.dataset.section)) s.remove();
  });
  site.home.forEach((name) => {
    const s = main.querySelector('[data-section="' + name + '"]');
    if (s) main.append(s);
  });

  /* opening */
  fill("opening-media", Shop.media(site.images.opening, { label: t("home.opening.imageLabel"), alt: t("home.opening.imageLabel"), eager: true }));
  if (site.features.openingHours) {
    const s = Shop.hours.status();
    fill("status", h("p", { class: "status" + (s.open ? " is-open" : "") }, h("span", { class: "status__dot", "aria-hidden": "true" }), s.text));
  }

  /* category index */
  fill(
    "index",
    catalog.categories.map((c, i) =>
      h(
        "li",
        null,
        h(
          "a",
          { class: "index__row", href: "shop.html?cat=" + encodeURIComponent(c.id) },
          h("span", { class: "index__num", "aria-hidden": "true" }, String(i + 1).padStart(2, "0")),
          h("span", { class: "index__name" }, loc(c.name)),
          h("span", { class: "index__note" }, loc(c.note)),
          h("span", { class: "index__count" }, t("home.index.count", { count: catalog.inCategory(c.id).length })),
        ),
      ),
    ),
  );

  /* featured products: the ids in site.featured, or the newest ones */
  const featured = (site.featured && site.featured.length ? site.featured.map(catalog.get).filter(Boolean) : [...catalog.products].sort((a, b) => (b.added || "").localeCompare(a.added || ""))).slice(0, 5);
  fill("featured", featured.map((p) => Shop.productCard(p)));

  /* price list (businesses without a shop) */
  if (!site.features.shop) fill("pricelist", Shop.priceList());

  /* newsletter */
  if (site.features.newsletter && slot("newsletter")) {
    const status = Shop.formStatus();
    const field = Shop.field({ name: "email", label: t("home.newsletter.label"), type: "email", required: true, autocomplete: "email", className: "newsletter__field" });
    const form = h("form", { class: "newsletter__form", novalidate: true }, field, h("button", { type: "submit", class: "button" }, t("home.newsletter.submit")), status);
    Shop.liveValidation(form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!Shop.validate(form)) return;
      const email = Shop.formData(form).email;
      try {
        const how = await Shop.send(site.forms.newsletter, { email }, { to: site.contact.email, subject: "Newsletter", body: email });
        status.textContent = how === "sent" ? t("home.newsletter.sent") : t("form.mailtoOpened");
        form.reset();
      } catch (err) {
        console.error(err);
        status.textContent = t("form.failed");
      }
    });
    fill("newsletter", form);
  }

  /* instagram strip: saved images linking to the profile, no embed */
  if (site.features.instagramStrip) {
    const profile = site.socials.find((s) => /instagram/i.test(s.label));
    const href = profile ? profile.url : null;
    fill("instagram-link", href && h("a", { class: "arrow-link", href, rel: "noopener" }, t("home.instagram.link")));
    fill(
      "instagram",
      (site.images.instagram || []).map((img) =>
        h(href ? "a" : "div", { class: "instagram__item", href, rel: href ? "noopener" : null, tabindex: href ? "-1" : null, "aria-hidden": "true" }, Shop.media(img, { label: "", alt: "" })),
      ),
    );
  }

  /* story */
  fill("story-media", Shop.media(site.images.story, { label: t("home.story.imageLabel"), alt: t("home.story.imageLabel") }));

  /* visit */
  const a = site.address;
  fill(
    "address",
    h("address", { class: "visit__value" }, h("span", { rich: a.street }), h("br"), h("span", { rich: a.postcode + " " + a.city })),
    a.routeUrl && h("a", { class: "arrow-link", href: a.routeUrl, rel: "noopener", target: "_blank" }, t("home.visit.route")),
  );

  if (site.features.openingHours) {
    const today = Shop.hours.today();
    fill(
      "hours",
      h(
        "table",
        { class: "hours" },
        h(
          "tbody",
          null,
          Shop.hours.DAYS.map((d, i) => {
            const hrs = site.hours[d];
            return h(
              "tr",
              { class: (i === today ? "is-today" : "") + (hrs ? "" : " is-closed") },
              h("th", { scope: "row" }, Shop.hours.dayName(i)),
              h("td", null, hrs ? hrs[0] + "–" + hrs[1] : t("hours.closedDay")),
            );
          }),
        ),
      ),
    );
  }

  /* structured data for search engines: the business, its address and hours */
  const days = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
  const clean = (v) => String(v || "").replace(/\[\[|\]\]/g, "");
  document.head.append(
    h(
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": site.features.shop ? "Store" : "LocalBusiness",
        name: site.name,
        url: clean(site.url),
        email: clean(site.contact.email),
        telephone: clean(site.contact.phone),
        address: { "@type": "PostalAddress", streetAddress: clean(a.street), postalCode: clean(a.postcode), addressLocality: a.city, addressCountry: a.country },
        geo: a.lat ? { "@type": "GeoCoordinates", latitude: a.lat, longitude: a.lng } : undefined,
        openingHoursSpecification: Object.entries(site.hours)
          .filter(([, v]) => v)
          .map(([d, v]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: days[d], opens: v[0], closes: v[1] })),
        sameAs: site.socials.map((s) => clean(s.url)),
      }),
    ),
  );

  const c = site.contact;
  fill(
    "contact",
    h(
      "ul",
      { class: "visit__list", role: "list" },
      h("li", null, h("a", { href: "mailto:" + c.email, rich: c.email })),
      c.phone && h("li", null, h("a", { href: "tel:" + c.phone.replace(/[^\d+]/g, ""), rich: c.phone })),
      c.whatsapp && h("li", null, h("a", { href: "https://wa.me/" + c.whatsapp.replace(/\D/g, ""), rel: "noopener" }, t("home.visit.whatsapp"))),
    ),
  );
})();
