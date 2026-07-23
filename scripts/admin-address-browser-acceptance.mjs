import { spawn } from "node:child_process";
import { readFile, rm } from "node:fs/promises";

const configPath = process.argv[2];
if (!configPath) throw new Error("Acceptance configuration path is required.");
const config = JSON.parse((await readFile(configPath, "utf8")).replace(/^\uFEFF/, ""));

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

class CdpClient {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id && message.method) {
        if (["Log.entryAdded", "Runtime.exceptionThrown", "Network.loadingFailed"].includes(message.method)) {
          this.events.push(message);
        }
        return;
      }
      if (!message.id || !this.pending.has(message.id)) return;
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result ?? {});
    });
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || "Browser evaluation failed.");
    }
    return result.result?.value;
  }

  close() {
    this.socket?.close();
  }
}

async function waitFor(predicate, label, timeoutMs = 25_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await predicate()) return;
    await delay(150);
  }
  throw new Error(`Timed out waiting for ${label}.`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertRenderedState(state, config, phase) {
  assert(state.url.endsWith(`/admin/customers/${config.customerId}/edit`), `${phase}: direct Admin URL changed.`);
  assert(state.editorRecordId === String(config.customerId), `${phase}: editor is not bound to the selected customer.`);
  assert(state.editorEmail === config.customerEmail, `${phase}: original customer-information editor did not render.`);
  assert(state.cards.length === 2, `${phase}: expected exactly two address cards, received ${state.cards.length}.`);
  assert(!state.pageText.includes(config.otherCustomerMarker), `${phase}: another customer's address leaked into the page.`);

  const thailand = state.cards.find((card) => card.countryKey === "thailand");
  const usa = state.cards.find((card) => card.countryKey === "usa");
  assert(thailand, `${phase}: Thailand address card is missing.`);
  assert(usa, `${phase}: United States address card is missing.`);
  assert(thailand.addressId === String(config.thailandAddressId), `${phase}: wrong Thailand address ID.`);
  assert(usa.addressId === String(config.usaAddressId), `${phase}: wrong United States address ID.`);
  assert(thailand.isDefault === "true", `${phase}: Thailand address is not marked default.`);
  assert(usa.isDefault === "false", `${phase}: United States address is incorrectly marked default.`);
  assert(state.cards.filter((card) => card.text.includes("Default")).length === 1, `${phase}: default badge count is not one.`);

  for (const value of config.thailandRenderedValues) {
    assert(thailand.text.includes(value), `${phase}: Thailand card is missing ${value}.`);
  }
  for (const value of config.usaRenderedValues) {
    assert(usa.text.includes(value), `${phase}: United States card is missing ${value}.`);
  }
}

const chrome = spawn(config.chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${config.debugPort}`,
  `--user-data-dir=${config.chromeUserDataDirectory}`,
  "about:blank",
], { stdio: "ignore", windowsHide: true });
chrome.unref();

let cdp;
try {
  let version;
  await waitFor(async () => {
    try {
      const response = await fetch(`http://127.0.0.1:${config.debugPort}/json/version`);
      if (!response.ok) return false;
      version = await response.json();
      return Boolean(version.webSocketDebuggerUrl);
    } catch {
      return false;
    }
  }, "headless Chrome");

  const targetResponse = await fetch(
    `http://127.0.0.1:${config.debugPort}/json/new?${encodeURIComponent(config.adminUrl)}`,
    { method: "PUT" },
  );
  if (!targetResponse.ok) throw new Error(`Unable to create browser target: HTTP ${targetResponse.status}.`);
  const target = await targetResponse.json();
  cdp = new CdpClient(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Log.enable");
  await cdp.send("Page.navigate", { url: config.adminUrl });

  try {
    await waitFor(
      async () => await cdp.evaluate("Boolean(document.querySelector('input[type=email]') && document.querySelector('input[type=password]'))"),
      "Admin login form",
    );
  } catch (error) {
    const diagnostic = await cdp.evaluate(`({
      url: location.href,
      title: document.title,
      readyState: document.readyState,
      body: document.body?.innerText?.slice(0, 1000) ?? '',
      html: document.documentElement?.outerHTML?.slice(0, 1000) ?? '',
    })`);
    throw new Error(`${error.message} ${JSON.stringify({ diagnostic, browserEvents: cdp.events.slice(-20) })}`);
  }

  const loginSubmitted = await cdp.evaluate(`(() => {
    const email = document.querySelector('input[type=email]');
    const password = document.querySelector('input[type=password]');
    const form = email?.closest('form');
    if (!email || !password || !form) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(email, ${JSON.stringify(config.adminEmail)});
    email.dispatchEvent(new Event('input', { bubbles: true }));
    setter.call(password, ${JSON.stringify(config.adminPassword)});
    password.dispatchEvent(new Event('input', { bubbles: true }));
    form.requestSubmit();
    return true;
  })()`);
  assert(loginSubmitted, "Admin login form could not be submitted.");

  const readState = () => cdp.evaluate(`(() => {
    const editor = document.querySelector('[data-testid="managed-user-editor"]');
    const section = document.querySelector('[data-testid="customer-addresses"]');
    return {
      url: location.href,
      editorRecordId: editor?.getAttribute('data-record-id') ?? null,
      editorEmail: editor?.querySelector('input[name="email"]')?.value ?? null,
      cards: section ? [...section.querySelectorAll('[data-address-id]')].map((card) => ({
        addressId: card.getAttribute('data-address-id'),
        countryKey: card.getAttribute('data-country-key'),
        isDefault: card.getAttribute('data-is-default'),
        text: card.innerText,
      })) : [],
      pageText: document.body.innerText,
    };
  })()`);

  await waitFor(async () => (await readState()).cards.length === 2, "two Admin address cards");
  const firstLoad = await readState();
  assertRenderedState(firstLoad, config, "initial load");

  await cdp.send("Page.reload", { ignoreCache: true });
  await waitFor(async () => (await readState()).cards.length === 2, "two Admin address cards after refresh");
  const refreshed = await readState();
  assertRenderedState(refreshed, config, "direct URL refresh");

  process.stdout.write(JSON.stringify({
    browser: "headless Chrome via DevTools",
    directUrl: config.adminUrl,
    customerId: String(config.customerId),
    firstLoad,
    refreshed,
  }));
} finally {
  cdp?.close();
  chrome.kill();
  await rm(config.chromeUserDataDirectory, { recursive: true, force: true }).catch(() => {});
}
