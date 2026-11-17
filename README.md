# Webshop template

A small-business website and webshop in plain HTML, CSS and JavaScript. No framework, no build step, no npm.
Every client gets a copy of this folder; everything that changes per client lives in `config/` and `content/`.

The demo business is **Studio Lont**, a made-up candle and ceramics studio in Utrecht.

## Open it

Double-click `index.html`. That's it: it works straight from disk.

Useful URLs while working:

- `?lang=en` / `?lang=nl`: switch language (the choice is remembered)
- `?preset=market` / `?preset=workshop`: view another design without changing config
- `presets.html`: all three designs side by side, for showing a client
- `tools/sitemap.html`: generates `sitemap.xml` and `robots.txt` from config
- `tools/og.html`: the social preview image (see below)

Anything still written as `[[like this]]` in config or content shows up **highlighted yellow** on the page.
Nothing should be yellow when a site goes live.

## Deploy

Static hosting, nothing to build. Drag the folder onto Netlify Drop, or push it to a repo and import it in
Vercel or Netlify (framework: "Other", no build command, output folder: the root). A plain FTP upload to shared
hosting works too.

- `404.html` is used automatically by Netlify, Vercel and GitHub Pages. It uses `<base href="/">`, so it assumes
  the site lives at the domain root. On a GitHub Pages *project* site (`user.github.io/repo/`), change that to
  `<base href="/repo/">`.
- Don't upload `docs/` if you'd rather not. `tools/` and `presets.html` are blocked in `robots.txt`.

## How it's organised

```
config/site.js        business details, contact, opening hours, features on/off, preset, colours, checkout
config/products.js    categories and products (prices in cents; names etc. as { nl, en })
config/posts.js       journal posts (only used when features.blog is on)
content/nl.js, en.js  every word of interface and page text, per language
presets/*.css         the three designs: atelier, market, workshop
css/base.css          shared structure; uses only the preset's tokens
js/boot.js            runs first: picks language + preset, loads their files, applies colour overrides
js/core.js            text lookup, DOM builder, money, opening hours, storage
js/catalog.js         product lookups, cards, image placeholders, price list
js/cart.js            cart (localStorage) and the cart drawer
js/forms.js           fields, validation, sending forms
js/layout.js          header, menu, footer, language switch, consent banner
js/pages/*.js         one file per page with logic
assets/fonts, assets/img
tools/                sitemap and social-image helpers (not part of the site)
```

All scripts are plain `<script defer>` files that add to one global `Shop` object. ES modules would be
tidier, but browsers refuse to load them from `file://`, and opening `index.html` directly was a requirement.

Text is never hard-coded in HTML or JS. HTML carries keys (`data-t="home.story.quote"`); the content files
hold the words. In content strings:

| write              | becomes                                        |
|--------------------|------------------------------------------------|
| `{site.address.city}` | the value from `config/site.js`            |
| `*words*`          | emphasis (italic in Atelier, red in Market)    |
| `[[...]]`          | a highlighted placeholder                      |
| `{ one: "...", other: "..." }` | singular/plural, picked by count    |

Data is inserted with `textContent` only; nothing from config or forms is ever parsed as HTML.

## Features (config/site.js → features)

| flag            | what it does |
|-----------------|--------------|
| `shop`          | Catalog, product pages, cart and checkout. Off = business site: the shop page becomes a price list ("Aanbod"), no cart anywhere, and a price list section can appear on home. |
| `openingHours`  | Hours table, and "open now / opens tomorrow at 11:00" in the header menu, footer and home. Uses `timezone`. |
| `map`           | OpenStreetMap on the contact page. Loads nothing until the visitor clicks. Needs `address.lat/lng`. |
| `faq`           | FAQ page and footer link. Questions in `content/*.js` → `faq.items`. |
| `booking`       | A nav link to `booking.url` (Calendly, Salonized, etc.). |
| `blog`          | Journal (`blog.html`, `post.html?id=`), posts in `config/posts.js`. |
| `newsletter`    | Sign-up section on home; posts to `forms.newsletter`. |
| `instagramStrip`| A row of saved images on home linking to the Instagram profile. No embed, no tracking. |
| `analytics`     | Shows a consent banner; loads `analytics.src` only after "yes". Off = no banner needed. |

