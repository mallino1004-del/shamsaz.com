import { chromium } from "playwright-core";
import { existsSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
const base = process.env.DIRECTORY_TEST_ORIGIN || "http://localhost:3001";
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname));
const executablePath =
  process.env.DIRECTORY_TEST_BROWSER ||
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].find(existsSync);
const browser = await chromium.launch({ headless: true, executablePath });
try {
  const page = await browser.newPage({
      viewport: { width: 1366, height: 900 },
      timezoneId: "Asia/Tehran",
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/#centers`);
  const hospitals = page.locator("#hospitals-panel"),
    pharmacies = page.locator("#pharmacies-panel");
  await hospitals.waitFor();
  assert.equal(await page.locator("[data-page-banner]").count(), 1);
  assert.equal(
    await page
      .getByText("بانک اطلاعات جامع نظام سلامت تهران", { exact: true })
      .count(),
    0,
    "Legacy duplicate banner removed",
  );
  assert.equal(
    await page
      .getByRole("tab", { name: "بیمارستان‌ها", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  const hospitalName = (
    await hospitals.locator("h3").first().innerText()
  ).trim();
  const hospitalSearch = hospitals.locator('input[type="text"]');
  await hospitalSearch.fill(hospitalName);
  await page.getByRole("tab", { name: "داروخانه‌ها", exact: true }).click();
  await page.waitForURL("**/#pharmacies");
  await pharmacies.waitFor();
  assert.equal(await hospitals.count(), 0);
  const pharmacyName = (
    await pharmacies.locator("h3").first().innerText()
  ).trim();
  const pharmacySearch = pharmacies.locator('input[type="text"]');
  await pharmacySearch.fill(pharmacyName);
  assert.ok((await pharmacies.locator("h3").count()) > 0);
  await page.getByRole("tab", { name: "بیمارستان‌ها", exact: true }).click();
  await page.waitForURL("**/#hospitals");
  await hospitals.waitFor();
  assert.equal(
    await hospitalSearch.inputValue(),
    hospitalName,
    "Hospital search retained separately",
  );
  await page
    .getByRole("tab", { name: "بیمارستان‌ها", exact: true })
    .press("ArrowLeft");
  await page.waitForURL("**/#pharmacies");
  await pharmacies.waitFor();
  assert.equal(
    await pharmacySearch.inputValue(),
    pharmacyName,
    "Pharmacy search retained separately",
  );
  await page.reload();
  await pharmacies.waitFor();
  assert.equal(
    await page
      .getByRole("tab", { name: "داروخانه‌ها", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  await page
    .locator("header summary")
    .filter({ hasText: "مراکز درمانی" })
    .click();
  await page
    .locator("header")
    .getByRole("button", { name: /بیمارستان‌ها/ })
    .click();
  await page.waitForURL("**/#hospitals");
  await hospitals.waitFor();
  mkdirSync(".local/ui-qa/centers", { recursive: true });
  for (const width of [320, 360, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Hospital overflow ${width}`,
    );
    await page.getByRole("tab", { name: "داروخانه‌ها", exact: true }).click();
    await pharmacies.waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Pharmacy overflow ${width}`,
    );
    if (width === 1366)
      await page.screenshot({
        path: ".local/ui-qa/centers/pharmacies-desktop.png",
      });
    if (width === 360)
      await page.screenshot({
        path: ".local/ui-qa/centers/pharmacies-mobile.png",
      });
    await page.getByRole("tab", { name: "بیمارستان‌ها", exact: true }).click();
    await hospitals.waitFor();
  }
  await page.setViewportSize({ width: 360, height: 900 });
  await page.getByRole("button", { name: "باز کردن منو", exact: true }).click();
  await page
    .locator("#mobile-navigation summary")
    .filter({ hasText: "مراکز درمانی" })
    .click();
  await page
    .locator("#mobile-navigation")
    .getByRole("button", { name: /داروخانه‌ها/ })
    .click();
  await page.waitForURL("**/#pharmacies");
  await pharmacies.waitFor();
  assert.equal(
    await page.locator("#mobile-navigation").count(),
    0,
    "Mobile menu closes after selecting group",
  );
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.getByRole("tab", { name: "بیمارستان‌ها", exact: true }).click();
  await hospitals.waitFor();
  await page.screenshot({ path: ".local/ui-qa/centers/hospitals-desktop.png" });
  assert.deepEqual(errors, []);
  console.log(
    "Centers QA passed: one merged banner, separate hospital/pharmacy groups and searches, keyboard, menu destinations, refresh persistence and four viewport widths.",
  );
} finally {
  await browser.close();
}
