/*
 * Everything about the business lives here. Anything written as [[like this]] is a placeholder:
 * it shows up highlighted on the page until you replace it.
 */
window.SITE = {
  // Short id, used as the prefix for saved data in the browser (cart, language). Use a new one per client.
  id: "studio-lont",
  name: "Studio Lont",
  logo: "", // e.g. "assets/img/logo.svg". Empty = the name is set in the preset's display type
  url: "https://[[studiolont.nl]]", // used for canonical links, sitemap and social previews

  // First language is the default. Remove one to make the site single-language (the switch disappears).
  languages: ["nl", "en"],

  theme: {
    preset: "atelier", // "atelier" | "market" | "workshop"
    // Optional overrides. Leave null to use the preset's own choices.
    accent: null, // e.g. "#9b4a26". The console warns if it's too light to read as text.
    accentText: null, // optional darker version of the accent for text, when the accent itself is light
    background: null,
    text: null,
    fontDisplay: null, // a font-family string; add the @font-face to the preset CSS
    fontText: null,
  },

  business: {
    legalName: "[[Studio Lont v.o.f.]]",
    kvk: "[[12345678]]",
    btw: "[[NL000000000B01]]",
    founded: 2019,
  },

  address: {
    street: "[[Oudegracht 000]]",
    postcode: "[[3511 AA]]",
    city: "Utrecht",
    country: "NL",
    // Link for "plan a route". Leave empty to hide the link.
    routeUrl: "https://www.google.com/maps/search/?api=1&query=Oudegracht+Utrecht",
    // For the map on the contact page. Find them by right-clicking the spot in any map app.
    lat: 52.0907,
    lng: 5.1214,
  },

  contact: {
    email: "[[hallo@studiolont.nl]]",
    phone: "[[+31 30 000 00 00]]",
    whatsapp: "[[31600000000]]", // digits only, with country code, no + or spaces
  },

  socials: [
    { label: "Instagram", url: "https://instagram.com/[[studiolont]]" },
    { label: "Pinterest", url: "https://pinterest.com/[[studiolont]]" },
  ],

  // Opening hours in the business's own time zone. null = closed that day.
  timezone: "Europe/Amsterdam",
  hours: {
    mon: null,
    tue: null,
    wed: ["11:00", "17:00"],
    thu: ["11:00", "17:00"],
    fri: ["11:00", "20:00"],
    sat: ["10:00", "17:00"],
    sun: ["12:00", "17:00"],
  },

  features: {
    shop: true, // catalog, cart and checkout. false = business site without a shop
    openingHours: true,
    map: true, // contact page map, only loads after a click
    faq: true,
    booking: false, // shows a "book" link in the nav, pointing at booking.url
    blog: false,
    newsletter: false,
    instagramStrip: false,
    analytics: false, // when true, a consent banner appears before anything loads
  },

  booking: { url: "" },

  // Where forms are sent: a Formspree (formspree.io) or similar endpoint that accepts JSON.
  // Empty = the visitor's own email app opens with the message filled in.
  forms: {
    contact: "",
    newsletter: "", // e.g. a Mailchimp/Brevo/Formspree endpoint; needed for the newsletter section
  },

  // Only loaded after the visitor agrees (features.analytics must be true).
  analytics: {
    src: "", // e.g. "https://plausible.io/js/script.js"
    attrs: {}, // extra attributes for the script tag, e.g. { "data-domain": "studiolont.nl" }
  },

  // Photos used outside the product pages. Without src, a placeholder in that tone is shown.
  images: {
    opening: { src: "", ratio: "4/5", tone: "clay" },
    story: { src: "", ratio: "3/4", tone: "ash" },
    about: { src: "", ratio: "3/2", tone: "wax" },
    about2: { src: "", ratio: "4/5", tone: "ochre" },
    // For the instagramStrip section: a few recent posts, saved as images (no Instagram embed, no tracking).
    instagram: [
      { src: "", ratio: "1/1", tone: "ochre" },
      { src: "", ratio: "1/1", tone: "soot" },
      { src: "", ratio: "1/1", tone: "wax" },
      { src: "", ratio: "1/1", tone: "moss" },
      { src: "", ratio: "1/1", tone: "clay" },
      { src: "", ratio: "1/1", tone: "ash" },
    ],
  },

  // Home page sections, in order. Remove a name to hide that section.
  // Sections whose feature is off are skipped automatically.
  // Available: opening, index, featured, pricelist (only when shop is off), story, visit, newsletter, instagram
  home: ["opening", "index", "featured", "pricelist", "story", "newsletter", "instagram", "visit"],
  featured: ["pot-turf", "stomp", "beker-as", "dinerkaarsen", "kandelaar"],

  shop: {
    currency: "EUR",
    vatRate: 21, // only used for the "incl. 21% btw" note
    shippingCost: 595, // in cents
    freeShippingFrom: 6000, // in cents; null = never free
    dispatchDays: 2,
    checkout: {
      mode: "email", // "email" | "whatsapp" | "links"
      formEndpoint: "", // e.g. a Formspree URL. Empty = open a prefilled email instead
    },
  },
};
