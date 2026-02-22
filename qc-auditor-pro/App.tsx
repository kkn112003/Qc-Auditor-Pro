import React, { useState, useMemo, useEffect } from 'react';
import { LayoutDashboard, Database, Settings, Terminal, FileDown, Trash2, Moon, Sun, CheckCircle2, Menu, X, History as HistoryIcon, LogOut, AlertCircle, AlertTriangle } from 'lucide-react';
import FileUpload from './components/FileUpload';
import DeviceList from './components/DeviceList';
import DeviceDetail from './components/DeviceDetail';
import CollectorScript from './components/CollectorScript';
import ConfirmationModal from './components/ConfirmationModal';
import SettingsView from './components/Settings';
import History from './components/History';
import Login from './components/Login';
import UserManagement from './components/admin/UserManagement';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ProcessedDevice, InventoryItem, UserRole, QCData, RepairTicket, User, ActivityLog, ManualInspection } from './types';
import AdminSidebar from './components/admin/AdminSidebar';
import DashboardAnalytics from './components/admin/DashboardAnalytics';
import HistoryLog from './components/admin/HistoryLog';
import Inventory from './components/admin/Inventory';
import RepairTicketing from './components/admin/RepairTicketing';
import ToolsDownload from './components/admin/ToolsDownload';
import SystemHealth from './components/admin/SystemHealth';

type ViewState = 'DASHBOARD' | 'TOOLS' | 'SETTINGS' | 'HISTORY' | 'ADMIN_DASHBOARD' | 'ADMIN_INVENTORY' | 'ADMIN_REPAIR_TICKETS' | 'ADMIN_USERS' | 'ADMIN_LOGS' | 'ADMIN_TOOLS';
type Theme = 'light' | 'dark';

