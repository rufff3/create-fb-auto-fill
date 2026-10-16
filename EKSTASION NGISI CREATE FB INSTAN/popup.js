const phoneInputList = document.getElementById("phoneInputList");
const otpRawList = document.getElementById("otpRawList");
const cookieOutputList = document.getElementById("cookieOutputList");
const phoneCounter = document.getElementById("phoneCounter");
const otpCounter = document.getElementById("otpCounter");
const cookieCounter = document.getElementById("cookieCounter");
const btnRunPhone = document.getElementById("btnRunPhone");
const btnRunOtp = document.getElementById("btnRunOtp");
const btnClickIdont = document.getElementById("btnClickIdont");
const btnClickResend = document.getElementById("btnClickResend");
const btnClickChangeNum = document.getElementById("btnClickChangeNum");
const btnGetCookies = document.getElementById("btnGetCookies");
const btnCopyCookies = document.getElementById("btnCopyCookies");
const btnDeleteCookies = document.getElementById("btnDeleteCookies");
const btnRefreshAll = document.getElementById("btnRefreshAll");
const btnGoWeb = document.getElementById("btnGoWeb");
const btnGoM = document.getElementById("btnGoM");
const statusDiv = document.getElementById("status");

let deleteConfirmArmed = false;
let deleteConfirmTimeout = null;

function getCleanLines(textarea) {
  return textarea.value.split("\n").map(l => l.trim()).filter(l => l.length > 0);
}

function getUniqueCookiesByCUser(rawText) {
  const lines = (rawText || "").split("\n").map(l => l.trim()).filter(Boolean);
  const cookieMap = new Map();

  for (const line of lines) {
    const uidMatch = line.match(/c_user=(\d+)/);
    if (uidMatch && uidMatch[1]) {
      cookieMap.set(uidMatch[1], line);
    }
  }

  return Array.from(cookieMap.values());
}

function parseOtpData(rawText) {
  const result = {};
  const lines = rawText.split("\n");

  for (const line of lines) {
    if (line.includes("Menunggu") || line.includes("⏳")) continue;

    const matches = line.match(/\d+/g);
    if (!matches) continue;

    const phoneCandidates = matches.filter(num => num.length >= 10);
    const otpCandidates = matches.filter(num => num.length >= 4 && num.length <= 8 && num !== phoneCandidates[0]);

    if (phoneCandidates.length > 0 && otpCandidates.length > 0) {
      const phone = phoneCandidates[0];
      const otp = otpCandidates[otpCandidates.length - 1];
      result[phone] = otp;
    }
  }

  return result;
}

function updateCounts() {
  const phones = getCleanLines(phoneInputList);
  phoneCounter.innerText = `${phones.length} Nomor`;

  const otps = parseOtpData(otpRawList.value);
  otpCounter.innerText = `${Object.keys(otps).length} Siap`;

  const uniqueCookies = getUniqueCookiesByCUser(cookieOutputList.value);
  cookieCounter.innerText = `${uniqueCookies.length} Cookies`;
}

function saveInputs(callback) {
  const uniqueCookies = getUniqueCookiesByCUser(cookieOutputList.value);
  chrome.storage.local.set({
    rawPhones: phoneInputList.value,
    rawOtps: otpRawList.value,
    rawCookies: uniqueCookies.join("\n")
  }, () => {
    if (typeof callback === "function") callback();
  });
}

function resetDeleteButtonState() {
  deleteConfirmArmed = false;
  if (deleteConfirmTimeout) {
    clearTimeout(deleteConfirmTimeout);
    deleteConfirmTimeout = null;
  }
  btnDeleteCookies.innerText = "🗑️ Hapus";
  btnDeleteCookies.classList.remove("btn-delete-confirm");
}

chrome.storage.local.get(["rawPhones", "rawOtps", "rawCookies"], (data) => {
  if (data.rawPhones) phoneInputList.value = data.rawPhones;
  if (data.rawOtps) otpRawList.value = data.rawOtps;
  if (data.rawCookies) {
    cookieOutputList.value = getUniqueCookiesByCUser(data.rawCookies).join("\n");
  }
  updateCounts();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    if (changes.rawPhones) phoneInputList.value = changes.rawPhones.newValue || "";
    if (changes.rawOtps) otpRawList.value = changes.rawOtps.newValue || "";
    if (changes.rawCookies !== undefined) {
      cookieOutputList.value = getUniqueCookiesByCUser(changes.rawCookies.newValue || "").join("\n");
    }
    updateCounts();
  }
});

phoneInputList.addEventListener("input", () => {
  updateCounts();
  saveInputs();
});

otpRawList.addEventListener("input", () => {
  updateCounts();
  saveInputs();
});

