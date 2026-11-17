/*
 * Journal / news posts. Only used when features.blog is true.
 * Newest first is done automatically by date. body is a list of paragraphs per language.
 */
window.POSTS = [
  {
    id: "oven-van-november",
    date: "2026-11-04",
    image: { src: "", ratio: "3/2", tone: "soot" },
    title: { nl: "De oven van november", en: "The November firing" },
    summary: {
      nl: "Een nieuwe roetglazuur, en waarom de helft van de bekers terug naar de klei ging.",
      en: "A new soot glaze, and why half the tumblers went back to clay.",
    },
    body: {
      nl: [
        "We testen al maanden een donkerder glazuur, dat we intern roet noemen. Deze oven was de eerste volle lading ermee.",
        "De helft kwam er prachtig uit: diep zwart met bruine randen waar het glazuur dun liep. De andere helft had speldenprikjes, kleine gaatjes waar gas uit de klei ontsnapte. Die zijn terug naar de klei gegaan.",
        "De goede staan vanaf deze week in de winkel.",
      ],
      en: [
        "We've been testing a darker glaze for months, which we call soot. This was the first full kiln of it.",
        "Half came out beautifully: deep black with brown edges where the glaze ran thin. The other half had pinholes, tiny holes where gas escaped from the clay. Those went back to clay.",
        "The good ones are in the shop from this week.",
      ],
    },
  },
  {
    id: "bijenwas-uit-bunnik",
    date: "2026-09-18",
    image: { src: "", ratio: "3/2", tone: "ochre" },
    title: { nl: "Bijenwas uit Bunnik", en: "Beeswax from Bunnik" },
    summary: {
      nl: "Op bezoek bij de imker waar onze was vandaan komt.",
      en: "Visiting the beekeeper our wax comes from.",
    },
    body: {
      nl: [
        "Elk najaar halen we een paar blokken was op bij een imker in Bunnik. Hij smelt de raten om na het slingeren, en wat overblijft is genoeg voor een jaar waxinelichtjes.",
      ],
      en: [
        "Every autumn we collect a few blocks of wax from a beekeeper in Bunnik. He melts down the combs after extracting the honey, and what's left is enough for a year of tealights.",
      ],
    },
  },
];
