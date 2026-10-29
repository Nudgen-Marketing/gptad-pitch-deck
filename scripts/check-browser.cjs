/* Browser acceptance checks for both deck languages and the English overview. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const qa = path.join(root, 'output', 'qa');
const pdf = path.join(root, 'output', 'pdf');
fs.mkdirSync(qa, {recursive: true});
fs.mkdirSync(pdf, {recursive: true});

async function checkLayout(page, print = false) {
  const errors = await page.evaluate(({print}) => {
    const slides = [...document.querySelectorAll('.slide')];
    const surfaces = slides.length ? slides.filter(s => print || !s.hidden) : [document.querySelector('.sheet')];
    const errors = [];
    if (document.documentElement.scrollWidth > innerWidth + 1 && !print) errors.push('Horizontal document overflow');
    for (const surface of surfaces) {
      if (surface.scrollHeight > surface.clientHeight + 2 || surface.scrollWidth > surface.clientWidth + 2) errors.push(`${surface.id || 'sheet'} overflows its container`);
      const boundary = surface.getBoundingClientRect();
      for (const el of surface.querySelectorAll('h1,h2,h3,p,a,.row,.card,.tag,.chat-question')) {
        const r = el.getBoundingClientRect();
        if (r.width && (r.right > boundary.right + 2 || r.left < boundary.left - 2 || r.bottom > boundary.bottom + 2)) errors.push(`${surface.id || 'sheet'} clips ${el.tagName}: ${el.textContent.slice(0,45)}`);
        if (!el.matches('.workflow .card') && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).display !== 'inline') errors.push(`${surface.id || 'sheet'} text overflow: ${el.textContent.slice(0,45)}`);
      }
    }
    return errors;
  }, {print});
  assert.deepEqual(errors, []);
}

(async () => {
  const browser = await chromium.launch({headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? {channel: process.env.PLAYWRIGHT_CHANNEL} : {})});
  try {
    const context = await browser.newContext({viewport:{width:1440,height:900}, offline:true});
    const page = await context.newPage();
    const browserErrors = [];
    page.on('pageerror', error => browserErrors.push(error.message));
    for (const [deck, language] of [['gptad-pitch-deck', 'en'], ['gptad-pitch-deck-vi', 'vi']]) {
      await page.setViewportSize({width:1440,height:900});
      const url = pathToFileURL(path.join(root, `${deck}.html`)).href;
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('html').getAttribute('lang'), language);
      await page.locator('.slide:not([hidden]) .eyebrow').click();
      assert.equal(await page.locator('#counter').innerText(), '02 / 9');
      await page.keyboard.press('Home');
      await page.locator('.slide:not([hidden]) .title').evaluate(el => {
        const range = document.createRange();
        range.selectNodeContents(el);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        el.click();
      });
      assert.equal(await page.locator('#counter').innerText(), '01 / 9');
      await page.evaluate(() => window.getSelection().removeAllRanges());
      await page.locator('.slide:not([hidden]) a').first().evaluate(el => {
        el.addEventListener('click', event => event.preventDefault(), {once:true});
        el.click();
      });
      assert.equal(await page.locator('#counter').innerText(), '01 / 9');
      await page.mouse.move(700, 400);
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(100);
      assert.equal(await page.locator('#counter').innerText(), '02 / 9');
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(100);
      assert.equal(await page.locator('#counter').innerText(), '02 / 9');
      await page.waitForTimeout(800);
      await page.mouse.wheel(0, -120);
      await page.waitForTimeout(100);
      assert.equal(await page.locator('#counter').innerText(), '01 / 9');

      assert.equal(await page.locator('.slide:not([hidden])').count(), 1);
      assert.equal(await page.locator('#previous').isDisabled(), true);
      await page.keyboard.press('ArrowLeft');
      assert.equal(await page.locator('#counter').innerText(), '01 / 9');
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('#counter').innerText(), '02 / 9');
      await page.keyboard.press('PageDown');
      assert.equal(await page.locator('#counter').innerText(), '03 / 9');
      await page.keyboard.press('PageUp');
      assert.equal(await page.locator('#counter').innerText(), '02 / 9');
      await page.keyboard.press('End');
      assert.equal(await page.locator('#next').isDisabled(), true);
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('#counter').innerText(), '09 / 9');
      await page.keyboard.press('Home');
      await page.locator('#next').click();
      await page.locator('#previous').click();
      assert.equal(await page.locator('#counter').innerText(), '01 / 9');
      assert.equal(await page.locator('.slide:not([hidden]) a[href="https://cal.com/toannhu/30min"]').count(), 1);
      assert.equal(await page.locator('.slide[hidden]:not([inert])').count(), 0);
      await page.goto(url + '#slide-6');
      assert.equal(await page.locator('#counter').innerText(), '06 / 9');
      await page.goto(url + '#slide-999');
      assert.equal(await page.locator('#counter').innerText(), '09 / 9');
      await page.goto(url + '#slide-0');
      assert.equal(await page.locator('#counter').innerText(), '01 / 9');
      await page.emulateMedia({reducedMotion:'reduce'});
      assert.equal(await page.locator('.active .content').evaluate(el => getComputedStyle(el).animationName), 'none');
      for (const [width,height] of [[1920,1080],[1440,900],[1366,768],[1280,720],[1024,768],[768,1024],[390,844],[375,667]]) {
        await page.setViewportSize({width,height});
        for (let i=1; i<=9; i++) {
          await page.evaluate(i => { location.hash = `slide-${i}`; }, i);
          await page.waitForFunction(i => document.querySelector('.slide:not([hidden])').id === `slide-${i}`, i);
          await checkLayout(page);
        }
        await page.keyboard.press('Home');
        await page.screenshot({path:path.join(qa,`${deck}-cover-${width}.png`),fullPage:true});
        console.log(`PASS ${deck} layout ${width}×${height}: all 9 slides`);
      }
      await page.keyboard.press('Home');
      await page.waitForTimeout(800);
      await page.setViewportSize({width:390,height:400});
      await page.mouse.move(200,200);
      await page.mouse.wheel(0,100);
      await page.waitForTimeout(50);
      assert.equal(await page.locator('#counter').innerText(), '01 / 9');
      await page.evaluate(() => window.scrollTo(0, document.scrollingElement.scrollHeight));
      await page.mouse.wheel(0,100);
      await page.waitForTimeout(50);
      assert.equal(await page.locator('#counter').innerText(), '01 / 9');
      await page.setViewportSize({width:390,height:844});
      await page.keyboard.press('Home');
      const gesture = async (x1,y1,x2,y2) => {
        await page.evaluate(({x1,y1,x2,y2}) => {
          const el = document.querySelector('#deck');
          el.dispatchEvent(new TouchEvent('touchstart', {touches:[new Touch({identifier:1,target:el,clientX:x1,clientY:y1})]}));
          el.dispatchEvent(new TouchEvent('touchend', {changedTouches:[new Touch({identifier:1,target:el,clientX:x2,clientY:y2})]}));
        }, {x1,y1,x2,y2});
      };
      await gesture(300,250,100,250);
      assert.equal(await page.locator('#counter').innerText(),'02 / 9');
      await gesture(100,250,300,250);
      assert.equal(await page.locator('#counter').innerText(),'01 / 9');
      await gesture(300,200,280,450);
      assert.equal(await page.locator('#counter').innerText(),'01 / 9');
      await page.setViewportSize({width:1440,height:900});
      await page.setViewportSize({width:1123,height:794});
      await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('.slide:visible').count(),9);
      await checkLayout(page,true);
      await page.pdf({path:path.join(pdf,`${deck}.pdf`),preferCSSPageSize:true,printBackground:true});
      await page.emulateMedia({media:'screen'});
    }
    await page.goto(pathToFileURL(path.join(root,'one-pager.html')).href);
    await page.evaluate(() => document.fonts.ready);
    for (const [width,height] of [[1440,900],[768,1024],[390,844],[375,667]]) {
      await page.setViewportSize({width,height});
      await checkLayout(page);
      console.log(`PASS one-pager layout ${width}×${height}`);
    }
    await page.setViewportSize({width:1440,height:900});
    await page.setViewportSize({width:703,height:1032});
    await page.emulateMedia({media:'print'});
    await checkLayout(page,true);
    const printHeight = await page.locator('.sheet').evaluate(el => el.getBoundingClientRect().height);
    assert.ok(printHeight <= 1031, `One-pager exceeds A4 content height: ${printHeight}`);
    await page.pdf({path:path.join(pdf,'gptad-one-pager.pdf'),preferCSSPageSize:true,printBackground:true});
    await page.emulateMedia({media:'screen'});
    await page.screenshot({path:path.join(qa,'one-pager.png'),fullPage:true});
    assert.deepEqual(browserErrors,[]);
    for (const [name,expected] of [['gptad-pitch-deck.pdf',9],['gptad-pitch-deck-vi.pdf',9],['gptad-one-pager.pdf',1]]) {
      const count = (fs.readFileSync(path.join(pdf,name)).toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
      assert.equal(count,expected, `${name} page count`);
      console.log(`PASS ${name}: ${count} printed pages`);
    }
    console.log('PASS offline assets, navigation, deep links, touch, reduced motion, print, and browser errors');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
