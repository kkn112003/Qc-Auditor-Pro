import React, { useState } from 'react';
import { InventoryItem, RepairTicket } from '../../types';
import { Wrench, Clock, CheckCircle, AlertOctagon, Plus, Search, X } from 'lucide-react';

interface RepairTicketingProps {
    tickets: RepairTicket[];
    inventory?: InventoryItem[];
    onUpdateStatus: (ticketId: string, status: RepairTicket['status']) => void;
    onCreateTicket?: (ticket: RepairTicket) => void;
}

const RepairTicketing: React.FC<RepairTicketingProps> = ({ tickets, inventory = [], onUpdateStatus, onCreateTicket }) => {
    const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDeviceForTicket, setSelectedDeviceForTicket] = useState<InventoryItem | null>(null);
    const [newTicketReason, setNewTicketReason] = useState('');

    // Filter inventory for items that can have a ticket created (not already having an open ticket)
    const availableDevices = inventory.filter(item => {
        const hasOpenTicket = tickets.some(t => t.serialNumber === item.serial_number && t.status !== 'COMPLETED');
        const matchesSearch = item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.model.toLowerCase().includes(searchTerm.toLowerCase());
        return !hasOpenTicket && matchesSearch;
    });

    const handleCreateTicket = () => {
        if (!selectedDeviceForTicket || !onCreateTicket) return;

        const newTicket: RepairTicket = {
            id: `tick-${Date.now()}`,
            deviceId: selectedDeviceForTicket.id,
            serialNumber: selectedDeviceForTicket.serial_number,
            model: `${selectedDeviceForTicket.brand} ${selectedDeviceForTicket.model}`,
            technician: 'Manual Entry',
            failureReasons: [newTicketReason || 'Manual Ticket Created'],
            status: 'PENDING',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            notes: 'Created manually via Admin Dashboard'
        };

        onCreateTicket(newTicket);
        setIsCreateModalOpen(false);
        setSelectedDeviceForTicket(null);
        setNewTicketReason('');
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Repair Ticketing</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage failed units and track repair progress.</p>
                </div>
                {onCreateTicket && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={16} /> Create Ticket
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Kanban-like Board or List */}
                <div className="lg:col-span-2 space-y-4">
                    {tickets.length === 0 ? (
                        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                            <CheckCircle size={48} className="mx-auto text-emerald-200 dark:text-slate-700 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">All Clear!</h3>
                            <p className="text-slate-500 dark:text-slate-400">No active repair tickets pending.</p>
                            {onCreateTicket && (
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="mt-4 text-blue-600 hover:underline text-sm"
                                >
                                    Create a manual ticket
                                </button>
                            )}
                        </div>
                    ) : (
                        tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`bg-white dark:bg-slate-800 p-4 rounded-xl border cursor-pointer transition-all ${selectedTicket?.id === ticket.id
                                    ? 'border-blue-500 ring-1 ring-blue-500'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-400/50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${ticket.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                                            ticket.status === 'WAITING_SPAREPART' ? 'bg-amber-100 text-amber-600' :
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                            <Wrench size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">{ticket.serialNumber}</div>
                                            <div className="text-xs text-slate-500">{ticket.model}</div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                        ticket.status === 'WAITING_SPAREPART' ? 'bg-amber-100 text-amber-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex gap-2 flex-wrap">
                                        {ticket.failureReasons.map((reason, idx) => (
                                            <span key={idx} className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-100 dark:border-rose-900/30">
                                                {reason}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                                        <Clock size={12} /> Reported {new Date(ticket.createdAt).toLocaleDateString()} by {ticket.technician}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Detail Information */}
                <div className="lg:col-span-1">
                    {selectedTicket ? (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sticky top-6">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Ticket Details</h3>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Unit</label>
                                    <div className="text-slate-900 dark:text-white">{selectedTicket.model}</div>
                                    <div className="text-sm font-mono text-slate-500">{selectedTicket.serialNumber}</div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Defects</label>
                                    <ul className="list-disc list-inside text-rose-600 dark:text-rose-400 text-sm mt-1">
                                        {selectedTicket.failureReasons.map((r, i) => <li key={i}>{r}</li>)}
                                    </ul>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Notes</label>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                                        {selectedTicket.notes || "No additional notes."}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Update Status</label>
                                <button
                                    onClick={() => onUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}
                                    disabled={selectedTicket.status === 'IN_PROGRESS'}
                                    className="w-full py-2 px-4 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition-colors text-left flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Wrench size={16} /> Mark as In Progress
                                </button>
                                <button
                                    onClick={() => onUpdateStatus(selectedTicket.id, 'WAITING_SPAREPART')}
                                    disabled={selectedTicket.status === 'WAITING_SPAREPART'}
                                    className="w-full py-2 px-4 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium transition-colors text-left flex items-center gap-2 disabled:opacity-50"
                                >
                                    <AlertOctagon size={16} /> Waiting for Sparepart
                                </button>
                                <button
                                    onClick={() => onUpdateStatus(selectedTicket.id, 'COMPLETED')}
                                    disabled={selectedTicket.status === 'COMPLETED'}
                                    className="w-full py-2 px-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium transition-colors text-left flex items-center gap-2 disabled:opacity-50"
                                >
                                    <CheckCircle size={16} /> Mark as Repaired
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 h-64 flex flex-col items-center justify-center">
                            <Wrench size={32} className="mb-2 opacity-50" />
                            <p className="text-sm">Select a ticket to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Ticket Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus size={20} className="text-blue-500" />
                                Create Repair Ticket
                            </h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {!selectedDeviceForTicket ? (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search Serial Number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-100 dark:border-slate-800 rounded-lg p-2">
                                    {availableDevices.map(device => (
                                        <div
                                            key={device.id}
                                            onClick={() => setSelectedDeviceForTicket(device)}
                                            className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                                        >
                                            <div className="font-bold text-sm text-slate-900 dark:text-white">{device.brand} {device.model}</div>
                                            <div className="text-xs font-mono text-slate-500">{device.serial_number}</div>
                                        </div>
                                    ))}
                                    {availableDevices.length === 0 && (
                                        <div className="text-center text-sm text-slate-400 py-4">No available units found.</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="text-xs font-bold uppercase text-slate-500 mb-1">Selected Unit</div>
                                    <div className="font-bold text-slate-900 dark:text-white">{selectedDeviceForTicket.brand} {selectedDeviceForTicket.model}</div>
                                    <div className="text-xs font-mono text-slate-500">{selectedDeviceForTicket.serial_number}</div>
                                    <button
                                        onClick={() => setSelectedDeviceForTicket(null)}
                                        className="text-xs text-blue-600 hover:underline mt-2"
                                    >
                                        Change Unit
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Reason for Repair / Defect
                                    </label>
                                    <input
                                        type="text"
                                        value={newTicketReason}
                                        onChange={(e) => setNewTicketReason(e.target.value)}
                                        placeholder="e.g. Broken Hinge, Dead Pixel..."
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    />
                                </div>

                                <button
                                    onClick={handleCreateTicket}
                                    disabled={!newTicketReason.trim()}
                                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create Ticket
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepairTicketing;
