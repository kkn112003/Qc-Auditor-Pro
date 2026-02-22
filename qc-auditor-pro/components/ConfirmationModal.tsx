
import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    isDanger?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isDanger = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in transition-opacity duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 transform transition-all scale-100 animate-scale-in">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full flex-shrink-0 ${isDanger ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                            {isDanger ? <AlertTriangle size={24} /> : <Info size={24} />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {title}
                        </h3>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed ml-1">
                        {message}
                    </p>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onCancel}
                            className="px-5 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-5 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all ${isDanger
                                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                }`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
