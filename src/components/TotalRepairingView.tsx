import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Jobcard, RepairStatus } from '../types';
import { 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  Wrench, 
  Trash2, 
  Clock, 
  Layers, 
  Kanban, 
  Share2, 
  Plus, 
  ChevronRight,
  User,
  Smartphone,
  Laptop
} from 'lucide-react';
import { AddPartToJobModal } from './AddPartToJobModal';

export const TotalRepairingView: React.FC = () => {
  const { 
    jobcards, 
    updateJobcardStatus, 
    deleteJobcard, 
    statusFilterFromDashboard, 
    setStatusFilterFromDashboard,
    setSelectedJobcardForReceipt,
    setSelectedJobcardForDelivery,
    employees,
    setActiveTab,
    shopSettings
  } = useApp();

  const [activeStatus, setActiveStatus] = useState<RepairStatus | 'All'>(statusFilterFromDashboard || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [techFilter, setTechFilter] = useState<string>('All');
  const [deviceFilter, setDeviceFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [partModalJob, setPartModalJob] = useState<Jobcard | null>(null);

  // Status list
  const statuses: (RepairStatus | 'All')[] = [
    'All',
    'Pending',
    'Repairing',
    'Testing',
    'Ready',
    'Not Repaired',
    'Delivered'
  ];

  // Filtered jobcards
  const filteredJobcards = useMemo(() => {
    return jobcards.filter(card => {
      // Status filter
      if (activeStatus !== 'All' && card.status !== activeStatus) return false;

      // Tech filter
      if (techFilter !== 'All' && card.assignedTechnicianId !== techFilter) return false;

      // Device filter
      if (deviceFilter !== 'All' && card.deviceType !== deviceFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          card.id.toLowerCase().includes(q) ||
          card.customerName.toLowerCase().includes(q) ||
          card.customerPhone.includes(q) ||
          card.brand.toLowerCase().includes(q) ||
          card.model.toLowerCase().includes(q) ||
          card.problemDescription.toLowerCase().includes(q) ||
          card.imeiSerial.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [jobcards, activeStatus, techFilter, deviceFilter, searchQuery]);

  // Status counts
  const counts = useMemo(() => {
    const map: Record<string, number> = { All: jobcards.length };
    jobcards.forEach(j => {
      map[j.status] = (map[j.status] || 0) + 1;
    });
    return map;
  }, [jobcards]);

  const handleShareWhatsApp = (job: Jobcard) => {
    const balanceDue = (job.finalAmount || job.estimatedCost) - job.advancePaid;
    const text = encodeURIComponent(
      `Hello ${job.customerName},\nUpdate regarding your repair #${job.id} (${job.brand} ${job.model}):\nCurrent Status: ${job.status}\nEstimated / Final: ₹${job.finalAmount || job.estimatedCost}\nBalance Due: ₹${balanceDue}\n${shopSettings.shopName}`
    );
    const cleanPhone = job.customerPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const getStatusBadge = (status: RepairStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-orange-950/60 text-orange-400 border border-orange-700/60';
      case 'Repairing':
        return 'bg-amber-950/60 text-amber-400 border border-amber-700/60';
      case 'Testing':
        return 'bg-purple-950/60 text-purple-400 border border-purple-700/60';
      case 'Ready':
        return 'bg-blue-950/60 text-blue-400 border border-blue-700/60';
      case 'Not Repaired':
        return 'bg-red-950/60 text-red-400 border border-red-700/60';
      case 'Delivered':
        return 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/60';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      
      {/* Header & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <span>🧮</span>
            <span>Total Repairing Jobs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track workflow statuses, technician assignments, repair costs and delivery
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>List Grid</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('create_jobcard')}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Jobcard</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statuses.map(st => {
          const isActive = activeStatus === st;
          return (
            <button
              key={st}
              onClick={() => {
                setActiveStatus(st);
                setStatusFilterFromDashboard(st);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-[#101726] text-slate-300 border-slate-800 hover:bg-[#162136] hover:text-white'
              }`}
            >
              <span>{st}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isActive ? 'bg-orange-700/80 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {counts[st] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Secondary Filters */}
      <div className="bg-[#0f1728] border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Job ID, Customer Name, Phone, Brand, Model, IMEI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141e33] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Technician Filter */}
        <div>
          <select
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
          >
            <option value="All">All Technicians</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        {/* Device Type Filter */}
        <div>
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
          >
            <option value="All">All Device Types</option>
            <option value="Mobile">Mobiles</option>
            <option value="Laptop">Laptops</option>
            <option value="Tablet">Tablets</option>
            <option value="Desktop">Desktops</option>
            <option value="Smartwatch">Smartwatches</option>
          </select>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-[#0f1728] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#121c30] border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Job ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Device & Problem</th>
                  <th className="py-3 px-4">Assigned Tech</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Billing (Est / Bal)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredJobcards.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No repair jobcards match your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredJobcards.map(job => {
                    const balance = (job.finalAmount || job.estimatedCost) - job.advancePaid;
                    return (
                      <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* ID & Date */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setSelectedJobcardForReceipt(job)}
                            className="font-mono font-bold text-orange-400 hover:text-orange-300 hover:underline block"
                          >
                            {job.id}
                          </button>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(job.createdAt).toLocaleDateString('en-IN')}
                          </div>
                          {job.priority !== 'Normal' && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800">
                              {job.priority}
                            </span>
                          )}
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-100">{job.customerName}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{job.customerPhone}</span>
                            <button
                              onClick={() => handleShareWhatsApp(job)}
                              title="Send WhatsApp update"
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              <Share2 className="w-3 h-3" />
                            </button>
                          </div>
                          {job.customerAddress && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                              {job.customerAddress}
                            </div>
                          )}
                        </td>

                        {/* Device & Issue */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">
                            {job.brand} {job.model}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-[240px]" title={job.problemDescription}>
                            {job.problemDescription}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            IMEI: {job.imeiSerial}
                          </div>
                        </td>

                        {/* Technician */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{job.assignedTechnicianName}</span>
                          </div>
                          {job.partsUsed && job.partsUsed.length > 0 && (
                            <div className="text-[10px] text-orange-400 mt-1">
                              {job.partsUsed.length} part(s) used
                            </div>
                          )}
                        </td>

                        {/* Status (with quick changer) */}
                        <td className="py-3.5 px-4">
                          <select
                            value={job.status}
                            onChange={(e) => updateJobcardStatus(job.id, e.target.value as RepairStatus)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold focus:outline-none transition-colors cursor-pointer ${getStatusBadge(job.status)}`}
                          >
                            <option value="Pending" className="bg-[#111928] text-orange-400">Pending</option>
                            <option value="Repairing" className="bg-[#111928] text-amber-400">Repairing</option>
                            <option value="Testing" className="bg-[#111928] text-purple-400">Testing</option>
                            <option value="Ready" className="bg-[#111928] text-blue-400">Ready</option>
                            <option value="Not Repaired" className="bg-[#111928] text-red-400">Not Repaired</option>
                            <option value="Delivered" className="bg-[#111928] text-emerald-400">Delivered</option>
                          </select>
                        </td>

                        {/* Billing */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-mono font-bold text-slate-200">
                            ₹{job.finalAmount || job.estimatedCost}
                          </div>
                          <div className="text-[10px] text-emerald-400 font-mono">
                            Adv: ₹{job.advancePaid}
                          </div>
                          {balance > 0 ? (
                            <div className="text-[10px] text-red-400 font-mono font-bold">
                              Bal: ₹{balance}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 font-mono">
                              Paid in Full
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Print receipt */}
                            <button
                              onClick={() => setSelectedJobcardForReceipt(job)}
                              title="Print Jobcard / Receipt"
                              className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Add Part Used */}
                            <button
                              onClick={() => setPartModalJob(job)}
                              title="Attach Spare Part Used"
                              className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-orange-400 transition-colors"
                            >
                              <Wrench className="w-4 h-4" />
                            </button>

                            {/* Deliver & Settle */}
                            {job.status !== 'Delivered' && (
                              <button
                                onClick={() => setSelectedJobcardForDelivery(job)}
                                title="Deliver & Settle Bill"
                                className="p-1.5 rounded hover:bg-emerald-950/60 text-emerald-400 hover:text-emerald-300 transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(`Delete jobcard #${job.id}?`)) {
                                  deleteJobcard(job.id);
                                }
                              }}
                              title="Delete Jobcard"
                              className="p-1.5 rounded hover:bg-red-950/60 text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {(['Pending', 'Repairing', 'Testing', 'Ready', 'Delivered'] as RepairStatus[]).map(statusCol => {
            const columnJobs = filteredJobcards.filter(j => j.status === statusCol);
            return (
              <div key={statusCol} className="bg-[#0f1728] border border-slate-800 rounded-xl p-3.5 space-y-3 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200 uppercase">{statusCol}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      {columnJobs.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[650px] pr-1">
                  {columnJobs.length === 0 ? (
                    <div className="py-8 text-center text-slate-600 text-xs italic">
                      Empty column
                    </div>
                  ) : (
                    columnJobs.map(job => (
                      <div
                        key={job.id}
                        className="bg-[#131d31] border border-slate-700/80 hover:border-orange-500/60 rounded-lg p-3 space-y-2 transition-all shadow-md group"
                      >
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setSelectedJobcardForReceipt(job)}
                            className="font-mono font-bold text-orange-400 text-xs hover:underline"
                          >
                            {job.id}
                          </button>
                          <span className="text-[10px] font-mono text-slate-400">
                            ₹{job.finalAmount || job.estimatedCost}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs font-bold text-slate-200">
                            {job.brand} {job.model}
                          </div>
                          <div className="text-[11px] text-slate-400">{job.customerName}</div>
                          <div className="text-[10px] text-slate-400 truncate mt-1">
                            {job.problemDescription}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                          <span>{job.assignedTechnicianName}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedJobcardForReceipt(job)}
                              className="p-1 hover:text-white"
                              title="Print"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setPartModalJob(job)}
                              className="p-1 hover:text-orange-400"
                              title="Add Part"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Quick next stage button */}
                        {statusCol === 'Pending' && (
                          <button
                            onClick={() => updateJobcardStatus(job.id, 'Repairing')}
                            className="w-full mt-1 py-1 rounded bg-orange-600/30 hover:bg-orange-600 text-orange-300 hover:text-white text-[10px] font-semibold transition-colors"
                          >
                            Start Repairing →
                          </button>
                        )}
                        {statusCol === 'Repairing' && (
                          <button
                            onClick={() => updateJobcardStatus(job.id, 'Testing')}
                            className="w-full mt-1 py-1 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white text-[10px] font-semibold transition-colors"
                          >
                            Move to Testing →
                          </button>
                        )}
                        {statusCol === 'Testing' && (
                          <button
                            onClick={() => updateJobcardStatus(job.id, 'Ready')}
                            className="w-full mt-1 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[10px] font-semibold transition-colors"
                          >
                            Mark as Ready →
                          </button>
                        )}
                        {statusCol === 'Ready' && (
                          <button
                            onClick={() => setSelectedJobcardForDelivery(job)}
                            className="w-full mt-1 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[10px] font-semibold transition-colors"
                          >
                            Deliver & Bill →
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Part Modal */}
      {partModalJob && (
        <AddPartToJobModal
          jobcard={partModalJob}
          onClose={() => setPartModalJob(null)}
        />
      )}
    </div>
  );
};
