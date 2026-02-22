import React from 'react';
import { ProcessedDevice } from '../types';
import { AlertCircle, CheckCircle2, Clock, Smartphone, ChevronRight, Cpu, Trash2 } from 'lucide-react';

interface DeviceListProps {
  devices: ProcessedDevice[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedIds?: string[]; // Optional for backward compatibility, but we'll use it
  onToggleSelect?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
}

const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  onSelect,
  onDelete,
  selectedIds = [],
  onToggleSelect,
  onSelectAll
}) => {
  const allIds = devices.map(d => d.id);
  const isAllSelected = devices.length > 0 && selectedIds.length === devices.length;
  const isIndeterminate = selectedIds.length > 0 && !isAllSelected;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAll) {
      onSelectAll(e.target.checked ? allIds : []);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onToggleSelect) {
      onToggleSelect(id);
    }
  };

  if (devices.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-500">
        <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-30 dark:opacity-50" />
        <p>Belum ada data unit. Import file JSON dari USB untuk memulai.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider items-center">
        <div className="col-span-1 flex items-center justify-center">
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
        </div>
        <div className="col-span-4">Unit Info</div>
        <div className="col-span-3">Spesifikasi</div>
        <div className="col-span-2">Baterai</div>
        <div className="col-span-2 text-right">Status QC</div>
      </div>

      {devices.map((device) => {
        const isPending = device.status === 'PENDING';
        const isFail = device.status === 'FAIL';
        const isPass = device.status === 'PASS';
        const isSelected = selectedIds.includes(device.id);

        return (
          <div
            key={device.id}
            onClick={() => onSelect(device.id)}
            className={`
                group relative grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl border transition-all cursor-pointer shadow-sm
                ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-500' : ''}
                ${!isSelected && isPass ? 'bg-emerald-50 dark:bg-emerald-900/5 border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-500/50' : ''}
                ${!isSelected && isFail ? 'bg-rose-50 dark:bg-rose-900/5 border-rose-200 dark:border-rose-500/20 hover:border-rose-400 dark:hover:border-rose-500/50' : ''}
                ${!isSelected && isPending ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-750' : ''}
            `}
          >
            {/* Checkbox */}
            <div className="col-span-1 md:col-span-1 flex items-center justify-center md:justify-center z-10">
              {onToggleSelect && (
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  checked={isSelected}
                  onChange={() => { }} // Handled by onClick container, prevents double trigger
                  onClick={(e) => handleCheckboxClick(e, device.id)}
                />
              )}
            </div>

            {/* Identity */}
            <div className="col-span-1 md:col-span-4 min-w-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isPass ? 'bg-emerald-500' : isFail ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate" title={`${device.identity.brand} ${device.identity.model}`}>
                    {device.identity.brand} {device.identity.model}
                  </div>
                  <div className="font-mono text-xs text-slate-500 dark:text-slate-500 truncate">
                    {device.identity.serial_number} • <span className="text-blue-600 dark:text-blue-400 font-medium">{device.technician || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specs */}
            <div className="hidden md:block col-span-3 min-w-0">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-1">
                <span className="flex items-center gap-1.5 truncate" title={device.specs.cpu.name}>
                  <Cpu size={12} className="flex-shrink-0" />
                  <span className="truncate">{device.specs.cpu.name.split('CPU')[0]}</span>
                </span>
                <span className="text-slate-400 dark:text-slate-500 truncate" title={`${device.specs.ram.total_gb}GB RAM • ${device.specs.storage[0]?.capacity_gb}GB SSD`}>
                  {device.specs.ram.total_gb}GB RAM • {device.specs.storage[0]?.capacity_gb}GB SSD
                </span>
              </div>
            </div>

            {/* Battery */}
            <div className="hidden md:block col-span-2 min-w-0">
              <div className="flex flex-col gap-1">
                <div className="w-full max-w-[100px] bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${device.battery.wear_level_percent > 40 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${100 - device.battery.wear_level_percent}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-500 whitespace-nowrap">{device.battery.wear_level_percent}% Wear</span>
              </div>
            </div>

            {/* Status Badge & Actions */}
            <div className="col-span-1 md:col-span-2 flex justify-between md:justify-end items-center gap-3">
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 whitespace-nowrap ${isPass ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                isFail ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' :
                  'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                }`}>
                {isPass && <CheckCircle2 className="w-3.5 h-3.5" />}
                {isFail && <AlertCircle className="w-3.5 h-3.5" />}
                {isPending && <Clock className="w-3.5 h-3.5" />}
                {device.status}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(device.id);
                }}
                title="Hapus Unit"
                className="p-2 text-slate-400 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-white transition-colors flex-shrink-0" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DeviceList;