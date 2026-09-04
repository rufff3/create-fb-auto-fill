const phoneInputList = document.getElementById("phoneInputList");
const otpRawList = document.getElementById("otpRawList");
const phoneCounter = document.getElementById("phoneCounter");
const otpCounter = document.getElementById("otpCounter");
const btnRunPhone = document.getElementById("btnRunPhone");
const btnRunOtp = document.getElementById("btnRunOtp");
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