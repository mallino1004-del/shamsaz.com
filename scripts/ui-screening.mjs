import "dotenv/config";
import { Pool } from "pg";
import { chromium } from "playwright-core";
import { randomBytes } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:net";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const source = new URL(process.env.DATABASE_URL || "");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(source.hostname));
const name = `shamsaz_test_${randomBytes(10).toString("hex")}`;
assert.match(name, /^shamsaz_test_[a-f0-9]{20}$/);
const target = new URL(source);
target.pathname = `/${name}`;
const admin = new Pool({ connectionString: source.toString() });
const portServer = createServer();
await new Promise((r) => portServer.listen(0, "127.0.0.1", r));
const port = portServer.address().port;
await new Promise((r) => portServer.close(r));
const base = `http://localhost:${port}`,
  password = randomBytes(24).toString("hex"),
  directory = ".local/ui-qa/screening";
const executablePath =
  process.env.AUTH_TEST_BROWSER ||
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].find(existsSync);
assert.ok(executablePath);
let created = false,
  service,
  browser,
  fixture;
try {
  execFileSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
    stdio: "pipe",
    windowsHide: true,
  });
  await admin.query(`CREATE DATABASE "${name}"`);
  created = true;
  const env = {
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
    { env, stdio: "pipe", windowsHide: true },
  );
  service = spawn(process.execPath, ["scripts/ui-server.ts"], {
    env: { ...env, ENABLE_DEMO_SEED: "false" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  service.stdout.resume();
  service.stderr.resume();
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (
      await fetch(base + "/api/health")
        .then((r) => r.ok)
        .catch(() => false)
    ) {
      ready = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.ok(ready);
  fixture = new Pool({ connectionString: target.toString() });
  browser = await chromium.launch({ headless: true, executablePath });
  mkdirSync(directory, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    timezoneId: "Asia/Tehran",
    reducedMotion: "reduce",
    acceptDownloads: true,
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  async function login(p, email) {
    await p.goto(base + "/#login");
    await p.locator('[name="identifier"]').fill(email);
    await p.locator('[name="password"]').fill(password);
    await p.getByRole("button", { name: "ورود به حساب شمساز", exact: true }).click();
    await p.waitForURL(/#dashboard/);
  }
  async function fits() {
    for (const width of [320, 360, 768, 1366]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        ),
        false,
        `No horizontal overflow ${width}`,
      );
    }
  }
  await login(page, "patient@shamsaz.local");
  await page.goto(base + "/#screening");
  const workspace = page.locator(".screening-workspace");
  await workspace
    .getByRole("heading", { name: "غربالگری هوشمند سلامت زنان", exact: true })
    .waitFor();
  assert.equal(
    await page
      .getByRole("spinbutton", { name: "سن (سال)", exact: true })
      .inputValue(),
    "",
  );
  await fits();
  await page
    .getByRole("spinbutton", { name: "سن (سال)", exact: true })
    .fill("45");
  const choices = [
    ["وضعیت قاعدگی / یائسگی", "pre"],
    ["آیا دهانه رحم دارید؟", "yes"],
    ["بارداری یا احتمال بارداری", "no"],
    ["سرطان پستان یا تخمدان در بستگان درجه‌اول", "no"],
    ["نتیجه شناخته‌شده آزمایش ژنتیک", "none"],
    ["سابقه سرطان پستان / زنان یا ضایعه پیش‌سرطانی دهانه رحم", "no"],
    ["ضعف سیستم ایمنی، HIV یا درمان سرکوب‌کننده ایمنی", "no"],
    ["سابقه پرتودرمانی قفسه سینه پیش از ۳۰ سال", "no"],
  ];
  for (const [label, value] of choices)
    await page
      .getByRole("combobox", { name: label, exact: true })
      .selectOption(value);
  await page.getByRole("button", { name: "ادامه", exact: true }).click();
  await page.getByRole("button", { name: "ادامه", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "علائم را انتخاب کنید" })
    .waitFor();
  await page
    .getByRole("checkbox", {
      name: "هیچ‌یک از علائم زیر را ندارم",
      exact: true,
    })
    .check();
  await fits();
  await page.getByRole("button", { name: "ادامه", exact: true }).click();
  await page
    .getByLabel("تاریخ آخرین ماموگرافی (میلادی)", { exact: true })
    .fill("2025-10-01");
  await page
    .getByRole("combobox", { name: "نتیجه ماموگرافی", exact: true })
    .selectOption("normal");
  await page
    .getByLabel("تاریخ آخرین آزمایش دهانه رحم (میلادی)", { exact: true })
    .fill("2024-10-01");
  await page
    .getByRole("combobox", { name: "نوع آزمایش دهانه رحم", exact: true })
    .selectOption("hpv");
  await page
    .getByRole("combobox", { name: "نتیجه آزمایش دهانه رحم", exact: true })
    .selectOption("normal");
  await page
    .getByRole("combobox", { name: "وضعیت واکسن HPV", exact: true })
    .selectOption("complete");
  await fits();
  await page.getByRole("button", { name: "ادامه", exact: true }).click();
  await page
    .getByRole("heading", { name: "برنامه پیشگیری و پیگیری", exact: true })
    .waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "چاپ گزارش", exact: true })
      .getAttribute("type"),
    "button",
  );
  await page
    .getByRole("button", { name: "راهنما و پرسش‌ها", exact: true })
    .click();
  await page
    .getByText("آیا گزارش به معنی تشخیص سرطان است؟", { exact: true })
    .click();
  await fits();
  await page.getByRole("button", { name: "ارزیابی جدید", exact: true }).click();
  await page
    .getByRole("heading", { name: "بازبینی و رضایت", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "ثبت نهایی گزارش", exact: true })
    .click();
  assert.equal(
    (await fixture.query("SELECT COUNT(*)::int AS n FROM screening_reports"))
      .rows[0].n,
    0,
  );
  await page.getByRole("checkbox", { name: /با ذخیره پاسخ‌های سلامت/ }).check();
  let injectedFailure = false;
  await page.route("**/api/screenings", async (route) => {
    if (route.request().method() === "POST" && !injectedFailure) {
      injectedFailure = true;
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: { message: "خطای آزمایشی ثبت؛ دوباره تلاش کنید." },
        }),
      });
    } else await route.continue();
  });
  await page
    .getByRole("button", { name: "ثبت نهایی گزارش", exact: true })
    .click();
  await page
    .getByRole("alert")
    .filter({ hasText: "خطای آزمایشی ثبت" })
    .waitFor();
  assert.equal(
    await page
      .getByRole("checkbox", { name: /با ذخیره پاسخ‌های سلامت/ })
      .isChecked(),
    true,
  );
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/screenings") && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "ثبت نهایی گزارش", exact: true })
    .click();
  const r = await response;
  assert.equal(r.status(), 201);
  const { screening } = await r.json();
  await page
    .getByRole("status")
    .filter({ hasText: "گزارش با موفقیت" })
    .waitFor();
  await fits();
  await page.screenshot({
    path: directory + "/report-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 360, height: 900 });
  await page.screenshot({
    path: directory + "/report-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1366, height: 900 });
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "دریافت فایل گزارش", exact: true })
    .click();
  const download = await downloadPromise;
  await download.saveAs(directory + "/download.json");
  assert.equal(
    JSON.parse(readFileSync(directory + "/download.json", "utf8")).id,
    screening.id,
  );
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator(".page-banner").isVisible(), false);
  assert.equal(
    await page.getByRole("article", { name: "گزارش غربالگری" }).isVisible(),
    true,
  );
  await page.pdf({
    path: directory + "/report.pdf",
    format: "A4",
    printBackground: true,
  });
  await page.emulateMedia({ media: "screen" });
  await context.clearCookies();
  await login(page, "patient@shamsaz.local");
  await page.goto(base + "/#screening");
  await page
    .getByRole("button", { name: "گزارش‌ها و پیگیری", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: /برنامه پیشگیری و پیگیری.*مشاهده جزئیات گزارش/,
    })
    .click();
  await page.getByRole("article", { name: "گزارش غربالگری" }).waitFor();
  assert.ok(
    (
      await page.getByRole("article", { name: "گزارش غربالگری" }).innerText()
    ).includes(screening.id),
  );
  await fits();
  const row = (
    await fixture.query("SELECT * FROM screening_reports WHERE id=$1", [
      screening.id,
    ])
  ).rows[0];
  assert.equal(row.patient_id, "demo-patient");
  assert.equal(row.triage_level, "routine");
  assert.equal(row.payload_json.assessment.plans[0].nextDate, "2027-10-01");
  assert.equal(row.payload_json.assessment.plans[1].nextDate, "2029-10-01");
  await page.getByRole("button", { name: "ارزیابی جدید", exact: true }).click();
  await page
    .getByRole("spinbutton", { name: "سن (سال)", exact: true })
    .fill("45");
  await page.getByRole("button", { name: "ادامه", exact: true }).click();
  await page
    .getByRole("checkbox", {
      name: "درد ناگهانی و شدید شکم یا لگن",
      exact: true,
    })
    .check();
  await page
    .getByRole("alert")
    .filter({ hasText: "برای مراجعه فوری منتظر تکمیل فرم نمانید" })
    .waitFor();
  await fits();
  await page.screenshot({
    path: directory + "/urgent-alert.png",
    fullPage: true,
  });
  const doctorContext = await browser.newContext();
  const doctor = await doctorContext.newPage();
  doctor.on("pageerror", (e) => errors.push(e.message));
  await login(doctor, "doctor@shamsaz.local");
  await doctor.goto(base + "/#screening");
  await doctor
    .getByRole("heading", {
      name: "راهنمای غربالگری برای تیم درمان",
      exact: true,
    })
    .waitFor();
  assert.equal(await doctor.locator('[name="age"]').count(), 0);
  assert.deepEqual(errors, []);
  writeFileSync(
    directory + "/report.json",
    JSON.stringify(
      {
        verifiedAt: new Date().toISOString(),
        mode: "isolated",
        reportId: screening.id,
        triageLevel: row.triage_level,
        viewports: [320, 360, 768, 1366],
        checks: [
          "wizard validation",
          "consent",
          "retry without data loss",
          "server-derived assessment",
          "PostgreSQL persistence",
          "logout/login history",
          "print PDF",
          "JSON export",
          "urgent alert",
          "staff restriction",
        ],
        runtimeErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "Screening browser QA passed: five-step assessment, consent, failed-save retry, persisted report after logout/login, urgent symptoms, four widths, export/print and staff restrictions.",
  );
} finally {
  await browser?.close();
  if (service && service.exitCode === null) {
    service.kill();
    await new Promise((r) => service.once("exit", r));
  }
  await fixture?.end();
  if (created) await admin.query(`DROP DATABASE "${name}" WITH (FORCE)`);
  await admin.end();
}
