import React, { useState, useEffect } from 'react';
import { Server, HardDrive, Database, Download, Upload, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { ProcessedDevice, InventoryItem, User, ActivityLog, RepairTicket } from '../../types';

interface SystemHealthProps {
    devices: ProcessedDevice[];
    inventory: InventoryItem[];
    users: User[];
    logs: ActivityLog[];
    tickets: RepairTicket[];
    onRestore: (data: any) => void;
}

const SystemHealth: React.FC<SystemHealthProps> = ({ devices, inventory, users, logs, tickets, onRestore }) => {
    const [storageUsage, setStorageUsage] = useState<{ used: number; total: number; percent: number }>({ used: 0, total: 5 * 1024 * 1024, percent: 0 }); // Assuming 5MB limit for localStorage
    const [lastBackup, setLastBackup] = useState<number | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        calculateStorage();
        window.addEventListener('online', () => setIsOnline(true));
        window.addEventListener('offline', () => setIsOnline(false));

        const storedBackup = localStorage.getItem('qc_auditor_last_backup');
        if (storedBackup) setLastBackup(Number(storedBackup));

        return () => {
            window.removeEventListener('online', () => setIsOnline(true));
            window.removeEventListener('offline', () => setIsOnline(false));
        };
    }, [devices, inventory, users, logs, tickets]);

    const calculateStorage = () => {
        let total = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += (localStorage[key].length * 2); // 2 bytes per char
            }
        }
        // Estimate 5MB quota (typical browser limit)
        const quota = 5 * 1024 * 1024;
        setStorageUsage({
            used: total,
            total: quota,
            percent: Math.min((total / quota) * 100, 100)
        });
    };

    const handleBackup = () => {
        const data = {
            devices,
            inventory,
            users,
            logs,
            tickets,
            timestamp: Date.now(),
            version: '1.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qc_system_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const now = Date.now();
        setLastBackup(now);
        localStorage.setItem('qc_auditor_last_backup', String(now));
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (confirm(`Restore system data from backup dated ${new Date(data.timestamp).toLocaleString()}? This will OVERWRITE current data.`)) {
                    onRestore(data);
                }
            } catch (error) {
                alert("Invalid backup file");
            }
            e.target.value = ''; // Reset input
        };
        reader.readAsText(file);
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">System Health & Maintenance</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor system status and manage data backups.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Server Status */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-lg ${isOnline ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'}`}>
                            <Server size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">System Status</h3>
                            <div className="text-xs text-slate-500">Connectivity & Services</div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Network Status</span>
                            <span className={`flex items-center gap-1.5 text-sm font-medium ${isOnline ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {isOnline ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Database Engine</span>
                            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                                <CheckCircle size={14} /> Active (Local)
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Last Sync</span>
                            <span className="text-sm text-slate-900 dark:text-white font-mono">Real-time</span>
                        </div>
                    </div>
                </div>

                {/* Storage Usage */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                            <HardDrive size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Storage Usage</h3>
                            <div className="text-xs text-slate-500">Local Browser Storage</div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600 dark:text-slate-400">Used: {formatBytes(storageUsage.used)}</span>
                            <span className="text-slate-600 dark:text-slate-400">Total: {formatBytes(storageUsage.total)}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${storageUsage.percent > 90 ? 'bg-rose-500' : storageUsage.percent > 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                style={{ width: `${storageUsage.percent}%` }}
                            ></div>
                        </div>
                        <div className="mt-2 text-right text-xs text-slate-500">
                            {storageUsage.percent.toFixed(1)}% Used
                        </div>
                    </div>

                    <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs py-1">
                            <span className="text-slate-500">Devices</span>
                            <span className="font-mono">{devices.length} records</span>
                        </div>
                        <div className="flex justify-between text-xs py-1">
                            <span className="text-slate-500">Inventory</span>
                            <span className="font-mono">{inventory.length} items</span>
                        </div>
                        <div className="flex justify-between text-xs py-1">
                            <span className="text-slate-500">Logs</span>
                            <span className="font-mono">{logs.length} entries</span>
                        </div>
                    </div>
                </div>

                {/* Backup & Maintenance */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Backup & Data</h3>
                            <div className="text-xs text-slate-500">Manage System Data</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleBackup}
                            className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded text-emerald-600">
                                    <Download size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Backup Data</div>
                                    <div className="text-xs text-slate-500">Download full JSON backup</div>
                                </div>
                            </div>
                        </button>

                        <label className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors group cursor-pointer relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleRestore}
                                className="hidden"
                            />
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded text-amber-600">
                                    <Upload size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Restore Data</div>
                                    <div className="text-xs text-slate-500">Restore from JSON file</div>
                                </div>
                            </div>
                        </label>

                        <div className="pt-2 text-center text-xs text-slate-400">
                            Last Backup: {lastBackup ? new Date(lastBackup).toLocaleString() : 'Never'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Info */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Software Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Version</div>
                        <div className="font-mono text-sm">v2.4.0 (Pro)</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Build Date</div>
                        <div className="font-mono text-sm">Feb 2026</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">License</div>
                        <div className="font-mono text-sm text-emerald-600">Enterprise Active</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Support</div>
                        <div className="font-mono text-sm text-blue-600">support@qcpro.com</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemHealth;
