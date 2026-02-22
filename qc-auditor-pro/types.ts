export interface ManualInspection {
  phys_body_ok: boolean | null;
  phys_engsel_ok: boolean | null;
  phys_lcd_ok: boolean | null;
  phys_keyboard_ok: boolean | null;
  phys_port_ok: boolean | null;
  phys_camera_test_ok: boolean | null;
  phys_sound_test_ok: boolean | null;
  phys_cover_screws_ok: boolean | null;
  physical_notes?: string;
}

export interface QCData {
  meta: {
    scan_timestamp: string;
    script_version: string;
  };
  identity: {
    brand: string;
    model: string;
    serial_number: string;
    bios_version: string;
  };
  specs: {
    cpu: {
      name: string;
      cores: number;
      threads: number;
    };
    ram: {
      total_gb: number;
      slots_used: number; // Approximate
      type: string;
      speed: string;
    };
    storage: Array<{
      model: string;
      type: string;
      capacity_gb: number;
      smart_status: string;
      health_percent: number; // 0-100
    }>;
    gpu: string[];
  };
  battery: {
    present: boolean;
    design_capacity_mwh: number;
    full_charge_capacity_mwh: number;
    wear_level_percent: number;
    cycle_count: number;
  };
  connectivity: {
    wifi_module: string;
    bluetooth_present: boolean;
    webcam_present: boolean;
    audio_device: string;
    microphone: string;
    biometric: string;
  };
  system_check: {
    os_info: string;
    activation_status: string;
    driver_issues: string[]; // List of device names with errors
  };
  manual_inspection: ManualInspection;
}

// Extended interface for the app state
export interface ProcessedDevice extends QCData {
  id: string; // Internal unique ID
  status: 'PASS' | 'FAIL' | 'PENDING';
  failureReasons: string[];
  aiAnalysis?: string;
  technician: string;
  timestamp: number;
}

export const QC_THRESHOLDS = {
  MIN_STORAGE_HEALTH: 80,
  MAX_BATTERY_CYCLES: 800,
  MAX_BATTERY_WEAR: 40, // Max 40% wear allowed
  MIN_RAM_GB: 8,
};

export type InventoryStatus = 'PENDING' | 'READY_TO_SELL' | 'NEED_REPAIR';



export type UserRole = 'ADMIN' | 'TECHNICIAN';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  lastActive: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: number;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string; // e.g., "DELETED_UNIT", "CREATED_USER"
  target: string; // e.g., "SN12345"
  timestamp: number;
}

export interface RepairTicket {
  id: string;
  deviceId: string;
  serialNumber: string;
  model: string;
  technician: string;
  failureReasons: string[];
  status: 'WAITING_SPAREPART' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  serial_number: string;
  model: string;
  brand: string; // e.g. Asus, Dell
  category: string; // e.g. Laptop Gaming, Ultrabook
  status: InventoryStatus;

  // Logistics
  warehouseLocation: string; // e.g. "Rak A-01"
  importDate: number;
  qcDate?: number;

  // Technical Specs (Standard)
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    screen?: string; // e.g. "14 inch FHD"
    gpu?: string;
  };

  // Stock & Vendor
  vendor: string; // Supplier Name
  batch: string; // Batch Number / Source
  price?: number; // Selling Price
  cost?: number; // Cost Price
  poNumber?: string;

  // QC Standards
  passCriteria?: {
    maxBatteryWear: number; // e.g. 20%
    minRam: number; // e.g. 8GB
    allowMinorScratches: boolean;
  };

  technician?: string;
}