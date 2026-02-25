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
1. Buka aplikasi QC Auditor Pro di browser.
2. Login menggunakan akun Anda:
   - Admin: Username 'admin'
   - Teknisi: Username 'teknisi'

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
- Repair Ticketing: Unit yang "FAIL" otomatis membuat tiket perbaikan.
- User Management: Pengaturan akun pengguna (hanya akun Admin).
- Dark/Light Mode: Klik ikon matahari/bulan untuk mengubah tema.

-------------------------------------------------------------------
