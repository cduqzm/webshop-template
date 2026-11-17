# webshop template: build brief

You're building a reusable website/webshop template in this folder (`C:\Users\deffi\Documents\template`, empty apart from this brief). I build sites for small businesses and starters: a bakery, a candle maker, a barber, a clothing brand run from someone's bedroom, a local bike repair shop. Every new client should take me an afternoon of config and content, not a rebuild.

Plain HTML, CSS and JavaScript. No framework, no build step, no npm, no bundler. I want to be able to open `index.html` from the folder and have it work, and to deploy it by dragging the folder onto any static host (Vercel, Netlify, GitHub Pages, a cheap shared host).

For a sense of how I build and what I care about, look at my own sites: `C:\Users\deffi\Documents\custom_website` (quiet, monospace, hairlines, one accent, almost no motion) and `C:\Users\deffi\Documents\custom_website_op` (the loud version). Treat both as read-only. Don't copy their content or their cube stuff. Take the attitude: deliberate type, a real grid, details that come from the subject instead of from a trend.

## 1. The main rule: it must not look AI-generated

This is the most important part of the brief. Clients can tell when a site came out of a generator, and so can their customers. Avoid everything that marks a site as generated:

- A centred hero with a big headline, a grey subtitle and two buttons ("Shop now" / "Learn more").
- Purple/blue gradients, glowing blobs, glassmorphism, mesh backgrounds.
- A row of three cards, each with an icon in a rounded square, a bold title and two lines of text.
- Emoji or generic line icons used as decoration.
- Every box with the same `border-radius: 1rem` and the same soft shadow.
- Inter or system-ui for everything, at one weight.
- Fade-up-on-scroll on every single element.
- Copy like "Elevate your style", "Crafted with passion", "Discover our curated collection", "Unlock", "Seamless", "Journey". Also fake testimonials and fake trust badges.
- Placeholder images from stock-photo sites that all look like the same beige lifestyle shoot.

Instead, the template should look like a small studio designed it for this one business:

- **Products and the business are the design.** Product photography leads; layout serves it. Big images, honest crops, real proportions.
- **Typography with a point of view.** A real pairing per preset (see section 3), a proper type scale, tight headings, comfortable reading measure, tabular numbers for prices.
- **A visible grid with some tension.** Asymmetric layouts, things that align to columns, hairline rules, text that overlaps an image edge on purpose. Not everything centred, not everything in a card.
- **Small, specific details.** A price that's set like a price tag, a "made in [city]" line in the footer, opening hours that show "open now / closes at 17:00", stock shown as "3 left" instead of a badge, a shop-local touch.
- **Restraint in motion.** Hover states, a cart drawer that slides, image swaps on product cards. Nothing animates just because it can. Respect `prefers-reduced-motion`.

## 2. Built to be re-skinned

Everything that changes per client lives in a few obvious places, so I never hunt through HTML for a phone number.

```
/config/site.js        business info, contact, socials, hours, legal details, features on/off, preset, colours, fonts
/config/products.js    categories and products
/content/en.js         all interface text and page copy in English
/content/nl.js         the same in Dutch
/assets/img/           logo, photos, favicon, og image
/presets/*.css         the design presets
/css/base.css          shared structure (layout, components), driven by CSS custom properties
/js/                   small modules: i18n, cart, catalog rendering, nav, forms
```

- **Use `.js` files that set a global** (`window.SITE = {...}`), not JSON loaded with `fetch`, so the site also works when opened straight from disk.
- **`site.js` holds**: business name, tagline, logo path, address, email, phone, WhatsApp number, KvK and BTW number, opening hours, social links, currency, default language, which preset, colour overrides (accent, background, text), font overrides, and feature flags.
- **Feature flags**, so the same template covers a full shop or just a business site: `shop` (catalog + cart + checkout), `blog`/`news`, `booking` (link to an external booking tool), `openingHours`, `map` (embed only when on), `newsletter`, `instagramStrip`, `faq`. When `shop` is off, the site becomes a clean business site with services/menu/price list instead of products, and no cart icon anywhere.
- **Theming through CSS custom properties.** A preset sets the tokens; `site.js` can override a few (accent colour, fonts) and they're applied at load. Changing the brand colour should be one line, and contrast must still pass (warn in the console if the chosen accent fails AA against the background).
- **Product data** supports: id/slug, name and description per language, price (in cents, to avoid rounding bugs), optional sale price, images (several), category, variants (size/colour with their own price or stock), stock count or "made to order", tags like new/sold out, and a short "details" list (material, size, care).

