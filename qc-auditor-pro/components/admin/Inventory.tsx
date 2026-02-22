// ... (imports)
import React, { useState, useRef } from 'react';
import { Plus, Search, Package, AlertCircle, CheckCircle2, Factory, MapPin, Cpu, Barcode, Upload, DollarSign, Tag, Trash2 } from 'lucide-react';
import { InventoryItem } from '../../types';
import BarcodeGenerator from 'react-barcode';

// ... (component code)



interface InventoryProps {
    inventory: InventoryItem[];
    onAddIventory: (item: Omit<InventoryItem, 'id' | 'status' | 'importDate'>) => void;
    onBulkAddInventory?: (items: Omit<InventoryItem, 'id' | 'status' | 'importDate'>[]) => void;
    onClearInventory?: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, onAddIventory, onBulkAddInventory, onClearInventory }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [selectedItemForPrint, setSelectedItemForPrint] = useState<InventoryItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [newItem, setNewItem] = useState({
        serial_number: '',
        model: '',
        brand: '',
        category: 'Laptop',
        warehouseLocation: '',
        vendor: '',
        batch: '',
        price: 0,
        cost: 0,
        poNumber: '',
        specs: {
            cpu: '',
            ram: '',
            storage: '',
            screen: '',
            gpu: ''
        },
        passCriteria: {
            maxBatteryWear: 20,
            minRam: 8,
            allowMinorScratches: true
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddIventory({
            ...newItem,
            // @ts-ignore - Parent handles defaults
            status: 'PENDING',
        });
        resetForm();
        setIsAddModalOpen(false);
    };

    const resetForm = () => {
        setNewItem({
            serial_number: '',
            model: '',
            brand: '',
            category: 'Laptop',
            warehouseLocation: '',
            vendor: '',
            batch: '',
            price: 0,
            cost: 0,
            poNumber: '',
            specs: { cpu: '', ram: '', storage: '', screen: '', gpu: '' }
        });
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            // Simple CSV Parser: assumes header row and comma separation
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            // Basic validation
            if (!headers.includes('serial_number') || !headers.includes('model')) {
                alert('Invalid CSV format. Must include "serial_number" and "model" columns.');
                return;
            }

            const newItems: any[] = [];
            let successCount = 0;

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                const values = lines[i].split(',').map(v => v.trim());
                const rowData: any = {};
                headers.forEach((header, index) => {
                    rowData[header] = values[index];
                });

                if (rowData.serial_number && rowData.model) {
                    newItems.push({
                        serial_number: rowData.serial_number,
                        model: rowData.model,
                        brand: rowData.brand || '',
                        category: rowData.category || 'Laptop',
                        warehouseLocation: rowData.warehouselocation || '',
                        vendor: rowData.vendor || '',
                        status: 'PENDING',
                        specs: {
                            cpu: rowData.cpu || '',
                            ram: rowData.ram || '',
                            storage: rowData.storage || '',
                            screen: rowData.screen || ''
                        }
                    });
                    successCount++;
                }
            }

            if (newItems.length > 0) {
                if (onBulkAddInventory) {
                    onBulkAddInventory(newItems);
                } else {
                    // Fallback if prop not provided (less efficient)
                    newItems.forEach(item => onAddIventory(item));
                }
                alert(`Successfully imported ${successCount} units.`);
                setIsUploadModalOpen(false);
            }
        };
        reader.readAsText(file);
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch =
            item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(inventory.map(i => i.category || 'Uncategorized')));

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Package className="text-blue-600" />
                        Master Data / Inventory
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage unit identity, specs, and logistics.</p>
                </div>
                <div className="flex gap-2">
                    {inventory.length > 0 && onClearInventory && (
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg text-sm font-medium transition-colors border border-rose-200 dark:border-rose-800"
                            onClick={onClearInventory}
                        >
                            <Trash2 size={16} /> Clear Data
                        </button>
                    )}
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
                        onClick={() => setIsUploadModalOpen(true)}
                    >
                        <Upload size={16} /> Bulk Upload
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={16} /> Add Unit
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                        <Package size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase">Total Stock</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{inventory.length}</div>
                    </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                        <Package size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase">Pending QC</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {inventory.filter(i => i.status === 'PENDING').length}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase">Passed / Ready</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {inventory.filter(i => i.status === 'READY_TO_SELL').length}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase">Need Repair</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {inventory.filter(i => i.status === 'NEED_REPAIR').length}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Serial, Model, Brand..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                    >
                        <option value="ALL">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3">Identity</th>
                                <th className="px-6 py-3">Specs</th>
                                <th className="px-6 py-3">Logistics</th>
                                <th className="px-6 py-3">QC Info</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-center">Barcode</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No inventory data found. Add units to track.
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${item.category === 'Laptop' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                                    item.category === 'Desktop' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                                                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}>
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white text-base">{item.brand} {item.model}</div>
                                                    <div className="text-xs font-mono text-slate-500 mt-0.5 flex items-center gap-1.5">
                                                        <span className="select-all">{item.serial_number}</span>
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-wide">
                                                            {item.category}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                    <Cpu size={12} className="text-slate-400" />
                                                    <span className="font-medium">{item.specs?.cpu || '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                    <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500">R</div>
                                                    <span>{item.specs?.ram || '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                    <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500">S</div>
                                                    <span>{item.specs?.storage || '-'}</span>
                                                </div>
                                                {item.specs?.gpu && (
                                                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 col-span-2">
                                                        <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500">G</div>
                                                        <span className="truncate max-w-[120px]" title={item.specs.gpu}>{item.specs.gpu}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                                    <MapPin size={12} className="text-slate-400" />
                                                    {item.warehouseLocation || 'Unassigned'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                                    <Factory size={12} className="text-slate-400" />
                                                    {item.vendor || 'Unknown'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <span className="text-[10px] uppercase tracking-wider text-slate-400">In:</span>
                                                    {new Date(item.importDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 dark:text-slate-300">{item.vendor || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{item.batch || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                Rp {item.price?.toLocaleString('id-ID') || '0'}
                                            </div>
                                            {item.cost && <div className="text-xs text-slate-400">Cost: Rp {item.cost.toLocaleString('id-ID')}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.technician ? (
                                                <div className="flex items-start gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                                                        {item.technician.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-slate-900 dark:text-white">{item.technician}</div>
                                                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                                            <CheckCircle2 size={10} className="text-emerald-500" />
                                                            {item.qcDate ? new Date(item.qcDate).toLocaleDateString() : '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic flex items-center gap-1">
                                                    <AlertCircle size={12} /> No QC Data
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.status === 'READY_TO_SELL' && (
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full w-fit">
                                                    <CheckCircle2 size={12} /> Ready
                                                </span>
                                            )}
                                            {item.status === 'NEED_REPAIR' && (
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-2.5 py-1 rounded-full w-fit">
                                                    <AlertCircle size={12} /> Repair
                                                </span>
                                            )}
                                            {item.status === 'PENDING' && (
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-full w-fit">
                                                    <Package size={12} /> Queued
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedItemForPrint(item);
                                                    setIsPrintModalOpen(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Print Barcode Asset Tag"
                                            >
                                                <Barcode size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Unit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus size={20} className="text-blue-500" />
                                Add New Target Unit
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Section 1: Identity */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">1. Identity</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Serial Number <span className="text-rose-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            value={newItem.serial_number}
                                            onChange={e => setNewItem({ ...newItem, serial_number: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white font-mono"
                                            placeholder="SCAN or Type SN"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                                        <input
                                            type="text"
                                            value={newItem.brand}
                                            onChange={e => setNewItem({ ...newItem, brand: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none dark:text-white"
                                            placeholder="e.g. Asus"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Model Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={newItem.model}
                                            onChange={e => setNewItem({ ...newItem, model: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none dark:text-white"
                                            placeholder="e.g. Vivobook 14"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                        <select
                                            value={newItem.category}
                                            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none dark:text-white"
                                        >
                                            <option value="Laptop">Laptop</option>
                                            <option value="Desktop">Desktop</option>
                                            <option value="Tablet">Tablet</option>
                                            <option value="Smartphone">Smartphone</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Specs */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">2. Standard Specs</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">CPU</label>
                                        <input type="text" value={newItem.specs.cpu} onChange={e => setNewItem({ ...newItem, specs: { ...newItem.specs, cpu: e.target.value } })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none dark:text-white" placeholder="i5-1135G7" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">RAM</label>
                                        <input type="text" value={newItem.specs.ram} onChange={e => setNewItem({ ...newItem, specs: { ...newItem.specs, ram: e.target.value } })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none dark:text-white" placeholder="8GB" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Storage</label>
                                        <input type="text" value={newItem.specs.storage} onChange={e => setNewItem({ ...newItem, specs: { ...newItem.specs, storage: e.target.value } })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none dark:text-white" placeholder="512GB SSD" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Screen</label>
                                        <input type="text" value={newItem.specs.screen} onChange={e => setNewItem({ ...newItem, specs: { ...newItem.specs, screen: e.target.value } })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none dark:text-white" placeholder="14 FHD IPS" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Logistics */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">3. Logistics & Stock</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Warehouse Location</label>
                                        <input type="text" value={newItem.warehouseLocation} onChange={e => setNewItem({ ...newItem, warehouseLocation: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none dark:text-white" placeholder="Rak A-01" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Supplier / Vendor</label>
                                            <input
                                                type="text"
                                                value={newItem.vendor}
                                                onChange={e => setNewItem({ ...newItem, vendor: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none dark:text-white"
                                                placeholder="e.g. PT. Sumber Laptop"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Batch / PO Number</label>
                                            <input
                                                type="text"
                                                value={newItem.batch}
                                                onChange={e => setNewItem({ ...newItem, batch: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none dark:text-white"
                                                placeholder="e.g. BATCH-2023-001"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cost Price (IDR)</label>
                                            <input
                                                type="number"
                                                value={newItem.cost}
                                                onChange={e => setNewItem({ ...newItem, cost: Number(e.target.value) })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none dark:text-white"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Selling Price (IDR)</label>
                                            <input
                                                type="number"
                                                value={newItem.price}
                                                onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none dark:text-white"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>


                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20"
                                >
                                    Save Unit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Print Asset Tag Modal */}
            {isPrintModalOpen && selectedItemForPrint && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full border border-slate-200 text-center print:shadow-none print:border-none print:w-auto print:max-w-none">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 print:hidden">Print Asset Tag</h3>

                        <div id="print-area" className="border border-slate-300 p-6 rounded-lg inline-block bg-white shadow-sm print:shadow-none print:border-none w-full max-w-[320px]">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Asset Tag</div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-800">
                                    <Package size={12} /> QC PRO
                                </div>
                            </div>

                            <div className="py-2 flex justify-center mb-2">
                                <BarcodeGenerator
                                    value={selectedItemForPrint.serial_number}
                                    width={1.8}
                                    height={60}
                                    fontSize={16}
                                    displayValue={true}
                                />
                            </div>

                            <div className="space-y-1 text-center">
                                <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                                    {selectedItemForPrint.brand}
                                </div>
                                <div className="text-sm text-slate-700 font-medium truncate px-2" title={selectedItemForPrint.model}>
                                    {selectedItemForPrint.model}
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-600 border border-slate-200">
                                        {selectedItemForPrint.specs?.cpu || 'CPU N/A'}
                                    </span>
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-600 border border-slate-200">
                                        {selectedItemForPrint.specs?.ram || 'RAM N/A'}
                                    </span>
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-600 border border-slate-200">
                                        {selectedItemForPrint.specs?.storage || 'SSD N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3 justify-center print:hidden">
                            <button
                                onClick={() => setIsPrintModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 flex items-center gap-2"
                            >
                                <Barcode size={18} /> Print Tag
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
