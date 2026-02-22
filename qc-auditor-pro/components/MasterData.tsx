
import React, { useState, useRef } from 'react';
import { InventoryItem, InventoryStatus } from '../types';
import { Search, Filter, Upload, FileSpreadsheet, Plus, AlertCircle, CheckCircle2, Factory, Trash2 } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface MasterDataProps {
    inventory: InventoryItem[];
    onUpdateInventory: (items: InventoryItem[]) => void;
}

const MasterData: React.FC<MasterDataProps> = ({ inventory, onUpdateInventory }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | InventoryStatus>('ALL');
    const [showImportConfirm, setShowImportConfirm] = useState(false);
    const [pendingImport, setPendingImport] = useState<InventoryItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Delete Confirmation
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const filteredItems = inventory.filter(item => {
        const matchesSearch = item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.model.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => b.importDate - a.importDate);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            // Simple CSV parser: Assumes headers [Serial Number, Model] or just text
            // Skip header if present
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const newItems: InventoryItem[] = [];

            lines.forEach((line, index) => {
                // Skip potential header row if it contains "Serial"
                if (index === 0 && line.toLowerCase().includes('serial')) return;

                const parts = line.split(',').map(p => p.trim());
                if (parts.length >= 1) {
                    newItems.push({
                        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        serial_number: parts[0],
                        model: parts[1] || 'Unknown Model',
                        status: 'PENDING',
                        importDate: Date.now()
                    });
                }
            });

            if (newItems.length > 0) {
                setPendingImport(newItems);
                setShowImportConfirm(true);
            }
        };
        reader.readAsText(file);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const confirmImport = () => {
        // Dedup: Don't import if SN already exists
        const existingSNs = new Set(inventory.map(i => i.serial_number.toLowerCase()));
        const uniqueNewItems = pendingImport.filter(i => !existingSNs.has(i.serial_number.toLowerCase()));

        onUpdateInventory([...uniqueNewItems, ...inventory]);
        setShowImportConfirm(false);
        setPendingImport([]);
    };

    const handleDelete = (id: string) => {
        onUpdateInventory(inventory.filter(i => i.id !== id));
        setDeleteId(null);
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <ConfirmationModal
                isOpen={showImportConfirm}
                title="Confirm Import"
                message={`Found ${pendingImport.length} items. Import them to Master Data?`}
                onConfirm={confirmImport}
                onCancel={() => setShowImportConfirm(false)}
                confirmLabel="Yes, Import"
                cancelLabel="Cancel"
            />
            <ConfirmationModal
                isOpen={!!deleteId}
                title="Delete Item"
                message="Are you sure you want to delete this item from Master Data?"
                onConfirm={() => deleteId && handleDelete(deleteId)}
                onCancel={() => setDeleteId(null)}
                isDanger={true}
                confirmLabel="Delete"
                cancelLabel="Cancel"
            />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                        <Factory size={24} className="text-blue-600" />
                        Master Data / Inventory
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage target list of devices for QC.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".csv,.txt"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <Upload size={16} /> Import CSV
                    </button>
                    <button
                        onClick={() => {
                            // Dummy export
                            alert("Export feature specific for Inventory not implemented yet.");
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
                    >
                        <FileSpreadsheet size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                    <div className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold mb-1">Total Stock</div>
                    <div className="text-2xl font-mono text-slate-900 dark:text-white">
                        {inventory.length}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                    <div className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold mb-1">Ready to Sell</div>
                    <div className="text-2xl font-mono text-emerald-500">
                        {inventory.filter(i => i.status === 'READY_TO_SELL').length}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                    <div className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold mb-1">Needs Repair</div>
                    <div className="text-2xl font-mono text-rose-500">
                        {inventory.filter(i => i.status === 'NEED_REPAIR').length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search Serial Number..."
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
                        <option value="PENDING">Pending QC</option>
                        <option value="READY_TO_SELL">Ready to Sell</option>
                        <option value="NEED_REPAIR">Need Repair</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4 font-bold">Import Date</th>
                                <th className="p-4 font-bold">Serial Number</th>
                                <th className="p-4 font-bold">Model</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold">QC Date</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(item.importDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-sm font-mono text-slate-800 dark:text-slate-200 font-bold">
                                            {item.serial_number}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            {item.model}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border ${item.status === 'READY_TO_SELL' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' :
                                                    item.status === 'NEED_REPAIR' ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400' :
                                                        'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                                                }`}>
                                                {item.status === 'READY_TO_SELL' && <CheckCircle2 size={12} />}
                                                {item.status === 'NEED_REPAIR' && <AlertCircle size={12} />}
                                                {item.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            {item.qcDate ? new Date(item.qcDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setDeleteId(item.id)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                        No inventory data found. Import a CSV to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MasterData;
