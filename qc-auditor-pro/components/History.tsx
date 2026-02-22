import React, { useState, useMemo } from 'react';
import { ProcessedDevice } from '../types';
import { Search, Filter, Download, FileSpreadsheet, Eye, CheckCircle, XCircle, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ConfirmationModal from './ConfirmationModal';

interface HistoryProps {
    devices: ProcessedDevice[];
    onSelectDevice: (deviceId: string) => void;
    onDelete: (deviceId: string) => void;
}

const History: React.FC<HistoryProps> = ({ devices, onSelectDevice, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL' | 'PENDING'>('ALL');
    const [showExportConfirm, setShowExportConfirm] = useState(false);

    const filteredDevices = useMemo(() => {
        return devices.filter(device => {
            const searchLower = searchTerm.toLowerCase();
            const dateString = new Date(device.timestamp).toLocaleString().toLowerCase();

            const matchesSearch =
                device.identity.serial_number.toLowerCase().includes(searchLower) ||
                device.identity.model.toLowerCase().includes(searchLower) ||
                (device.technician && device.technician.toLowerCase().includes(searchLower)) ||
                dateString.includes(searchLower);

            const matchesStatus = statusFilter === 'ALL' || device.status === statusFilter;
            return matchesSearch && matchesStatus;
        }).sort((a, b) => b.timestamp - a.timestamp); // Newest first
    }, [devices, searchTerm, statusFilter]);

    const exportToCSV = () => {
        if (filteredDevices.length === 0) return;

        const headers = ["Scan Date", "Technician", "Serial Number", "Model", "Processor", "RAM", "Storage", "Battery Wear", "Status", "Failure Reasons"];
        const rows = filteredDevices.map(d => [
            new Date(d.timestamp).toLocaleString(),
            d.technician || 'Unknown',
            d.identity.serial_number,
            d.identity.model,
            d.specs.cpu.name,
            `${d.specs.ram.total_gb}GB`,
            d.specs.storage?.[0]?.capacity_gb + "GB" || "N/A",
            `${d.battery.wear_level_percent}%`,
            d.status,
            d.failureReasons.join("; ")
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `qc_history_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setShowExportConfirm(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <ConfirmationModal
                isOpen={showExportConfirm}
                title="Confirm Export"
                message={`Are you sure you want to export ${filteredDevices.length} records to CSV?`}
                onConfirm={exportToCSV}
                onCancel={() => setShowExportConfirm(false)}
                confirmLabel="Yes, Export"
                cancelLabel="Cancel"
            />
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">History & Reports</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Complete archive of audited devices.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowExportConfirm(true)}
                        disabled={filteredDevices.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileSpreadsheet size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search Serial, Model, Technician, or Date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-slate-400" size={18} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PASS">PASS Only</option>
                        <option value="FAIL">FAIL Only</option>
                        <option value="PENDING">PENDING Only</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4 font-bold">Date & Time</th>
                                <th className="p-4 font-bold">Technician</th>
                                <th className="p-4 font-bold">Serial Number</th>
                                <th className="p-4 font-bold">Model</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {filteredDevices.length > 0 ? (
                                filteredDevices.map((device) => (
                                    <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Clock size={14} className="text-slate-400" />
                                                    {new Date(device.timestamp).toLocaleDateString('en-US')}
                                                </div>
                                                <div className="text-xs text-slate-400 pl-6">
                                                    {new Date(device.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{device.technician || 'Unknown'}</td>
                                        <td className="p-4 text-sm font-mono text-slate-800 dark:text-slate-200">{device.identity.serial_number}</td>
                                        <td className="p-4 text-sm text-slate-800 dark:text-white font-medium">{device.identity.model}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${device.status === 'PASS' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                                device.status === 'FAIL' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' :
                                                    'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                                }`}>
                                                {device.status === 'PASS' && <CheckCircle size={12} />}
                                                {device.status === 'FAIL' && <XCircle size={12} />}
                                                {device.status === 'PENDING' && <AlertTriangle size={12} />}
                                                {device.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => onSelectDevice(device.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded text-xs font-medium transition-colors"
                                                >
                                                    <Eye size={14} /> Detail
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(device.id);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded text-xs font-medium transition-colors"
                                                    title="Delete Unit"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 flex justify-between items-center text-xs text-slate-500">
                    <span>Showing {filteredDevices.length} of {devices.length} units</span>
                </div>
            </div>
        </div>
    );
};

export default History;
