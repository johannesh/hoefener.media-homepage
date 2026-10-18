import { expect, test, type Page } from "@playwright/test";
import { gotoPage, PAGES, THEMES } from "../helpers";

/** Tab through the page and describe every focused element and its focus style. */
async function tabThroughPage(page: Page, maxSteps = 80) {
  const stops: { name: string; visible: boolean }[] = [];
  for (let i = 0; i < maxSteps; i++) {
    await page.keyboard.press("Tab");
    const stop = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const hasOutline =
        cs.outlineStyle !== "none" && cs.outlineWidth !== "0px";
      const hasRing = cs.boxShadow !== "none";
      const label =
        el.getAttribute("aria-label") ||
        el.textContent?.trim().replace(/\s+/g, " ").slice(0, 40) ||
        el.tagName;
      return {
        name: `${el.tagName.toLowerCase()} "${label}"`,
        visible: hasOutline || hasRing,
      };
    });
    if (!stop) break;
    // Focus wrapped around to the first element again
    if (stops.length > 0 && stop.name === stops[0].name) break;
    stops.push(stop);
  }
  return stops;
}

test.describe("keyboard", () => {
  for (const theme of THEMES) {
    for (const path of PAGES) {
      test(`${path} (${theme}): every focus stop is visible`, async ({
        page,
      }) => {
        await gotoPage(page, path, theme);
        const stops = await tabThroughPage(page);

        expect(stops.length).toBeGreaterThan(3);
        expect(stops[0].name).toBe('a "Zum Inhalt springen"');
        expect(stops.filter((s) => !s.visible).map((s) => s.name)).toEqual([]);
      });
    }
  }

  test("skip link moves focus to the main content", async ({ page }) => {
    await gotoPage(page, "/");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Zum Inhalt springen" });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
  });

  test("theme toggle switches scheme and updates its label", async ({
    page,
  }) => {
    await gotoPage(page, "/", "light");
    const toggle = page
      .getByRole("button", { name: "Zu dunklem Farbschema wechseln" })
      .filter({ visible: true });
    await toggle.focus();
    await page.keyboard.press("Enter");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(
      page
        .getByRole("button", { name: "Zu hellem Farbschema wechseln" })
        .filter({ visible: true }),
    ).toBeFocused();
  });
});

test.describe("mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "Only shown on small screens");

  test("opens with the keyboard and reports its state", async ({ page }) => {
    await gotoPage(page, "/");
    const menuButton = page.getByRole("button", { name: "Hauptmenü öffnen" });
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await menuButton.focus();
    await page.keyboard.press("Enter");

    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    const menu = page.locator("#mobile-menu");
    await expect(menu.getByRole("link", { name: "Leistungen" })).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
  });
});

test.describe("navigation structure", () => {
  test.skip(({ isMobile }) => !!isMobile, "Desktop navigation only");

  test("matches the expected accessibility tree", async ({ page }) => {
    await gotoPage(page, "/");
    await expect(page.getByRole("navigation", { name: "Hauptnavigation" }))
      .toMatchAriaSnapshot(`
      - navigation "Hauptnavigation":
        - link "hoefener.media"
        - link "Leistungen"
        - link "Portfolio"
        - link "Ablauf"
        - link "Über mich"
        - link "Projekt anfragen"
        - button "Zu dunklem Farbschema wechseln"
    `);
  });
});
