import "dotenv/config";
import { Pool } from "pg";
import { chromium } from "playwright-core";
import { randomBytes } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:net";
import { existsSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";

const source = new URL(process.env.DATABASE_URL || "");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(source.hostname));
const databaseName = `shamsaz_test_${randomBytes(10).toString("hex")}`;
assert.match(databaseName, /^shamsaz_test_[a-f0-9]{20}$/);
const target = new URL(source);
target.pathname = `/${databaseName}`;
const admin = new Pool({ connectionString: source.toString() });
const ports = createServer();
await new Promise((resolve) => ports.listen(0, "127.0.0.1", resolve));
const port = ports.address().port;
await new Promise((resolve) => ports.close(resolve));
const base = `http://localhost:${port}`,
  password = randomBytes(24).toString("hex");
const executablePath =
  process.env.AUTH_TEST_BROWSER ||
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].find(existsSync);
assert.ok(executablePath);
let created = false,
  server,
  browser;
const seen = new Set(),
  errors = [];
try {
  execFileSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
    stdio: "pipe",
    windowsHide: true,
  });
  await admin.query(`CREATE DATABASE "${databaseName}"`);
  created = true;
  const environment = {
    ...process.env,
    NODE_ENV: "test",
    DATABASE_URL: target.toString(),
    PORT: String(port),
    APP_ORIGIN: base,
    ENABLE_DEMO_SEED: "true",
    DEMO_PASSWORD: password,
  };
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "const {initializeDatabase,db}=await import('./server/db/index.ts');await initializeDatabase();await db.end();",
    ],
    { env: environment, stdio: "pipe", windowsHide: true },
  );
  server = spawn(process.execPath, ["scripts/ui-server.ts"], {
    env: { ...environment, ENABLE_DEMO_SEED: "false" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  server.stdout.resume();
  server.stderr.resume();
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (
      await fetch(`${base}/api/health`)
        .then((r) => r.ok)
        .catch(() => false)
    ) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready);
  browser = await chromium.launch({ headless: true, executablePath });
  mkdirSync(".local/ui-qa/banners", { recursive: true });
  async function check(page, route, expected) {
    await page.goto(`${base}/#${route}`);
    const banner = page.locator(`[data-page-banner="${expected}"]`);
    await banner.waitFor();
    const photo = banner.locator("[data-banner-image]");
    await photo.evaluate(async (image) => {
      await image.decode();
      if (!image.naturalWidth) throw new Error("Banner image failed to decode");
    });
    seen.add(await photo.getAttribute("data-banner-image"));
    assert.ok(
      await banner.locator("h2").innerText(),
      `Banner heading ${route}`,
    );
    await page
      .getByRole("status")
      .filter({ hasText: "در حال دریافت اطلاعات…" })
      .waitFor({ state: "hidden" });
    for (const width of [320, 360, 768, 1366]) {
      await page.setViewportSize({ width, height: 900 });
      const bounds = await banner.boundingBox();
      assert.ok(
        bounds.x >= 0 && bounds.x + bounds.width <= width + 0.5,
        `Banner fits viewport ${route}/${width}`,
      );
      assert.equal(
        await banner.evaluate((node) => node.scrollWidth > node.clientWidth),
        false,
        `Banner overflow ${route}/${width}`,
      );
    }
    await page.screenshot({
      path: `.local/ui-qa/banners/${expected}-desktop.png`,
    });
    if (["home", "doctors", "login", "patient-dashboard"].includes(expected)) {
      await page.setViewportSize({ width: 360, height: 900 });
      await page.screenshot({
        path: `.local/ui-qa/banners/${expected}-mobile.png`,
      });
      if (expected === "login")
        assert.ok(
          (await page.locator('[name="identifier"]').boundingBox()).y < 800,
          "Mobile login remains readily accessible",
        );
    }
    await page.setViewportSize({ width: 1366, height: 900 });
    const toggle = banner.getByRole("button", {
      name: "توقف حرکت بنر",
      exact: true,
    });
    if (await toggle.count()) await toggle.click();
    assert.equal(await banner.getAttribute("data-banner-motion"), "paused");
    assert.equal(
      await banner
        .locator(".page-banner__ring")
        .first()
        .evaluate((node) => getComputedStyle(node).animationPlayState),
      "paused",
    );
    await banner
      .getByRole("button", { name: "پخش حرکت بنر", exact: true })
      .click();
    assert.equal(await banner.getAttribute("data-banner-motion"), "playing");
  }
  const publicContext = await browser.newContext({
    timezoneId: "Asia/Tehran",
    viewport: { width: 1366, height: 900 },
  });
  const publicPage = await publicContext.newPage();
  publicPage.on("pageerror", (e) => errors.push(e.message));
  for (const [route, key] of [
    ["home", "home"],
    ["doctors", "doctors"],
    ["centers", "centers"],
    ["articles", "articles"],
    ["login", "login"],
    ["register", "register"],
    ["forgot-password", "forgot-password"],
    ["reset-password", "reset-password"],
  ])
    await check(publicPage, route, key);
  const groups = [
    [
      "patient",
      [
        ["dashboard", "patient-dashboard"],
        ["appointments", "appointments"],
        ["screening", "screening"],
        ["profile", "profile"],
        ["telemedicine", "telemedicine"],
      ],
    ],
    [
      "doctor",
      [
        ["dashboard", "doctor-dashboard"],
        ["clinical", "clinical"],
        ["registry", "registry"],
        ["tumor-board", "tumor-board"],
      ],
    ],
    [
      "registry",
      [
        ["dashboard", "registry"],
        ["registry", "registry"],
      ],
    ],
    [
      "admin",
      [
        ["dashboard", "admin-dashboard"],
        ["organization", "organization"],
      ],
    ],
    ["supervisor", [["national-dashboard", "national-dashboard"]]],
  ];
  for (const [role, routes] of groups) {
    const context = await browser.newContext({
      timezoneId: "Asia/Tehran",
      viewport: { width: 1366, height: 900 },
    });
    const response = await context.request.post(`${base}/api/auth/login`, {
      data: { email: `${role}@shamsaz.local`, password },
    });
    assert.equal(response.status(), 200);
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    for (const [route, key] of routes) await check(page, route, key);
    await context.close();
  }
  await publicPage.emulateMedia({ reducedMotion: "reduce" });
  await publicPage.goto(`${base}/#home`);
  await publicPage.locator('[data-page-banner="home"]').waitFor();
  assert.equal(
    await publicPage
      .locator(".page-banner__ring")
      .first()
      .evaluate((node) => getComputedStyle(node).animationName),
    "none",
  );
  assert.equal(seen.size, 19, "Every distinct banner asset is used");
  assert.deepEqual(errors, []);
  console.log(
    "Banner QA passed: 19 distinct images across 22 page/role views, 320/360/768/1366 layouts, motion toggle, reduced-motion, mobile login accessibility and no browser errors.",
  );
} finally {
  await browser?.close();
  if (server && server.exitCode === null) {
    server.kill();
    await new Promise((resolve) => server.once("exit", resolve));
  }
  if (created)
    await admin.query(`DROP DATABASE "${databaseName}" WITH (FORCE)`);
  await admin.end();
}
