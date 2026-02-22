import React, { useState, useMemo } from 'react';
import { InventoryItem, ProcessedDevice } from '../types';
import { Wrench, CheckCircle, Trash2, AlertTriangle, Search, FileText, X } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface RepairTicketingProps {
    inventory: InventoryItem[];
    devices: ProcessedDevice[];
    onUpdateStatus: (serialNumber: string, newStatus: 'READY_TO_SELL' | 'NEED_REPAIR' /* | 'SCRAP' */, notes?: string) => void;
}

const RepairTicketing: React.FC<RepairTicketingProps> = ({ inventory, devices, onUpdateStatus }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<{ inventory: InventoryItem, device?: ProcessedDevice } | null>(null);
    const [repairNotes, setRepairNotes] = useState('');
    const [showActionModal, setShowActionModal] = useState<{ isOpen: boolean, action: 'REPAIR' | 'SCRAP' }>({ isOpen: false, action: 'REPAIR' });

    // Filter only items that NEED_REPAIR
    const repairList = useMemo(() => {
        return inventory.filter(item => {
            const matchesStatus = item.status === 'NEED_REPAIR';
            const matchesSearch = item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.model.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [inventory, searchTerm]);

    const handleSelect = (item: InventoryItem) => {
        // Find corresponding QC data for details
        const deviceData = devices.find(d => d.identity.serial_number === item.serial_number);
        setSelectedItem({ inventory: item, device: deviceData });
        setRepairNotes('');
    };

    const confirmAction = () => {
        if (!selectedItem) return;

        if (showActionModal.action === 'REPAIR') {
            onUpdateStatus(selectedItem.inventory.serial_number, 'READY_TO_SELL', repairNotes);
        } else {
            // For now, SCRAP might just mean removing from inventory or marking as such. 
            // Types currently only support PENDING, READY_TO_SELL, NEED_REPAIR. 
            // I'll stick to READY_TO_SELL for "Repaired". 
            // Maybe we need a 'SCRAP' status in types? For now I'll just use console.log or assume it's removed? 
            // Let's just implement REPAIR for now as requested.
            onUpdateStatus(selectedItem.inventory.serial_number, 'READY_TO_SELL', `SCRAPPED: ${repairNotes}`);
        }
        setShowActionModal({ isOpen: false, action: 'REPAIR' });
        setSelectedItem(null);
    };

    return (
        <div className="space-y-6 animate-fade-in relative">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Repair Ticketing</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage failed units and track repair progress.</p>
                </div>
                {/* Stats */}
                <div className="flex gap-4">
                    <div className="bg-rose-100 dark:bg-rose-900/30 px-4 py-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
                        <span className="text-rose-600 dark:text-rose-400 font-bold block text-lg">{repairList.length}</span>
                        <span className="text-rose-600 dark:text-rose-400 text-xs font-medium uppercase">Units Failed</span>
                    </div>
                </div>
            </header>

            <div className="flex gap-6 h-[calc(100vh-200px)]">
                {/* Left: List */}
                <div className="w-1/3 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Serial Number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {repairList.length > 0 ? (
                            repairList.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${selectedItem?.inventory.id === item.id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500 ring-1 ring-blue-500'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.serial_number}</span>
                                        <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                            Need Repair
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2">{item.model}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                        <AlertTriangle size={12} />
                                        <span>Failed on: {item.qcDate ? new Date(item.qcDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        Tech: {item.technician || 'Unknown'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                                <CheckCircle className="mx-auto mb-2 opacity-50" size={32} />
                                <p>No units need repair</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Detail & Actions */}
                <div className="w-2/3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 relative overflow-hidden">
                    {selectedItem ? (
                        <div className="h-full flex flex-col">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Wrench className="text-blue-500" />
                                Repair Ticket Details
                            </h3>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 mb-2">Device Info</h4>
                                    <div className="space-y-1">
                                        <div className="text-sm"><span className="text-slate-400">Model:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedItem.inventory.model}</span></div>
                                        <div className="text-sm"><span className="text-slate-400">SN:</span> <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{selectedItem.inventory.serial_number}</span></div>
                                        <div className="text-sm"><span className="text-slate-400">Import Date:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{new Date(selectedItem.inventory.importDate).toLocaleDateString()}</span></div>
                                    </div>
                                </div>

                                <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/20">
                                    <h4 className="text-xs uppercase font-bold text-rose-600 dark:text-rose-400 mb-2">Failure Analysis</h4>
                                    {selectedItem.device && selectedItem.device.failureReasons.length > 0 ? (
                                        <ul className="list-disc list-inside text-sm text-rose-700 dark:text-rose-300 space-y-1">
                                            {selectedItem.device.failureReasons.map((reason, idx) => (
                                                <li key={idx}>{reason}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No specific failure reasons logged.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Repair Logs / Technician Notes
                                </label>
                                <textarea
                                    className="w-full h-32 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Describe the repair actions taken..."
                                    value={repairNotes}
                                    onChange={(e) => setRepairNotes(e.target.value)}
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                {/* 
                                <button
                                    onClick={() => setShowActionModal({ isOpen: true, action: 'SCRAP' })}
                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-medium transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={16} /> Mark as Scrap
                                </button> 
                                */}
                                <button
                                    onClick={() => setShowActionModal({ isOpen: true, action: 'REPAIR' })}
                                    disabled={!repairNotes.trim()}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-bold shadow-lg shadow-emerald-600/20 transition-all transform hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <CheckCircle size={18} /> Mark as Repaired
                                </button>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                            <Wrench size={64} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a ticket to view details</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={showActionModal.isOpen}
                title={showActionModal.action === 'REPAIR' ? "Confirm Repair" : "Confirm Scrap"}
                message={showActionModal.action === 'REPAIR'
                    ? "Are you sure this unit is fully repaired and ready to return to stock (Ready to Sell)?"
                    : "Are you sure you want to scrap this unit? This action usually cannot be undone."}
                onConfirm={confirmAction}
                onCancel={() => setShowActionModal({ ...showActionModal, isOpen: false })}
                confirmLabel={showActionModal.action === 'REPAIR' ? "Yes, Repair Complete" : "Yes, Scrap Unit"}
                cancelLabel="Cancel"
                isDanger={showActionModal.action === 'SCRAP'}
            />
        </div>
    );
};

export default RepairTicketing;
