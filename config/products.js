/*
 * Categories and products.
 *
 * Prices are in cents (1850 = € 18,50) so sums never round wrong.
 * stock: a number, or null for "made to order" / unlimited.
 * images: { src, alt, ratio, tone }. Without a src, a placeholder in that tone is shown,
 *         so you can see exactly which photos still need to be shot.
 * variants: optional. Each option can set its own price and stock.
 * paymentLink: only for checkout mode "links" (config/site.js): a Stripe Payment Link or Mollie
 *              payment link for this product (a variant can have its own). Set its return URL to
 *              https://<domain>/confirm.html?paid=1
 */
window.CATALOG = {
  categories: [
    {
      id: "kaarsen",
      name: { nl: "Kaarsen", en: "Candles" },
      note: { nl: "Gegoten van koolzaad- en bijenwas", en: "Poured from rapeseed and beeswax" },
    },
    {
      id: "keramiek",
      name: { nl: "Keramiek", en: "Ceramics" },
      note: { nl: "Gedraaid in steengoed, op 1240 °C gestookt", en: "Thrown in stoneware, fired at 1240 °C" },
    },
    {
      id: "sets",
      name: { nl: "Sets & cadeaus", en: "Sets & gifts" },
      note: { nl: "Ingepakt in papier, met een kaartje", en: "Wrapped in paper, with a card" },
    },
  ],

  products: [
    {
      id: "pot-turf",
      category: "kaarsen",
      name: { nl: "Kaars in pot, Turf", en: "Potted candle, Peat" },
      summary: {
        nl: "Rokerig, een beetje zoet. Brandt zo'n 45 uur in een pot die je daarna als beker gebruikt.",
        en: "Smoky, a little sweet. Burns for about 45 hours in a pot you'll use as a cup afterwards.",
      },
      description: {
        nl: "Turf ruikt naar een open haard waar net hout op is gegooid, met wat vanille eronder. De pot draaien we zelf en glazuren we binnenin, zodat hij na de laatste vlam gewoon in de vaatwasser kan.",
        en: "Peat smells like a fire that's just been fed, with some vanilla underneath. We throw the pot ourselves and glaze the inside, so once the last flame is out it can go straight in the dishwasher.",
      },
      price: 3400,
      stock: 2,
      added: "2026-10-28",
      tags: ["new"],
      images: [
        { src: "", ratio: "4/5", tone: "soot", alt: { nl: "Kaars in donkere pot", en: "Candle in a dark pot" } },
        { src: "", ratio: "4/5", tone: "clay", alt: { nl: "Brandende kaars, van boven", en: "Burning candle, from above" } },
        { src: "", ratio: "4/5", tone: "ash", alt: { nl: "Lege pot na gebruik", en: "Empty pot after use" } },
      ],
      details: [
        { label: { nl: "Was", en: "Wax" }, value: { nl: "Koolzaad- en bijenwas", en: "Rapeseed and beeswax" } },
        { label: { nl: "Brandduur", en: "Burn time" }, value: { nl: "± 45 uur", en: "± 45 hours" } },
        { label: { nl: "Formaat", en: "Size" }, value: { nl: "⌀ 8 × 9 cm", en: "⌀ 8 × 9 cm" } },
        { label: { nl: "Pot", en: "Pot" }, value: { nl: "Steengoed, vaatwasserbestendig", en: "Stoneware, dishwasher safe" } },
      ],
    },
    {
      id: "stomp",
      category: "kaarsen",
      name: { nl: "Stompkaars, oker", en: "Pillar candle, ochre" },
      summary: {
        nl: "Brandt een kuiltje in het midden en laat een dunne rand staan, zodat het licht erdoorheen schijnt.",
        en: "Burns a hollow in the middle and leaves a thin wall, so the light shines through.",
      },
      description: {
        nl: "Onze meest gegoten kaars. Gekleurd met aardpigment, dus de kleur verschilt per partij een tikje. Zet hem op een bord of onze kandelaar; hij druipt nauwelijks.",
        en: "The candle we pour most. Coloured with earth pigment, so the shade varies a little between batches. Put it on a plate or our holder; it barely drips.",
      },
      price: 1450,
      stock: 14,
      added: "2026-06-10",
      variants: {
        label: { nl: "Hoogte", en: "Height" },
        options: [
          { id: "10", name: { nl: "10 cm", en: "10 cm" }, price: 1450, stock: 6 },
          { id: "15", name: { nl: "15 cm", en: "15 cm" }, price: 1950, stock: 3 },
          { id: "20", name: { nl: "20 cm", en: "20 cm" }, price: 2600, stock: 0 },
        ],
      },
      images: [
        { src: "", ratio: "4/5", tone: "ochre", alt: { nl: "Okergele stompkaars", en: "Ochre pillar candle" } },
        { src: "", ratio: "4/5", tone: "wax", alt: { nl: "Drie hoogtes naast elkaar", en: "Three heights side by side" } },
      ],
      details: [
        { label: { nl: "Was", en: "Wax" }, value: { nl: "Koolzaadwas", en: "Rapeseed wax" } },
        { label: { nl: "Brandduur", en: "Burn time" }, value: { nl: "30 tot 70 uur, naar hoogte", en: "30 to 70 hours, by height" } },
        { label: { nl: "Doorsnede", en: "Diameter" }, value: { nl: "7 cm", en: "7 cm" } },
      ],
    },
    {
      id: "dinerkaarsen",
      category: "kaarsen",
      name: { nl: "Dinerkaarsen, set van 4", en: "Dinner candles, set of 4" },
      summary: {
        nl: "Gedompeld, niet gegoten: dertig keer door de was, dus elke kaars is net anders dik.",
        en: "Dipped, not poured: thirty times through the wax, so each one is slightly different.",
      },
      description: {
        nl: "We dompelen ze in paren aan één lont, en knippen ze pas los als ze hard zijn. Ze passen in elke standaard kandelaar van 2,2 cm.",
        en: "We dip them in pairs on a single wick and only cut them apart once they've set. They fit any standard 2.2 cm holder.",
      },
      price: 1200,
      stock: 20,
      added: "2026-09-02",
      variants: {
        label: { nl: "Kleur", en: "Colour" },
        options: [
          { id: "ivoor", name: { nl: "Ivoor", en: "Ivory" }, stock: 9 },
          { id: "salie", name: { nl: "Salie", en: "Sage" }, stock: 7 },
          { id: "oker", name: { nl: "Oker", en: "Ochre" }, stock: 4 },
        ],
      },
      images: [
        { src: "", ratio: "4/5", tone: "wax", alt: { nl: "Vier dunne kaarsen", en: "Four thin candles" } },
        { src: "", ratio: "4/5", tone: "moss", alt: { nl: "Kaarsen aan het droogrek", en: "Candles on the drying rack" } },
      ],
      details: [
        { label: { nl: "Lengte", en: "Length" }, value: { nl: "25 cm", en: "25 cm" } },
        { label: { nl: "Brandduur", en: "Burn time" }, value: { nl: "± 8 uur per kaars", en: "± 8 hours each" } },
      ],
    },
    {
      id: "waxine",
      category: "kaarsen",
      name: { nl: "Bijenwas waxinelichtjes, 12 stuks", en: "Beeswax tealights, 12" },
      summary: {
        nl: "Zonder aluminium cupje, in een papieren zakje. Ruiken heel licht naar honing.",
        en: "No aluminium cup, packed in a paper bag. A faint smell of honey.",
      },
      description: {
        nl: "Bijenwas van een imker uit Bunnik. Zet ze in een theelichthouder of een glas; zonder cupje branden ze helemaal op.",
        en: "Beeswax from a beekeeper in Bunnik. Use them in a tealight holder or a glass; without a cup they burn down completely.",
      },
      price: 950,
      stock: 40,
      added: "2026-03-14",
      images: [{ src: "", ratio: "4/5", tone: "ochre", alt: { nl: "Waxinelichtjes in papieren zak", en: "Tealights in a paper bag" } }],
      details: [{ label: { nl: "Brandduur", en: "Burn time" }, value: { nl: "± 5 uur per stuk", en: "± 5 hours each" } }],
    },
    {
      id: "beker-as",
      category: "keramiek",
      name: { nl: "Beker zonder oor", en: "Tumbler" },
      summary: {
        nl: "Past precies in een hand, voor koffie, wijn of een kaars als hij uit de pot is.",
        en: "Fits a hand exactly. For coffee, wine, or a candle once it's out of its pot.",
      },
      description: {
        nl: "Gedraaid, afgedraaid en twee keer gestookt. De onderkant laten we ruw, zodat je ziet waar hij van gemaakt is. Elk glazuur loopt anders uit, dus jouw beker wijkt af van de foto.",
        en: "Thrown, trimmed and fired twice. We leave the foot unglazed so you can see what it's made of. Every glaze runs differently, so yours won't match the photo exactly.",
      },
      price: 2400,
      stock: 9,
      added: "2026-08-21",
      variants: {
        label: { nl: "Glazuur", en: "Glaze" },
        options: [
          { id: "as", name: { nl: "Asglazuur", en: "Ash glaze" }, stock: 5 },
          { id: "mos", name: { nl: "Mosgroen", en: "Moss green" }, stock: 3 },
          { id: "roet", name: { nl: "Roet", en: "Soot" }, stock: 1 },
        ],
      },
      images: [
        { src: "", ratio: "4/5", tone: "ash", alt: { nl: "Beker met asglazuur", en: "Tumbler with ash glaze" } },
        { src: "", ratio: "4/5", tone: "clay", alt: { nl: "Ongeglazuurde voet", en: "Unglazed foot" } },
      ],
      details: [
        { label: { nl: "Inhoud", en: "Volume" }, value: { nl: "250 ml", en: "250 ml" } },
        { label: { nl: "Klei", en: "Clay" }, value: { nl: "Steengoed uit het Westerwald", en: "Westerwald stoneware" } },
        { label: { nl: "Onderhoud", en: "Care" }, value: { nl: "Vaatwasser en magnetron", en: "Dishwasher and microwave safe" } },
      ],
    },
    {
      id: "ontbijtkom",
      category: "keramiek",
      name: { nl: "Ontbijtkom", en: "Breakfast bowl" },
      summary: {
        nl: "Diep genoeg voor yoghurt met alles erop, breed genoeg voor ramen.",
        en: "Deep enough for yoghurt with everything on it, wide enough for ramen.",
      },
      description: {
        nl: "De rand is iets naar binnen gedraaid, zodat er niets overheen klotst als je hem naar de bank draagt.",
        en: "The rim turns in slightly, so nothing slops over on the way to the sofa.",
      },
      price: 3200,
      stock: 4,
      added: "2026-07-30",
      images: [
        { src: "", ratio: "4/5", tone: "moss", alt: { nl: "Mosgroene kom", en: "Moss green bowl" } },
        { src: "", ratio: "4/5", tone: "wax", alt: { nl: "Kom van boven", en: "Bowl from above" } },
      ],
      details: [
        { label: { nl: "Formaat", en: "Size" }, value: { nl: "⌀ 15 × 7 cm", en: "⌀ 15 × 7 cm" } },
        { label: { nl: "Onderhoud", en: "Care" }, value: { nl: "Vaatwasser en magnetron", en: "Dishwasher and microwave safe" } },
      ],
    },
    {
      id: "kandelaar",
      category: "keramiek",
      name: { nl: "Kandelaar, laag", en: "Low candle holder" },
      summary: {
        nl: "Een schoteltje met een kraag voor dinerkaarsen. De druppels vallen op de schotel, niet op tafel.",
        en: "A saucer with a collar for dinner candles. Drips land on the saucer, not the table.",
      },
      description: {
        nl: "Gemaakt voor onze dinerkaarsen, maar elke kaars van 2,2 cm past erin. Er staat ook een stompkaars van 7 cm stevig op.",
        en: "Made for our dinner candles, but any 2.2 cm candle fits. A 7 cm pillar candle sits on it nicely too.",
      },
      price: 2200,
      stock: 6,
      added: "2026-10-05",
      tags: ["new"],
      images: [
        { src: "", ratio: "4/5", tone: "clay", alt: { nl: "Lage kandelaar met kaars", en: "Low holder with candle" } },
        { src: "", ratio: "4/5", tone: "ash", alt: { nl: "Kandelaar zonder kaars", en: "Holder without candle" } },
      ],
      details: [
        { label: { nl: "Formaat", en: "Size" }, value: { nl: "⌀ 11 × 4 cm", en: "⌀ 11 × 4 cm" } },
        { label: { nl: "Past op", en: "Fits" }, value: { nl: "Kaarsen van 2,2 cm", en: "2.2 cm candles" } },
      ],
    },
    {
      id: "knopvaas",
      category: "keramiek",
      name: { nl: "Knopvaas", en: "Bud vase" },
      summary: {
        nl: "Voor één tak, of een paar takjes uit de berm.",
        en: "For one branch, or a few stems from the roadside.",
      },
      description: {
        nl: "Een smalle hals, zodat een enkele bloem rechtop blijft staan. Deze is op; de volgende serie staat in de oven.",
        en: "A narrow neck so a single stem stays upright. Sold out; the next batch is in the kiln.",
      },
      price: 2800,
      stock: 0,
      added: "2026-05-18",
      images: [{ src: "", ratio: "4/5", tone: "soot", alt: { nl: "Smalle donkere vaas", en: "Narrow dark vase" } }],
      details: [{ label: { nl: "Hoogte", en: "Height" }, value: { nl: "14 cm", en: "14 cm" } }],
    },
    {
      id: "zondagset",
      category: "sets",
      name: { nl: "Zondagset", en: "Sunday set" },
      summary: {
        nl: "Twee bekers en een kaars in pot. Voor iemand die je graag op zondag ziet.",
        en: "Two tumblers and a potted candle. For someone you like seeing on a Sunday.",
      },
      description: {
        nl: "We kiezen bekers die bij elkaar passen en pakken alles in vloeipapier, met een kaartje waar je zelf iets op schrijft.",
        en: "We pick tumblers that go together and wrap everything in tissue paper, with a card for you to write on.",
      },
      price: 7400,
      salePrice: 6900,
      stock: 3,
      added: "2026-10-12",
      images: [
        { src: "", ratio: "4/5", tone: "wax", alt: { nl: "Ingepakte set", en: "Wrapped set" } },
        { src: "", ratio: "4/5", tone: "ash", alt: { nl: "Inhoud van de set", en: "What's in the set" } },
      ],
      details: [
        { label: { nl: "Inhoud", en: "Contents" }, value: { nl: "2 bekers, 1 kaars in pot", en: "2 tumblers, 1 potted candle" } },
      ],
    },
    {
      id: "cadeaubon",
      category: "sets",
      name: { nl: "Cadeaubon", en: "Gift card" },
      summary: {
        nl: "Te besteden in de winkel en online, een jaar geldig.",
        en: "For the shop and online, valid for a year.",
      },
      description: {
        nl: "We sturen de bon per post op dik papier, met een stempel van het atelier. Wil je hem digitaal? Zet het in de opmerking bij je bestelling.",
        en: "We post the card on heavy paper with the workshop's stamp. Want it digital? Say so in the note with your order.",
      },
      price: 2500,
      stock: null,
      added: "2025-11-01",
      variants: {
        label: { nl: "Waarde", en: "Value" },
        options: [
          { id: "25", name: { nl: "€ 25", en: "€25" }, price: 2500 },
          { id: "50", name: { nl: "€ 50", en: "€50" }, price: 5000 },
          { id: "75", name: { nl: "€ 75", en: "€75" }, price: 7500 },
        ],
      },
      images: [{ src: "", ratio: "4/5", tone: "ochre", alt: { nl: "Cadeaubon met stempel", en: "Gift card with stamp" } }],
      details: [{ label: { nl: "Geldig", en: "Valid" }, value: { nl: "12 maanden", en: "12 months" } }],
    },
  ],
};
