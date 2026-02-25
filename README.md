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
<img width="1897" height="990" alt="User Login" src="https://github.com/user-attachments/assets/43c76655-5171-4c25-9ace-7df15afbdb30" />

1. Buka aplikasi QC Auditor Pro di browser.
2. Login menggunakan akun Anda:
   - Admin: Username 'admin' Paaword 'admin'
   - Teknisi: Username 'teknisi' password 'teknisi'

B. Import Data
1. Setelah login, klik tombol "Import Data QC" atau area upload.
2. Pilih file JSON yang Anda ambil menggunakan USB Collector.
3. Data akan otomatis masuk ke daftar unit dan tersinkron ke Inventory.
<img width="1897" height="990" alt="Dashboard Teknisi" src="https://github.com/user-attachments/assets/456355e6-b7e6-45b3-9365-02654dc63fff" />


C. Validasi & Checklist Fisik
1. Klik pada unit laptop di daftar untuk melihat detail.
2. Lakukan pengecekan fisik (Layar, Keyboard, Bodi, dll) sesuai checklist.
3. Masukkan catatan tambahan jika diperlukan.
4. Klik "Simpan" untuk memperbarui status unit.
<img width="1897" height="990" alt="Detail Unit" src="https://github.com/user-attachments/assets/39281443-20c5-4dfa-a36f-ece40045f0a8" />
<img width="1897" height="990" alt="Validasi Teknisi" src="https://github.com/user-attachments/assets/c2af1c06-f9e3-4031-b298-af5711418263" />


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
- Dark/Light Mode: Klik ikon matahari/bulan untuk mengubah tema.
<img width="1897" height="990" alt="Dashboard Admin" src="https://github.com/user-attachments/assets/9cbd540d-e946-4763-904b-ded96437a31d" />
<img width="1897" height="990" alt="History   Logs Admin" src="https://github.com/user-attachments/assets/1dc35c9b-e74a-4f81-a4a0-3ca75b2c2670" />
<img width="1897" height="990" alt="History Teknisi" src="https://github.com/user-attachments/assets/dd7832b2-a0e0-463c-bd12-b1760255cfae" />
<img width="1897" height="990" alt="Master Data" src="https://github.com/user-attachments/assets/07a87fe4-7b31-45df-84e9-d62a1a6f5a76" />
<img width="1897" height="990" alt="Repair Admin" src="https://github.com/user-attachments/assets/3abd2c2e-4793-4754-9880-4660c40f30e3" />
<img width="1897" height="990" alt="Tools   Drivers Admin" src="https://github.com/user-attachments/assets/9d7d39e1-ce5e-4a88-b2a5-05ea08d751b7" />
<img width="1897" height="990" alt="Tools   Drivers Teknisi" src="https://github.com/user-attachments/assets/e3e8eb44-2e04-4ebd-bebf-a157f9690bd7" />
<img width="1897" height="990" alt="User Management" src="https://github.com/user-attachments/assets/49f3e934-cf42-4f53-9d39-ec481c5a1694" />
<img width="1897" height="990" alt="Light Mode" src="https://github.com/user-attachments/assets/ba936fb5-0aaa-43af-ba14-55139669379e" />
<img width="1897" height="990" alt="Konfirmasi LogOut" src="https://github.com/user-attachments/assets/a4217d9c-ee63-49bb-afde-b0803104dd70" />
-------------------------------------------------------------------
