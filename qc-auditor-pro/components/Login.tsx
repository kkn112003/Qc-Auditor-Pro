import React, { useState } from 'react';
import { Lock, User, LogIn, AlertCircle, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
    onLogin: (status: boolean, username: string, role: UserRole) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    showNotification: (message: string, type: 'success' | 'error') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, theme, toggleTheme, showNotification }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay for better UX
        setTimeout(() => {
            if (username === 'teknisi' && password === 'teknisi') {
                onLogin(true, username, 'TECHNICIAN');
            } else if (username === 'admin' && password === 'admin') {
                onLogin(true, username, 'ADMIN');
            } else {
                showNotification('Invalid username or password', 'error');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-1000 relative overflow-hidden">
            {/* Video Background */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="https://cdn.pixabay.com/video/2019/04/20/22908-331653890_large.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                {/* Overlay to ensure text readability */}
                <div className={`absolute inset-0 transition-colors duration-1000 ${theme === 'dark'
                    ? 'bg-slate-900/70'
                    : 'bg-blue-900/20'
                    }`}></div>

                {/* Noise Texture Overlay for texture */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Watermark */}
            <div className="absolute bottom-2 left-0 right-0 text-center z-10 pointer-events-none animate-float">
                <p className="text-white text-sm font-medium tracking-[0.5em] uppercase opacity-80 shadow-black drop-shadow-md">
                    Created by Kukun Kurniawan
                </p>
            </div>

            <div className={`backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border relative z-10 transition-all duration-500 ${theme === 'dark'
                ? 'bg-slate-900/60 border-slate-700/50 shadow-black/50'
                : 'bg-white/70 border-white/50 shadow-blue-200/50'
                }`}>
                <button
                    onClick={toggleTheme}
                    className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Selamat Datang</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Please sign in to continue to QC Auditor Pro</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">


                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white sm:text-sm"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white sm:text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white font-medium transition-all ${isLoading
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30'
                                }`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Protected by QC Security System v1.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
