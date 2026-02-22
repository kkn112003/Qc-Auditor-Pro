import React, { useState } from 'react';
import { User, ActivityLog, UserRole } from '../../types';
import { Users, Shield, Clock, Plus, Trash2, Edit, AlertCircle, CheckCircle2, Search } from 'lucide-react';

interface UserManagementProps {
    users: User[];
    logs: ActivityLog[];
    onAddUser: (user: Omit<User, 'id' | 'createdAt' | 'lastActive'>) => void;
    onUpdateUser: (id: string, updates: Partial<User>) => void;
    onDeleteUser: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, logs, onAddUser, onUpdateUser, onDeleteUser }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [newUser, setNewUser] = useState({
        username: '',
        role: 'TECHNICIAN' as UserRole,
        status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddUser(newUser);
        setNewUser({ username: '', role: 'TECHNICIAN', status: 'ACTIVE' });
        setIsAddModalOpen(false);
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get time ago string
    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="text-blue-600" />
                        User Management
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage technicians, access roles, and audit logs.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Plus size={16} /> Add New User
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User List Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center gap-4">
                            <h3 className="font-bold text-slate-800 dark:text-white">All Users</h3>
                            <div className="relative max-w-xs w-full">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-3">User</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Last Active</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${user.role === 'ADMIN'
                                                            ? 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                                                            : 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                                        }`}>
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-slate-900 dark:text-white">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    {user.role === 'ADMIN' ? <Shield size={14} className="text-purple-500" /> : <Users size={14} className="text-blue-500" />}
                                                    <span className="capitalize text-slate-700 dark:text-slate-300">{user.role.toLowerCase()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${user.status === 'ACTIVE'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                                        : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                    }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                                                {user.lastActive > 0 ? timeAgo(user.lastActive) : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {user.username !== 'admin' && ( // Prevent deleting main admin
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => onUpdateUser(user.id, { status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                            title={user.status === 'ACTIVE' ? "Deactivate User" : "Activate User"}
                                                        >
                                                            {user.status === 'ACTIVE' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => onDeleteUser(user.id)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Activity Logs Section */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-[500px] flex flex-col">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Clock size={16} className="text-slate-500" />
                                Audit Logs
                            </h3>
                            <span className="text-xs text-slate-500">{logs.length} events</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {logs.length === 0 ? (
                                <div className="text-center text-slate-400 text-sm py-8">No activity recorded yet</div>
                            ) : (
                                logs.map(log => (
                                    <div key={log.id} className="flex gap-3 text-sm">
                                        <div className="mt-1">
                                            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-white dark:ring-slate-800"></div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-white">
                                                <span className="text-blue-600 dark:text-blue-400">{log.user}</span> {log.action.toLowerCase().replace('_', ' ')}
                                            </div>
                                            <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                                                Target: <span className="font-mono text-slate-600 dark:text-slate-300">{log.target}</span> • {timeAgo(log.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add New User</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                                <input
                                    required
                                    type="text"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none dark:text-white"
                                    placeholder="e.g. tech_dina"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none dark:text-white"
                                >
                                    <option value="TECHNICIAN">Technician</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
