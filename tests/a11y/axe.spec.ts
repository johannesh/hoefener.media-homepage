import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { gotoPage, PAGES, THEMES } from "../helpers";

const WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
  "best-practice",
];

for (const theme of THEMES) {
  for (const path of PAGES) {
    test(`axe: ${path} (${theme})`, async ({ page }) => {
      await gotoPage(page, path, theme);

      const { violations } = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .analyze();

      // Readable summary in the failure message instead of the raw axe dump
      const summary = violations.map(
        (v) =>
          `${v.id} (${v.impact}): ${v.help}\n` +
          v.nodes.map((n) => `  - ${n.target.join(" ")}`).join("\n"),
      );
      expect(summary).toEqual([]);
    });
  }
}
