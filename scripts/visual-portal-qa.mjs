import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const baseUrl = process.env.VISUAL_QA_BASE_URL || "http://localhost:3001";
const outputRoot = path.resolve("artifacts/visual-qa");
const authReports = [];
const publicReports = [];

function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function waitForTarget(port) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
      const page = targets.find((target) => target.type === "page" && target.url.startsWith(baseUrl)) || targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await delay(250);
  }
  throw new Error("Headless Chrome debugging target did not start.");
}

function connect(url) {
  const socket = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? reject(new Error(message.error.message)) : resolve(message.result);
  };
  return new Promise((resolve, reject) => {
    socket.onerror = reject;
    socket.onopen = () => resolve({
      send(method, params = {}) {
        const requestId = ++id;
        socket.send(JSON.stringify({ id: requestId, method, params }));
        return new Promise((requestResolve, requestReject) => pending.set(requestId, { resolve: requestResolve, reject: requestReject }));
      },
      close: () => socket.close(),
    });
  });
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  return result.result.value;
}

async function waitFor(cdp, expression, timeout = 25000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(cdp, expression)) return;
    await delay(250);
  }
  throw new Error(`Timed out waiting for: ${expression}`);
}

async function typeInto(cdp, selector, text) {
  await evaluate(cdp, `(() => { const element=document.querySelector(${JSON.stringify(selector)}); const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set; setter.call(element,${JSON.stringify(text)}); element.dispatchEvent(new Event("input",{bubbles:true})); element.dispatchEvent(new Event("change",{bubbles:true})); })()`);
}

