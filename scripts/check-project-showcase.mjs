import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:4322";
const output = ".impeccable/review/project-showcase";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#computer").count(), 1);
  assert.equal(
    await page
      .getByRole("link", { name: "Work", exact: true })
      .getAttribute("href"),
    "#work",
  );
  assert.equal(
    await page.locator("#scene canvas").count(),
    0,
    "3D below fold is deferred",
  );
  await page.screenshot({ path: `${output}/hero.png` });
  await page.locator("#computer").click();
  await page.waitForSelector("#terminal-dialog[open]");
  const frame = page.frameLocator("iframe");
  await frame
    .locator("#output")
    .getByText("WELCOME", { exact: true })
    .waitFor();
  await frame.locator("#command-input").fill("/projects");
  await frame.locator("#command-input").press("Enter");
  await frame
    .locator("#output")
    .getByText("FEATURED PROJECTS", { exact: true })
    .waitFor();
  await page.locator("#expand-terminal").click();
  await page.waitForFunction(
    () =>
      document.querySelector("#terminal-dialog").getBoundingClientRect()
        .width === innerWidth,
  );
  await frame.locator("#command-input").press("Escape");
  await page.waitForFunction(
    () => !document.querySelector("#terminal-dialog").open,
  );
  await page.locator("#computer").click();
  await frame
    .locator("#output")
    .getByText("FEATURED PROJECTS", { exact: true })
    .waitFor();
  await page.locator("#close-terminal").click();
  await page.waitForFunction(
    () => !document.querySelector("#terminal-dialog").open,
  );
  await page.locator("#work").scrollIntoViewIfNeeded();
  await page.waitForSelector("#scene[data-ready=true][data-animating=false]");
  assert.equal(
    await page.locator("[data-project-choice]").count(),
    0,
    "No duplicate tabs",
  );
  const links = ["mrsl", "careermatch", "kids-worksheets"];
  for (let i = 0; i < 3; i++) {
    assert.equal(
      await page.locator("#scene").getAttribute("data-selected"),
      String(i),
    );
    assert.equal(await page.locator("[data-project-panel]:visible").count(), 1);
    assert.equal(
      await page
        .locator(`[data-project-panel="${i}"] .story-link`)
        .getAttribute("href"),
      `/work/${links[i]}/`,
    );
    await page.locator(`[data-project-panel="${i}"] summary`).click();
    assert.equal(
      await page
        .locator(`[data-project-panel="${i}"] details`)
        .getAttribute("open"),
      "",
    );
    await page.locator("#project-next").click();
  }
  await page.waitForTimeout(1200);
  await page.locator("#work").screenshot({ path: `${output}/desktop.png` });
  await page.locator("#project-inspect").click();
  await page.waitForTimeout(1200);
  assert.equal(
    await page.locator("#scene").getAttribute("data-inspecting"),
    "true",
  );
  await page.locator("#work").screenshot({ path: `${output}/closeup.png` });
  await page.locator("#project-inspect").click();
  await page.waitForTimeout(1200);
  const picked = new Set();
  for (let round = 0; round < 3; round++) {
    const box = await page.locator("#scene").boundingBox();
    let point = null;
    for (const y of [0.32, 0.42, 0.52, 0.62]) {
      for (const x of [0.12, 0.2, 0.28, 0.36, 0.65, 0.74, 0.82, 0.9]) {
        await page.mouse.move(box.x + box.width * x, box.y + box.height * y);
        if (
          (await page.locator("#exhibit-hover").textContent()).startsWith(
            "Pick up",
          ) &&
          (await page.locator("#exhibit-hover").isVisible())
        ) {
          point = { x: box.x + box.width * x, y: box.y + box.height * y };
          break;
        }
      }
      if (point) break;
    }
    assert.ok(point, "A rear exhibit has a named clickable exposed area");
    const before = await page.locator("#scene").getAttribute("data-selected");
    await page.mouse.click(point.x, point.y);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(1400);
    const after = await page.locator("#scene").getAttribute("data-selected");
    assert.notEqual(
      after,
      before,
      "Rear plane click selects a different project",
    );
    picked.add(after);
  }
  assert.equal(
    picked.size,
    3,
    "All three exhibits can be cycled through actual plane clicks",
  );
  await page.locator("#project-next").focus();
  await page.locator("#project-next").press("Home");
  assert.equal(await page.locator("#scene").getAttribute("data-selected"), "0");
  await page.locator("#project-next").press("End");
  assert.equal(await page.locator("#scene").getAttribute("data-selected"), "2");
  // Rapid navigation must not leave stale text, animation or selected state.
  await page.evaluate(() => {
    for (let i = 0; i < 8; i++) document.querySelector("#project-next").click();
  });
  assert.equal(await page.locator("#scene").getAttribute("data-selected"), "1");
  await page.waitForTimeout(1400);
  assert.equal(
    await page.locator("#collection-name").textContent(),
    "CareerMatch AI",
  );
  await page.locator("#work").screenshot({ path: `${output}/career.png` });
  const frames = await page.locator("#scene").getAttribute("data-frames");
  await page.waitForTimeout(500);
  assert.equal(
    await page.locator("#scene").getAttribute("data-frames"),
    frames,
    "Scene rests after settling",
  );
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (let i = 0; i < 3; i++) {
      await page.locator("#project-next").click();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
    }
    if (width === 390) {
      await page.waitForTimeout(1400);
      await page.locator("#work").screenshot({ path: `${output}/mobile.png` });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator("#scene").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const timing = await page.evaluate(async () => {
    const times = [];
    const observer = new MutationObserver(() => times.push(performance.now()));
    observer.observe(document.querySelector("#scene"), {
      attributes: true,
      attributeFilter: ["data-frames"],
    });
    document.querySelector("#project-next").click();
    await new Promise((resolve) => setTimeout(resolve, 1600));
    observer.disconnect();
    const intervals = times
      .slice(1)
      .map((time, i) => time - times[i])
      .sort((a, b) => a - b);
    return {
      renderedFrames: times.length,
      medianMs: intervals[Math.floor(intervals.length * 0.5)],
      p95Ms: intervals[Math.floor(intervals.length * 0.95)],
    };
  });
  await client.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  console.log("Local 4x CPU collection transition", JSON.stringify(timing));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("#project-next").click();
  assert.equal(
    await page.locator('[data-project-panel="1"]').isVisible(),
    true,
  );
  assert.equal(await page.locator(".project-stage-fallback").isVisible(), true);
  assert.equal(await page.locator("#project-inspect").isVisible(), false);
  assert.deepEqual(errors, []);
  const fallback = await browser.newPage();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type.includes("webgl") ? null : original.call(this, type, ...args);
    };
  });
  await fallback.goto(`${base}/`);
  await fallback.locator("#project-next").click();
  await fallback.locator("#project-next").click();
  assert.equal(
    await fallback.locator('[data-project-panel="2"]').isVisible(),
    true,
  );
  assert.equal(
    await fallback.locator(".project-stage-fallback").isVisible(),
    true,
  );
  const nojs = await browser.newPage({ javaScriptEnabled: false });
  await nojs.goto(`${base}/`);
  assert.equal(await nojs.locator("[data-project-panel]:visible").count(), 3);
  const navigation = await browser.newPage();
  for (const legacy of ['exhibit', 'studio']) {
    await navigation.goto(`${base}/${legacy}/`);
    await navigation.waitForURL(`${base}/`);
    assert.equal(await navigation.locator('.project-showcase').count(), 1);
    assert.equal(await navigation.locator('a[href="/studio/"], a[href="/exhibit/"]').count(), 0);
  }
  for (const slug of ['mrsl', 'careermatch', 'kids-worksheets']) {
    await navigation.goto(`${base}/work/${slug}/`, { waitUntil: 'networkidle' });
    assert.equal(await navigation.locator('.case-sections section').count(), 4);
    await navigation.getByRole('link', { name: 'All work', exact: false }).click();
    await navigation.waitForURL(`${base}/#work`);
    assert.equal(await navigation.locator('.project-showcase').count(), 1);
  }
  await navigation.goto(`${base}/terminal/`, { waitUntil: 'networkidle' });
  await navigation.getByRole('link', { name: 'Back to portfolio', exact: false }).click();
  await navigation.waitForURL(`${base}/`);
  console.log('PASS: canonical homepage, both legacy redirects, no edition links, three case-study return links, standalone terminal return.');
  console.log(
    "PASS: hero/terminal, deferred 3D, no tabs, actual rear-plane picks, closeup/return, synchronized stories and links, disclosure, keyboard, rapid interruption, idle, 320/390/768, reduced-motion, WebGL/no-JS fallback. Screenshots: " +
      output,
  );
} finally {
  await browser.close();
}
