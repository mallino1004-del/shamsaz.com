import { chromium } from "playwright-core";
import { existsSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";

// Read-only QA against the running local development site. Uses its own headless browser.
const base = process.env.DIRECTORY_TEST_ORIGIN || "http://localhost:3001";
const origin = new URL(base);
assert.ok(
  ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname),
  "Directory QA requires a local server",
);
const executablePath =
  process.env.DIRECTORY_TEST_BROWSER ||
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].find(existsSync);
assert.ok(
  executablePath,
  "Set DIRECTORY_TEST_BROWSER to a locally installed Chromium browser",
);
const response = await fetch(`${base}/api/practitioners`);
assert.equal(response.ok, true, "Practitioner API must respond");
const { practitioners, categories } = await response.json();
assert.ok(
  practitioners.length > 0,
  "Import the verified directory before running this QA",
);
assert.equal(
  categories.reduce((sum, category) => sum + category.count, 0),
  practitioners.length,
  "Category counts match public profiles",
);
assert.ok(
  practitioners.every(
    (doctor) => doctor.sourceUrl ? /^https:\/\//.test(doctor.sourceUrl) : !!doctor.accountId && doctor.profileOrigin === 'registered',
  ),
  "Imported profiles retain sources; registered profiles identify their account",
);
const runtimeErrors = [];
const browser = await chromium.launch({
  headless: true,
  executablePath,
  timeout: 20000,
});
try {
  const page = await browser.newPage({
    viewport: { width: 1366, height: 900 },
    timezoneId: "Asia/Tehran",
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.goto(`${base}/#doctors`);
  const cards = page.locator("main article");
  await cards.first().waitFor();
  await assertCount(cards, practitioners.length);
  for (const doctor of practitioners) {
    const card = cards.filter({
      has: page.getByRole("heading", { name: doctor.displayName, exact: true }),
    });
    assert.equal(await card.count(), 1, `${doctor.displayName} appears once`);
    if(doctor.sourceUrl)assert.equal(
      await card
        .getByRole("link", { name: "صفحهٔ معرفی و منبع اطلاعات" })
        .getAttribute("href"),
      doctor.sourceUrl,
    );
    else {
      assert.equal(await card.getByRole('link',{name:'صفحهٔ معرفی و منبع اطلاعات'}).count(),0);
      assert.equal(await card.getByText('عضو سامانه',{exact:true}).count(),1);
    }
    assert.equal(await card.getByRole("button", { name: "رزرو ویزیت", exact: true }).count(), 1, "Every physician has a booking button");
    if (doctor.photoUrl) {
      const photoResponse = await fetch(new URL(doctor.photoUrl, base));
      assert.equal(
        photoResponse.ok,
        true,
        `${doctor.displayName} photo endpoint`,
      );
      assert.ok(
        photoResponse.headers.get("content-type")?.startsWith("image/"),
      );
      const image = card.locator("img");
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((image) => image.decode());
      assert.ok(
        await image.evaluate((image) => image.naturalWidth > 0),
        `${doctor.displayName} photo decodes`,
      );
    }
  }
  for (const category of categories) {
    await page
      .getByRole("button", {
        name: `${category.label} (${category.count.toLocaleString("fa-IR")})`,
        exact: true,
      })
      .click();
    await assertCount(cards, category.count);
    const headings = await cards.locator("h3").allTextContents();
    assert.ok(
      headings.every((name) =>
        practitioners.some(
          (doctor) =>
            doctor.displayName === name && doctor.categoryId === category.id,
        ),
      ),
    );
  }
  await page.getByRole("button", { name: "همهٔ تخصص‌ها", exact: true }).click();
  const search = page.getByRole("textbox", {
    name: "جست‌وجوی نام، تخصص یا نشانی پزشک",
  });
  const chosen =
    practitioners.find((doctor) => /[یک]/.test(doctor.displayName)) ||
    practitioners[0];
  await search.fill(chosen.displayName.replace(/ی/g, "ي").replace(/ک/g, "ك"));
  await assertCount(cards, 1);
  assert.equal(await cards.locator("h3").textContent(), chosen.displayName);
  await search.fill("نامی که در فهرست پزشکان وجود ندارد ۹۸۷۶۵۴");
  await assertCount(cards, 0);
  assert.ok(
    await page
      .getByText("پزشکی با این جست‌وجو پیدا نشد", { exact: true })
      .isVisible(),
  );
  await page
    .getByRole("button", { name: "نمایش همهٔ پزشکان", exact: true })
    .click();
  await assertCount(cards, practitioners.length);
  mkdirSync(".local/ui-qa", { recursive: true });
  for (const width of [320, 360, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Directory horizontal overflow at ${width}`,
    );
    const header = page.locator("header");
    assert.ok(await header.isVisible(), `Header visible at ${width}`);
    assert.equal(
      await header.evaluate((header) => header.scrollWidth > innerWidth),
      false,
      `Header horizontal overflow at ${width}`,
    );
    if (width === 360)
      await page.screenshot({
        path: ".local/ui-qa/doctors-mobile.png",
        fullPage: false,
      });
    if (width === 1366)
      await page.screenshot({
        path: ".local/ui-qa/doctors-desktop.png",
        fullPage: false,
      });
  }
  await page.goto(`${base}/#home`);
  const featured = page.locator("section").filter({
    has: page.getByRole("heading", {
      name: "پزشکان سرطان زنان",
      exact: true,
    }),
  });
  const featuredCards = featured.locator("article");
  const expected = [
    ...new Set(practitioners.map((doctor) => doctor.categoryId)),
  ]
    .flatMap((category) =>
      practitioners
        .filter((doctor) => doctor.categoryId === category)
        .slice(0, 2),
    )
    .slice(0, 6);
  await assertCount(featuredCards, expected.length);
  assert.deepEqual(
    await featuredCards.locator("h3").allTextContents(),
    expected.map((doctor) => doctor.displayName),
  );
  for (const width of [320, 360, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Homepage horizontal overflow at ${width}`,
    );
  }
  assert.deepEqual(runtimeErrors, [], "No browser runtime errors");
  console.log(
    `Directory QA passed: ${practitioners.length} profiles, ${categories.length} categories, photographs, Persian search, filters, homepage and four viewport widths.`,
  );
} finally {
  await browser.close();
}
async function assertCount(locator, expected) {
  // React filtering and asynchronous fetch may settle after this message boundary.
  for (let attempt = 0; attempt < 50; attempt++) {
    if ((await locator.count()) === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(await locator.count(), expected);
}
