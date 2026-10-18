import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { Page } from "@playwright/test";

export const PAGES = [
  "/",
  "/contact",
  "/impressum",
  "/datenschutz",
  "/blog",
  "/blog/markdown-features",
  "/404",
];

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

/**
 * Load a page in the given color scheme. By default reduced motion is on, which
 * skips the scroll-reveal fade-in and the typewriter so all content is visible.
 */
export async function gotoPage(
  page: Page,
  path: string,
  theme: Theme = "light",
  { animations = false } = {},
) {
  await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
  await page.emulateMedia({
    reducedMotion: animations ? "no-preference" : "reduce",
    colorScheme: theme,
  });
  await page.goto(path);
}

const require = createRequire(import.meta.url);
const virtualScreenReaderSource = readFileSync(
  require
    .resolve("@guidepup/virtual-screen-reader/package.json")
    .replace(/package\.json$/, "lib/esm/index.browser.js"),
  "utf8",
);

/**
 * Start Guidepup's Virtual Screen Reader in the page and expose it as
 * `window.screenReader`. Run its commands through `page.evaluate`.
 */
export async function startScreenReader(page: Page) {
  const url = "/__virtual-screen-reader.js";
  await page.route(`**${url}`, (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: virtualScreenReaderSource,
    }),
  );
  await page.evaluate(async (src) => {
    const { virtual } = await import(src);
    await virtual.start({ container: document.body });
    Object.assign(window, { screenReader: virtual });
  }, url);
}

/** Move the virtual screen reader through the whole page and return what it said. */
export async function readWholePage(page: Page, maxSteps = 400) {
  return page.evaluate(async (steps) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sr = (window as any).screenReader;
    for (let i = 0; i < steps; i++) {
      const before = (await sr.spokenPhraseLog()).length;
      await sr.next();
      if ((await sr.lastSpokenPhrase()) === "end of document") break;
      if ((await sr.spokenPhraseLog()).length === before) break;
    }
    return (await sr.spokenPhraseLog()) as string[];
  }, maxSteps);
}
