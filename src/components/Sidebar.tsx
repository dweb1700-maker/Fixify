import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { 
  LayoutDashboard, 
  Wrench, 
  Layers, 
  Boxes, 
  Users, 
  Settings, 
  LogOut,
  AlertCircle
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: string; LucideIcon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📙', LucideIcon: LayoutDashboard },
    { id: 'create_jobcard', label: 'Create Jobcard', icon: '🛠️', LucideIcon: Wrench },
    { id: 'total_repairing', label: 'Total Repairing', icon: '🧮', LucideIcon: Layers },
    { id: 'spare_parts', label: 'Spare Parts', icon: '📦', LucideIcon: Boxes },
    { id: 'employees', label: 'Employees', icon: '👤', LucideIcon: Users },
    { id: 'admin_settings', label: 'Admin Settings', icon: '⚙️', LucideIcon: Settings },
  ];

  return (
    <>
      <aside className="w-64 bg-[#0a0f1d] flex flex-col justify-between border-r-2 border-orange-500/80 z-20 shrink-0 select-none shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
        {/* Brand Header */}
        <div className="p-6">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold tracking-wider text-orange-500 hover:text-orange-400 transition-colors drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              FIXIFY
            </span>
          </div>
          <div className="text-[11px] font-medium tracking-wide text-slate-400 mt-0.5">
            Tech Repair Management
          </div>

          {/* Nav Items */}
          <nav className="mt-8 space-y-2.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_4px_16px_rgba(249,115,22,0.35)]'
                      : 'bg-[#101726]/60 text-slate-300 hover:bg-[#162033] hover:text-white border border-slate-800/60'
                  }`}
                >
                  <span className="text-base select-none">{item.icon}</span>
                  <span className="tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#141b2b] hover:bg-red-950/40 border border-slate-800 hover:border-red-900/60 text-red-400 hover:text-red-300 transition-all text-sm font-medium"
          >
            <span className="text-base">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#111928] border border-slate-700/80 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <AlertCircle className="w-6 h-6 text-orange-400" />
              <h3 className="text-lg font-bold text-white">Log Out Session</h3>
            </div>
            <p className="text-sm text-slate-300 mb-6">
              Are you sure you want to end your active session as Chairman?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  setActiveTab('dashboard');
                }}
                className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
