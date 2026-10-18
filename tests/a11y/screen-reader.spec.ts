import { expect, test } from "@playwright/test";
import { gotoPage, PAGES, readWholePage, startScreenReader } from "../helpers";

test.describe("virtual screen reader", () => {
  for (const path of PAGES) {
    test(`${path}: one h1, landmarks, no unnamed controls`, async ({
      page,
    }) => {
      await gotoPage(page, path);
      await startScreenReader(page);
      const spoken = await readWholePage(page);

      expect(spoken[0]).toBe("document");
      expect(spoken[1]).toBe("link, Zum Inhalt springen");
      expect(spoken).toContain("navigation, Hauptnavigation");
      expect(spoken).toContain("main");
      expect(spoken).toContain("contentinfo");
      expect(spoken.at(-1)).toBe("end of document");

      const h1s = spoken.filter(
        (p) => p.startsWith("heading, ") && p.endsWith(", level 1"),
      );
      expect(h1s).toHaveLength(1);

      // A link or button without an accessible name is read as just its role
      const unnamed = spoken.filter((p) =>
        /^(link|button|textbox)(, (required|placeholder .*))?$/.test(p),
      );
      expect(unnamed).toEqual([]);
    });
  }

  test("home: headline is read as one stable sentence", async ({ page }) => {
    await gotoPage(page, "/");
    await startScreenReader(page);
    const spoken = await readWholePage(page);

    expect(spoken).toContain(
      "heading, Webdesign und Web-Engineering: Schön. Schnell. Sicher., level 1",
    );
    // The animated typewriter and its cursor are hidden from assistive tech
    expect(spoken.join("\n")).not.toContain("Web-Design");
    expect(spoken.join("\n")).not.toContain("|");
  });

  test("home: typewriter does not change the announced headline", async ({
    page,
  }) => {
    await gotoPage(page, "/", "light", { animations: true });
    const h1 = page.getByRole("heading", { level: 1 });
    const name = "Webdesign und Web-Engineering: Schön. Schnell. Sicher.";

    await expect(h1).toHaveAccessibleName(name);
    // Wait until the animation has started deleting/typing letters
    await expect(page.locator("#typewriter-text")).not.toHaveText("Design", {
      timeout: 6000,
    });
    await expect(h1).toHaveAccessibleName(name);
    await expect(
      page.locator("[aria-live]:not([data-form-status])"),
    ).toHaveCount(0);
  });

  test("contact: form fields are announced with label and required", async ({
    page,
  }) => {
    await gotoPage(page, "/contact");
    await startScreenReader(page);
    const spoken = await readWholePage(page);

    expect(spoken).toEqual(
      expect.arrayContaining([
        "form",
        expect.stringMatching(/^textbox, Name, .*required$/),
        expect.stringMatching(/^textbox, E-Mail, .*required$/),
        expect.stringMatching(/^textbox, Nachricht, .*required$/),
        "button, Nachricht senden",
      ]),
    );
    // The honeypot field must stay invisible to screen readers
    expect(spoken.join("\n")).not.toMatch(/textbox, Website/);
  });
});