## 3. Presets

Build three presets that are genuinely different, not three colours of the same thing. Same HTML, different CSS (and at most a different layout class on `<html>`). Suggestions, improve on them:

1. **Atelier**: editorial. A sharp serif for headings, a quiet sans for text, warm off-white paper, black type, one muted accent. Large images, wide margins, magazine-like asymmetry. For makers, ceramics, candles, fashion, florists.
2. **Market**: bold and loud. A heavy grotesk, solid colour blocks, tight dense grid, thick rules, prices huge. For streetwear, food, snacks, young brands.
3. **Workshop**: functional and calm, closest to my own v2 site. Monospace or a technical sans, hairline borders, a strict grid, small type, little colour. For repair shops, tech, services, B2B.

Fonts: self-hosted `woff2` in `/assets/fonts` (pick good free fonts, not Inter/Roboto/Poppins/Montserrat), with `font-display: swap` and preloads, no Google Fonts requests (privacy, see section 6). Each preset also needs a dark variant only if it looks good; don't force it.

Build a single `/presets.html` page (not linked from the site) that shows the same demo shop in all three presets side by side, so I can show a client options.

## 4. Two languages: English and Dutch

- All text comes from `/content/en.js` and `/content/nl.js`, including product names/descriptions (from `products.js`), page copy, buttons, form labels, errors, cart messages and legal pages. No hard-coded strings in HTML or JS.
- Language switch in the header (`EN / NL`), remembered in `localStorage`, defaulting to `site.js`'s default and otherwise the browser language. Update `<html lang>`, the page `<title>` and meta description on switch.
- Allow `?lang=nl` in the URL so I can link to a specific language.
- Format prices and dates with `Intl`: `€ 12,50` in Dutch, `€12.50` in English. Same for opening hours and days of the week.
- Keep the content in `nl.js` natural Dutch, not translated-sounding. Same for English.
- Make it easy to turn off one language for a client who only wants Dutch (switch disappears).
- Write it so adding a third language later is just adding a file.

## 5. Pages and what they need

- **Home**: the business in one look. Not the hero formula from section 1. Lead with product/work photography and one strong line, then featured products or services, something about the people behind it, practical info (where, when, how to reach them). Sections are toggleable and reorderable from `site.js`.
- **Shop / catalog**: category filter, sort (price, new), responsive product grid, empty and sold-out states. URLs keep the filter state (`shop.html?cat=candles`).
- **Product page**: one `product.html?id=slug` rendered from `products.js`. Image gallery (thumbnails, swipe on mobile), variant picker that updates price/stock, quantity, add to cart, details list, "you might also like".
- **Cart**: a drawer from any page plus a full `cart.html`. Saved in `localStorage`. Quantity edit, remove, subtotal, shipping note (free above an amount set in `site.js`), total incl. BTW.
- **Checkout**: no backend, so make it configurable in `site.js`:
  - `mode: "email"`: an order form (name, address, email, phone, note) that sends the order summary through a form service (Formspree or similar, endpoint in config) or opens a prefilled `mailto:`.
  - `mode: "whatsapp"`: sends the order as a prefilled WhatsApp message.
  - `mode: "links"`: each product has a payment link (Stripe Payment Link or Mollie, which supports iDEAL) and buying goes straight there.
  - Show a clear order confirmation page either way. Leave a clearly marked place where a real backend (Mollie/Stripe Checkout) could plug in later, and describe how in the README.
