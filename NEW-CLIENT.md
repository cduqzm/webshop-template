# New client checklist

Rough times are for a small shop (10–20 products) with photos and texts already supplied.

## 1. Copy (2 min)

- [ ] Copy the whole `template` folder and rename it after the client.
- [ ] Delete `docs/` from the copy if you don't want it there.

## 2. Business details (15 min): `config/site.js`

- [ ] `id`: short and unique (it prefixes saved cart data in the browser).
- [ ] `name`, `url`, `languages` (remove one for a single-language site).
- [ ] `business`: legal name, KvK, btw number, founding year.
- [ ] `address` (+ `routeUrl`, `lat`, `lng` for the map), `contact` (WhatsApp digits only: `316...`), `socials`.
- [ ] `hours` (null = closed) and `timezone`.
- [ ] `features`: switch off what they don't need. No webshop? `shop: false`.
- [ ] `home`: which sections, in what order. `featured`: which product ids on home.
- [ ] `images`: opening, story and about photos.

## 3. Look (15–30 min)

- [ ] Open `presets.html`, pick a preset with the client, set `theme.preset`.
- [ ] Brand colour: `theme.accent`. Reload with the console open; fix any contrast warning.
- [ ] Logo: put it in `assets/img/` and add `logo: "assets/img/logo.svg"` to `site.js` (otherwise the name is set in type).
- [ ] Favicon: replace `assets/img/favicon.svg`.

## 4. Products (30–90 min): `config/products.js`

- [ ] Categories (id, name, one-line note per language).
- [ ] Products: prices **in cents**, stock (number, `0` = sold out, `null` = unlimited), variants, details.
- [ ] Photos in `assets/img/`, set `src`, `alt`, and `ratio` to match the photo.
- [ ] No webshop? Products still drive the price list, so add services here (images can stay empty).

## 5. Texts (30–60 min): `content/nl.js` and `content/en.js`

- [ ] `pages`: title and description per page (search results).
- [ ] `home`, `about`, `contact`, `faq`: rewrite in the client's own voice. Short and specific; no "passie" or "kwaliteit".
- [ ] `footer.made` and `home.opening.since`.
- [ ] Have both languages read by someone who speaks them.

## 6. Checkout (10 min): `site.js → shop`

- [ ] `shippingCost`, `freeShippingFrom` (cents), `dispatchDays`, `vatRate`.
- [ ] `checkout.mode`:
  - `email`: make a Formspree form for the client's address; paste the endpoint in `formEndpoint`.
  - `whatsapp`: check `contact.whatsapp`.
  - `links`: make a Stripe/Mollie payment link per product, set `paymentLink` on each, and set the return URL to `https://<domain>/confirm.html?paid=1`.
- [ ] Contact form: `forms.contact` (same Formspree account is fine). Newsletter: `forms.newsletter`.
- [ ] Place a test order in each language.

## 7. Legal (20 min + the client's own check)

- [ ] `content/*.js → legal`: fill every `[[...]]` in privacy, terms, and shipping & returns.
- [ ] Name the services actually used (carrier, payment, form service, analytics if any).
- [ ] Remove `legal.templateNote` once someone has checked the texts.
- [ ] Analytics? Turn on `features.analytics`, set `analytics.src`, and mention it in the privacy text.

## 8. Search and sharing (10 min)

- [ ] In all `.html` files, search and replace `studiolont.nl` and `Studio Lont` (the `og:` tags and `<title>`).
- [ ] Render `assets/img/og.png` from `tools/og.html` (command in the README).
- [ ] Open `tools/sitemap.html`, download `sitemap.xml` and `robots.txt`, replace the ones in the root.

## 9. Check (20 min)

- [ ] Search the folder for `[[`: nothing left. Nothing yellow on any page.
- [ ] Every page in both languages, on a phone and a laptop.
- [ ] Long Dutch words in headings and buttons don't break the layout.
- [ ] Sold-out product, product with variants, empty cart, cart above and below free shipping.
- [ ] Keyboard only: tab through header, product page, cart drawer, checkout.

## 10. Deploy (10 min)

- [ ] Upload or connect the folder (see README), connect the domain, check `404.html` on a wrong URL.
- [ ] Submit the sitemap in Google Search Console.

**Total: roughly an afternoon (3–5 hours)**, most of it spent on products and texts.
