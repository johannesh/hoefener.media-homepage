import ogImage from "@/assets/og-image.png";

export const siteConfig = {
  name: "hoefener.media",
  description:
    "Webdesign & Web-Engineering aus dem Fichtelgebirge. Schnelle, sichere und skalierbare Webpräsenzen, die Ihre Kunden begeistern.",
  url: "https://hoefener.media",
  lang: "de",
  locale: "de_DE",
  author: "hoefener.media",
  ogImage: ogImage,
  socialLinks: {
    github: "https://github.com/johannesh/hoefener.media-homepage",
  },
  navLinks: [
    { text: "Start", href: "/" },
    { text: "Leistungen", href: "/#leistungen" },
    { text: "Portfolio", href: "/#portfolio" },
    { text: "Kontakt", href: "/contact" },
  ],
};
