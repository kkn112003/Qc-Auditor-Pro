# PANDUAN PENGGUNAAN QC AUDITOR PRO


Sistem QC Auditor Pro dirancang untuk mendigitalkan proses Quality Control
laptop dengan mengintegrasikan pengambilan data hardware otomatis dan
dashboard manajemen berbasis web.

Sistem terdiri dari dua komponen utama:
1. USB Collector (Aplikasi Python untuk Laptop Target)
2. Web Dashboard (Pusat Data dan Pelaporan)

-------------------------------------------------------------------
1. CARA PENGGUNAAN USB COLLECTOR (PENGAMBILAN DATA)
-------------------------------------------------------------------
Gunakan langkah ini untuk mengambil spesifikasi hardware dari laptop target.

Langkah-langkah:
1. Hubungkan Flashdisk yang berisi file 'qc_collector.exe'.
2. Jalankan 'qc_collector.exe' pada laptop yang akan di-QC.
3. Tunggu hingga proses selesai.
4. File data berupa JSON (contoh: QC_SN12345.json) akan muncul di
   folder yang sama dengan aplikasi.
5. Cabut flashdisk setelah file data terkumpul.

-------------------------------------------------------------------
2. CARA PENGGUNAAN WEB DASHBOARD (MANAJEMEN & QC)
-------------------------------------------------------------------
Gunakan langkah ini untuk memproses data yang sudah diambil.

A. Login
<img width="1920" height="1200" alt="User Login" src="https://github.com/user-attachments/assets/f66e19b7-3c87-455e-b2c6-329b5ae48299" />

1. Buka aplikasi QC Auditor Pro di browser.
2. Login menggunakan akun Anda:
   - Admin: Username 'admin' Paaword 'admin'
   - Teknisi: Username 'teknisi' password 'teknisi'

B. Import Data
1. Setelah login, klik tombol "Import Data QC" atau area upload.
2. Pilih file JSON yang Anda ambil menggunakan USB Collector.
3. Data akan otomatis masuk ke daftar unit dan tersinkron ke Inventory.

C. Validasi & Checklist Fisik
1. Klik pada unit laptop di daftar untuk melihat detail.
2. Lakukan pengecekan fisik (Layar, Keyboard, Bodi, dll) sesuai checklist.
3. Masukkan catatan tambahan jika diperlukan.
4. Klik "Simpan" untuk memperbarui status unit.

D. Export Laporan PDF
1. Klik tombol "Expert PDF Report" pada detail unit atau dashboard.
2. Laporan profesional akan diunduh secara otomatis.

-------------------------------------------------------------------
3. FITUR UTAMA
-------------------------------------------------------------------
- Dashboard Analytics: Visualisasi data QC (hanya akun Admin).
- Inventory Management: Data unit otomatis tersinkron ke stok.
- User Management: Pengaturan akun pengguna (hanya akun Admin).
- Repair Ticketing: Unit yang "FAIL" otomatis membuat tiket perbaikan.
- <img width="1920" height="1200" alt="Repair Admin" src="https://github.com/user-attachments/assets/58f3d4d8-1062-42ef-9043-9e1da3be3423" />
<img width="1920" height="1200" alt="Master Data" src="https://github.com/user-attachments/assets/737ea357-4704-436f-b554-6f8dcb8a2183" />
<img width="1920" height="1200" alt="Tools   Script teknisi" src="https://github.com/user-attachments/assets/0426499b-a8e5-4ada-97dc-a82ab8fbe5fb" />
<img width="1920" height="1200" alt="User Management" src="https://github.com/user-attachments/assets/c2d0834e-4fd9-435d-8111-8d0a3443f7b9" />
<img width="1920" height="1200" alt="Tools   Drivers" src="https://github.com/user-attachments/assets/826a9aef-f566-4a33-8ae0-f124a50a29ee" />
<img width="1920" height="1200" alt="Validasi Teknisi" src="https://github.com/user-attachments/assets/2a5ba409-aaf3-433a-9be6-68cecea004d1" />
<img width="1920" height="1200" alt="Dashboard Teknisi" src="https://github.com/user-attachments/assets/6ceaa0f5-47e0-4c21-a77d-9855f17cbbda" />
<img width="1920" height="1200" alt="Dashboard Admin" src="https://github.com/user-attachments/assets/6bdde2c0-313c-4037-99fc-ec88c84a895e" />
<img width="1920" height="1200" alt="History Teknisi" src="https://github.com/user-attachments/assets/b6126759-239a-4711-95f2-6d53d303f1df" />
<img width="1920" height="1200" alt="History Admin" src="https://github.com/user-attachments/assets/e2e2a1fe-7d8b-4a14-922b-94d1e71a76f2" />
<img width="1920" height="1200" alt="Detail Spesifikasi Hardware dan Modul Cek Fisik" src="https://github.com/user-attachments/assets/d1089b61-62f9-439d-942a-bb537e3760cb" />

- Dark/Light Mode: Klik ikon matahari/bulan untuk mengubah tema.
<img width="1920" height="1200" alt="Light Mode" src="https://github.com/user-attachments/assets/ecbc8190-f600-4845-ba51-cfbb1bd6caf0" />
-------------------------------------------------------------------
