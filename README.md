# 🚀 FB Auto Register, OTP Filler & Cookie Extractor
**AUTO FILLER BY : ROTI BAKAR RIICH**

Ekstensi Chrome (Manifest V3) untuk mengotomatisasi pengisian formulir pendaftaran Facebook (Web & Mobile), pencocokan kode OTP lintas tab secara instan, kontrol navigasi ulang kode SMS, serta pengambilan *cookies* akun Facebook per-tab secara otomatis (kompatibel dengan SessionBox & anti-duplikat `c_user`).

---

## ✨ Fitur Utama

### 1. 📋 Auto Fill Form Pendaftaran (Web & Mobile)
* Mengisi data pendaftaran Facebook secara otomatis ke seluruh tab yang terbuka (1 nomor telepon per tab).
* Mendukung tampilan **Facebook Desktop (`www.facebook.com`)** dan **Facebook Mobile (`m.facebook.com`)**.
* Mengisi otomatis Nama Depan, Nama Belakang, Tanggal Lahir acak, Jenis Kelamin, Nomor Telepon, dan Password default (`kontol87`). #ganti sandi di file background.js 
* Menyimpan pemetaan nomor telepon ke masing-masing ID Tab secara otomatis agar kode OTP tidak tertukar.

### 2. 💬 Auto Fill OTP Lintas Tab (Kombo Bot Telegram)
* Cukup tempel (*paste*) seluruh pesan balasan dari Bot OTP Telegram ke kolom **Format Pesan OTP Bot**.
* Ekstensi otomatis memfilter baris yang masih berstatus `⏳ / Menunggu` dan mengekstrak pasangan **Nomor Telepon** beserta **Kode OTP**.
* Mengisi kode OTP secara tepat ke tab Facebook yang menggunakan nomor telepon tersebut.

### 3. ⚡ Kontrol Navigasi Kode Massal (Semua Tab)
Kontrol 1x klik untuk mengeksekusi aksi di seluruh tab Facebook secara bersamaan:
* **⚡ 1. I Didn't Get the Code**: Mengklik opsi tidak menerima kode.
* **🔄 2. Resend Code**: Mengklik opsi kirim ulang kode SMS.
* **✏️ 3. Change Mobile Number**: Mengklik opsi ganti nomor ponsel (dan siap diisi nomor baru dari antrean).

### 4. 🍪 Cookie Extractor (Anti-Duplikat `c_user`)
* Mengambil *cookies* sesi aktif dari seluruh tab Facebook dengan urutan prioritas: `datr`, `wd`, `dpr`, `sb`, `c_user`, `fr`, `xs`.
* **Anti-Duplikat**: Mendeteksi ID akun (`c_user`) secara otomatis sehingga meskipun tombol **GET COOKIES** diklik berkali-kali, *cookie* dengan `c_user` yang sama tidak akan pernah terduplikasi.
* **📋 Salin**: Menyalin seluruh daftar *cookies* unik ke *clipboard*.
* **🗑️ Hapus (Pengaman 2x Klik)**: Dilengkapi konfirmasi klik kedua (`⚠️ Yakin? Klik Lagi`) untuk mencegah penghapusan *cookies* secara tidak sengaja.

### 5. 🛠️ Fitur Tambahan & Navigasi Cepat
* **Side Panel Support**: Klik kanan pada ikon ekstensi lalu pilih **"Buka di Side Panel"** agar panel tetap terbuka di samping layar tanpa tertutup saat pindah tab.
* **🔁 Refresh All Tab**: Memuat ulang seluruh tab Facebook secara bersamaan.
* **Go to Web / Go to M**: Mengalihkan seluruh tab aktif ke halaman registrasi Facebook Web atau Facebook Mobile secara instan.

---

## ⌨️ Pintasan Keyboard (Shortcuts)

| Shortcut | Fungsi |
| :--- | :--- |
| `Alt + Shift + 1` | Isi Form Pendaftaran Instan ke seluruh tab Facebook |
| `Alt + Shift + 2` | Isi Kode OTP ke masing-masing tab yang sesuai |

