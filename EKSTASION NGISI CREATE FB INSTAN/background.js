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

// ==========================================================
// 1. PENGISIAN FORM PENDAFTARAN PARALEL & INSTAN KE SEMUA TAB
// ==========================================================
async function executePhoneBatch() {
  const storage = await chrome.storage.local.get(["rawPhones", "tabPhoneMap"]);
  const rawPhones = storage.rawPhones || "";
  let phoneList = rawPhones.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  let tabPhoneMap = storage.tabPhoneMap || {};

  if (phoneList.length === 0) return;

  const currentWindowTabs = await chrome.tabs.query({ currentWindow: true });
  
  const targetTabs = currentWindowTabs.filter(t => 
    t.id && t.url && t.url.includes("facebook.com") && !t.url.startsWith("chrome://")
  );

  if (targetTabs.length === 0) return;

  const executionPromises = [];

  for (const tab of targetTabs) {
    if (phoneList.length === 0) break;

    const targetPhone = phoneList.shift();
    const cleanDigits = targetPhone.replace(/\D/g, "");
    
    // Simpan digit angka murni untuk sinkronisasi pemetaan OTP
    tabPhoneMap[tab.id] = cleanDigits;

    // Nomor yang disuntikkan ke kolom input diawali dengan tanda +
    const phoneToInject = "+" + cleanDigits;

    const p = chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectRegistrationDataOnly,
      args: [phoneToInject]
    }).catch(err => console.warn(`Gagal pada Tab ${tab.id}:`, err));

    executionPromises.push(p);
  }

  await chrome.storage.local.set({
    tabPhoneMap: tabPhoneMap,
    rawPhones: phoneList.join("\n")
  });

  await Promise.all(executionPromises);
}

