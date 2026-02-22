import React, { useState } from 'react';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Cpu,
    HardDrive,
    Battery,
    Monitor,
    Save,
    Wand2,
    Wifi,
    Video,
    Layers,
    ShieldAlert,
    ClipboardCheck,
    Tag,
    User
} from 'lucide-react';
import { ProcessedDevice, QC_THRESHOLDS, ManualInspection } from '../types';
import { analyzeDeviceCondition } from '../services/geminiService';

interface DeviceDetailProps {
    device: ProcessedDevice;
    onUpdate: (updatedDevice: ProcessedDevice) => void;
    onSave: (updatedDevice: ProcessedDevice) => void;
    onBack: () => void;
}

const DeviceDetail: React.FC<DeviceDetailProps> = ({ device, onUpdate, onSave, onBack }) => {
    const [manualCheck, setManualCheck] = useState<ManualInspection>(device.manual_inspection);
    const [technicianName, setTechnicianName] = useState(device.technician || '');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);

    const toggleCheck = (key: keyof ManualInspection) => {
        setManualCheck(prev => ({
            ...prev,
            [key]: prev[key] === true ? false : true
        }));
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setManualCheck(prev => ({
            ...prev,
            physical_notes: e.target.value
        }));
    };

    const calculateStatus = (): { status: 'PASS' | 'FAIL' | 'PENDING', reasons: string[] } => {
        const reasons: string[] = [];
        let status: 'PASS' | 'FAIL' | 'PENDING' = 'PASS';

        // --- 1. AUTOMATIC CHECKS (Hardware) ---
        if (device.battery && device.battery.wear_level_percent > QC_THRESHOLDS.MAX_BATTERY_WEAR) {
            status = 'FAIL';
            reasons.push(`Battery Wear Critical (${device.battery.wear_level_percent}%)`);
        }

        const primaryStorage = device.specs.storage && device.specs.storage[0];
        if (primaryStorage && primaryStorage.health_percent < QC_THRESHOLDS.MIN_STORAGE_HEALTH) {
            status = 'FAIL';
            reasons.push(`Storage Health Low (${primaryStorage.health_percent}%)`);
        }

        const driverIssues = device.system_check?.driver_issues || [];
        if (driverIssues.length > 0) {
            status = 'FAIL';
            reasons.push(`${driverIssues.length} Driver Errors Detected`);
        }

        // --- 2. MANUAL CHECKS (Checklist) ---
        const checks = Object.values(manualCheck);

        if (checks.includes(null)) {
            if (status !== 'FAIL') status = 'PENDING';
        }
        else if (checks.includes(false)) {
            status = 'FAIL';
            if (manualCheck.phys_body_ok === false) reasons.push("Physical Body Damage");
            if (manualCheck.phys_lcd_ok === false) reasons.push("LCD Defect");
            if (manualCheck.phys_engsel_ok === false) reasons.push("Hinge Issue");
            if (manualCheck.phys_keyboard_ok === false) reasons.push("Keyboard Malfunction");
            if (manualCheck.phys_port_ok === false) reasons.push("Port Connection Issue");
            if (manualCheck.phys_camera_test_ok === false) reasons.push("Camera Test Failed");
            if (manualCheck.phys_sound_test_ok === false) reasons.push("Audio Test Failed");
        }

        return { status, reasons };
    };

    const saveChanges = () => {
        const { status, reasons } = calculateStatus();
        const updatedDevice: ProcessedDevice = {
            ...device,
            manual_inspection: manualCheck,
            status,
            failureReasons: reasons,
            technician: technicianName || 'Unknown'
        };
        onSave(updatedDevice);
    };

    const handleAIAnalysis = async () => {
        setIsAnalyzing(true);
        const { status, reasons } = calculateStatus();
        const tempDevice = {
            ...device,
            manual_inspection: manualCheck,
            status,
            failureReasons: reasons,
            technician: technicianName || 'Unknown'
        };

        const analysis = await analyzeDeviceCondition(tempDevice);

        onUpdate({
            ...tempDevice,
            aiAnalysis: analysis
        });
        setIsAnalyzing(false);
    };

    const CheckItem = ({ label, field, icon: Icon }: { label: string, field: keyof ManualInspection, icon: any }) => {
        const value = manualCheck[field];
        return (
            <div
                onClick={() => toggleCheck(field)}
                className={`cursor-pointer flex items-center justify-between p-3 rounded-lg border transition-all ${value === true
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-100'
                    : value === false
                        ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-500/50 text-rose-800 dark:text-rose-100'
                        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <Icon size={18} className={value === true ? 'text-emerald-600 dark:text-emerald-400' : value === false ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'} />
                    <span className="text-sm font-medium">{label}</span>
                </div>
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${value === true ? 'bg-emerald-500 border-emerald-500' :
                    value === false ? 'bg-rose-500 border-rose-500' :
                        'border-slate-300 dark:border-slate-500'
                    }`}>
                    {value === true && <CheckCircle size={14} className="text-white" />}
                    {value === false && <XCircle size={14} className="text-white" />}
                </div>
            </div>
        )
    };

    const driverIssues = device.system_check?.driver_issues || [];

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                    <button onClick={onBack} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-2 text-sm flex items-center gap-1">
                        ← Kembali ke Dashboard
                    </button>
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{device.identity.model}</h2>
                        <span className="font-mono text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{device.identity.serial_number}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold border flex items-center gap-2 text-sm sm:text-base ${device.status === 'PASS' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500' :
                        device.status === 'FAIL' ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600'
                        }`}>
                        {device.status === 'PASS' && <CheckCircle size={18} />}
                        {device.status === 'FAIL' && <AlertTriangle size={18} />}
                        {device.status}
                    </span>
                    <button
                        onClick={handleAIAnalysis}
                        disabled={isAnalyzing}
                        className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 py-2 sm:px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                        <Wand2 className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        <span className="whitespace-nowrap">AI Analysis</span>
                    </button>
                    <button
                        onClick={() => setShowSaveModal(true)}
                        className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 py-2 sm:px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 text-sm sm:text-base"
                    >
                        <Save className="w-4 h-4" />
                        <span className="whitespace-nowrap">Simpan & Validasi</span>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                {/* LEFT COLUMN: AUTOMATIC REPORT */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">

                    {/* 1. Identity & Core Specs */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Tag size={16} /> Identitas & Spesifikasi
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded border border-slate-200 dark:border-slate-700/50">
                                <div className="text-xs text-slate-500 mb-1">Processor</div>
                                <div className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                                    <Cpu size={16} className="text-blue-500 dark:text-blue-400" /> {device.specs.cpu?.name || "Unknown"}
                                </div>
                                <div className="text-xs text-slate-500 mt-1 pl-6">
                                    {device.specs.cpu?.cores || 0} Cores, {device.specs.cpu?.threads || 0} Threads
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded border border-slate-200 dark:border-slate-700/50">
                                <div className="text-xs text-slate-500 mb-1">Memory (RAM)</div>
                                <div className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                                    <Layers size={16} className="text-purple-500 dark:text-purple-400" /> {device.specs.ram?.total_gb || 0} GB
                                </div>
                                <div className="text-xs text-slate-500 mt-1 pl-6">
                                    Used Slots: {device.specs.ram?.slots_used || 0} | Speed: {device.specs.ram?.speed || "N/A"}
                                </div>
                            </div>
                        </div>
                        {/* Extended Identity & Specs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded border border-slate-200 dark:border-slate-700/50">
                                <div className="text-xs text-slate-500 mb-1">Unit Identity</div>
                                <div className="text-slate-900 dark:text-white font-medium text-sm flex items-center gap-2">
                                    <Tag size={16} className="text-orange-500 dark:text-orange-400" />
                                    <span className="font-mono">{device.identity.serial_number}</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1 pl-6">
                                    Model: {device.identity.model}
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded border border-slate-200 dark:border-slate-700/50">
                                <div className="text-xs text-slate-500 mb-1">Graphics (GPU)</div>
                                <div className="text-slate-900 dark:text-white font-medium text-sm flex items-center gap-2">
                                    <Monitor size={16} className="text-pink-500 dark:text-pink-400" />
                                    <span className="truncate">{device.specs.gpu && device.specs.gpu.length > 0 ? device.specs.gpu[0] : "Integrated Graphics"}</span>
                                </div>
                                {device.specs.gpu && device.specs.gpu.length > 1 && (
                                    <div className="text-xs text-slate-500 mt-1 pl-6 truncate">
                                        + {device.specs.gpu.slice(1).join(', ')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* 2. Health Check (Storage & Battery) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Battery */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Battery size={16} /> Baterai
                            </h3>
                            {device.battery && device.battery.present ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500 dark:text-slate-300">Wear Level</span>
                                        <span className={`font-bold ${device.battery.wear_level_percent > QC_THRESHOLDS.MAX_BATTERY_WEAR ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                                            {device.battery.wear_level_percent}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${device.battery.wear_level_percent > QC_THRESHOLDS.MAX_BATTERY_WEAR ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(device.battery.wear_level_percent, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mt-2">
                                        <div>Design: {device.battery.design_capacity_mwh} mWh</div>
                                        <div>Full: {device.battery.full_charge_capacity_mwh} mWh</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-rose-500 dark:text-rose-400 text-sm flex items-center gap-2">
                                    <AlertTriangle size={16} /> Tidak Terdeteksi
                                </div>
                            )}
                        </div>

                        {/* Storage */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <HardDrive size={16} /> Penyimpanan
                            </h3>
                            {device.specs.storage && device.specs.storage.length > 0 ? device.specs.storage.map((disk, idx) => (
                                <div key={idx} className="mb-3 last:mb-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-slate-700 dark:text-slate-200">{disk.model}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${disk.health_percent > 80 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                            }`}>
                                            {disk.health_percent}% Health
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500">{disk.capacity_gb} GB • {disk.type} • {disk.smart_status}</div>
                                </div>
                            )) : (
                                <div className="text-slate-500 text-sm italic">No storage detected</div>
                            )}
                        </div>
                    </div>

                    {/* 3. Connectivity & Software */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <ShieldAlert size={16} /> Software & Modul
                        </h3>
                        <div className="space-y-4">
                            {/* OS */}
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                                <span className="text-sm text-slate-500 dark:text-slate-300">Operating System</span>
                                <span className="text-sm text-slate-800 dark:text-white font-medium text-right">{device.system_check?.os_info || "Unknown"}</span>
                            </div>
                            {/* Drivers */}
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                                <span className="text-sm text-slate-500 dark:text-slate-300">Driver Status</span>
                                {driverIssues.length === 0 ? (
                                    <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle size={14} /> All OK</span>
                                ) : (
                                    <span className="text-sm text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                        <AlertTriangle size={14} /> {driverIssues.length} Issues
                                    </span>
                                )}
                            </div>
                            {/* Webcam */}
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                                <span className="text-sm text-slate-500 dark:text-slate-300">Webcam</span>
                                <div className={`flex items-center gap-2 text-sm ${device.connectivity.webcam_present ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    <Video size={16} /> {device.connectivity.webcam_present ? 'Ready' : 'Missing'}
                                </div>
                            </div>

                            {/* Audio & Biometrics */}
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                                <span className="text-sm text-slate-500 dark:text-slate-300">Audio & Mikrofon</span>
                                {device.connectivity.audio_device && device.connectivity.audio_device !== 'N/A' && device.connectivity.microphone && device.connectivity.microphone !== 'Mic N/A' ? (
                                    <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <CheckCircle size={14} /> All OK
                                    </span>
                                ) : (
                                    <div className="text-right">
                                        <div className={`text-sm font-medium ${device.connectivity.audio_device && device.connectivity.audio_device !== 'N/A' ? 'text-slate-800 dark:text-white' : 'text-slate-800 dark:text-white'}`}>
                                            {device.connectivity.audio_device || "Audio N/A"}
                                        </div>
                                        <div className={`text-xs ${device.connectivity.microphone && device.connectivity.microphone !== 'Mic N/A' ? 'text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {device.connectivity.microphone || "Mic N/A"}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                                <span className="text-sm text-slate-500 dark:text-slate-300">Keamanan Biometrik</span>
                                {device.connectivity.biometric && device.connectivity.biometric !== 'None' ? (
                                    <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <CheckCircle size={14} /> All OK ({device.connectivity.biometric})
                                    </span>
                                ) : (
                                    <span className="text-sm text-slate-800 dark:text-white font-medium">{device.connectivity.biometric || "None"}</span>
                                )}
                            </div>

                            {/* Wifi Module (Moved to Bottom) */}
                            <div className="flex items-center justify-between pt-1">
                                <span className="text-sm text-slate-500 dark:text-slate-300">Konektivitas (WiFi)</span>
                                <div className={`flex items-center gap-2 text-sm ${device.connectivity.wifi_module !== 'Not Detected' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    <Wifi size={16} /> {device.connectivity.wifi_module}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Report */}
                    {/* AI Report */}
                    {device.aiAnalysis && (
                        <div className="rounded-xl shadow-lg border border-indigo-500/30 transition-all duration-500 animate-fade-in overflow-hidden bg-indigo-600 text-white">
                            <div className="px-6 py-4 flex items-center justify-between border-b border-indigo-500/30">
                                <h3 className="font-bold text-base flex items-center gap-2">
                                    <Wand2 className="w-5 h-5 text-indigo-100" /> Analisis AI
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="leading-relaxed text-sm whitespace-pre-wrap font-medium text-indigo-50">
                                    {device.aiAnalysis.replace("[AI ANALYSIS]", "").trim()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: MANUAL CHECKLIST */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sticky top-6 shadow-sm dark:shadow-none">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 rounded-t-xl">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-emerald-500" /> Cek Fisik
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Teknisi wajib memeriksa fisik. Centang jika kondisi <strong>BAGUS</strong>.
                            </p>
                        </div>

                        <div className="p-4 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">

                            <div className="text-xs font-bold text-slate-500 uppercase mt-2">Eksterior</div>
                            <CheckItem label="Body / Casing Mulus" field="phys_body_ok" icon={Monitor} />
                            <CheckItem label="Baut Cover Lengkap" field="phys_cover_screws_ok" icon={ShieldAlert} />
                            <CheckItem label="Engsel Kokoh" field="phys_engsel_ok" icon={Layers} />

                            <div className="text-xs font-bold text-slate-500 uppercase mt-4">Layar & Visual</div>
                            <CheckItem label="LCD (No Deadpixel/Spot)" field="phys_lcd_ok" icon={Monitor} />
                            <CheckItem label="Kamera Berfungsi" field="phys_camera_test_ok" icon={Video} />

                            <div className="text-xs font-bold text-slate-500 uppercase mt-4">Fungsi Lain</div>
                            <CheckItem label="Keyboard & Trackpad" field="phys_keyboard_ok" icon={Monitor} />
                            <CheckItem label="Port USB/HDMI/LAN" field="phys_port_ok" icon={Wifi} />
                            <CheckItem label="Speaker & Mic Jernih" field="phys_sound_test_ok" icon={Monitor} />

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Additional Notes</label>
                                <textarea
                                    value={manualCheck.physical_notes || ''}
                                    onChange={handleNotesChange}
                                    placeholder="Enter physical details not covered in the checklist (e.g. Scratches near USB port)..."
                                    className="w-full text-sm p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                                />
                            </div>

                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850/50 rounded-b-xl">
                            {device.failureReasons.length > 0 ? (
                                <div className="bg-rose-100 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-500/20 p-3 rounded text-xs text-rose-800 dark:text-rose-200">
                                    <strong>Penyebab Gagal:</strong>
                                    <ul className="list-disc list-inside mt-1 opacity-80">
                                        {device.failureReasons.map((r, i) => <li key={i}>{r}</li>)}
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-center text-xs text-slate-500">
                                    Unit ini memenuhi syarat jika semua checklist hijau dan hardware aman.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
            {/* Technician Input Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-700 p-6 animate-scale-in">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Validasi Unit</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                            Masukkan nama teknisi untuk menyimpan hasil pemeriksaan ini.
                        </p>

                        <div className="relative mb-6">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={technicianName}
                                onChange={(e) => setTechnicianName(e.target.value)}
                                placeholder="Nama Teknisi"
                                autoFocus
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={saveChanges}
                                disabled={!technicianName.trim()}
                                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default DeviceDetail;