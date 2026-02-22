import React, { useState } from 'react';
import { Search, Filter, FileJson, FileText, Download } from 'lucide-react';
import { ProcessedDevice } from '../../types';
import ConfirmationModal from '../ConfirmationModal';

interface HistoryLogProps {
    devices: ProcessedDevice[];
    onExportPDF: (filtered?: ProcessedDevice[]) => void;
    selectedIds?: string[];
    onToggleSelect?: (id: string) => void;
    onSelectAll?: (ids: string[]) => void;
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
}

const HistoryLog: React.FC<HistoryLogProps> = ({
    devices,
    onExportPDF,
    selectedIds = [],
    onToggleSelect,
    onSelectAll,
    searchTerm = '',
    onSearchChange
}) => {
    // Internal state for backward compatibility if props not provided (optional)
    const [internalSearchTerm, setInternalSearchTerm] = useState('');
    const effectiveSearchTerm = onSearchChange ? searchTerm : internalSearchTerm;
    const handleSearchChange = (val: string) => {
        if (onSearchChange) onSearchChange(val);
        else setInternalSearchTerm(val);
    };

    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL' | 'PENDING'>('ALL');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [exportType, setExportType] = useState<'excel' | 'pdf' | null>(null);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredDevices = devices.filter(device => {
        const matchesSearch =
            device.identity.serial_number.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
            device.identity.model.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
            device.technician.toLowerCase().includes(effectiveSearchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || device.status === statusFilter;

        let matchesDate = true;
        if (startDate) {
            matchesDate = matchesDate && device.timestamp >= new Date(startDate).getTime();
        }
        if (endDate) {
            // Include the whole end date (until 23:59:59)
            matchesDate = matchesDate && device.timestamp <= new Date(endDate).getTime() + 86400000 - 1;
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    const isAllSelected = filteredDevices.length > 0 && filteredDevices.every(d => selectedIds.includes(d.id));
    const isIndeterminate = selectedIds.length > 0 && !isAllSelected;

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onSelectAll) {
            onSelectAll(e.target.checked ? filteredDevices.map(d => d.id) : []);
        }
    };

    const handleExportClick = (type: 'excel' | 'pdf') => {
        setExportType(type);
        setShowConfirmModal(true);
    };

    const handleConfirmExport = () => {
        if (exportType === 'excel') {
            exportToExcel();
        } else if (exportType === 'pdf') {
            onExportPDF(filteredDevices);
        }
        setShowConfirmModal(false);
        setExportType(null);
    };

    const exportToExcel = () => {
        // Simple CSV export implementation
        const headers = ["Scan Time", "Serial Number", "Model", "Technician", "Status", "Issues"];
        const rows = filteredDevices.map(d => [
            new Date(d.timestamp).toLocaleString(),
            d.identity.serial_number,
            `${d.identity.brand} ${d.identity.model}`,
            d.technician,
            d.status,
            d.failureReasons.join("; ")
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `qc_history_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <ConfirmationModal
                isOpen={showConfirmModal}
                title={`Confirm ${exportType === 'excel' ? 'Excel/CSV' : 'PDF'} Export`}
                message={`Are you sure you want to export ${filteredDevices.length} records?`}
                onConfirm={handleConfirmExport}
                onCancel={() => setShowConfirmModal(false)}
                confirmLabel="Yes, Export"
                cancelLabel="Cancel"
            />
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">History Logs</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Archive of all QC processed units.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleExportClick('excel')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <FileJson size={16} /> Export Excel (CSV)
                    </button>
                    <button
                        onClick={() => handleExportClick('pdf')}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <FileText size={16} /> Export PDF
                    </button>
                </div>
            </header>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Serial, Model, or Technician..."
                            value={effectiveSearchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                        />
                    </div>


                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Start Date"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="End Date"
                        />
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
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

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 w-10">
                                    {onSelectAll && (
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            checked={isAllSelected}
                                            ref={input => {
                                                if (input) input.indeterminate = isIndeterminate;
                                            }}
                                            onChange={handleSelectAll}
                                        />
                                    )}
                                </th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Serial Number</th>
                                <th className="px-6 py-3">Model</th>
                                <th className="px-6 py-3">Technician</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredDevices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        No logs found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredDevices.map((device) => {
                                    const isSelected = selectedIds.includes(device.id);
                                    return (
                                        <tr key={device.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                                            <td className="px-6 py-4">
                                                {onToggleSelect && (
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                        checked={isSelected}
                                                        onChange={() => onToggleSelect(device.id)}
                                                    />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {new Date(device.timestamp).toLocaleDateString()}
                                                <div className="text-xs opacity-70">{new Date(device.timestamp).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                                                {device.identity.serial_number}
                                            </td>
                                            <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                                                {device.identity.brand} {device.identity.model}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                {device.technician}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${device.status === 'PASS'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : device.status === 'FAIL'
                                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }`}>
                                                    {device.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate text-slate-500 dark:text-slate-500">
                                                {device.status === 'FAIL' ? device.failureReasons.join(', ') : '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistoryLog;
