const phoneInputList = document.getElementById("phoneInputList");
const otpRawList = document.getElementById("otpRawList");
const phoneCounter = document.getElementById("phoneCounter");
const otpCounter = document.getElementById("otpCounter");
const btnRunPhone = document.getElementById("btnRunPhone");
const btnRunOtp = document.getElementById("btnRunOtp");
const btnClickIdont = document.getElementById("btnClickIdont");
const btnClickResend = document.getElementById("btnClickResend");
const btnClickChangeNum = document.getElementById("btnClickChangeNum");
const btnRefreshAll = document.getElementById("btnRefreshAll");
const btnGoWeb = document.getElementById("btnGoWeb");
const btnGoM = document.getElementById("btnGoM");
const statusDiv = document.getElementById("status");

function getCleanLines(textarea) {
  return textarea.value.split("\n").map(l => l.trim()).filter(l => l.length > 0);
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
}

function saveInputs() {
  chrome.storage.local.set({
    rawPhones: phoneInputList.value,
    rawOtps: otpRawList.value
  });
}

chrome.storage.local.get(["rawPhones", "rawOtps"], (data) => {
  if (data.rawPhones) phoneInputList.value = data.rawPhones;
  if (data.rawOtps) otpRawList.value = data.rawOtps;
  updateCounts();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    if (changes.rawPhones) phoneInputList.value = changes.rawPhones.newValue || "";
    if (changes.rawOtps) otpRawList.value = changes.rawOtps.newValue || "";
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