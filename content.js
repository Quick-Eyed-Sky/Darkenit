(() => {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "apply") return;
    const root = document.documentElement;
    if (!root) return;
    const amount = Math.max(0, Math.min(100, Number(message.level) || 0));
    // Inline important styling takes precedence over the registered document-start rule,
    // allowing a toggle or slider change to affect the currently open page immediately.
    root.style.setProperty("filter", message.enabled ? `brightness(${100 - amount}%)` : "none", "important");
  });
})();