*(Pintasan dapat diatur ulang melalui menu `chrome://extensions/shortcuts`)*

---

## 🤖 Daftar Bot Telegram Penyedia Nomor OTP (Kombo Ekstensi)

Ekstensi ini sudah disesuaikan dan kompatibel penuh (*kombo*) dengan format pesan OTP dari bot Telegram berikut:

| No | Nama Layanan | Link Bot Telegram | Website Resmi (Ambil API Key) |
| :-: | :--- | :--- | :--- |
| 1 | **SMSBower** | [@SMSbwer_bot](https://t.me/SMSbwer_bot) | [https://smsbower.app/](https://smsbower.app/) |
| 2 | **Grizzly SMS** | [@grizzlyOTP_BOT](https://t.me/grizzlyOTP_BOT) | [https://grizzlysms.com/](https://grizzlysms.com/) |
| 3 | **Tiger SMS** | [@sdggtt_bot](https://t.me/sdggtt_bot) | [https://tiger-sms.com/](https://tiger-sms.com/) |
| 4 | **SMSCode** | [@smscodev2_bot](https://t.me/smscodev2_bot) | [https://smscode.gg/dashboard](https://smscode.gg/dashboard) |

### ⚠️ Penting: Cara Mengaktifkan Bot dengan API Key
Sebelum memesan nomor di Bot Telegram, Anda **WAJIB** mendaftar di website resmi penyedia layanan terlebih dahulu dan menghubungkan **API Key**:
1. Buka salah satu **Website Resmi** pada tabel di atas, lalu **Daftar (Register)** dan **Login** ke akun Anda.
2. Lakukan pengisian saldo (*Top Up*) pada website tersebut sesuai kebutuhan.
3. Masuk ke menu **Profile / Settings / Dashboard** di website untuk menyalin **API Key** akun Anda.
4. Buka **Link Bot Telegram** yang sesuai, klik **Start**, lalu masukkan **API Key** Anda sesuai petunjuk di dalam bot.
5. Setelah API Key terhubung, Anda dapat langsung memesan nomor melalui bot Telegram dan menyalin format nomor/OTP-nya ke dalam ekstensi ini.

---

## 📦 Cara Instalasi Ekstensi

1. Unduh atau pastikan seluruh file ekstensi berada dalam satu folder:
   * `manifest.json`
   * `background.js`
   * `popup.html`
   * `popup.js`
2. Buka browser Google Chrome dan akses halaman `chrome://extensions/`.
3. Aktifkan sakelar **Developer mode** (Mode Pengembang) di pojok kanan atas.
4. Klik tombol **Load unpacked** (Muat yang belum dikemas) di pojok kiri atas.
5. Pilih folder tempat file ekstensi disimpan.
6. Ekstensi siap digunakan melalui klik ikon *popup* maupun melalui **Side Panel**.

---

## 📖 Cara Penggunaan Singkat

1. **Siapkan Tab**: Buka beberapa tab dan klik tombol **go to web** atau **go to m** untuk membuka halaman registrasi Facebook di semua tab.
2. **Isi Pendaftaran**: Pesan nomor di Bot Telegram, salin daftar nomornya ke kolom **1. Antrean Nomor Telepon**, lalu klik **▶ Isi Form Pendaftaran** (atau tekan `Alt+Shift+1`).
3. **Masukkan OTP**: Setelah kode SMS masuk di Bot Telegram, salin seluruh pesan dari bot dan tempel ke kolom **2. Format Pesan OTP Bot**, lalu klik **▶ Isi Kode OTP** (atau tekan `Alt+Shift+2`).
4. **Ambil Cookies**: Setelah akun berhasil masuk/terdaftar, klik tombol **🍪 GET COOKIES** pada bagian **4. Kolom Cookies**, lalu klik **📋 Salin** untuk menyimpan hasil *cookies*.
