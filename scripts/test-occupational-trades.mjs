import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin=process.env.TRADE_TEST_ORIGIN || 'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const resp=await page.goto(origin+'/occupational-trades/',{waitUntil:'domcontentloaded'});
  assert.equal(resp?.status(),200,'trade careers page loads');
  assert.equal(await page.locator('#trades article').count(),6,'all six paths render');
  assert.equal(await page.locator('#resourceCards article').count(),12,'all twelve resources render');
  await page.locator('#occupationSearch').fill('welder');
  assert.equal(await page.locator('#trades article').count(),1,'occupation search filters');
  await page.locator('#occupationSearch').fill('');
  await page.locator('#resourceFilter').selectOption('training');
  assert.equal(await page.locator('#resourceCards article').count(),3,'resource filters render');
  await page.locator('#resourceFilter').selectOption('all');
  await page.locator('#planSelect').selectOption('automotive');
  await page.locator('#generatePlan').click();
  assert.match(await page.locator('#planResult').innerText(),/Automotive and diesel mechanics/,'seven-day plan generator works');
  await page.locator('[name="name"]').fill('Test Candidate');
  await page.locator('[name="contact"]').fill('test@example.invalid');
  await page.locator('[name="role"]').fill('Apprentice Mechanic');
  await page.locator('#cvForm button[type=submit]').click();
  const cv=await page.locator('#cvPreview').innerText();
  assert.match(cv,/Test Candidate/);
  assert.match(cv,/Apprentice Mechanic/);
  await page.locator('input[data-check="0"]').check();
  assert.equal(await page.locator('#checkProgress').getAttribute('value'),null,'native progress value is managed by DOM');
  assert.equal(await page.locator('#checkProgress').evaluate(el=>el.value),10,'checklist progresses to ten percent');
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('input[data-check="0"]').isChecked(),true,'checklist progress persists locally');
  await page.setViewportSize({width:375,height:812});
  const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert.ok(dimensions.scroll<=dimensions.viewport+2,'mobile layout has no horizontal overflow');
  assert.deepEqual(errors,[],'no JavaScript runtime errors');
  console.log('Occupational career hub desktop/mobile browser tests passed.');
} finally {
  await browser.close();
}
