import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile, rm } from "node:fs/promises";

const configPath = process.argv[2];
if (!configPath) throw new Error("Referral browser acceptance configuration is required.");
const config = JSON.parse((await readFile(configPath, "utf8")).replace(/^\uFEFF/, ""));
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

class CdpClient {
  constructor(url) { this.url = url; this.nextId = 1; this.pending = new Map(); }
  async connect() {
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id || !this.pending.has(message.id)) return;
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result ?? {});
    });
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.socket.send(JSON.stringify({ id, method, params })); });
  }
  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Browser evaluation failed.");
    return result.result?.value;
  }
  close() { this.socket?.close(); }
}

async function waitFor(predicate, label, timeoutMs = 25_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await predicate()) return;
    await delay(150);
  }
  throw new Error(`Timed out waiting for ${label}.`);
}

function assert(condition, message) { if (!condition) throw new Error(message); }

async function attach(browserUrl) {
  const targets = await (await fetch(`${browserUrl}/json`)).json();
  const target = targets.find((item) => item.type === "page");
  if (!target?.webSocketDebuggerUrl) throw new Error("Browser page target was unavailable.");
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  return client;
}

async function navigate(client, url) {
  await client.send("Page.navigate", { url });
  await waitFor(() => client.evaluate("document.readyState === 'complete'"), `page load for ${url}`);
}

async function writeSession(client, key, value) {
  const serialized = JSON.stringify(JSON.stringify({ state: value, version: 0 }));
  await client.evaluate(`localStorage.setItem(${JSON.stringify(key)}, ${serialized});`);
}

async function referralDashboard(client, config) {
  let dashboardReady = false;
  let diagnostics = "";
  for (let attempt = 1; attempt <= 3 && !dashboardReady; attempt += 1) {
    await navigate(client, `${config.frontendOrigin}/account/refer`);
    await writeSession(client, "foodonline-public-auth", {
      currentUser: config.customer,
      token: config.customerToken,
    });
    await client.send("Page.reload", { ignoreCache: true });
    try {
      await waitFor(() => client.evaluate(`document.body.innerText.includes(${JSON.stringify(config.referralCode)})`), "Customer referral code", 15_000);
      dashboardReady = true;
    } catch {
      diagnostics = await client.evaluate("JSON.stringify({ path: window.location.pathname, storage: localStorage.getItem('foodonline-public-auth'), text: document.body.innerText.slice(0, 1600) })");
    }
  }
  if (!dashboardReady) throw new Error(`Customer referral dashboard did not render: ${diagnostics}`);
  const state = await client.evaluate(`(() => ({
    text: document.body.innerText,
    actions: [...document.querySelectorAll('button')].map((button) => button.textContent.trim()).filter((label) => ['Share', 'Copy link', 'Copy invite code'].includes(label)),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }))()`);
  assert(state.actions.join("|") === "Share|Copy link|Copy invite code", "Customer referral actions are not exactly Share, Copy link, and Copy invite code.");
  assert(state.text.includes("Referral activity"), "Customer referral activity section did not render.");
  assert(!state.overflow, "Customer referral page has horizontal overflow.");
  return state;
}

async function terminateProcessTree(chromeProcess) {
  if (!chromeProcess?.pid) return;
  if (process.platform !== "win32") {
    chromeProcess.kill();
    await Promise.race([once(chromeProcess, "exit"), delay(3_000)]);
    return;
  }
  const taskkill = spawn("taskkill", ["/PID", String(chromeProcess.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
  await Promise.race([once(taskkill, "close"), delay(3_000)]);
}

async function invitationRoute(client, config) {
  const url = `${config.frontendOrigin}/invite/${encodeURIComponent(config.referralCode)}`;
  await navigate(client, url);
  await waitFor(() => client.evaluate("document.body.innerText.includes('Create customer account')"), "direct referral invitation route");
  const first = await client.evaluate("document.body.innerText");
  await client.send("Page.reload", { ignoreCache: true });
  await waitFor(() => client.evaluate("document.body.innerText.includes('Create customer account')"), "refreshed referral invitation route");
  const refreshed = await client.evaluate("document.body.innerText");
  assert(first.includes("FoodOnlines") && refreshed.includes("FoodOnlines"), "Referral invitation did not survive direct-route refresh.");
}

async function adminOperations(client, config) {
  await navigate(client, `${config.frontendOrigin}/admin/referrals`);
  await writeSession(client, "foodonline-admin-store", { token: config.adminToken, adminEmail: config.adminEmail, adminName: "Referral Acceptance Admin", lastLoginAt: null, sessionExpiresAt: null });
  await client.send("Page.reload", { ignoreCache: true });
  await waitFor(() => client.evaluate(`document.body.innerText.includes(${JSON.stringify(config.referralCode)})`), "Admin referral operations row");
  const list = await client.evaluate("document.body.innerText");
  const headings = await client.evaluate("[...document.querySelectorAll('th')].map((heading) => heading.textContent.trim())");
  assert(headings.includes("Referrer") && headings.includes("Friend") && headings.includes("Registered"), `Admin referral table headings did not render: ${list.slice(0, 800)}`);
  await navigate(client, `${config.frontendOrigin}/admin/referrals/${encodeURIComponent(config.referralId)}`);
  try {
    await waitFor(() => client.evaluate("document.body.innerText.toLowerCase().includes('referral detail')"), "Admin referral detail");
  } catch {
    const diagnostics = await client.evaluate("JSON.stringify({ path: window.location.pathname, text: document.body.innerText.slice(0, 1600) })");
    throw new Error(`Admin referral detail did not render: ${diagnostics}`);
  }
  const detail = await client.evaluate("document.body.innerText");
  assert(detail.includes(config.referralCode), "Admin referral detail does not include the selected referral code.");
}

let chrome;
let client;
try {
  chrome = spawn(config.chromePath, ["--headless=new", `--remote-debugging-port=${config.debugPort}`, `--user-data-dir=${config.chromeUserDataDirectory}`, "--no-first-run", "--no-default-browser-check", "--disable-gpu", "about:blank"], { stdio: "ignore", windowsHide: true });
  const browserUrl = `http://127.0.0.1:${config.debugPort}`;
  await waitFor(async () => { try { return (await fetch(`${browserUrl}/json/version`)).ok; } catch { return false; } }, "headless browser");
  client = await attach(browserUrl);
  const customer = await referralDashboard(client, config);
  await invitationRoute(client, config);
  await adminOperations(client, config);
  process.stdout.write(`${JSON.stringify({ result: "passed", customer })}\n`);
} finally {
  client?.close();
  await terminateProcessTree(chrome);
  if (config.chromeUserDataDirectory) await rm(config.chromeUserDataDirectory, { recursive: true, force: true }).catch(() => undefined);
}
