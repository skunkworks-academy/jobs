import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base=process.env.JOBS_TEST_ORIGIN || 'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
  for(const scheme of ['light','dark']){
    const page=await browser.newPage({viewport:{width:1280,height:850},colorScheme:scheme});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const response=await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    assert.equal(response?.status(),200,'homepage responds successfully');
    assert.match(await page.title(),/Jobs & Career Pathways/,'SEO title present');
    await page.waitForFunction(()=>document.querySelectorAll('#cards article').length>0,{timeout:15000});
    assert.ok(Number(await page.locator('#siteCount').innerText())>10,'directory entries loaded');
    assert.ok(await page.locator('#cards article').count()>10,'directory renders cards');
    const heroBg=await page.locator('.jobs-main .hero').evaluate(e=>getComputedStyle(e).backgroundColor);
    assert.match(heroBg,/rgb\(3, 3, 58\)/,'canonical ink navy hero');
    const bodyBg=await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor);
    assert.ok(scheme==='light'?bodyBg==='rgb(247, 249, 252)':bodyBg==='rgb(14, 19, 39)',scheme+' body contrast/theme is applied; got '+bodyBg);
    await page.locator('#search').fill('remote');
    assert.ok(await page.locator('#cards article').count()>0,'search returns matching platforms');
    await page.locator('#clearBtn').click();
    assert.equal(await page.locator('#search').inputValue(),'','clear search resets input');
    await page.locator('.filters [data-filter="Freelance"]').click();
    assert.equal(await page.locator('.filters .active').getAttribute('data-filter'),'Freelance','filters update state');
    assert.ok(await page.locator('#cards article').count()>0,'freelance filter returns results');
    assert.deepEqual(errors,[],scheme+' runtime has no uncaught script errors');
    await page.close();
  }
  const mobile=await browser.newPage({viewport:{width:375,height:812},colorScheme:'light'});
  await mobile.goto(base+'/',{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.querySelectorAll('#cards article').length>0);
  const metrics=await mobile.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:window.innerWidth}));
  assert.ok(metrics.scroll<=metrics.inner+2,'mobile page has no horizontal overflow: '+JSON.stringify(metrics));
  const navToggle=mobile.locator('.nav-toggle');
  await navToggle.click();
  assert.equal(await navToggle.getAttribute('aria-expanded'),'true','mobile nav toggle responds');
  assert.ok(await mobile.locator('a[href="/occupational-trades/"]').count()>0,'trade careers integrated');
  console.log('Jobs brand, accessible search, directory and mobile smoke tests passed.');
} finally {await browser.close();}
