import React, { useState, useEffect } from 'react';
import { Save, Key, Monitor, ShieldCheck, Database } from 'lucide-react';

const Settings: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load existing key if valid
        const currentKey = localStorage.getItem('gemini_api_key') || '';
        setApiKey(currentKey);
    }, []);

    const handleSave = () => {
        localStorage.setItem('gemini_api_key', apiKey);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Settings</h2>
                <p className="text-slate-500 dark:text-slate-400">Configure application preferences and integrations.</p>
            </header>

            <div className="grid gap-6">
                {/* AI Configuration */}
                <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Key size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">AI Integration (Gemini)</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                Enter your Google Gemini API Key to enable advanced AI analysis features.
                            </p>

                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter API Key (starts with AIza...)"
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    <Save size={18} />
                                    {saved ? 'Saved!' : 'Save'}
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                Your key is stored locally in your browser and never sent to our servers.
                            </p>
                        </div>
                    </div>
                </section>

                {/* General Preferences Placeholder */}
                <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm opacity-60">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <Monitor size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Display Options</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Customizable dashboard layouts and density settings coming soon.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm opacity-60">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <Database size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Data Management</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Backup and restore local database options.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;