async function runSession({ label, email, password, routes, port }) {
  const userData = path.join(outputRoot, `.chrome-${label}-${Date.now()}`);
  const chrome = spawn(chromePath, ["--headless=new",`--remote-debugging-port=${port}`,`--user-data-dir=${userData}`,"--disable-gpu","--no-first-run","--window-size=1440,1000",`${baseUrl}/login`], { stdio: "ignore" });
  let cdp;
  try {
    cdp = await connect(await waitForTarget(port));
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await waitFor(cdp, `document.readyState === "complete" && Boolean(document.querySelector('[name="email"]'))`);
    if (label === "affiliate") {
      for (const mobile of [false, true]) {
        await cdp.send("Emulation.setDeviceMetricsOverride", { width: mobile ? 390 : 1440, height: mobile ? 844 : 1000, deviceScaleFactor: 1, mobile });
        await cdp.send("Page.navigate", { url: `${baseUrl}/` });
        await waitFor(cdp, `document.readyState === "complete" && location.pathname === "/"`);
        await waitFor(cdp, `Boolean(document.querySelector('header img')?.complete)`);
        await evaluate(cdp, `window.scrollTo(0,document.documentElement.scrollHeight)`);
        await waitFor(cdp, `Boolean(document.querySelector('footer img')?.complete)`);
        await delay(700);
        const metrics = await evaluate(cdp, `(() => { const headerLogo=document.querySelector('header img'); const footerLogo=document.querySelector('footer img'); return {path:location.pathname,horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,headerLogoLoaded:Boolean(headerLogo?.naturalWidth),footerLogoLoaded:Boolean(footerLogo?.naturalWidth)}; })()`);
        const footerImage = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
        const footerFilename = `website-footer-${mobile ? "mobile" : "desktop"}.png`;
        await writeFile(path.join(outputRoot, footerFilename), Buffer.from(footerImage.data, "base64"));
        await evaluate(cdp, `window.scrollTo(0,0)`);
        await delay(250);
        const image = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
        const filename = `website-home-${mobile ? "mobile" : "desktop"}.png`;
        await writeFile(path.join(outputRoot, filename), Buffer.from(image.data, "base64"));
        publicReports.push({ ...metrics, viewport: mobile ? "390x844" : "1440x1000", screenshot: filename, footerScreenshot: footerFilename });
      }
      for (const route of [
        { path: "/login" }, { path: "/signup" },
        { path: "/login", viewport: "mobile" }, { path: "/signup", viewport: "mobile" },
      ]) {
        const mobile = route.viewport === "mobile";
        await cdp.send("Emulation.setDeviceMetricsOverride", { width: mobile ? 390 : 1440, height: mobile ? 844 : 1000, deviceScaleFactor: 1, mobile });
        await cdp.send("Page.navigate", { url: `${baseUrl}${route.path}` });
        await waitFor(cdp, `document.readyState === "complete" && location.pathname === ${JSON.stringify(route.path)}`);
        await waitFor(cdp, `Array.from(document.images).every((item) => item.complete)`);
        await delay(700);
        const metrics = await evaluate(cdp, `({path:location.pathname,horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,languageSelector:Boolean(document.querySelector('select[name="language"]')),formVisible:Boolean(document.querySelector('form')),maxInputHeight:Math.max(0,...Array.from(document.querySelectorAll('form input, form select')).map((item)=>item.getBoundingClientRect().height))})`);
        const image = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
        const filename = `auth-${route.path.slice(1)}-${mobile ? "mobile" : "desktop"}.png`;
        await writeFile(path.join(outputRoot, filename), Buffer.from(image.data, "base64"));
        authReports.push({ ...metrics, viewport: mobile ? "390x844" : "1440x1000", screenshot: filename });
      }
      await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
      await cdp.send("Page.navigate", { url: `${baseUrl}/login` });
      await waitFor(cdp, `document.readyState === "complete" && Boolean(document.querySelector('[name="email"]'))`);
    }
    await typeInto(cdp, '[name="email"]', email);
    await typeInto(cdp, '[name="password"]', password);
    await evaluate(cdp, `document.querySelector('form')?.requestSubmit()`);
    try {
      await waitFor(cdp, `location.pathname === "/dashboard"`, 25000);
    } catch (error) {
      const state = await evaluate(cdp, `({ path: location.pathname, status: document.querySelector('[role="status"]')?.textContent?.trim() || null, submitDisabled: Boolean(document.querySelector('button[type="submit"]')?.disabled) })`);
      throw new Error(`${error.message}; login state=${JSON.stringify(state)}`);
    }

    const reports = [];
    for (const route of routes) {
      const mobile = route.viewport === "mobile";
      await cdp.send("Emulation.setDeviceMetricsOverride", { width: mobile ? 390 : 1440, height: mobile ? 844 : 1000, deviceScaleFactor: 1, mobile });
      await cdp.send("Page.navigate", { url: `${baseUrl}${route.path}` });
      await waitFor(cdp, `document.readyState === "complete" && location.pathname === ${JSON.stringify(route.path)}`);
      await delay(700);
      if (route.drawer) {
        await evaluate(cdp, `document.querySelector('button[aria-controls="portal-sidebar"]')?.click()`);
        await waitFor(cdp, `Boolean(document.querySelector('#portal-sidebar[data-open]'))`);
        await delay(350);
      }
      if (!mobile && route.path === "/dashboard") {
        await evaluate(cdp, `document.querySelector('details summary')?.click()`);
        await evaluate(cdp, `document.querySelector('main')?.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`);
      }
      if (route.path === "/network") {
        if (mobile) {
          await evaluate(cdp, `document.querySelector('button[class*="memberNode"]')?.focus()`);
        } else {
          const point = await evaluate(cdp, `(() => { const box=document.querySelector('button[class*="memberNode"]')?.getBoundingClientRect(); return box?{x:box.left+box.width/2,y:box.top+box.height/2}:null; })()`);
          if (point) await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
        }
        await delay(200);
      }
      const metrics = await evaluate(cdp, `(() => { const aside=document.querySelector('aside'); const nav=aside?.querySelector('nav'); const tooltip=document.querySelector('[role="tooltip"]'); const bodyText=document.body.innerText; return { path:location.pathname,title:document.title,horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,publicFooter:Boolean(document.querySelector('footer')),portalAside:Boolean(aside),portalLogoHref:aside?.querySelector('a')?.getAttribute('href')||null,accountMenuOpen:Boolean(document.querySelector('details[open]')),tooltipVisible:tooltip?getComputedStyle(tooltip).display!=="none":null,supabaseConfigError:bodyText.includes('Missing required Supabase environment variables'),asideOverflow:aside?getComputedStyle(aside).overflowY:null,asideScrollHeight:aside?.scrollHeight||0,asideClientHeight:aside?.clientHeight||0,navScrollHeight:nav?.scrollHeight||0,navClientHeight:nav?.clientHeight||0 }; })()`);
      const image = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      const filename = `${label}-${route.path.replaceAll("/","-").replace(/^-/,"") || "home"}-${mobile ? "mobile" : "desktop"}${route.drawer ? "-drawer" : ""}.png`;
      await writeFile(path.join(outputRoot, filename), Buffer.from(image.data, "base64"));
      reports.push({ ...metrics, viewport: mobile ? "390x844" : "1440x1000", screenshot: filename });
    }
    return reports;
  } finally {
    if (cdp) {
      try { await cdp.send("Browser.close"); } catch {}
      cdp.close();
    }
    if (chrome.exitCode === null) {
      await Promise.race([once(chrome, "exit"), delay(3000)]);
    }
    if (chrome.exitCode === null) {
      chrome.kill();
      await Promise.race([once(chrome, "exit"), delay(3000)]);
    }
    await rm(userData, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 }).catch(() => {});
  }
}