Home sections and their order: `home: [...]` in `site.js`.

## Checkout (config/site.js → shop.checkout.mode)

There's no backend, so an order is a message:

- **`email`**: the order form posts to `formEndpoint` (e.g. a [Formspree](https://formspree.io) form; the shop
  owner gets an email per order and replies with a payment link). Without an endpoint, the customer's email app
  opens with the order filled in.
- **`whatsapp`**: the order opens as a prefilled WhatsApp message to `contact.whatsapp`.
- **`links`**: no cart; each product's button goes to its own `paymentLink` (Stripe Payment Link or a Mollie
  payment link, both do iDEAL). Set the provider's return URL to `https://<domain>/confirm.html?paid=1`.

Every mode ends on `confirm.html` with the order number and summary.

### Plugging in real payments later

When a client outgrows "we'll send you a payment link": add one serverless function (Vercel/Netlify) that takes
the cart, creates a Mollie payment or Stripe Checkout session with the secret key, and returns its URL. Then in
`js/pages/cart.js`, replace `placeOrder()` with a `fetch` to that function and `location.href = url`. Set the
return URL to `confirm.html?paid=1`. Prices must be re-checked on the server from `products.js`, never trusted
from the browser. The rest of the template doesn't change.

## Presets

Same HTML, different CSS. Each preset sets the tokens at the top of its file (colours, fonts, placeholder tones)
and then makes its own layout decisions.

- **Atelier**: Newsreader + Schibsted Grotesk. Editorial: warm paper, the headline overlapping the photo,
  dotted price leaders. Makers, fashion, florists, bakeries.
- **Market**: Archivo, from condensed to extended. Loud: colour blocks, thick rules, boxed grid, huge prices.
  Food, streetwear, young brands.
- **Workshop**: IBM Plex Mono + Plex Sans. Calm: hairlines, numbered sections, spec-sheet details.
  Repairs, tech, services, B2B.

Per client you can keep the preset and override `theme.accent` (and optionally `background`, `text`, fonts) in
`site.js`. When run locally, the console warns if the accent is too light to read as text.

Fonts are self-hosted woff2 (from Fontsource, all SIL Open Font License). To use another font, drop the woff2 in
`assets/fonts`, add an `@font-face` to the preset, and set `theme.fontDisplay` / `theme.fontText`.

## Languages

`site.languages` lists them; the first is the default. Remove one and the switch disappears. To add a third,
copy `content/en.js` to e.g. `content/de.js`, translate it, set `window.CONTENT.de`, and add `"de"` to
`site.languages`. Product texts (`{ nl, en }`) fall back to the default language where a translation is missing.

Prices and dates are formatted with `Intl`: `€ 18,50` / `€ 18,-` in Dutch, `€18.50` / `€18` in English.

## Images

A product image without `src` renders as a coloured placeholder that names the photo and its aspect ratio, so
it's clear what still needs shooting. Add photos to `assets/img/`, then set `src` (and ideally `width`/`height`
of the actual file). Optional `srcset` is supported.

Social preview: update `tools/og.html` if needed, then render `assets/img/og.png` at 1200×630:

```
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --window-size=1200,630 --screenshot=assets\img\og.png tools\og.html
```

## Known limits

- Pages are rendered by JavaScript. Google indexes them fine; visitors without JS see a short notice.
  Social scrapers don't run JS, so link previews use the static `og:` tags in each HTML head (same image and
  name for every page).
- Stock is only what's in `products.js`. Nothing decrements it when someone orders; update it by hand.
- Prices in the cart come from the visitor's browser. That's fine for "we'll send a payment link" (the owner
  checks the order), but a real payment integration must recalculate on the server.
