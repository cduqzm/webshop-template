# Plan

## File layout

```
index.html, shop.html, product.html, cart.html, about.html, contact.html, faq.html,
privacy.html, terms.html, shipping.html, 404.html, presets.html
config/site.js        window.SITE: business, contact, hours, legal, features, preset, theme overrides, shop settings
config/products.js    window.CATALOG: categories + products (multilingual fields are { nl, en } objects)
content/nl.js, en.js  window.CONTENT.<lang>: every interface string and page text
presets/<name>.css    one design each: tokens, fonts, and that preset's layout decisions
css/base.css          reset + structure every preset shares (grid, drawer, gallery mechanics, focus, utilities)
js/boot.js            runs in <head>: picks language and preset, loads the preset CSS, applies colour overrides
js/core.js            Shop namespace: text lookup, DOM builder, money, opening hours, storage
js/catalog.js         product lookups, product card, image/placeholder rendering
js/cart.js            cart state (localStorage) + drawer
js/layout.js          header, menu, footer, language switch
js/pages/*.js         one small file per page that needs logic
assets/fonts, assets/img
```

## Config shape

`site.js` is grouped by what a client would hand me: `business`, `address`, `contact`, `socials`, `hours`,
`features`, `home` (section order), `shop` (currency, shipping, checkout mode), `theme` (preset + overrides).
Every value that has to be replaced per client is written as `[[like this]]`. Those render highlighted on the
page, so a forgotten placeholder is impossible to miss.

## i18n

- Language order: `?lang=` → saved choice → browser language → `site.languages[0]`.
- HTML elements carry keys: `data-t="home.story.quote"`, `data-t-attr="aria-label=nav.menu"`, `data-site="contact.email"`.
- Strings support `{name}` variables, `{site.address.city}` lookups, `*emphasis*`, line breaks, and `{ one, other }` plurals.
- Multilingual data (product names etc.) is `{ nl: "...", en: "..." }`; missing languages fall back to the default.
- Prices and dates go through `Intl`. Dutch whole amounts are written the Dutch way: `€ 18,-`.
- A third language means one new content file plus adding its code to `site.languages`.

## Presets

All pages use the same HTML. `boot.js` sets `<html data-preset="…">` and loads `presets/<name>.css`, which owns
tokens, fonts and layout. `?preset=market` overrides it, which is what `presets.html` uses for side-by-side iframes.

| preset   | display              | text              | why |
|----------|----------------------|-------------------|-----|
| Atelier  | Newsreader (optical sizes, italics) | Schibsted Grotesk | Newsreader's display cuts get sharp at large sizes and its italic carries emphasis; Schibsted is a newspaper grotesk: plain, but with more character than Inter. |
| Market   | Archivo (width axis, up to 900)     | Archivo           | One family stretched from condensed to extended for loud, dense pages. |
| Workshop | IBM Plex Mono       | IBM Plex Sans      | Technical and calm, closest to my own v2 site. |

## Where I deviate from the brief

1. **Classic scripts instead of ES modules.** Browsers block `type="module"` scripts on `file://`, which would
   break "open index.html from the folder". Every file is a plain script that adds to one `Shop` namespace,
   loaded with `defer` in order. Same readability, works from disk.
2. **Text is rendered by JS, not baked into HTML.** The brief wants all words in the content files *and*
   real HTML content without JS. Doing both means every sentence lives in two places and drifts. I chose the
   content files as the only source. HTML holds the structure and the keys. Google renders JS, and a
   `<noscript>` note covers the rest. If you want static HTML text anyway, a small optional `tools/bake`
   script could write the default language into the pages later.
3. **The preset stylesheet is written with `document.write` in boot.js.** That keeps it render-blocking
   (no flash of the wrong design) while still being picked from config. One line, commented.

## Status

- Phase 1 (approved): config, i18n, boot, Atelier, header/footer/menu, cart drawer, home, product page.
- Phase 2 (done): shop, cart + checkout (email / WhatsApp / payment links), confirmation, about, contact,
  FAQ, privacy / terms / shipping templates, journal, 404, Market and Workshop presets, presets.html,
  feature flags incl. no-shop mode, consent banner, structured data, sitemap and OG tools, README, NEW-CLIENT.
