import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ChevronDown, Check } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUserRole, setCurrentUserRole, employees } = useApp();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const availableRoles = [
    'Chairman',
    'Store Manager',
    'Senior Laptop Tech',
    'Mobile Hardware Tech',
    'Service Advisor'
  ];

  return (
    <header className="h-16 px-6 border-b border-slate-800/80 bg-[#0a0f1d] flex items-center justify-between z-10 shrink-0">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Mobile & Laptop Repair System</span>
        </h1>
      </div>

      {/* Right side role badge & active user */}
      <div className="flex items-center gap-4">
        {/* Role Selector styled as the Chairman badge in the screenshot */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md border border-orange-500/80 bg-orange-950/20 text-orange-400 hover:bg-orange-900/30 transition-all font-medium text-sm tracking-wide shadow-[0_0_12px_rgba(249,115,22,0.15)]"
          >
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span>{currentUserRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-orange-400/80 ml-1" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#111928] border border-slate-700/80 rounded-lg shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-700/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Switch Active Role
              </div>
              {availableRoles.map(role => (
                <button
                  key={role}
                  onClick={() => {
                    setCurrentUserRole(role);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-slate-800/60 transition-colors ${
                    currentUserRole === role ? 'text-orange-400 font-semibold bg-orange-950/20' : 'text-slate-200'
                  }`}
                >
                  <span>{role}</span>
                  {currentUserRole === role && <Check className="w-4 h-4 text-orange-400" />}
                </button>
              ))}
              <div className="mt-1 pt-1 border-t border-slate-700/50 px-3 py-1 text-[11px] text-slate-400">
                Staff count: {employees.length} active members
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
