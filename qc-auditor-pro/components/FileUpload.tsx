import React, { useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { QCData } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: QCData[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileReaders: Promise<QCData>[] = [];

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      const filePromise = new Promise<QCData>((resolve, reject) => {
        reader.onload = (e) => {
          try {
            const raw = JSON.parse(e.target?.result as string);
            
            if (!raw.identity || !raw.identity.serial_number) {
                console.warn("Invalid JSON structure", file.name);
                reject("Invalid structure: Missing identity");
                return;
            }

            const safeData: QCData = {
                meta: raw.meta || { scan_timestamp: new Date().toISOString(), script_version: "unknown" },
                identity: raw.identity,
                specs: {
                    cpu: raw.specs?.cpu || { name: "Unknown", cores: 0, threads: 0 },
                    ram: raw.specs?.ram || { total_gb: 0, slots_used: 0, type: "Unknown", speed: "Unknown" },
                    storage: Array.isArray(raw.specs?.storage) ? raw.specs.storage : [],
                    gpu: Array.isArray(raw.specs?.gpu) ? raw.specs.gpu : [],
                },
                battery: raw.battery || { 
                    present: false, 
                    design_capacity_mwh: 0, 
                    full_charge_capacity_mwh: 0, 
                    wear_level_percent: 0, 
                    cycle_count: 0 
                },
                connectivity: raw.connectivity || { 
                    wifi_module: "Unknown", 
                    bluetooth_present: false, 
                    webcam_present: false, 
                    audio_device: "Unknown" 
                },
                system_check: {
                    os_info: raw.system_check?.os_info || "Unknown",
                    activation_status: raw.system_check?.activation_status || "Unknown",
                    driver_issues: Array.isArray(raw.system_check?.driver_issues) ? raw.system_check.driver_issues : []
                },
                manual_inspection: raw.manual_inspection || {
                     phys_body_ok: null,
                     phys_engsel_ok: null,
                     phys_lcd_ok: null,
                     phys_keyboard_ok: null,
                     phys_port_ok: null,
                     phys_camera_test_ok: null,
                     phys_sound_test_ok: null
                }
            };

            resolve(safeData);
          } catch (error) {
            console.error("Parse error for file:", file.name, error);
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
      fileReaders.push(filePromise);
    });

    Promise.allSettled(fileReaders).then((results) => {
      const validData = results
        .filter((r): r is PromiseFulfilledResult<QCData> => r.status === 'fulfilled')
        .map((r) => r.value);
      
      if (validData.length > 0) {
        onDataLoaded(validData);
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    });
  };

  return (
    <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group shadow-sm dark:shadow-none"
    >
      <input 
        type="file" 
        multiple 
        accept=".json, .txt" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
      <div className="bg-slate-200 dark:bg-slate-700 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
        <Upload className="w-8 h-8 text-blue-500 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Import Data QC (JSON)</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center max-w-xs">
        Pilih atau drag file <code>QC_SNxxxx.json</code> yang dihasilkan dari USB Tools.
      </p>
    </div>
  );
};

export default FileUpload;