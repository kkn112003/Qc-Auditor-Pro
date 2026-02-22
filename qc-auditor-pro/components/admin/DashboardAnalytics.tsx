import React, { useMemo, useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Users, AlertTriangle, Activity, CheckCircle2, XCircle, Clock, Server, Zap, Search, Package, MoreHorizontal, AlertCircle, CheckCircle } from 'lucide-react';
import { ProcessedDevice, InventoryItem } from '../../types';

interface DashboardAnalyticsProps {
    devices: ProcessedDevice[];
    inventory: InventoryItem[];
    onSearch?: (term: string) => void;
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ devices, inventory, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch && searchTerm.trim()) {
            onSearch(searchTerm);
        }
    };

    // --- Filter Devices based on Date Range ---
    const filteredDevices = useMemo(() => {
        return devices.filter(d => {
            let matchesDate = true;
            if (startDate) {
                matchesDate = matchesDate && d.timestamp >= new Date(startDate).getTime();
            }
            if (endDate) {
                matchesDate = matchesDate && d.timestamp <= new Date(endDate).getTime() + 86400000 - 1;
            }
            return matchesDate;
        });
    }, [devices, startDate, endDate]);

    // --- 1. Scorecards Data ---
    const totalScanned = filteredDevices.length;
    const passed = filteredDevices.filter(d => d.status === 'PASS').length;
    const failed = filteredDevices.filter(d => d.status === 'FAIL').length;
    const pending = filteredDevices.filter(d => d.status === 'PENDING').length;

    const passRate = totalScanned > 0 ? Math.round((passed / totalScanned) * 100) : 0;
    const failRate = totalScanned > 0 ? Math.round((failed / totalScanned) * 100) : 0;

    // --- 2. Charts Data ---
    // Daily Activity (Last 7 Days OR Selected Range)
    const dailyActivity = useMemo(() => {
        // If date range is selected, show activity within that range. 
        // Otherwise default to last 7 days.
        let daysToShow = 7;
        let start = new Date();

        if (startDate && endDate) {
            const startD = new Date(startDate);
            const endD = new Date(endDate);
            const diffTime = Math.abs(endD.getTime() - startD.getTime());
            daysToShow = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            start = endD;
        }

        const stats: { date: string, count: number }[] = [];
        for (let i = 0; i < daysToShow; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-CA');
            // Count from filteredDevices or devices? 
            // If we filtering by date in filteredDevices, we should use that to be consistent.
            // But dailyActivity logic usually builds the x-axis buckets first.
            // Let's count matching devices for each day.
            const count = filteredDevices.filter(dev => new Date(dev.timestamp).toLocaleDateString('en-CA') === dateStr).length;
            stats.push({ date: dateStr, count });
        }
        return stats.reverse();
    }, [filteredDevices, startDate, endDate]);

    // --- Custom SVG Line Chart Helper ---
    const renderLineChart = (data: { date: string, count: number }[]) => {
        const height = 60;
        const width = 200;
        const max = Math.max(...data.map(d => d.count), 1);
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - (d.count / max) * height;
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full h-full overflow-visible">
                <polyline
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                />
                <circle cx={(width)} cy={height - (data[data.length - 1].count / max) * height} r="3" fill="#6366f1" />
            </svg>
        );
    };

    // --- 3. Top Issues ---
    const topIssues = useMemo(() => {
        const issues: Record<string, number> = {};
        // Use filteredDevices to respect date range
        filteredDevices.filter(d => d.status === 'FAIL').forEach(d => {
            if (d.failureReasons && d.failureReasons.length > 0) {
                d.failureReasons.forEach(reason => {
                    issues[reason] = (issues[reason] || 0) + 1;
                });
            } else {
                // Fallback if no specific reason but failed
                issues['Unknown Error'] = (issues['Unknown Error'] || 0) + 1;
            }
        });

        const sorted = Object.entries(issues)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count, percentage: Math.round((count / (failed || 1)) * 100) || 0 }));

        return sorted;
    }, [filteredDevices, failed]);

    // --- 4. Recent Activity ---
    // Use filteredDevices
    const recentActivity = [...filteredDevices].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

    // --- 5. Leaderboard ---
    const technicianStats = useMemo(() => {
        const stats: Record<string, { total: number, passed: number }> = {};
        filteredDevices.forEach(d => {
            const tech = d.technician || 'Unknown';
            if (!stats[tech]) stats[tech] = { total: 0, passed: 0 };
            stats[tech].total += 1;
            if (d.status === 'PASS') stats[tech].passed += 1;
        });
        return Object.entries(stats)
            .sort(([, a], [, b]) => b.total - a.total)
            .map(([name, data]) => ({
                name,
                count: data.total,
                passRate: data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0
            }));
    }, [filteredDevices]);

    // ... (Rest of component Mock AI Status etc)

    const [aiStatus, setAiStatus] = useState<'online' | 'offline'>('online');
    useEffect(() => {
        const interval = setInterval(() => {
            setAiStatus(Math.random() > 0.05 ? 'online' : 'offline');
        }, 30000);
        return () => clearInterval(interval);
    }, []);


    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="text-indigo-500" />
                        Control Center
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time performance monitoring and analytics.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-end">
                    {/* Date Filter */}
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <input
                            type="date"
                            className="bg-transparent text-sm border-none focus:ring-0 text-slate-600 dark:text-slate-300"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="text-slate-400">-</span>
                        <input
                            type="date"
                            className="bg-transparent text-sm border-none focus:ring-0 text-slate-600 dark:text-slate-300"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    {onSearch && (
                        <form onSubmit={handleSearch} className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                            />
                        </form>
                    )}
                </div>
            </header>

            {/* 1. Scorecards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Scanned</div>
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <BarChart3 size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{totalScanned}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">All time units</div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Passed Rate</div>
                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{passRate}%</div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${passRate}%` }}></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Failed Rate</div>
                        <div className="p-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600 dark:text-rose-400">
                            <XCircle size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mb-1">{failRate}%</div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${failRate}%` }}></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Pending / On-Process</div>
                        <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">{pending}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">Units waiting</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Charts: Daily QC Activity */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-500" />
                        Daily QC Activity (Last 7 Days)
                    </h3>
                    <div className="h-48 flex items-end gap-2">
                        <div className="flex-1 h-full relative">
                            {renderLineChart(dailyActivity)}
                            {/* X-Axis Labels */}
                            <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between text-[10px] text-slate-400">
                                {dailyActivity.map((d, i) => (
                                    <span key={i}>{new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Status Distribution (Donut Chart) */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <PieChart size={18} className="text-emerald-500" />
                        Status Distribution
                    </h3>
                    <div className="flex flex-col items-center justify-center p-4">
                        <div className="relative w-32 h-32 rounded-full" style={{
                            background: `conic-gradient(
                                #10b981 0% ${passRate}%, 
                                #f43f5e ${passRate}% ${passRate + failRate}%, 
                                #f59e0b ${passRate + failRate}% 100%
                            )`
                        }}>
                            <div className="absolute inset-4 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center flex-col">
                                <span className="text-2xl font-bold text-slate-800 dark:text-white">{totalScanned}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Total</span>
                            </div>
                        </div>
                        <div className="mt-6 w-full space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Passed
                                </span>
                                <span className="font-mono">{passRate}%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Failed
                                </span>
                                <span className="font-mono">{failRate}%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending
                                </span>
                                <span className="font-mono">{100 - passRate - failRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 4. Recent Activities */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Zap size={18} className="text-amber-500" />
                            Recent QC Activity
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {recentActivity.map((device) => (
                            <div key={device.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="min-w-0">
                                    <div className="font-medium text-slate-800 dark:text-white truncate">{device.identity.model}</div>
                                    <div className="text-xs text-slate-500 font-mono">{device.identity.serial_number}</div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${device.status === 'PASS' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                        device.status === 'FAIL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}>
                                        {device.status}
                                    </span>
                                    <div className="text-[10px] text-slate-400 mt-1">{device.technician || 'Unknown'}</div>
                                </div>
                            </div>
                        ))}
                        {recentActivity.length === 0 && (
                            <div className="p-6 text-center text-slate-500 text-sm">No recent activity.</div>
                        )}
                    </div>
                </div>

                {/* 5. Top Issues */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-rose-500" />
                        Frequent Defects
                    </h3>
                    <div className="space-y-4">
                        {topIssues.length > 0 ? topIssues.map((issue, idx) => (
                            <div key={idx} className="group">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-rose-500 transition-colors">{issue.name}</span>
                                    <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">{issue.count}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${issue.percentage}%` }}></div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-slate-400 text-sm">No defects recorded yet.</div>
                        )}
                    </div>
                </div>

            </div>

            {/* 6. Technician Leaderboard */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users size={18} className="text-blue-500" />
                        Technician Performance
                    </h3>
                </div>
                <div className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Technician</th>
                                <th className="px-6 py-3 font-semibold text-right">Units Scanned</th>
                                <th className="px-6 py-3 font-semibold text-right">Pass Rate</th>
                                <th className="px-6 py-3 font-semibold text-right">Contribution</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {technicianStats.map((tech, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-3 font-medium text-slate-700 dark:text-slate-200">{tech.name}</td>
                                    <td className="px-6 py-3 text-right font-mono">{tech.count}</td>
                                    <td className="px-6 py-3 text-right font-mono">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${tech.passRate >= 90 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            tech.passRate >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                            }`}>
                                            {tech.passRate}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="w-24 ml-auto bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(tech.count / totalScanned) * 100}%` }}></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {technicianStats.length === 0 && (
                                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No data available.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardAnalytics;
