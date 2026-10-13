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
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/#home`);
  const banner = page.locator('[data-page-banner="home"]');
  await banner.waitFor();
  await banner
    .getByRole("button", { name: "توقف حرکت بنر", exact: true })
    .click();
  const dots = banner.locator(".page-banner__slide-dots button");
  assert.equal(await dots.count(), 8);
  const targets = [
    "doctors",
    "appointments",
    "screening",
    "articles",
    "register",
    "registry",
    "tumor-board",
    "clinical",
  ];
  for (let slide = 0; slide < 8; slide++) {
    await dots.nth(slide).click();
    assert.equal(await banner.getAttribute("data-home-slide"), String(slide));
    await banner.locator("img").evaluate(async (img) => {
      await img.decode();
      if (!img.naturalWidth) throw new Error("Slide image failed");
    });
    assert.equal(await dots.nth(slide).getAttribute("aria-current"), "true");
    assert.equal(
      await banner
        .locator(".page-banner__copy")
        .evaluate((node) => getComputedStyle(node).opacity),
      "1",
      "Paused manual slide remains readable",
    );
    for (const width of [320, 360, 768, 1366]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `Overflow slide${slide}/${width}`,
      );
      const controls = await banner
          .locator(".page-banner__carousel-controls")
          .boundingBox(),
        frame = await banner.boundingBox();
      assert.ok(
        controls.x >= frame.x &&
          controls.x + controls.width <= frame.x + frame.width,
        "Controls fit banner",
      );
      const action = await banner.locator(".page-banner__action").boundingBox();
      assert.ok(
        action.y + action.height <= controls.y,
        "Slide controls do not overlap action",
      );
    }
    await banner.locator(".page-banner__action").click();
    await page.waitForURL(`**/#${targets[slide]}`);
    await page.goto(`${base}/#home`);
    await banner.waitFor();
  }
  await page.setViewportSize({ width: 1366, height: 900 });
  await dots.first().click();
  await banner
    .getByRole("button", { name: "اسلاید قبلی", exact: true })
    .click();
  assert.equal(await banner.getAttribute("data-home-slide"), "7");
  await banner
    .getByRole("button", { name: "اسلاید بعدی", exact: true })
    .click();
  assert.equal(await banner.getAttribute("data-home-slide"), "0");
  await banner
    .getByRole("button", { name: "اسلاید بعدی", exact: true })
    .press("ArrowLeft");
  assert.equal(await banner.getAttribute("data-home-slide"), "1");
  await dots.first().click();
  await page.mouse.move(1300, 800);
  await page
    .locator("header")
    .getByRole("button", { name: "ورود", exact: true })
    .focus();
  await page.waitForTimeout(7300);
  assert.equal(
    await banner.getAttribute("data-home-slide"),
    "0",
    "Paused carousel does not advance",
  );
  await banner
    .getByRole("button", { name: "پخش حرکت بنر", exact: true })
    .click();
  await page.mouse.move(1300, 800);
  await page.waitForFunction(
    () =>
      document.querySelector('[data-page-banner="home"]').dataset.homeSlide ===
      "1",
    {},
    { timeout: 9000 },
  );
  await banner
    .getByRole("button", { name: "توقف حرکت بنر", exact: true })
    .click();
  mkdirSync(".local/ui-qa/carousel", { recursive: true });
  await page.screenshot({ path: ".local/ui-qa/carousel/home-desktop.png" });
  await page.setViewportSize({ width: 360, height: 900 });
  await page.screenshot({ path: ".local/ui-qa/carousel/home-mobile.png" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await banner
    .getByRole("button", { name: "پخش حرکت بنر", exact: true })
    .click();
  await page.mouse.move(1300, 800);
  const reducedSlide = await banner.getAttribute("data-home-slide");
  await page.waitForTimeout(7300);
  assert.equal(
    await banner.getAttribute("data-home-slide"),
    reducedSlide,
    "Reduced motion disables autoplay",
  );
  assert.deepEqual(errors, []);
  console.log(
    "Home carousel QA passed: 8 slides and destinations, image decoding, four viewport widths, controls, keyboard, wraparound, pause/resume autoplay and reduced-motion.",
  );
} finally {
  await browser.close();
}
