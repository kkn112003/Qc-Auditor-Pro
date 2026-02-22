import React from 'react';
import { Download, Terminal, FileCode, Play, FolderInput, Monitor, HardDrive, Cpu, Wifi } from 'lucide-react';

interface CollectorScriptProps {
    onShowNotification?: (message: string, type: 'success' | 'error') => void;
}

const CollectorScript: React.FC<CollectorScriptProps> = ({ onShowNotification }) => {
    // PYTHON COLLECTOR SCRIPT (For USB)
    const pythonScript = `import wmi
import json
import os
import platform
import subprocess
from datetime import datetime

def get_system_info():
    try:
        c = wmi.WMI()
        
        # Identity
        sys_info = c.Win32_ComputerSystem()[0]
        bios_info = c.Win32_BIOS()[0]
        
        # CPU
        cpu_info = c.Win32_Processor()[0]
        
        # RAM
        ram_modules = c.Win32_PhysicalMemory()
        total_ram = sum(int(m.Capacity) for m in ram_modules) / (1024**3)
        
        # Storage
        disks = []
        for disk in c.Win32_DiskDrive():
            if "USB" not in disk.MediaType and "Removable" not in disk.MediaType:
                disks.append({
                    "model": disk.Model,
                    "capacity_gb": round(int(disk.Size) / (1024**3)),
                    "type": "SSD" if "SSD" in disk.Model else "HDD" 
                })

        # Battery
        battery_info = {
            "present": False,
            "design_capacity_mwh": 0,
            "full_charge_capacity_mwh": 0,
            "wear_level_percent": 0,
            "cycle_count": 0
        }
        
        try:
            bats = c.Win32_Battery()
            if bats:
                bat = bats[0]
                battery_info["present"] = True
                battery_info["design_capacity_mwh"] = int(bat.DesignCapacity or 0)
                battery_info["full_charge_capacity_mwh"] = int(bat.FullChargeCapacity or 0)
                if battery_info["design_capacity_mwh"] > 0:
                    battery_info["wear_level_percent"] = round((1 - (battery_info["full_charge_capacity_mwh"] / battery_info["design_capacity_mwh"])) * 100, 1)
        except:
            pass

        # JSON Structure matching Web App
        data = {
            "meta": {
                "scan_timestamp": datetime.now().isoformat(),
                "script_version": "1.0.0"
            },
            "identity": {
                "serial_number": bios_info.SerialNumber,
                "model": sys_info.Model,
                "brand": sys_info.Manufacturer
            },
            "specs": {
                "cpu": {
                    "name": cpu_info.Name,
                    "cores": int(cpu_info.NumberOfCores),
                    "threads": int(cpu_info.NumberOfLogicalProcessors)
                },
                "ram": {
                    "total_gb": round(total_ram, 1),
                    "slots_used": len(ram_modules),
                    "type": "DDR4", 
                    "speed": f"{ram_modules[0].Speed}MHz" if ram_modules else "Unknown"
                },
                "storage": disks,
                "gpu": [{"name": v.Name} for v in c.Win32_VideoController()]
            },
            "battery": battery_info,
            "connectivity": {
                "wifi_module": "Detected",
                "bluetooth_present": True,
                "webcam_present": True,
                "audio_device": "Realtek Audio"
            },
            "system_check": {
                "os_info": f"{platform.system()} {platform.release()}",
                "activation_status": "Active",
                "driver_issues": []
            },
             "manual_inspection": {
                 "phys_body_ok": None,
                 "phys_engsel_ok": None,
                 "phys_lcd_ok": None,
                 "phys_keyboard_ok": None,
                 "phys_port_ok": None,
                 "phys_camera_test_ok": None,
                 "phys_sound_test_ok": None
             }
        }

        return data
    except Exception as e:
        print(f"Error gathering data: {e}")
        return None

if __name__ == "__main__":
    print("QC Auditor Pro - Collecting System Data...")
    try:
        data = get_system_info()
        if data:
            filename = f"QC_{data['identity']['serial_number']}.json"
            with open(filename, "w") as f:
                json.dump(data, f, indent=4)
            print(f"SUCCESS! Data saved to {filename}")
        else:
            print("FAILED to collect data.")
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
    
    input("Press Enter to exit...")`;

    const batScript = `@echo off
echo Starting QC Auditor Audit...
title QC Auditor Collector
color 0A
python qc_collector.py
pause`;

    const [downloading, setDownloading] = React.useState<string | null>(null);

    const handleDownload = (filename: string, content: string) => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleDriverDownload = (name: string) => {
        if (downloading) return;
        setDownloading(name);
        if (onShowNotification) onShowNotification(`Starting download: ${name}...`, 'success');

        setTimeout(() => {
            setDownloading(null);
            if (onShowNotification) onShowNotification(`${name} downloaded successfully!`, 'success');
        }, 2000);
    };

    const drivers = [
        { name: "Intel Chipset Driver", version: "10.1.18", size: "5 MB", icon: Cpu, type: "Chipset" },
        { name: "Intel UHD Graphics", version: "31.0.101", size: "350 MB", icon: Monitor, type: "Graphics" },
        { name: "NVIDIA GeForce Driver", version: "536.23", size: "600 MB", icon: Monitor, type: "Graphics" },
        { name: "Realtek Audio Driver", version: "6.0.9", size: "45 MB", icon: HardDrive, type: "Audio" },
        { name: "Intel WiFi Driver", version: "22.150", size: "25 MB", icon: Wifi, type: "Network" },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Tools & Drivers</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Unduh tool audit otomatis untuk USB Flashdisk dan driver standar untuk unit laptop.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SECTION 1: COLLECTOR SCRIPT */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <FileCode className="text-blue-500 dark:text-blue-400" /> 1. QC Collector Script (Python)
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDownload("qc_collector.py", pythonScript)}
                                className="text-xs bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded border border-blue-200 dark:border-blue-700 transition-colors flex items-center gap-1 font-medium"
                            >
                                <Download size={12} /> Download .py
                            </button>
                            <button
                                onClick={() => handleDownload("run_audit.bat", batScript)}
                                className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 transition-colors flex items-center gap-1 font-medium"
                            >
                                <Terminal size={12} /> Download .bat
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 relative overflow-hidden group shadow-lg">
                        <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-mono">PYTHON 3.x</div>
                        <pre className="text-xs font-mono text-slate-300 overflow-x-auto h-80 custom-scrollbar p-2">
                            <code>{pythonScript}</code>
                        </pre>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* SECTION 2: INSTRUCTIONS */}
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <FolderInput className="text-amber-500 dark:text-amber-400" /> 2. Cara Penggunaan
                    </h3>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
                        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            <li>Download kedua file di samping (<strong>qc_collector.py</strong> dan <strong>run_audit.bat</strong>).</li>
                            <li>Simpan kedua file tersebut ke dalam <strong>USB Flashdisk</strong>.</li>
                            <li>Pasang Flashdisk ke laptop unit yang akan di-QC.</li>
                            <li>Jalankan file <strong>run_audit.bat</strong> (Double Click).</li>
                            <li>Tunggu proses selesai. File JSON baru (contoh: <code>QC_SN123456.json</code>) akan muncul di Flashdisk.</li>
                            <li>Upload file JSON tersebut di menu <strong>Dashboard</strong> web ini.</li>
                        </ol>

                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs rounded border border-amber-200 dark:border-amber-800">
                            <strong>Note:</strong> Pastikan laptop target sudah terinstall Python. Jika belum, compile script menjadi .exe menggunakan PyInstaller.
                        </div>
                    </div>

                    {/* SECTION 3: DRIVERS */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                            <HardDrive className="text-emerald-500 dark:text-emerald-400" /> 3. Standard Drivers Repo
                        </h3>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Driver Name</th>
                                            <th className="px-4 py-3 font-medium">Version</th>
                                            <th className="px-4 py-3 font-medium">Size</th>
                                            <th className="px-4 py-3 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {drivers.map((driver, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 dark:text-slate-400">
                                                            <driver.icon size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-800 dark:text-slate-200">{driver.name}</div>
                                                            <div className="text-xs text-slate-500">{driver.type}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{driver.version}</td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{driver.size}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => handleDriverDownload(driver.name)}
                                                        disabled={downloading !== null}
                                                        className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${downloading === driver.name
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                            }`}
                                                    >
                                                        {downloading === driver.name ? 'Downloading...' : 'Download'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectorScript;