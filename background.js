const MENU_ID = "darken-it-toggle";
let syncQueue = Promise.resolve();

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({ id: MENU_ID, title: chrome.i18n.getMessage("contextMenuTitle"), contexts: ["page"] });
  await queueRegistrationSync();
});

chrome.runtime.onStartup.addListener(() => { queueRegistrationSync(); });
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.sites) queueRegistrationSync();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "sync-site-registrations") return;
  queueRegistrationSync().then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
  return true;
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id || !tab.url) return;
  const host = getHost(tab.url);
  if (!host) return;
  const { sites = {} } = await chrome.storage.local.get("sites");
  const current = sites[host] || { level: 35, enabled: false };
  const next = { ...current, enabled: !current.enabled };
  sites[host] = next;
  await chrome.storage.local.set({ sites });
  await queueRegistrationSync();
  await applyToTab(tab.id, next);
});

async function applyToTab(tabId, setting) {
  await chrome.tabs.sendMessage(tabId, { type: "apply", ...setting }).catch(async () => {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] }).catch(() => {});
    await chrome.tabs.sendMessage(tabId, { type: "apply", ...setting }).catch(() => {});
  });
}

function queueRegistrationSync() {
  syncQueue = syncQueue.then(syncRegisteredSites, syncRegisteredSites);
  return syncQueue;
}

async function syncRegisteredSites() {
  const { sites = {} } = await chrome.storage.local.get("sites");
  const desired = new Map(Object.entries(sites)
    .filter(([, setting]) => setting?.enabled)
    .map(([host, setting]) => [registrationId(host), registrationFor(host, setting)]));
  const current = await chrome.scripting.getRegisteredContentScripts();
  const managed = current.filter(({ id }) => id.startsWith("darken-site-"));
  const currentIds = new Set(managed.map(({ id }) => id));
  const removeIds = managed.filter(({ id }) => !desired.has(id)).map(({ id }) => id);
  if (removeIds.length) await chrome.scripting.unregisterContentScripts({ ids: removeIds });
  for (const [id, registration] of desired) {
    if (currentIds.has(id)) await chrome.scripting.updateContentScripts([registration]);
    else await chrome.scripting.registerContentScripts([registration]);
  }
}

function registrationFor(host, setting) {
  const amount = Math.max(0, Math.min(100, Number(setting.level) || 0));
  return {
    id: registrationId(host),
    matches: [`http://${host}/*`, `https://${host}/*`],
    css: [`html { filter: brightness(${100 - amount}%) !important; }`],
    runAt: "document_start",
    persistAcrossSessions: true
  };
}

function registrationId(host) {
  const hex = Array.from(host, (char) => char.codePointAt(0).toString(16)).join("");
  return `darken-site-${hex}`;
}

function getHost(url) {
  try { const u = new URL(url); return ["http:", "https:"].includes(u.protocol) ? u.hostname : null; }
  catch { return null; }
}
