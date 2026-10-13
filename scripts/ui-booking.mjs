import 'dotenv/config';
import { Pool } from 'pg';
import { chromium } from 'playwright-core';
import { randomBytes } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { existsSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const source = new URL(process.env.DATABASE_URL || '');
assert.ok(['localhost','127.0.0.1','[::1]'].includes(source.hostname), 'Booking QA requires local PostgreSQL');
const name = `shamsaz_test_${randomBytes(10).toString('hex')}`;
assert.match(name, /^shamsaz_test_[a-f0-9]{20}$/);
const admin = new Pool({connectionString:source.toString()});
const target = new URL(source); target.pathname=`/${name}`;
const ports = createServer(); await new Promise(resolve=>ports.listen(0,'127.0.0.1',resolve));
const port=ports.address().port; await new Promise(resolve=>ports.close(resolve));
const base=`http://localhost:${port}`;
const password=randomBytes(24).toString('hex');
const executablePath = process.env.AUTH_TEST_BROWSER || ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
assert.ok(executablePath, 'A local Chromium browser is required');
let created=false,service,browser,fixture;
try {
  execFileSync(process.execPath,['node_modules/vite/bin/vite.js','build'],{windowsHide:true,stdio:'pipe'});
  await admin.query(`CREATE DATABASE "${name}"`);created=true;
  const environment={...process.env,NODE_ENV:'test',PORT:String(port),DATABASE_URL:target.toString(),ENABLE_DEMO_SEED:'true',DEMO_PASSWORD:password,APP_ORIGIN:base};
  execFileSync(process.execPath,['--input-type=module','-e',"const {initializeDatabase,db}=await import('./server/db/index.ts');await initializeDatabase();await db.end();"],{env:environment,windowsHide:true,stdio:'pipe'});
  fixture=new Pool({connectionString:target.toString()});
  await fixture.query("INSERT INTO practitioner_categories(id,label) VALUES('qa-oncology','تخصص آزمایشی')");
  await fixture.query("INSERT INTO public_practitioners(id,display_name,specialty,category_id,city,address,source_url,source_checked_at) VALUES('qa-practitioner','پزشک آزمایش رزرو','تخصص آزمایشی','qa-oncology','تهران','نشانی مصنوعی آزمون','https://example.test/doctor',CURRENT_TIMESTAMP)");
  service=spawn(process.execPath,['scripts/ui-server.ts'],{windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...environment,ENABLE_DEMO_SEED:'false'}});
  service.stdout.resume();service.stderr.resume();
  let ready=false;
  for(let i=0;i<100;i++) { if(await fetch(`${base}/api/health`).then(r=>r.ok).catch(()=>false)){ready=true;break;}await new Promise(resolve=>setTimeout(resolve,100)); }
  assert.ok(ready,'Isolated server must start');
  browser=await chromium.launch({headless:true,executablePath});
  const page=await browser.newPage({viewport:{width:1366,height:900},timezoneId:'Asia/Tehran'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${base}/#doctors`);
  await page.locator('main article').filter({has:page.getByRole('heading',{name:'پزشک آزمایش رزرو',exact:true})}).getByRole('button',{name:'رزرو ویزیت',exact:true}).click();
  const dialog=page.getByRole('dialog');await dialog.waitFor();
  await dialog.getByRole('button',{name:'ورود به حساب',exact:true}).click();
  await page.waitForURL('**/#login');
  await page.locator('[name="identifier"]').fill('patient@shamsaz.local');
  await page.locator('[name="password"]').fill(password);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL('**/#doctors');await dialog.waitFor();
  await dialog.locator('[name="patientName"]').waitFor();
  assert.ok(await dialog.locator('[name="patientName"]').inputValue(),'Patient name prefilled');
  const preferredDate=new Date(Date.now()+3*86400000).toISOString().slice(0,10);
  await dialog.locator('[name="phone"]').fill('۰۹۱۲۳۴۵۰۰۰۲');
  await dialog.locator('[name="preferredDate"]').fill(preferredDate);
  await dialog.locator('[name="preferredTime"]').fill('15:30');
  await dialog.locator('[name="visitType"]').selectOption('in_person');
  await dialog.locator('[name="reason"]').fill('درخواست مصنوعی برای بررسی ثبت رزرو');
  await dialog.locator('[name="consent"]').check();
  mkdirSync('.local/ui-qa',{recursive:true});
  for(const width of [320,360,768,1366]) {
    await page.setViewportSize({width,height:900});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Booking modal overflow ${width}`);
    assert.ok(await dialog.isVisible());
  }
  await page.screenshot({path:'.local/ui-qa/booking-desktop.png'});
  const submitted=page.waitForResponse(r=>r.url().includes('/visit-requests')&&r.request().method()==='POST');
  await dialog.locator('form button[type="submit"]').click();
  const response=await submitted;assert.equal(response.status(),201);
  const {visitRequest}=await response.json();assert.equal(visitRequest.status,'pending');
  assert.equal(visitRequest.practitionerId,'qa-practitioner');assert.equal(visitRequest.phone,'09123450002');
  await dialog.getByText(visitRequest.reference,{exact:false}).waitFor();
  const stored=(await fixture.query('SELECT * FROM public_visit_requests WHERE id=$1',[visitRequest.id])).rows[0];
  assert.ok(stored,'Reservation stored in PostgreSQL');
  await page.goto(`${base}/#appointments`);
  await page.getByText(visitRequest.reference,{exact:false}).waitFor();
  await page.reload();await page.getByText(visitRequest.reference,{exact:false}).waitFor();
  const cancellation=page.waitForResponse(r=>r.url().endsWith(`/visit-requests/${visitRequest.id}`)&&r.request().method()==='PATCH');
  await page.getByRole('button',{name:'لغو درخواست',exact:true}).click();
  await page.getByRole('button',{name:'بله، لغو درخواست',exact:true}).click();
  assert.equal((await cancellation).status(),200);
  assert.deepEqual(errors,[]);
  console.log('Booking browser QA passed: anonymous/login return, selected doctor, validated form, PostgreSQL persistence, patient history after refresh, cancellation and four viewport widths.');
} finally {
  await browser?.close();
  if(service&&service.exitCode===null){service.kill();await new Promise(resolve=>service.once('exit',resolve));}
  await fixture?.end();
  if(created)await admin.query(`DROP DATABASE "${name}" WITH (FORCE)`);
  await admin.end();
}