async function injectRegistrationDataOnly(phoneNumber) {
  const dnama = [
    "Lawrence", "Rogers", "Murphy", "Pat", "Lynne", "Roberson", "Tina", "Norman", "Mcbride", "Clara", 
    "Joan", "Lula", "Charlene", "Welch", "June", "Jacquelyn", "Morrison", "Felicia", "Jacqueline", 
    "Kathryn", "Jessica", "Carlson", "Samantha", "Obrien", "Chandler", "Joyce", "Russell", "Aguilar", 
    "Maria", "Juana", "Jamie", "Emily", "Nelson", "Hazel", "Judith", "Ellen", "Celia", "Shannon", 
    "Gilbert", "Patrick", "Santiago", "Brandy", "Lambert", "Blanche", "Martin", "Gutierrez", "Vega", 
    "Reyes", "Sheri", "Palmer", "Wilma", "Mabel", "Gina", "Elliott", "Sherry", "Judy", "Heather", 
    "Chavez", "Atkins", "Ramsey", "Massey", "Barnes", "Leona", "Dorothy", "Townsend", "Hale", 
    "Beatrice", "Wendy", "Lucy", "Paula", "Phelps", "Boone", "Cannon", "Rodriquez", "Yvonne", 
    "Nichols", "Ida", "Gayle", "Parker", "Gonzalez", "Poole", "Wise", "Flores", "Munoz", "Sherman", 
    "Sarah", "Lopez", "Johnston", "Joseph", "Long", "Morales", "Michele", "Freeman", "Buchanan", 
    "Clayton", "Torres", "Alvarado", "Bernice", "Roxanne", "Castro", "Burns", "Anna", "Vanessa", 
    "Jenkins", "Monique", "Foster", "Frank", "Dora", "Joanna", "Terry", "Pierce", "Schultz", "Ruth", 
    "Norris", "Clark", "Jackie", "Tyler", "Elsie", "Alberta", "Moody", "Horton", "Holland", "Carole", 
    "Blair", "Cummings", "Casey", "Tamara", "Garcia", "Pearl", "Daisy", "Stanley", "Joy", "Walker", 
    "Brock", "Rebecca", "Tonya", "Glenda", "Anita", "Irma", "Lowe", "Eleanor", "Sanchez", "Velma", 
    "Kara", "Burnett", "Vargas", "Alison", "Christy", "Ryan", "Edwards", "Fitzgerald", "Evelyn", 
    "Karla", "Warren", "Inez", "Shelley", "Norton", "Lydia", "Fields", "Bowman", "Robin", "Holt", 
    "Craig", "Mathis", "Harmon", "Sanders", "Wilkerson", "Medina", "Curtis", "Yolanda", "Ward", 
    "Smith", "Beck", "Huff", "Kelley", "Rhonda", "Natalie", "Brown", "Hubbard", "Edith", "Patton", 
    "Hawkins", "Manning", "Pearson", "Summers", "Spencer", "Josephine", "Lori", "Mullins", "Iris", 
    "Melanie", "Juanita", "Hogan", "Marsh", "Dolores", "Bass", "Beth", "Pitts", "Sherri", "Geneva", 
    "Toni", "Rivera", "Mae", "Lillian", "Holmes", "Vicky", "Stacy", "Steele", "Harriet", "Debbie", 
    "Mcdonald", "Doyle", "Lauren", "Patty", "Rios", "Arlene", "Tammy", "Denise", "Doris", "Conley", 
    "Bridges", "Todd", "Pratt", "Lucas", "Fuller", "Penny", "Lynda", "Richards", "Carol", "Robinson", 
    "Lindsay", "Gertrude", "Angelica", "Christine", "Renee", "Nancy", "Kelly", "Marian", "Franklin", 
    "Gray", "Haynes", "Delgado", "Leonard", "Annie", "Payne", "Hansen", "Matthews", "Harper", "Donna", 
    "Jimenez", "Mann", "Myra", "Vickie", "Ramos", "Shirley", "Wright", "Hall", "Faye", "Viola", "Agnes", 
    "Marcia", "Billie", "Logan", "Reeves", "Sara", "Jordan", "Jensen", "Greer", "Margaret", "April", 
    "Cruz", "Valdez", "Elaine", "Singleton", "Alvarez", "Stone", "Bowen", "Miller", "Bessie", "Sonia", 
    "Butler", "Laurie", "Henderson", "Isabel", "Mcgee", "Kathy", "Carr", "Erin", "Mclaughlin", "Pena", 
    "Hernandez", "Pamela", "Diana", "Alicia", "Moss", "Osborne", "Eileen", "Amber", "Malone", "Rhodes", 
    "Jean", "Gloria", "Beverly", "Phyllis", "Mason", "Thelma", "Powell", "Marie", "Ford", "Gomez", 
    "Lynch", "Robbins", "Tate", "Nora", "Olivia", "Krista", "Walsh", "Patsy", "Wong", "Gardner", "Sonya", 
    "Violet", "Teresa", "Kelli", "Ballard", "West", "Lillie", "Naomi", "Cohen", "Leticia", "Jan", 
    "Monica", "Luz", "Georgia", "Peggy", "Dianne", "Grant", "Anne", "Briggs", "Richardson", "Griffin", 
    "Fisher", "Alma", "Adrienne", "Moreno", "Kristi", "Katherine", "Sheryl", "Cathy", "Roberta", "Morris", 
    "Caroline", "Holloway", "Padilla", "Wolfe", "Natasha", "Marshall", "Colon", "Emma", "Terri", "Cora", 
    "Potter", "Tucker", "Cole", "Helen", "Allison", "Sheila", "Montgomery", "Jeannette", "Burton", "Barton", 
    "Irene", "Bryant", "Bertha", "Antoinette", "Garza", "Pauline", "Julie", "Reynolds", "Margarita", 
    "Simon", "Theresa", "Genevieve", "Thomas", "Wheeler", "Connie", "Walters", "Shelia", "Collier", 
    "Harris", "Bush", "Melissa", "Willie", "Wanda", "Janice", "Hannah", "Santos", "Fannie", "Katrina", 
    "Stevens", "Stephens", "Beulah", "Berry", "Melody", "Guzman", "Miles", "Tiffany", "Francis", "Angie", 
    "Shelly", "Mcguire", "Jennifer", "Maryann", "Anderson", "Virginia", "Richard", "Glover", "Louise", 
    "Walton", "Mcdaniel", "Meyer", "Sutton", "Ramirez", "Hudson", "Evans", "Kimberly", "Colleen", 
    "Schneider", "Jeanette", "Mendoza", "Flora", "Candice", "Katie", "Miriam", "Daniels", "Sandra", 
    "Verna", "Arnold", "Della", "Dawson", "Misty", "Davidson", "Gail", "Gates", "Williamson", "Marquez", 
    "Brooke", "Reese", "Diane", "Dixon", "Gonzales", "Dunn", "Cheryl", "Loretta", "Erica", "Geraldine", 
    "Delores", "Melinda", "Constance", "Tracey", "Susie", "Heidi", "Weaver", "Kristine", "Carpenter", 
    "Bennett", "Becky", "Moore", "Barbara", "Henry", "Suzanne", "Jenny", "Erickson", "Maldonado", "Morton", 
    "Figueroa", "Barnett", "Oliver", "Wells", "Bradley", "Michelle", "Darlene", "Deanna", "Hattie", 
    "Mendez", "Goodwin", "Holly"
  ];

  const fnDesktop = ["Emma","Olivia","Sophia","Ava","Isabella","Mia","Harper","Evelyn","Abigail","Emily","Ella","Elizabeth","Camila","Luna","Sofia","Avery","Mila","Aria","Scarlett","Penelope","Chloe","Layla","Riley","Nora","Hazel","Zoey","Grace","Victoria","Amelia","Hannah","Lily","Addison","Eleanor","Natalie","Savannah","Brooklyn","Leah","Zoe","Stella","Ellie","Paisley","Audrey","Skylar","Violet","Claire","Bella","Aurora","Lucy","Anna","Samantha"];
  const lnDesktop = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const r = arr => arr[Math.floor(Math.random() * arr.length)];
  const sleep = ms => new Promise(res => setTimeout(res, ms));

  function setVal(el, val) {
    if (!el) return;
    el.focus();
    const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    const prototype = Object.getPrototypeOf(el);
    const protoSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

    if (protoSetter && valueSetter !== protoSetter) {
      protoSetter.call(el, val);
    } else if (valueSetter) {
      valueSetter.call(el, val);
    } else {
      el.value = val;
    }

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  const isMobileFb = !!document.getElementById("day") && !!document.getElementById("month");

  if (isMobileFb) {
    const a = (Math.random() * dnama.length) | 0;
    const b = (Math.random() * dnama.length) | 0;
    const f = (Math.random() * dnama.length) | 0;

    const fnInput = document.querySelector('input[name="firstname"]');
    const lnInput = document.querySelector('input[name="lastname"]');
    const emailInput = document.querySelector('input[name="reg_email__"]');
    const passInput = document.querySelector('input[name="reg_passwd__"]');

    if (fnInput) setVal(fnInput, dnama[a] + " " + dnama[b] + " " + dnama[f]);
    if (lnInput) setVal(lnInput, dnama[b]);
    if (emailInput) setVal(emailInput, phoneNumber);
    if (passInput) {
      passInput.type = "text";
      setVal(passInput, "Harimau");
    }

    const dayArr = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"];
    const monthArr = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    const yearArr = ["1998", "1999", "2000", "2001", "2002"];

    const dSelect = document.getElementById("day");
    const mSelect = document.getElementById("month");
    const ySelect = document.getElementById("year");

    if (dSelect) { dSelect.value = r(dayArr); dSelect.dispatchEvent(new Event("change", { bubbles: true })); }
    if (mSelect) { mSelect.value = r(monthArr); mSelect.dispatchEvent(new Event("change", { bubbles: true })); }
    if (ySelect) { ySelect.value = r(yearArr); ySelect.dispatchEvent(new Event("change", { bubbles: true })); }

    const femaleRadio = document.querySelector('input[name="sex"][value="1"]') || document.getElementsByName('sex')[0];
    if (femaleRadio) {
      femaleRadio.checked = true;
      femaleRadio.dispatchEvent(new Event("change", { bubbles: true }));
    }
  } else {
    const randomFirstName = r(fnDesktop);
    const randomLastName = r(lnDesktop);
    const randomDay = String(Math.floor(Math.random() * 28) + 1);
    const randomMonth = r(months);
    const randomYear = String(Math.floor(Math.random() * 5) + 1998);

    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"])'));
    const fnInput = document.querySelector('input[name="firstname"], input[placeholder*="First" i]') || inputs[0];
    const lnInput = document.querySelector('input[name="lastname"], input[placeholder*="Surname" i]') || inputs[1];
    const emailInput = document.querySelector('input[name="reg_email__"], input[aria-label="Mobile number"], input[placeholder*="Mobile" i], input[placeholder*="email" i]') || inputs[2];
    const passInput = document.querySelector('input[name="reg_passwd__"], input[type="password"]') || inputs[3];

    if (fnInput) setVal(fnInput, randomFirstName);
    if (lnInput) setVal(lnInput, randomLastName);
    if (emailInput) setVal(emailInput, phoneNumber);
    if (passInput) setVal(passInput, "Harimau");

    function triggerClick(el) {
      if (!el) return;
      let target = el;
      for (let i = 0; i < 3 && target; i++) {
        const rk = Object.keys(target).find(k => k.startsWith("__reactProps$") || k.startsWith("__reactEventHandlers$"));
        if (rk && typeof target[rk]?.onClick === "function") {
          try { target[rk].onClick({ preventDefault: () => {}, stopPropagation: () => {}, target: el, currentTarget: target }); } catch(e) {}
        }
        ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(evt => {
          target.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, composed: true, view: window }));
        });
        target = target.parentElement;
      }
    }

    async function selectDropdown(comboEl, textVal) {
      if (!comboEl) return;
      triggerClick(comboEl);
      await sleep(100);
      const targetStr = String(textVal).toLowerCase().trim();
      const options = Array.from(document.querySelectorAll('[role="option"], [role="listbox"] div, [role="listbox"] span, [role="menu"] div, div, span'));
      const opt = options.find(el => (el.innerText || el.textContent || "").toLowerCase().trim() === targetStr && el.children.length === 0) ||
                  options.find(el => (el.innerText || el.textContent || "").toLowerCase().trim() === targetStr);
      if (opt) triggerClick(opt);
      else triggerClick(comboEl);
      await sleep(100);
    }

    const comboboxes = Array.from(document.querySelectorAll('[role="combobox"]'));
    const dayCombo = document.querySelector('[aria-label="Select day"]') || comboboxes[0];
    const monthCombo = document.querySelector('[aria-label="Select month"]') || comboboxes[1];
    const yearCombo = document.querySelector('[aria-label="Select year"]') || comboboxes[2];
    const genderCombo = comboboxes.find(el => (el.innerText || "").toLowerCase().includes("gender")) || comboboxes[3];

    if (dayCombo) await selectDropdown(dayCombo, randomDay);
    if (monthCombo) await selectDropdown(monthCombo, randomMonth);
    if (yearCombo) await selectDropdown(yearCombo, randomYear);
    if (genderCombo) await selectDropdown(genderCombo, "Female");
  }
}

// ==========================================================
// 2. PENGISIAN KODE OTP SECARA SIMULTAN KE TAB SESUAI MAPPING
// ==========================================================
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
  const otpPromises = [];

  for (const tabIdStr of tabIds) {
    const tabId = parseInt(tabIdStr, 10);
    const mappedPhone = tabPhoneMap[tabId];
    const otpCode = otpMap[mappedPhone];

    if (otpCode) {
      const p = chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: injectOtpFillOnly,
        args: [otpCode]
      }).catch(() => {});
      otpPromises.push(p);
    }
  }

  await Promise.all(otpPromises);
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

  let otpInput = document.querySelector('input[aria-label="Confirmation code"], input[maxlength="5"], input[maxlength="6"], input[autocomplete="one-time-code"]');

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