interface ToastState {
    show: boolean;
    message: string;
    type: 'success' | 'error';
}

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<string>('DASHBOARD');
    const [devices, setDevices] = useState<ProcessedDevice[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
    const [historySearchTerm, setHistorySearchTerm] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<string>('');
    const [userRole, setUserRole] = useState<UserRole>('TECHNICIAN');

    // User Management State
    const [users, setUsers] = useState<User[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [repairTickets, setRepairTickets] = useState<RepairTicket[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDanger: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDanger: false,
    });

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    // Logout Confirmation State
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Mobile Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // PDF Export Confirmation State
    const [showPdfConfirm, setShowPdfConfirm] = useState(false);

    // Theme State
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            return (saved === 'light' || saved === 'dark') ? saved : 'dark';
        }
        return 'dark';
    });

    // Apply Theme to HTML
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Current Time State
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formattedTime = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    // Toast auto-hide
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);
    useEffect(() => {
        const savedData = localStorage.getItem('qc_auditor_devices');
        const savedInventory = localStorage.getItem('qc_auditor_inventory');
        const savedTickets = localStorage.getItem('qc_auditor_tickets');

        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (Array.isArray(parsed)) setDevices(parsed);
            } catch (e) {
                console.error("Failed to load saved data", e);
            }
        }

        // Load Users
        const savedUsers = localStorage.getItem('qc_auditor_users');
        if (savedUsers) {
            try {
                const parsed = JSON.parse(savedUsers);
                if (Array.isArray(parsed)) setUsers(parsed);
            } catch (e) { console.error("Failed load users", e); }
        } else {
            // Seed default users if empty
            setUsers([
                { id: 'u1', username: 'admin', role: 'ADMIN', status: 'ACTIVE', lastActive: Date.now(), createdAt: Date.now() },
                { id: 'u2', username: 'teknisi', role: 'TECHNICIAN', status: 'ACTIVE', lastActive: Date.now(), createdAt: Date.now() }
            ]);
        }

        // Load Logs
        const savedLogs = localStorage.getItem('qc_auditor_logs');
        if (savedLogs) {
            try {
                const parsed = JSON.parse(savedLogs);
                if (Array.isArray(parsed)) setActivityLogs(parsed);
            } catch (e) { console.error("Failed load logs", e); }
        }

        if (savedInventory) {
            try {
                const parsed = JSON.parse(savedInventory);
                if (Array.isArray(parsed)) setInventory(parsed);
            } catch (e) { console.error(e); }
        }
        if (savedTickets) {
            try {
                const parsed = JSON.parse(savedTickets);
                if (Array.isArray(parsed)) setRepairTickets(parsed);
            } catch (e) { console.error(e); }
        }

        // Check Auth
        const auth = sessionStorage.getItem('qc_auditor_auth');
        const savedUser = sessionStorage.getItem('qc_auditor_username');
        const savedRole = sessionStorage.getItem('qc_auditor_role');

        if (auth === 'true') {
            setIsLoggedIn(true);
            if (savedUser) setCurrentUser(savedUser);
            if (savedRole) setUserRole(savedRole as UserRole);
        }

        setIsLoaded(true);
    }, []);

    // 2. Continuous Sync to LocalStorage (Only after initial load)
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('qc_auditor_devices', JSON.stringify(devices));
            localStorage.setItem('qc_auditor_inventory', JSON.stringify(inventory));
            localStorage.setItem('qc_auditor_tickets', JSON.stringify(repairTickets));
            localStorage.setItem('qc_auditor_users', JSON.stringify(users));
            localStorage.setItem('qc_auditor_logs', JSON.stringify(activityLogs));
        }
    }, [devices, inventory, repairTickets, users, activityLogs, isLoaded]);

    // 3. Listen for Storage Changes (Cross-Tab Sync)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'qc_auditor_devices' && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    if (Array.isArray(parsed)) setDevices(parsed);
                } catch (err) { console.error("Sync error devices", err); }
            }
            if (e.key === 'qc_auditor_inventory' && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    if (Array.isArray(parsed)) setInventory(parsed);
                } catch (err) { console.error("Sync error inventory", err); }
            }
            if (e.key === 'qc_auditor_tickets' && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    if (Array.isArray(parsed)) setRepairTickets(parsed);
                } catch (err) { console.error("Sync error tickets", err); }
            }
            if (e.key === 'qc_auditor_users' && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    if (Array.isArray(parsed)) setUsers(parsed);
                } catch (err) { console.error("Sync error users", err); }
            }
            if (e.key === 'qc_auditor_logs' && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    if (Array.isArray(parsed)) setActivityLogs(parsed);
                } catch (err) { console.error("Sync error logs", err); }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
    };

    const handleDataLoaded = (rawData: QCData[]) => {
        const timestamp = Date.now();
        const newDevices: ProcessedDevice[] = rawData.map((data, index) => ({
            ...data,
            id: `dev-${timestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            status: 'PENDING',
            failureReasons: [],
            technician: currentUser || 'Unknown',
            timestamp: timestamp
        }));

        setDevices(prev => [...newDevices, ...prev]);

        // Sync to Inventory (Master Data)
        setInventory(prevInventory => {
            const updatedInventory = [...prevInventory];

            newDevices.forEach(device => {
                const existingIndex = updatedInventory.findIndex(i => i.serial_number === device.identity.serial_number);

                const inventoryItem: InventoryItem = {
                    id: existingIndex >= 0 ? updatedInventory[existingIndex].id : `inv-${timestamp}-${Math.random().toString(36).substr(2, 5)}`,
                    serial_number: device.identity.serial_number,
                    model: device.identity.model,
                    brand: device.identity.brand,
                    category: 'Laptop', // Default assignment
                    status: 'PENDING',
                    importDate: timestamp,
                    qcDate: undefined,
                    technician: device.technician,
                    warehouseLocation: 'Processing',
                    vendor: 'Unknown',
                    batch: 'BATCH-' + new Date().toISOString().slice(0, 10),
                    specs: {
                        cpu: device.specs.cpu.name,
                        ram: `${device.specs.ram.total_gb}GB`,
                        storage: device.specs.storage.map(s => `${s.capacity_gb}GB ${s.type}`).join(', '),
                        screen: '', // Not in QC data
                        gpu: device.specs.gpu.join(', ')
                    }
                };

                if (existingIndex >= 0) {
                    updatedInventory[existingIndex] = { ...updatedInventory[existingIndex], ...inventoryItem };
                } else {
                    updatedInventory.push(inventoryItem);
                }
            });

            return updatedInventory;
        });

        showNotification(`${newDevices.length} unit berhasil diimport & disinkronkan ke Inventory`);
        logActivity('IMPORT_DEVICES', `${newDevices.length} devices`);
    };

    const updateDevice = (updated: ProcessedDevice) => {
        setDevices(prev => prev.map(d => d.id === updated.id ? updated : d));

        // Sync to Inventory (Upsert)
        setInventory(prevInventory => {
            const existingIndex = prevInventory.findIndex(i => i.serial_number === updated.identity.serial_number);
            const timestamp = Date.now();

            const inventoryStatus = updated.status === 'PASS' ? 'READY_TO_SELL' : updated.status === 'FAIL' ? 'NEED_REPAIR' : 'PENDING';

            const newItemData: InventoryItem = {
                id: existingIndex >= 0 ? prevInventory[existingIndex].id : `inv-${timestamp}-${Math.random().toString(36).substr(2, 5)}`,
                serial_number: updated.identity.serial_number,
                model: updated.identity.model,
                brand: updated.identity.brand,
                category: existingIndex >= 0 ? prevInventory[existingIndex].category : 'Laptop',
                status: inventoryStatus as any,
                importDate: existingIndex >= 0 ? prevInventory[existingIndex].importDate : timestamp,
                qcDate: timestamp,
                technician: currentUser,
                warehouseLocation: existingIndex >= 0 ? prevInventory[existingIndex].warehouseLocation : 'Receiving',
                vendor: existingIndex >= 0 ? prevInventory[existingIndex].vendor : 'Incoming QC',
                batch: existingIndex >= 0 ? prevInventory[existingIndex].batch : 'BATCH-' + new Date().toISOString().slice(0, 10),
                specs: {
                    cpu: updated.specs.cpu.name,
                    ram: `${updated.specs.ram.total_gb}GB`,
                    storage: updated.specs.storage.map(s => `${s.capacity_gb}GB ${s.type}`).join(', '),
                    screen: existingIndex >= 0 ? prevInventory[existingIndex].specs?.screen : '',
                    gpu: updated.specs.gpu.join(', ')
                }
            };

            if (existingIndex >= 0) {
                const newInventory = [...prevInventory];
                newInventory[existingIndex] = newItemData;
                return newInventory;
            } else {
                return [...prevInventory, newItemData];
            }
        });

        // Handle Repair Ticket Creation
        if (updated.status === 'FAIL') {
            const existingTicket = repairTickets.find(t => t.serialNumber === updated.identity.serial_number && t.status !== 'COMPLETED');
            if (!existingTicket) {
                const newTicket: RepairTicket = {
                    id: `tick-${Date.now()}`,
                    deviceId: updated.id,
                    serialNumber: updated.identity.serial_number,
                    model: `${updated.identity.brand} ${updated.identity.model}`,
                    technician: currentUser,
                    failureReasons: updated.failureReasons,
                    status: 'PENDING',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    notes: updated.manual_inspection.physical_notes
                };
                setRepairTickets(prev => [newTicket, ...prev]);
                showNotification("Repair ticket created automatically", "error");
                logActivity('CREATE_REPAIR_TICKET', `Ticket for ${updated.identity.serial_number}`);
            }
        }

        showNotification(`Perubahan unit ${updated.identity.serial_number} disimpan & disinkronkan`);
        logActivity('UPDATE_DEVICE', updated.identity.serial_number);
    };

    const handleDeviceSave = (updated: ProcessedDevice) => {
        updateDevice(updated);
        setSelectedDeviceId(null);
        setCurrentView(userRole === 'ADMIN' ? 'ADMIN_DASHBOARD' : 'HISTORY');
    };

    const handleDeleteDevice = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Hapus Unit',
            message: 'Apakah Anda yakin ingin menghapus data unit ini? Data yang dihapus tidak dapat dikembalikan.',
            isDanger: true,
            onConfirm: () => {
                const deviceToDelete = devices.find(d => d.id === id);
                setDevices(prev => prev.filter(d => d.id !== id));
                setInventory(prev => prev.filter(i => i.serial_number !== deviceToDelete?.identity.serial_number));
                setSelectedDeviceId(current => current === id ? null : current);
                setSelectedDeviceIds(prev => prev.filter(sid => sid !== id));
                showNotification("Unit berhasil dihapus");
                logActivity('DELETE_DEVICE', deviceToDelete?.identity.serial_number || id);
                closeConfirmModal();
            }
        });
    };

    const handleToggleSelect = (id: string) => {
        setSelectedDeviceIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (ids: string[]) => {
        setSelectedDeviceIds(ids);
    };

    const handleBulkDelete = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Hapus Unit Terpilih',
            message: `Apakah Anda yakin ingin menghapus ${selectedDeviceIds.length} unit yang terpilih? Data yang dihapus tidak dapat dikembalikan.`,
            isDanger: true,
            onConfirm: () => {
                const selectedDevicesToDelete = devices.filter(d => selectedDeviceIds.includes(d.id));
                const selectedSerialsToDelete = selectedDevicesToDelete.map(d => d.identity.serial_number);

                setDevices(prev => prev.filter(d => !selectedDeviceIds.includes(d.id)));
                setInventory(prev => prev.filter(i => !selectedSerialsToDelete.includes(i.serial_number)));

                setSelectedDeviceIds([]);
                showNotification(`${selectedDeviceIds.length} unit berhasil dihapus`);
                logActivity('BULK_DELETE', `${selectedDeviceIds.length} items`);
                closeConfirmModal();
            }
        });
    };

    const handleBulkApprove = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Setujui Unit Terpilih',
            message: `Apakah Anda yakin ingin menyetujui ${selectedDeviceIds.length} unit yang terpilih? Status unit akan diubah menjadi 'PASS'.`,
            isDanger: false,
            onConfirm: () => {
                const timestamp = Date.now();

                // 1. Update Devices Status
                setDevices(prev => prev.map(d =>
                    selectedDeviceIds.includes(d.id) && d.status !== 'PASS'
                        ? { ...d, status: 'PASS', failureReasons: [] }
                        : d
                ));

                // 2. Sync/Upsert Inventory
                setInventory(prevInventory => {
                    let newInventory = [...prevInventory];

                    selectedDeviceIds.forEach(id => {
                        const device = devices.find(d => d.id === id);
                        if (device) {
                            const existingIndex = newInventory.findIndex(i => i.serial_number === device.identity.serial_number);

                            if (existingIndex >= 0) {
                                // Update existing
                                newInventory[existingIndex] = {
                                    ...newInventory[existingIndex],
                                    status: 'READY_TO_SELL',
                                    qcDate: timestamp,
                                    technician: currentUser
                                };
                            } else {
                                // Create new
                                newInventory.push({
                                    id: `inv-${timestamp}-${Math.random().toString(36).substr(2, 5)}`,
                                    serial_number: device.identity.serial_number,
                                    model: device.identity.model,
                                    brand: device.identity.brand,
                                    category: 'Laptop',
                                    status: 'READY_TO_SELL',
                                    importDate: timestamp,
                                    qcDate: timestamp,
                                    technician: currentUser,
                                    warehouseLocation: 'Processing',
                                    vendor: 'Unknown',
                                    batch: 'BATCH-' + new Date().toISOString().slice(0, 10),
                                    specs: {
                                        cpu: device.specs.cpu.name,
                                        ram: `${device.specs.ram.total_gb}GB`,
                                        storage: device.specs.storage.map(s => `${s.capacity_gb}GB ${s.type}`).join(', '),
                                        screen: '',
                                        gpu: device.specs.gpu.join(', ')
                                    }
                                });
                            }
                        }
                    });
                    return newInventory;
                });

                setSelectedDeviceIds([]);
                showNotification(`${selectedDeviceIds.length} unit berhasil disetujui`);
                logActivity('BULK_APPROVE', `${selectedDeviceIds.length} items`);
                closeConfirmModal();
            }
        });
    };

    const handleClearAll = () => {
        if (devices.length === 0) return;

        setConfirmModal({
            isOpen: true,
            title: 'Reset Dashboard',
            message: 'PERINGATAN: Hapus SEMUA data dari dashboard? Tindakan ini tidak bisa dibatalkan.',
            isDanger: true,
            onConfirm: () => {
                // 1. Clear State
                setDevices([]);
                setSelectedDeviceId(null);

                // 2. Clear Storage Explicitly
                localStorage.removeItem('qc_auditor_devices');

                // 3. Trigger Notification
                showNotification("Dashboard berhasil dibersihkan!");
                logActivity('CLEAR_DASHBOARD', 'All devices removed');
                closeConfirmModal();
            }
        });
    };

    const generatePDF = (itemsToExport?: ProcessedDevice[]) => {
        const targetDevices = itemsToExport || devices;
        if (targetDevices.length === 0) return;
        // (Existing PDF generation logic remains unchanged...)
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;

        targetDevices.forEach((device, index) => {
            if (index > 0) doc.addPage();
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, pageWidth, 40, 'F');
            doc.setFontSize(24);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text("QC Auditor Pro", margin, 20);
            doc.setFontSize(10);
            doc.setTextColor(200, 200, 200);
            doc.setFont("helvetica", "italic");
            doc.text("Automated Hardware Validation Report", margin, 28);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);

            let yPos = 50;
            doc.setFontSize(12);
            doc.setTextColor(10, 25, 47);
            doc.setFont("helvetica", "bold");
            doc.text("Device Information", margin, yPos);
            yPos += 4;

            const storageInfo = device.specs.storage && device.specs.storage[0]
                ? `${device.specs.storage[0].capacity_gb}GB`
                : "0GB";

            autoTable(doc, {
                startY: yPos,
                body: [
                    ["Model", `${device.identity.brand} ${device.identity.model}`],
                    ["Serial Number", device.identity.serial_number],
                    ["Processor", device.specs.cpu.name],
                    ["RAM / Storage", `${device.specs.ram.total_gb}GB / ${storageInfo}`],
                    ["OS Info", device.system_check.os_info]
                ],
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 2, textColor: 50 },
                columnStyles: { 0: { fillColor: [245, 245, 245], fontStyle: 'bold', cellWidth: 50 } }
            });

            yPos = (doc as any).lastAutoTable.finalY + 10;
            doc.setTextColor(10, 25, 47);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Battery Condition", margin, yPos);
            yPos += 4;
            const wear = device.battery.wear_level_percent;
            const wearText = wear > 30 ? `WARNING: ${wear}% (>30%)` : `${wear}% (Good)`;
            autoTable(doc, {
                startY: yPos,
                body: [
                    ["Design Capacity", `${device.battery.design_capacity_mwh} mWh`],
                    ["Full Charge Capacity", `${device.battery.full_charge_capacity_mwh} mWh`],
                    ["Wear Status", wearText]
                ],
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 2, textColor: 50 },
                columnStyles: { 0: { fillColor: [245, 245, 245], fontStyle: 'bold', cellWidth: 50 } },
            });

            yPos = (doc as any).lastAutoTable.finalY + 10;
            doc.setTextColor(10, 25, 47);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Physical Inspection Checklist", margin, yPos);
            yPos += 4;
            const checklistMap: Record<keyof ManualInspection, string> = {
                "phys_body_ok": "Body / Casing", "phys_engsel_ok": "Hinge / Engsel",
                "phys_lcd_ok": "LCD Screen", "phys_keyboard_ok": "Keyboard & Trackpad",
                "phys_camera_test_ok": "Webcam", "phys_sound_test_ok": "Speakers",
                "phys_port_ok": "Ports (USB/HDMI)", "phys_cover_screws_ok": "Cover Screws / Baut",
                "physical_notes": "Additional Notes"
            };
            const checklistBody = Object.entries(checklistMap).map(([key, label]) => {
                const val = device.manual_inspection[key as keyof ManualInspection];
                let resText = "PENDING";
                if (val === true) resText = "PASS";
                if (val === false) resText = "FAIL";
                return [label, resText];
            });
            autoTable(doc, {
                startY: yPos,
                head: [['Inspection Point', 'Result']],
                body: checklistBody,
                theme: 'grid',
                headStyles: { fillColor: [100, 100, 100], textColor: 255, fontSize: 9 },
                styles: { fontSize: 9, cellPadding: 2, textColor: 50 },
                columnStyles: { 1: { halign: 'center', fontStyle: 'bold', cellWidth: 30 } },
            });

            yPos = (doc as any).lastAutoTable.finalY + 10;
            if (device.failureReasons.length > 0) {
                doc.setFontSize(11);
                doc.setTextColor(239, 68, 68);
                doc.setFont("helvetica", "bold");
                doc.text("FAILURE ANALYSIS:", margin, yPos);
                yPos += 6;
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                doc.setFont("helvetica", "normal");
                device.failureReasons.forEach(reason => {
                    doc.text(`• ${reason}`, margin + 5, yPos);
                    yPos += 4;
                });
            }

            // Moved Status to Bottom
            yPos += 15;
            let statusColor = [245, 158, 11];
            let statusText = "STATUS: PENDING";
            if (device.status === 'PASS') { statusColor = [16, 185, 129]; statusText = "STATUS: PASSED"; }
            else if (device.status === 'FAIL') { statusColor = [239, 68, 68]; statusText = "STATUS: FAILED"; }

            doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
            doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 12, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(statusText, pageWidth / 2, yPos + 8, { align: 'center' });
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${doc.getCurrentPageInfo().pageNumber} | Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        });

        const dateStr = new Date().toISOString().split('T')[0];
        doc.save(`QC_Report_Full_${dateStr}.pdf`);
        setShowPdfConfirm(false);
        logActivity('EXPORT_PDF', `Generated PDF for ${devices.length} devices`);
    };

    const selectedDevice = useMemo(() =>
        devices.find(d => d.id === selectedDeviceId),
        [devices, selectedDeviceId]);

    const stats = useMemo(() => {
        return {
            total: devices.length,
            pass: devices.filter(d => d.status === 'PASS').length,
            fail: devices.filter(d => d.status === 'FAIL').length,
            pending: devices.filter(d => d.status === 'PENDING').length,
        }
    }, [devices]);

    const logActivity = (action: string, target: string) => {
        const newLog: ActivityLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            user: currentUser || 'system',
            action,
            target,
            timestamp: Date.now()
        };
        setActivityLogs(prev => [newLog, ...prev]);
    };

    const handleLogin = (status: boolean, username: string, role: UserRole) => {
        if (status) {
            setIsLoggedIn(true);
            setCurrentUser(username);
            setUserRole(role);

            // Update User Last Active
            setUsers(prev => prev.map(u => u.username === username ? { ...u, lastActive: Date.now() } : u));
            logActivity('LOGIN', 'System');

            sessionStorage.setItem('qc_auditor_auth', 'true');
            sessionStorage.setItem('qc_auditor_username', username);
            sessionStorage.setItem('qc_auditor_role', role);

            // Set default view based on role
            setCurrentView(role === 'ADMIN' ? 'ADMIN_DASHBOARD' : 'DASHBOARD');

            showNotification(`Welcome back, ${username.charAt(0).toUpperCase() + username.slice(1)}`);
        }
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setIsLoggedIn(false);
        setCurrentUser('');
        setUserRole('TECHNICIAN');
        sessionStorage.removeItem('qc_auditor_auth');
        sessionStorage.removeItem('qc_auditor_username');
        sessionStorage.removeItem('qc_auditor_role');
        showNotification("Logged out successfully");
        setShowLogoutConfirm(false);
    };

    const handleRestoreData = (data: any) => {
        if (data.devices) setDevices(data.devices);
        if (data.inventory) setInventory(data.inventory);
        if (data.users) setUsers(data.users);
        if (data.logs) setActivityLogs(data.logs);
        if (data.tickets) setRepairTickets(data.tickets);

        showNotification("System data restored successfully");
        logActivity('SYSTEM_RESTORE', `Restored from backup v${data.version || '1.0'}`);
    };

    const handleDashboardSearch = (term: string) => {
        setHistorySearchTerm(term);
        setCurrentView('ADMIN_HISTORY');
    };

    if (!isLoggedIn) {
        return (
            <>
                {toast.show && (
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] animate-bounce-in pointer-events-none">
                        <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ring-1 ring-black/10 text-white ${toast.type === 'error'
                            ? 'bg-rose-900 dark:bg-rose-600 border-rose-700 dark:border-rose-400/30'
                            : 'bg-slate-900 dark:bg-blue-600 border-slate-700 dark:border-blue-400/30'
                            }`}>
                            {toast.type === 'error' ? (
                                <AlertCircle size={20} className="text-white" />
                            ) : (
                                <CheckCircle2 size={20} className="text-emerald-400 dark:text-white" />
                            )}
                            <span className="font-medium text-sm tracking-wide">{toast.message}</span>
                        </div>
                    </div>
                )}
                <Login onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} showNotification={showNotification} />
            </>
        );
    }

    return (
        <div className="flex h-screen font-sans text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] animate-bounce-in pointer-events-none">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ring-1 ring-black/10 text-white ${toast.type === 'error'
                        ? 'bg-rose-900 dark:bg-rose-600 border-rose-700 dark:border-rose-400/30'
                        : 'bg-slate-900 dark:bg-blue-600 border-slate-700 dark:border-blue-400/30'
                        }`}>
                        {toast.type === 'error' ? (
                            <AlertCircle size={20} className="text-white" />
                        ) : (
                            <CheckCircle2 size={20} className="text-emerald-400 dark:text-white" />
                        )}
                        <span className="font-medium text-sm tracking-wide">{toast.message}</span>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeConfirmModal}
                isDanger={confirmModal.isDanger}
                confirmLabel="Ya, Hapus"
                cancelLabel="Batal"
            />

            <ConfirmationModal
                isOpen={showPdfConfirm}
                title="Confirm PDF Export"
                message={`Are you sure you want to generate the Expert PDF Report for ${devices.length} devices?`}
                onConfirm={generatePDF}
                onCancel={() => setShowPdfConfirm(false)}
                confirmLabel="Yes, Download PDF"
                cancelLabel="Cancel"
            />

            <ConfirmationModal
                isOpen={showLogoutConfirm}
                title="Confirm Logout"
                message="Are you sure you want to log out?"
                onConfirm={confirmLogout}
                onCancel={() => setShowLogoutConfirm(false)}
                isDanger={false}
                confirmLabel="Log Out"
                cancelLabel="Cancel"
            />

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            {userRole === 'ADMIN' ? (
                <AdminSidebar
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    handleLogout={handleLogout}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    currentUser={currentUser}
                    formattedDate={formattedDate}
                    formattedTime={formattedTime}
                    stats={stats}
                />
            ) : (
                <aside className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 
                transform transition-transform duration-300 ease-in-out flex flex-col h-full overflow-y-auto
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                            <Database className="text-blue-600 dark:text-blue-500" />
                            QC Auditor <span className="text-blue-600 dark:text-blue-500">Pro</span>
                        </h1>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-slate-800 dark:hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-4 space-y-2 flex-1">
                        <button
                            onClick={() => { setCurrentView('DASHBOARD'); setSelectedDeviceId(null); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${currentView === 'DASHBOARD'
                                ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600/20'
                                : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <LayoutDashboard size={18} />
                            <span className="font-medium">QC Dashboard</span>
                        </button>

                        <button
                            onClick={() => { setCurrentView('HISTORY'); setSelectedDeviceId(null); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${currentView === 'HISTORY'
                                ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600/20'
                                : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <HistoryIcon size={18} />
                            <span className="font-medium">History & Logs</span>
                        </button>

                        <button
                            onClick={() => { setCurrentView('TOOLS'); setSelectedDeviceId(null); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${currentView === 'TOOLS'
                                ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600/20'
                                : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <Terminal size={18} />
                            <span className="font-medium">Tools & Scripts</span>
                        </button>

                        <div className="flex items-center gap-3 px-4 py-3 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50">
                            <Settings size={18} />
                            <span className="font-medium">Settings</span>
                        </div>
                    </div>

                    <div className="px-6 py-4 flex flex-col items-center justify-center">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                            {formattedDate}
                            <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{formattedTime}</div>
                        </div>
                    </div>

                    <div className="px-4 pb-2">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 p-2 mb-2 rounded-lg border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut size={16} />
                            <span className="text-sm font-medium">Log Out</span>
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                    </div>

                    <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 z-10">
                        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-4">Session Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Total Scanned</span>
                                <span className="text-slate-900 dark:text-white font-mono">{stats.total}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-600 dark:text-emerald-400">PASSED</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-mono">{stats.pass}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-rose-600 dark:text-rose-400">FAILED</span>
                                <span className="text-rose-600 dark:text-rose-400 font-mono">{stats.fail}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-amber-600 dark:text-amber-400">PENDING</span>
                                <span className="text-amber-600 dark:text-amber-400 font-mono">{stats.pending}</span>
                            </div>
                        </div>
                        <div className="mt-6 text-center text-[10px] text-slate-400 dark:text-slate-600 font-medium tracking-wide">
                            Logged in as: <span className="text-slate-600 dark:text-slate-400 font-bold">{currentUser}</span>
                            <br />
                            Created by Kukun Kurniawan
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        QC Auditor Pro
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-10">

                        {/* Content Area Rendering Logic */}
                        {userRole === 'ADMIN' ? (
                            // ADMIN VIEWS
                            currentView === 'ADMIN_HISTORY' ? (
                                <HistoryLog
                                    devices={devices}
                                    onExportPDF={generatePDF}
                                    selectedIds={selectedDeviceIds}
                                    onToggleSelect={handleToggleSelect}
                                    onSelectAll={handleSelectAll}
                                    searchTerm={historySearchTerm}
                                    onSearchChange={setHistorySearchTerm}
                                />
                            ) : currentView === 'ADMIN_INVENTORY' ? (
                                <Inventory
                                    inventory={inventory}
                                    onAddIventory={(item) => {
                                        const newItem: InventoryItem = {
                                            ...item,
                                            id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                                            status: 'PENDING',
                                            importDate: Date.now()
                                        };
                                        setInventory(prev => [...prev, newItem]);
                                        showNotification("Item added to inventory");
                                    }}
                                    onBulkAddInventory={(items) => {
                                        const timestamp = Date.now();
                                        const newItems: InventoryItem[] = items.map((item, idx) => ({
                                            ...item,
                                            id: `inv-${timestamp}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
                                            status: 'PENDING',
                                            importDate: timestamp
                                        }));
                                        setInventory(prev => [...prev, ...newItems]);
                                        showNotification(`${newItems.length} items imported successfully`);
                                    }}
                                    onClearInventory={() => {
                                        setConfirmModal({
                                            isOpen: true,
                                            title: 'Hapus Semua Data',
                                            message: 'Apakah Anda yakin ingin menghapus SEMUA data (Inventory, Unit QC, dan Tiket Repair)? Tindakan ini tidak dapat dibatalkan.',
                                            isDanger: true,
                                            onConfirm: () => {
                                                setInventory([]);
                                                setDevices([]);
                                                setRepairTickets([]);
                                                showNotification("Semua data berhasil dihapus (Inventory, Unit & Tiket)");
                                                closeConfirmModal();
                                            }
                                        });
                                    }}
                                />
                            ) : currentView === 'ADMIN_REPAIR' ? (

                                <RepairTicketing
                                    tickets={repairTickets}
                                    inventory={inventory}
                                    onUpdateStatus={(id, status) => {
                                        setRepairTickets(prev => prev.map(t => t.id === id ? { ...t, status, updatedAt: Date.now() } : t));

                                        // If ticket is completed, update Inventory and Device status to PASS/READY
                                        if (status === 'COMPLETED') {
                                            const ticket = repairTickets.find(t => t.id === id);
                                            if (ticket) {
                                                const normalizedSerial = ticket.serialNumber.trim().toLowerCase();

                                                // 1. Update Inventory
                                                setInventory(prev => prev.map(item =>
                                                    item.serial_number.trim().toLowerCase() === normalizedSerial
                                                        ? { ...item, status: 'READY_TO_SELL' }
                                                        : item
                                                ));

                                                // 2. Update Device History (if exists)
                                                setDevices(prev => prev.map(d =>
                                                    d.identity.serial_number.trim().toLowerCase() === normalizedSerial
                                                        ? { ...d, status: 'PASS', failureReasons: [] }
                                                        : d
                                                ));

                                                showNotification(`Unit ${ticket.serialNumber} repaired. Status: READY/PASS`, "success");
                                            }
                                        } else {
                                            showNotification("Repair status updated");
                                        }
                                    }}
                                    onCreateTicket={(ticket) => {
                                        setRepairTickets(prev => [ticket, ...prev]);
                                        showNotification("New repair ticket created manually");
                                    }}
                                />
                            ) : currentView === 'ADMIN_TOOLS' ? (
                                <ToolsDownload onShowNotification={showNotification} />
                            ) : currentView === 'ADMIN_USERS' ? (
                                <UserManagement
                                    users={users}
                                    logs={activityLogs}
                                    onAddUser={(user) => {
                                        const newUser: User = { ...user, id: `u-${Date.now()}`, createdAt: Date.now(), lastActive: 0 };
                                        setUsers(prev => [...prev, newUser]);
                                        logActivity('CREATED_USER', newUser.username);
                                        showNotification(`User ${newUser.username} created`);
                                    }}
                                    onUpdateUser={(id, updates) => {
                                        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
                                        logActivity('UPDATED_USER', id);
                                        showNotification("User updated");
                                    }}
                                    onDeleteUser={(id) => {
                                        const user = users.find(u => u.id === id);
                                        if (user) {
                                            if (confirm(`Delete user ${user.username}?`)) {
                                                setUsers(prev => prev.filter(u => u.id !== id));
                                                logActivity('DELETED_USER', user.username);
                                                showNotification("User deleted");
                                            }
                                        }
                                    }}
                                />
                            ) : currentView === 'ADMIN_HEALTH' ? (
                                <SystemHealth
                                    devices={devices}
                                    inventory={inventory}
                                    users={users}
                                    logs={activityLogs}
                                    tickets={repairTickets}
                                    onRestore={handleRestoreData}
                                />
                            ) : (
                                <DashboardAnalytics
                                    devices={devices}
                                    inventory={inventory}
                                    onSearch={handleDashboardSearch}
                                />
                            )
                        ) : (
                            // TECHNICIAN VIEWS (Existing Logic)
                            currentView === 'TOOLS' ? (
                                <CollectorScript onShowNotification={showNotification} />
                            ) : currentView === 'HISTORY' ? (
                                <History
                                    devices={devices}
                                    onSelectDevice={(id) => {
                                        setSelectedDeviceId(id);
                                        setCurrentView('DASHBOARD');
                                    }}
                                    onDelete={handleDeleteDevice}
                                />
                            ) : selectedDevice ? (
                                <DeviceDetail
                                    device={selectedDevice}
                                    onUpdate={updateDevice}
                                    onSave={handleDeviceSave}
                                    onBack={() => setSelectedDeviceId(null)}
                                />
                            ) : (
                                <>
                                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Incoming Batches</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage hardware audits and validate physical condition.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {devices.length > 0 && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={handleClearAll}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/50 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-500/50 rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        <Trash2 size={16} /> Clear All
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPdfConfirm(true)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
                                                    >
                                                        <FileDown size={16} /> Expert PDF Report
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </header>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                                            <div className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold mb-1">Success Rate</div>
                                            <div className="text-2xl font-mono text-slate-900 dark:text-white">
                                                {stats.total > 0 ? Math.round((stats.pass / stats.total) * 100) : 0}%
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                                            <div className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold mb-1">Needs Attention</div>
                                            <div className="text-2xl font-mono text-amber-500 dark:text-amber-400">{stats.pending}</div>
                                        </div>
                                    </div>

                                    <FileUpload onDataLoaded={handleDataLoaded} />

                                    <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-1 shadow-sm dark:shadow-none">
                                        <DeviceList
                                            devices={devices}
                                            onSelect={setSelectedDeviceId}
                                            onDelete={handleDeleteDevice}
                                            selectedIds={selectedDeviceIds}
                                            onToggleSelect={handleToggleSelect}
                                            onSelectAll={handleSelectAll}
                                        />
                                    </div>
                                </>
                            )
                        )}
                    </div>
                </main>

                {/* Bulk Action Bar */}
                {selectedDeviceIds.length > 0 && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-6 z-50">
                        <span className="font-bold text-sm">{selectedDeviceIds.length} selected</span>
                        <div className="h-4 w-px bg-slate-700"></div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleBulkApprove}
                                className="flex items-center gap-2 text-sm font-medium hover:text-emerald-400 transition-colors"
                            >
                                <CheckCircle2 size={16} /> Approve
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 text-sm font-medium hover:text-rose-400 transition-colors ml-2"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                            <button
                                onClick={() => setSelectedDeviceIds([])}
                                className="ml-4 text-xs text-slate-500 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;