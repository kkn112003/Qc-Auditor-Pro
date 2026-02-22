import React from 'react';
import { LayoutDashboard, Database, Wrench, FileText, Download, LogOut, Sun, Moon, X, Archive, Users, Activity } from 'lucide-react';

interface AdminSidebarProps {
    currentView: string;
    setCurrentView: (view: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    handleLogout: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    currentUser: string;
    formattedDate: string;
    formattedTime: string;
    stats: {
        total: number;
        pass: number;
        fail: number;
        pending: number;
    };
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    currentView,
    setCurrentView,
    isSidebarOpen,
    setIsSidebarOpen,
    handleLogout,
    theme,
    toggleTheme,
    currentUser,
    formattedDate,
    formattedTime,
    stats
}) => {
    const menuItems = [
        { id: 'ADMIN_DASHBOARD', label: 'Dashboard Analytics', icon: LayoutDashboard },
        { id: 'ADMIN_HISTORY', label: 'History & Logs', icon: FileText },
        { id: 'ADMIN_INVENTORY', label: 'Inventory / Master', icon: Database },
        { id: 'ADMIN_REPAIR', label: 'Repair Ticketing', icon: Wrench },
        { id: 'ADMIN_USERS', label: 'User Management', icon: Users },
        { id: 'ADMIN_TOOLS', label: 'Tools & Drivers', icon: Download },
    ];

    return (
        <aside className={`
            fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 
            transform transition-transform duration-300 ease-in-out flex flex-col h-full overflow-y-auto
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <Database className="text-blue-600 dark:text-blue-500" />
                        QC Auditor <span className="text-blue-600 dark:text-blue-500">Pro</span>
                    </h1>
                    <div className="text-xs text-slate-500 dark:text-slate-400 ml-8 -mt-1">Admin Edition</div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <X size={20} />
                </button>
            </div>

            <div className="p-4 space-y-2 flex-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => { setCurrentView(item.id); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${currentView === item.id
                            ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600/20'
                            : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        <item.icon size={18} />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
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
                <div className="space-y-3 mb-6">
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

                <div className="text-center text-[10px] text-slate-400 dark:text-slate-600 font-medium tracking-wide">
                    Logged in as: <span className="text-slate-600 dark:text-slate-400 font-bold">{currentUser}</span>
                    <br />
                    Created by Kukun Kurniawan
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
