import ogImage from "@/assets/og-image.png";

export const siteConfig = {
  name: "hoefener.media",
  description:
    "Webdesign & Web-Engineering aus dem Fichtelgebirge. Schnelle, sichere und skalierbare Webpräsenzen, die Ihre Kunden begeistern.",
  url: "https://hoefener.media",
  lang: "de",
  locale: "de_DE",
  legalName: "hoefener.media e.K.",
  author: "Johannes Höfener",
  email: "johannes@hoefener.media",
  address: {
    street: "Kirchsteig 6",
    postalCode: "95697",
    city: "Nagel",
    region: "Bayern",
    country: "DE",
  },
  areaServed: ["Fichtelgebirge", "Oberfranken", "Oberpfalz"],
  ogImage: ogImage,
  socialLinks: {
    github: "https://github.com/johannesh/hoefener.media-homepage",
  },
  navLinks: [
    { text: "Leistungen", href: "/#leistungen" },
    { text: "Portfolio", href: "/#portfolio" },
    { text: "Ablauf", href: "/#ablauf" },
    { text: "Über mich", href: "/#ueber-mich" },
  ],
  ctaLink: { text: "Projekt anfragen", href: "/contact" },
  legalLinks: [
    { text: "Impressum", href: "/impressum" },
    { text: "Datenschutz", href: "/datenschutz" },
  ],
};