- **About**: the story and the people, with room for a real photo.
- **Contact**: form (same form service), address, hours with "open now", map embed (only loads after click, for privacy), WhatsApp/phone/email links.
- **FAQ**: accordion with real `<details>` elements.
- **Legal pages** (Dutch businesses need these): privacy policy, terms (algemene voorwaarden), shipping and returns including the 14-day withdrawal right (herroepingsrecht), and KvK/BTW in the footer. Write them as clearly marked templates with `[[PLACEHOLDER]]` fields, not as legal advice.
- **404**: in the preset's style, with a way back to the shop.

Shared header and footer are written once and injected by JS from config, but the main content of each page is real HTML, so it reads fine and is indexable.

## 6. Engineering

- **Simple and readable.** I'll be editing this for years. Plain ES modules, small files, comments where something isn't obvious. No clever abstractions.
- **Progressive**: product pages need JS (they're rendered from data); everything else should still show its content without it.
- **Accessible**: semantic HTML, real buttons and links, labels on every input, visible focus styles that fit the preset, alt text from product data, the cart drawer traps focus and closes on Escape, AA contrast, touch targets of at least 44px.
- **Responsive**: designed for phones first (most customers will be on one), then tablet and desktop. No horizontal scroll anywhere.
- **Fast**: no libraries unless clearly needed, `loading="lazy"` and `width/height` on images, `srcset` where it helps. Aim for 95+ on Lighthouse for performance, accessibility, best practices and SEO.
- **SEO**: per-page titles and descriptions from content files, Open Graph tags, `Product` structured data (JSON-LD) on product pages, `LocalBusiness` data on home, a `sitemap.xml` and `robots.txt` (with a tiny script or instructions to regenerate the sitemap per client).
- **Privacy (EU)**: no third-party trackers by default, self-hosted fonts, map and video embeds only after consent/click. Then no cookie banner is needed; if a client turns on analytics, a simple, honest consent banner appears.
- **Security**: insert data with `textContent`, never build HTML from config or form input with `innerHTML`.

## 7. Demo content

Fill the template with one believable fictional business so it looks finished out of the box, for example a small candle and ceramics studio in Utrecht (pick something else if it shows the design better). Write the copy in that shop's voice, short and specific, in both languages. No lorem ipsum.

For images, don't pull random stock photos. Use neutral placeholders that look intentional (solid tones in the preset's palette with the product name and aspect ratio), so it's obvious what needs replacing, and so screenshots of the template don't look like every other shop. Mark every placeholder text with `[[ ]]` where it's business-specific (KvK, address, legal text).

## 8. How to work

1. Read this brief and glance through my two sites. Write a short `docs/plan.md`: file layout, config shape, how i18n and presets work, the fonts you chose per preset and why, and where you'd deviate from this brief.
2. **Prove the look first.** Build the config system, i18n, one preset (Atelier) and the home + one product page to finished quality, on desktop and phone. Then stop and show me with screenshots and how to open it. Design is what I'm most likely to redirect.
3. After I approve, carry on: the rest of the pages, the cart and checkout modes, the other two presets, the presets comparison page, legal templates, SEO, then a polish pass (accessibility, both languages on every page, all feature-flag combinations, small screens).

**Look at your own work.** Open the pages in a browser, take screenshots at phone and desktop width in both languages, and actually look at them. Check for: Dutch text that's longer than the English and breaks the layout, anything that looks templated or generic, alignment that's almost-but-not-quite on the grid, empty states, and the site with `shop: false`.

## 9. Hand-off

Finish with:

- `README.md`: how to open it, how to deploy it, how the files are organised.
- `NEW-CLIENT.md`: a step-by-step checklist for setting the template up for a new client (copy the folder, fill in `site.js`, products, both content files, logo/photos/favicon/og image, pick a preset and colours, set checkout mode, fill legal placeholders, regenerate sitemap, test both languages, deploy). Including roughly how long each step takes.
- A short report: what's done, what you skipped and why, and anything you couldn't verify.

Don't deploy anything and don't sign up for any service; I'll do that.
