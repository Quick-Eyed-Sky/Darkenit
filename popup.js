document.documentElement.lang = chrome.i18n.getUILanguage().replace("_", "-");
for (const element of document.querySelectorAll("[data-i18n]")) {
  const message = chrome.i18n.getMessage(element.dataset.i18n);
  if (message) element.textContent = message;
}
for (const element of document.querySelectorAll("[data-i18n-aria]")) {
  const message = chrome.i18n.getMessage(element.dataset.i18nAria);
  if (message) element.setAttribute("aria-label", message);
}

const levelInput = document.getElementById("level");
const levelOutput = document.getElementById("value");
const enabledInput = document.getElementById("enabled");
const preview = document.getElementById("preview");
const siteLabel = document.getElementById("site");
let host;
let tabId;
let debounce;

(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  tabId = tab?.id;
  try { host = new URL(tab.url).hostname; } catch { host = null; }
  siteLabel.textContent = host || chrome.i18n.getMessage("unsupportedPage");
  levelInput.disabled = !host;
  enabledInput.disabled = !host;
  if (!host) return;
  const { sites = {} } = await chrome.storage.local.get("sites");
  const setting = sites[host] || { level: 35, enabled: false };
  levelInput.value = setting.level;
  enabledInput.checked = setting.enabled;
  render();
})();

levelInput.addEventListener("input", () => { render(); save(); });
enabledInput.addEventListener("change", save);
function render() {
  const n = Number(levelInput.value);
  levelOutput.value = `${n}%`;
  levelOutput.textContent = `${n}%`;
  preview.style.background = `linear-gradient(rgba(0,0,0,${n / 100}), rgba(0,0,0,${n / 100})), #fff`;
  preview.style.color = n > 70 ? "#fff" : "#222";
}
function save() {
  if (!host) return;
  clearTimeout(debounce);
  debounce = setTimeout(async () => {
    const setting = { level: Number(levelInput.value), enabled: enabledInput.checked };
    const { sites = {} } = await chrome.storage.local.get("sites");
    sites[host] = setting;
    await chrome.storage.local.set({ sites });
    await chrome.runtime.sendMessage({ type: "sync-site-registrations" }).catch(() => {});
    if (!tabId) return;
    await chrome.tabs.sendMessage(tabId, { type: "apply", ...setting }).catch(async () => {
      if (setting.enabled) {
        await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] }).catch(() => {});
        await chrome.tabs.sendMessage(tabId, { type: "apply", ...setting }).catch(() => {});
      }
    });
  }, 100);
}