cookieOutputList.addEventListener("input", () => {
  updateCounts();
  saveInputs();
});

btnRunPhone.addEventListener("click", () => {
  saveInputs();
  statusDiv.innerText = "⏳ Mengisi form ke seluruh tab...";
  chrome.runtime.sendMessage({ action: "RUN_PHONE_BATCH" });
});

btnRunOtp.addEventListener("click", () => {
  saveInputs();
  statusDiv.innerText = "⏳ Memasukkan OTP...";
  chrome.runtime.sendMessage({ action: "RUN_OTP_BATCH" });
});

btnClickIdont.addEventListener("click", () => {
  statusDiv.innerText = "⏳ Mengklik 'I didn't get code' di seluruh tab...";
  chrome.runtime.sendMessage({ action: "CLICK_IDONT_BATCH" });
});

btnClickResend.addEventListener("click", () => {
  statusDiv.innerText = "⏳ Mengklik 'Resend code' di seluruh tab...";
  chrome.runtime.sendMessage({ action: "CLICK_RESEND_BATCH" });
});

btnClickChangeNum.addEventListener("click", () => {
  statusDiv.innerText = "⏳ Mengklik 'Change number' di seluruh tab...";
  chrome.runtime.sendMessage({ action: "CLICK_CHANGE_NUM_BATCH" });
});

btnGetCookies.addEventListener("click", () => {
  const uniqueNow = getUniqueCookiesByCUser(cookieOutputList.value);
  cookieOutputList.value = uniqueNow.join("\n");

  saveInputs(() => {
    statusDiv.innerText = "⏳ Mengambil cookies dari seluruh tab Facebook...";
    chrome.runtime.sendMessage({ action: "GET_COOKIES_BATCH" }, (res) => {
      const uniqueFinal = getUniqueCookiesByCUser(cookieOutputList.value);
      cookieOutputList.value = uniqueFinal.join("\n");
      updateCounts();
      const total = res && typeof res.total === "number" ? res.total : uniqueFinal.length;
      statusDiv.innerText = `✅ Selesai! Total ${total} Cookies unik (by c_user).`;
    });
  });
});

btnCopyCookies.addEventListener("click", () => {
  const cookies = getUniqueCookiesByCUser(cookieOutputList.value);
  if (cookies.length === 0) {
    statusDiv.innerText = "⚠️ Kolom cookies masih kosong.";
    return;
  }

  cookieOutputList.value = cookies.join("\n");
  updateCounts();

  navigator.clipboard.writeText(cookies.join("\n")).then(() => {
    const originalText = btnCopyCookies.innerText;
    btnCopyCookies.innerText = "✅ Tersalin!";
    statusDiv.innerText = `✅ ${cookies.length} Cookies berhasil disalin!`;
    setTimeout(() => {
      btnCopyCookies.innerText = originalText;
    }, 1500);
  });
});

btnDeleteCookies.addEventListener("click", () => {
  if (!deleteConfirmArmed) {
    deleteConfirmArmed = true;
    btnDeleteCookies.innerText = "⚠️ Yakin? Klik Lagi";
    btnDeleteCookies.classList.add("btn-delete-confirm");
    statusDiv.innerText = "⚠️ Klik tombol Hapus sekali lagi untuk mengonfirmasi.";

    deleteConfirmTimeout = setTimeout(() => {
      resetDeleteButtonState();
      statusDiv.innerText = "Siap digunakan.";
    }, 3000);
  } else {
    resetDeleteButtonState();
    cookieOutputList.value = "";
    updateCounts();
    chrome.runtime.sendMessage({ action: "CLEAR_COOKIES_DATA" }, () => {
      statusDiv.innerText = "🗑️ Seluruh cookies berhasil dihapus.";
    });
  }
});

btnRefreshAll.addEventListener("click", () => {
  statusDiv.innerText = "⏳ Merefresh seluruh tab...";
  chrome.runtime.sendMessage({ action: "REFRESH_ALL_TABS" });
});

btnGoWeb.addEventListener("click", () => {
  statusDiv.innerText = "⏳ Mengalihkan seluruh tab ke Facebook Web...";
  chrome.runtime.sendMessage({
    action: "NAVIGATE_ALL_TABS",
    url: "https://www.facebook.com/reg/?entry_point=login"
  });
});

btnGoM.addEventListener("click", () => {
  statusDiv.innerText = "⏳ Mengalihkan seluruh tab ke Facebook Mobile...";
  chrome.runtime.sendMessage({
    action: "NAVIGATE_ALL_TABS",
    url: "https://m.facebook.com/reg/?is_two_steps_login=0&cid=103&refsrc=deprecated&soft=hjk"
  });
});