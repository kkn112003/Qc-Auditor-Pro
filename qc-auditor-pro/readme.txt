===================================================================
             QC AUDITOR PRO - WEB & USB SYSTEM
===================================================================

Sistem ini terdiri dari dua bagian utama:
1. Web Dashboard (React) - Untuk review, checklist, dan laporan.
2. USB Collector (Python) - Untuk mengambil data dari laptop target.

-------------------------------------------------------------------
A. CARA PENGGUNAAN (USB COLLECTOR)
-------------------------------------------------------------------

1. Persiapkan Script:
   - Gunakan file `qc_collector.py`.
   - Install library: `pip install wmi pyinstaller`.
   
2. Build ke .EXE (Agar portable):
   - Jalankan: `python -m PyInstaller --onefile qc_collector.py`
   - Ambil file `qc_collector.exe` di folder `dist`.

3. Eksekusi di Laptop Target:
   - Masukkan Flashdisk berisi `qc_collector.exe`.
   - Jalankan file tersebut.
   - File JSON (contoh: `QC_SN12345.json`) akan muncul di folder yang sama.

-------------------------------------------------------------------
B. CARA PENGGUNAAN (WEB DASHBOARD)
-------------------------------------------------------------------

1. Buka Dashboard:
   - Jalankan aplikasi web ini (React).
   
2. Import Data:
   - Klik area upload atau tombol "Import Data QC".
   - Pilih satu atau banyak file JSON yang dihasilkan dari USB.
   
3. Validasi & Laporan:
   - Klik salah satu unit di list untuk melihat detail.
   - Lakukan Cek Fisik (Checklist).
   - Simpan hasil validasi.
   - Klik "Expert PDF Report" untuk mendownload laporan profesional.

-------------------------------------------------------------------
CATATAN PENTING:
-------------------------------------------------------------------
Aplikasi Desktop Python (launcher.py, build.py, qc_dashboard.py) 
telah didepresiasi. Fokus sistem sekarang sepenuhnya pada Web Dashboard 
untuk kemudahan akses dan kualitas laporan PDF yang lebih baik.
===================================================================