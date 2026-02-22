import { useState } from 'react';
import { X, Server, Database } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<'ssh' | 'mysql'>('ssh');

    const [sshSettings, setSshSettings] = useState({ host: '', port: '22', username: '', password: '' });
    const [mysqlSettings, setMysqlSettings] = useState({ host: '127.0.0.1', port: '3306', username: 'root', password: '', database: '' });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/50">
                    <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                        Settings
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-800 bg-zinc-900">
                    <button
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'ssh' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-zinc-800/50' : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/30'}`}
                        onClick={() => setActiveTab('ssh')}
                    >
                        <Server size={16} /> SSH Server
                    </button>
                    <button
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'mysql' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-zinc-800/50' : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/30'}`}
                        onClick={() => setActiveTab('mysql')}
                    >
                        <Database size={16} /> MySQL Database
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 overflow-y-auto">
                    {activeTab === 'ssh' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Host / IP</label>
                                <input
                                    type="text"
                                    value={sshSettings.host}
                                    onChange={(e) => setSshSettings({ ...sshSettings, host: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    placeholder="example.com or 192.168.1.1"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Port</label>
                                    <input
                                        type="text"
                                        value={sshSettings.port}
                                        onChange={(e) => setSshSettings({ ...sshSettings, port: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Username</label>
                                    <input
                                        type="text"
                                        value={sshSettings.username}
                                        onChange={(e) => setSshSettings({ ...sshSettings, username: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Password / Key</label>
                                <input
                                    type="password"
                                    value={sshSettings.password}
                                    onChange={(e) => setSshSettings({ ...sshSettings, password: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'mysql' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Host</label>
                                    <input
                                        type="text"
                                        value={mysqlSettings.host}
                                        onChange={(e) => setMysqlSettings({ ...mysqlSettings, host: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Port</label>
                                    <input
                                        type="text"
                                        value={mysqlSettings.port}
                                        onChange={(e) => setMysqlSettings({ ...mysqlSettings, port: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Username</label>
                                    <input
                                        type="text"
                                        value={mysqlSettings.username}
                                        onChange={(e) => setMysqlSettings({ ...mysqlSettings, username: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Password</label>
                                    <input
                                        type="password"
                                        value={mysqlSettings.password}
                                        onChange={(e) => setMysqlSettings({ ...mysqlSettings, password: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Database Name (Optional)</label>
                                <input
                                    type="text"
                                    value={mysqlSettings.database}
                                    onChange={(e) => setMysqlSettings({ ...mysqlSettings, database: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    placeholder="my_database"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-md"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
