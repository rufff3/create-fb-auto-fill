chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  }

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "OPEN_SIDE_PANEL",
      title: "Buka di Side Panel",
      contexts: ["action"]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "OPEN_SIDE_PANEL" && chrome.sidePanel) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "exec-phone-batch") {
    executePhoneBatch();
  } else if (command === "exec-otp-batch") {
    executeOtpBatch();
  }
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "RUN_PHONE_BATCH") {
    executePhoneBatch().then(sendResponse);
    return true;
  }
  if (req.action === "RUN_OTP_BATCH") {
    executeOtpBatch().then(sendResponse);
    return true;
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// 1. LOGIKA EKSEKUSI PENGISIAN NOMOR (BATCH)
// ==========================================
async function executePhoneBatch() {
  const storage = await chrome.storage.local.get(["rawPhones", "tabPhoneMap"]);
  const rawPhones = storage.rawPhones || "";
  let phoneList = rawPhones.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  let tabPhoneMap = storage.tabPhoneMap || {};

  if (phoneList.length === 0) return;

  const currentWindowTabs = await chrome.tabs.query({ currentWindow: true });
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let startIndex = currentWindowTabs.findIndex(t => t.id === activeTab?.id);
  if (startIndex === -1) startIndex = 0;

  for (let i = startIndex; i < currentWindowTabs.length; i++) {
    if (phoneList.length === 0) break;

    const currentTab = currentWindowTabs[i];
    if (!currentTab || !currentTab.id || !currentTab.url || currentTab.url.startsWith("chrome://") || currentTab.url.startsWith("about:")) {
      continue;
    }

    const targetPhone = phoneList.shift();

    try {
      await chrome.tabs.update(currentTab.id, { active: true });
      await sleep(500);

      await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: injectPhoneFill,
        args: [targetPhone]
      });

      tabPhoneMap[currentTab.id] = targetPhone.replace(/\D/g, "");
      await chrome.storage.local.set({
        tabPhoneMap: tabPhoneMap,
        rawPhones: phoneList.join("\n")
      });

      await sleep(1500);
    } catch (err) {
      console.warn(`[FB Manager] Gagal pada Tab ${currentTab.id}:`, err);
    }
  }
}

async function injectPhoneFill(phoneNumber) {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function setReactInputValue(input, val) {
    const valueSetter = Object.getOwnPropertyDescriptor(input, "value")?.set;
    const prototype = Object.getPrototypeOf(input);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(input, val);
    } else if (valueSetter) {
      valueSetter.call(input, val);
    } else {
      input.value = val;
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function clickTargetElement(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const target = document.elementFromPoint(x, y) || el;
    const opts = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y };

    target.dispatchEvent(new PointerEvent("pointerdown", opts));
    target.dispatchEvent(new MouseEvent("mousedown", opts));
    target.dispatchEvent(new PointerEvent("pointerup", opts));
    target.dispatchEvent(new MouseEvent("mouseup", opts));
    target.dispatchEvent(new MouseEvent("click", opts));
  }

  // Deteksi input nomor telepon
  let phoneInput = document.querySelector('input[aria-label="Mobile number"]');

  if (!phoneInput) {
    const visibleInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="tel"]')).filter(i => {
      const r = i.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && i.getAttribute("maxlength") !== "5" && i.getAttribute("maxlength") !== "6";
    });
    phoneInput = visibleInputs[visibleInputs.length - 1];
  }

  if (phoneInput) {
    phoneInput.focus();
    setReactInputValue(phoneInput, phoneNumber);

    await wait(500);

    // Deteksi tombol aksi
    let targetButton = document.querySelector('div[role="button"][aria-label="Next"], button[aria-label="Next"]');

    if (!targetButton) {
      const allButtons = Array.from(document.querySelectorAll('div[role="button"], button')).filter(b => {
        const r = b.getBoundingClientRect();
        const txt = (b.innerText || b.textContent || "").trim().toLowerCase();
        const aria = (b.getAttribute("aria-label") || "").trim().toLowerCase();
        return r.width > 0 && r.height > 0 && (
          txt === "add" || txt === "tambah" || txt === "next" || txt === "lanjut" ||
          aria === "next" || aria === "lanjut" || aria === "add" || aria === "tambah"
        );
      });
      targetButton = allButtons[allButtons.length - 1];
    }

    if (targetButton) {
      clickTargetElement(targetButton);
      await wait(600);
    }
  }
}

// ==========================================
// 2. LOGIKA EKSEKUSI PENGISIAN OTP (BATCH)
// ==========================================
async function executeOtpBatch() {
  const storage = await chrome.storage.local.get(["rawOtps", "tabPhoneMap"]);
  const rawOtps = storage.rawOtps || "";
  const tabPhoneMap = storage.tabPhoneMap || {};

  const otpMap = {};
  const lines = rawOtps.split("\n");

  for (const line of lines) {
    if (line.includes("Menunggu") || line.includes("⏳")) continue;
    const matches = line.match(/\d+/g);
    if (!matches) continue;

    const phoneCandidates = matches.filter(num => num.length >= 10);
    const otpCandidates = matches.filter(num => num.length >= 4 && num.length <= 8 && num !== phoneCandidates[0]);

    if (phoneCandidates.length > 0 && otpCandidates.length > 0) {
      const phone = phoneCandidates[0];
      const otp = otpCandidates[otpCandidates.length - 1];
      otpMap[phone] = otp;
    }
  }

  const tabIds = Object.keys(tabPhoneMap);
  for (const tabIdStr of tabIds) {
    const tabId = parseInt(tabIdStr, 10);
    const mappedPhone = tabPhoneMap[tabId];
    const otpCode = otpMap[mappedPhone];

    if (otpCode) {
      try {
        await chrome.tabs.update(tabId, { active: true });
        await sleep(500);

        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: injectOtpFillOnly,
          args: [otpCode]
        });

        await sleep(1000);
      } catch (e) {
        console.warn(`[FB Manager] Tab ${tabId} tidak ditemukan.`);
      }
    }
  }
}

function injectOtpFillOnly(otpCode) {
  function setReactInputValue(input, val) {
    const valueSetter = Object.getOwnPropertyDescriptor(input, "value")?.set;
    const prototype = Object.getPrototypeOf(input);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(input, val);
    } else if (valueSetter) {
      valueSetter.call(input, val);
    } else {
      input.value = val;
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // 1. Prioritas selektor baru: aria-label="Confirmation code" serta selector bawaan
  let otpInput = document.querySelector('input[aria-label="Confirmation code"], input[maxlength="5"], input[maxlength="6"], input[autocomplete="one-time-code"]');

  // 2. Fallback jika struktur input dinamis
  if (!otpInput) {
    const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="tel"]')).filter(i => {
      const r = i.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });

    otpInput = inputs.find(i => {
      const aria = (i.getAttribute("aria-label") || "").toLowerCase();
      const mode = (i.getAttribute("inputmode") || "").toLowerCase();
      return aria.includes("confirmation") || aria.includes("code") || aria.includes("kode") || mode === "numeric";
    }) || inputs[inputs.length - 1];
  }

  if (otpInput) {
    otpInput.focus();
    setReactInputValue(otpInput, otpCode);
  }
}