// Browser check for the recruiter-first homepage. Run against a built site:
//   npm run build && npx astro preview --port 4322
//   PLAYWRIGHT_MODULE=/path/to/playwright-core node scripts/check-project-showcase.mjs
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
// Homepage order and case-study slugs, kept in step with src/data/projects.ts.
const order = [
  ["Nimpression Ops", "nimpression-ops"],
  ["Alma Android", "alma-android"],
  ["Kids Worksheet Generator", "kids-worksheets"],
  ["MRSL", "mrsl"],
  ["Pocket Home", "ky01-launcher"],
];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(`${base}/`, { waitUntil: "networkidle" });

  // Hero: role, stack, work rights and the contact routes, above the fold.
  const hero = page.locator(".hero");
  await assert.doesNotReject(hero.getByRole("heading", { level: 1, name: /full-stack developer/ }).waitFor());
  for (const text of ["C#/.NET", "TypeScript", "Java (Android)", "Full work rights in NZ", "Open to software, AI and BA roles"]) {
    assert.ok((await hero.innerText()).includes(text), `hero shows ${text}`);
  }
  for (const name of ["Explore my work", "Email", "LinkedIn", "GitHub"]) {
    const box = await hero.getByRole("link", { name, exact: false }).first().boundingBox();
    assert.ok(box && box.y + box.height <= 900, `${name} is above the fold`);
  }
  assert.equal(await page.locator("#computer").count(), 1, "the computer stays as the terminal entry");

  // Navigation: Work · Experience · Contact · Open terminal.
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  for (const [name, href] of [["Work", "#work"], ["Experience", "#experience"], ["Contact", "#contact"]]) {
    assert.equal(await nav.getByRole("link", { name, exact: true }).getAttribute("href"), href);
  }
  assert.equal(await page.locator(".terminal-link").getAttribute("href"), "/terminal");

  // Work: every project visible without interaction, in order, with its card parts.
  const cards = page.locator(".work-card");
  assert.equal(await cards.count(), order.length);
  for (const [i, [name, slug]] of order.entries()) {
    const card = cards.nth(i);
    assert.ok(await card.isVisible(), `${name} visible`);
    assert.equal((await card.locator("h3").innerText()).trim(), name);
    for (const part of [".work-tagline", ".work-summary", ".work-facts", ".work-stack li"]) {
      assert.ok(await card.locator(part).first().isVisible(), `${name} has ${part}`);
    }
    assert.equal(await card.getByRole("link", { name: /^Case study/ }).getAttribute("href"), `/work/${slug}/`);
  }
  assert.ok((await cards.nth(0).innerText()).includes("683 xUnit tests"));
  assert.equal(await page.locator("#work canvas, #project-next, [data-project-panel]").count(), 0, "no carousel");
  assert.equal(await page.getByText("CareerMatch").count(), 0, "CareerMatch stays off the homepage");

  // Experience and contact.
  const experience = page.locator("#experience");
  for (const text of ["Youthline Central South Island", "Product Director", "GameMaker", "Senior Product Manager", "Master of Applied Computing", "How I work"]) {
    assert.ok((await experience.innerText()).includes(text), `experience shows ${text}`);
  }
  for (const name of [/a-dobe\.club|email/i, /LinkedIn/, /GitHub/]) {
    const box = await page.locator("#contact .contact-actions").getByRole("link", { name }).boundingBox();
    assert.ok(box.height >= 44, `contact button ${name} is at least 44px tall`);
  }
  await page.screenshot({ path: `${output}/desktop.png` });

  // The terminal drawer still opens from the header and runs commands.
  await page.locator(".terminal-link").click();
  await page.waitForSelector("#terminal-dialog[open]");
  const frame = page.frameLocator("iframe");
  await frame.locator("#output").getByText("WELCOME", { exact: true }).waitFor();
  await page.waitForTimeout(2500);
  await frame.locator("#command-input").fill("/projects");
  await frame.locator("#command-input").press("Enter");
  await frame.locator("#output").getByText("SELECTED WORK", { exact: true }).waitFor();
  await page.locator("#close-terminal").click();
  await page.waitForFunction(() => !document.querySelector("#terminal-dialog").open);

  // Phones: no horizontal overflow, cards stacked, tap targets at least 44px.
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no overflow at ${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const small = await page.evaluate(() =>
    [...document.querySelectorAll(".site-header a, .hero-actions a, .work-actions a, .contact-actions a, .site-footer > div a")]
      .map((a) => [a.textContent.trim(), a.getBoundingClientRect().height])
      .filter(([, h]) => h < 44),
  );
  assert.deepEqual(small, [], "every primary tap target is at least 44px tall");
  const [a, b] = [await cards.nth(0).boundingBox(), await cards.nth(1).boundingBox()];
  assert.ok(b.y > a.y + a.height - 1, "cards stack on phones");
  await page.screenshot({ path: `${output}/mobile.png` });

  // Without JavaScript the work is all still there.
  const nojs = await browser.newPage({ javaScriptEnabled: false });
  await nojs.goto(`${base}/`);
  assert.equal(await nojs.locator(".work-card:visible").count(), order.length);

  // Case studies return to the work list; legacy aliases redirect home.
  const navigation = await browser.newPage();
  for (const [, slug] of order) {
    await navigation.goto(`${base}/work/${slug}/`, { waitUntil: "networkidle" });
    assert.equal(await navigation.locator(".case-sections section").count(), 4);
    await navigation.getByRole("link", { name: "All work", exact: false }).click();
    await navigation.waitForURL(`${base}/#work`);
  }
  for (const legacy of ["exhibit", "studio"]) {
    await navigation.goto(`${base}/${legacy}/`);
    await navigation.waitForURL(`${base}/`);
  }
  await navigation.goto(`${base}/terminal/`, { waitUntil: "networkidle" });
  await navigation.getByRole("link", { name: "Back to portfolio", exact: false }).click();
  await navigation.waitForURL(`${base}/`);

  assert.deepEqual(errors, []);
  console.log(`PASS: hero facts and contacts above the fold, nav, all ${order.length} projects visible in order without JS, experience, 44px tap targets, terminal drawer, 320/390/768 without overflow, case-study returns, legacy redirects. Screenshots: ${output}`);
} finally {
  await browser.close();
}