await mkdir(outputRoot, { recursive: true });
const required = ["DEV_SEED_AFFILIATE_EMAIL","DEV_SEED_AFFILIATE_PASSWORD","DEV_SEED_ADMIN_EMAIL","DEV_SEED_ADMIN_PASSWORD"];
if (required.some((name) => !process.env[name])) throw new Error("Guarded development visual-test credentials are required.");
if (process.env.SUPABASE_ENVIRONMENT !== "development") throw new Error("Visual portal QA is development-only.");

const affiliateRoutes = [
  { path: "/dashboard" }, { path: "/profile" }, { path: "/network" }, { path: "/inventory" }, { path: "/inventory/phase-2-development-estate" },
  { path: "/wallets" }, { path: "/earnings" }, { path: "/property-payments" }, { path: "/kyc" },
  { path: "/dashboard", viewport: "mobile" }, { path: "/dashboard", viewport: "mobile", drawer: true },
  { path: "/profile", viewport: "mobile" }, { path: "/network", viewport: "mobile" },
  { path: "/network/referrals", viewport: "mobile" }, { path: "/network/index", viewport: "mobile" },
  { path: "/inventory", viewport: "mobile" }, { path: "/inventory/phase-2-development-estate", viewport: "mobile" }, { path: "/wallets", viewport: "mobile" },
  { path: "/earnings", viewport: "mobile" }, { path: "/property-payments", viewport: "mobile" },
  { path: "/kyc", viewport: "mobile" },
];
const adminRoutes = [
  { path: "/admin" },{ path: "/admin/financials" },{ path: "/admin/kyc" },
  { path: "/admin", viewport: "mobile" },{ path: "/admin/financials", viewport: "mobile" },{ path: "/admin/kyc", viewport: "mobile" },
];
const affiliate = await runSession({ label: "affiliate", email: process.env.DEV_SEED_AFFILIATE_EMAIL, password: process.env.DEV_SEED_AFFILIATE_PASSWORD, routes: affiliateRoutes, port: 9333 });
const admin = await runSession({ label: "admin", email: process.env.DEV_SEED_ADMIN_EMAIL, password: process.env.DEV_SEED_ADMIN_PASSWORD, routes: adminRoutes, port: 9334 });
const failures = [...publicReports, ...authReports, ...affiliate, ...admin].filter((report) => report.horizontalOverflow || report.publicFooter || report.supabaseConfigError || report.headerLogoLoaded === false || report.footerLogoLoaded === false);
if (failures.length) throw new Error(`Visual portal QA failed: ${JSON.stringify(failures)}`);
process.stdout.write(`${JSON.stringify({ baseUrl, public: publicReports, auth: authReports, affiliate, admin }, null, 2)}\n`);
