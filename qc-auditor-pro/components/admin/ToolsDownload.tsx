import React from 'react';
import { Download, Monitor, HardDrive, Keyboard, Cpu, Battery } from 'lucide-react';

interface ToolsDownloadProps {
    onShowNotification: (message: string, type: 'success' | 'error') => void;
}

const ToolsDownload: React.FC<ToolsDownloadProps> = ({ onShowNotification }) => {
    const [downloading, setDownloading] = React.useState<string | null>(null);

    const handleDownload = (name: string) => {
        if (downloading) return;
        setDownloading(name);
        onShowNotification(`Starting download: ${name}...`, 'success');

        // Simulate network request
        setTimeout(() => {
            setDownloading(null);
            onShowNotification(`${name} downloaded successfully!`, 'success');
        }, 2000);
    };

    const tools = [
        { name: 'HWMonitor', category: 'Hardware Monitoring', size: '2.4 MB', icon: Monitor },
        { name: 'CrystalDiskMark', category: 'Storage Benchmark', size: '4.1 MB', icon: HardDrive },
        { name: 'Keyboard Tester Utility', category: 'Input Testing', size: '1.2 MB', icon: Keyboard },
        { name: 'CPU-Z', category: 'Processor Info', size: '3.0 MB', icon: Cpu },
        { name: 'BatteryInfoView', category: 'Battery Diagnostics', size: '0.8 MB', icon: Battery },
    ];

    const drivers = [
        { name: 'Asus System Control Interface', version: 'v3.1.20', type: 'System' },
        { name: 'Intel Graphics Driver', version: 'v31.0.101', type: 'Graphics' },
        { name: 'Realtek Audio Driver', version: 'v6.0.9', type: 'Audio' },
        { name: 'MediaTek Bluetooth Driver', version: 'v1.932', type: 'Connectivity' },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tools & Drivers</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Essential utilities for technicians.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tools Section */}
                <section className="space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Download className="text-blue-500" /> Diagnostic Tools
                    </h3>
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {tools.map((tool, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <tool.icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-slate-900 dark:text-white">{tool.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{tool.category} • {tool.size}</div>
                                </div>
                                <button
                                    onClick={() => handleDownload(tool.name)}
                                    disabled={downloading !== null}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${downloading === tool.name
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                                        }`}
                                >
                                    {downloading === tool.name ? '...' : 'Download'}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Drivers Section */}
                <section className="space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Download className="text-emerald-500" /> Unified Driver Pack
                    </h3>
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {drivers.map((driver, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                    <div className="font-bold text-xs">DRV</div>
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-slate-900 dark:text-white">{driver.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{driver.version} • {driver.type}</div>
                                </div>
                                <button
                                    onClick={() => handleDownload(driver.name)}
                                    disabled={downloading !== null}
                                    className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
                                >
                                    <Download size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1">Mirror Server Status</h4>
                        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Create-react-app mirror is online (Latency: 24ms)</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ToolsDownload;
