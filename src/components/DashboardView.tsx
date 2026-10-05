import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { QuickDateRange, RepairStatus } from '../types';
import { 
  RotateCcw, 
  Calendar as CalendarIcon, 
  Plus, 
  ArrowUpRight, 
  AlertTriangle, 
  Search, 
  ExternalLink, 
  Printer, 
  ChevronRight,
  Boxes
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    jobcards, 
    spareParts, 
    setActiveTab, 
    setStatusFilterFromDashboard, 
    setSelectedJobcardForReceipt,
    clearAllToZero,
    resetToMockData
  } = useApp();

  // Ledger collapse toggle state (defaults to open as in screenshot)
  const [isLedgerExpanded, setIsLedgerExpanded] = useState<boolean>(true);

  // Date filters
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [quickMatrix, setQuickMatrix] = useState<QuickDateRange>('Custom / Lifetime History');
  const [dashboardSearch, setDashboardSearch] = useState<string>('');

  // Status metrics counts
  const statusCounts = useMemo(() => {
    const counts: Record<RepairStatus, number> = {
      'Pending': 0,
      'Repairing': 0,
      'Testing': 0,
      'Ready': 0,
      'Not Repaired': 0,
      'Delivered': 0
    };

    jobcards.forEach(card => {
      if (counts[card.status] !== undefined) {
        counts[card.status]++;
      }
    });

    return counts;
  }, [jobcards]);

  // Handle Quick Month Matrix selections
  const handleQuickMatrixChange = (val: QuickDateRange) => {
    setQuickMatrix(val);
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (val === 'Custom / Lifetime History') {
      setFromDate('');
      setToDate('');
    } else if (val === 'Today') {
      const todayStr = formatDate(today);
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (val === 'Yesterday') {
      const yest = new Date(today);
      yest.setDate(today.getDate() - 1);
      const yestStr = formatDate(yest);
      setFromDate(yestStr);
      setToDate(yestStr);
    } else if (val === 'This Week') {
      const firstDay = new Date(today);
      const day = today.getDay() || 7;
      firstDay.setDate(today.getDate() - day + 1);
      setFromDate(formatDate(firstDay));
      setToDate(formatDate(today));
    } else if (val === 'This Month') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(formatDate(firstDayOfMonth));
      setToDate(formatDate(today));
    } else if (val === 'Previous Month') {
      const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      setFromDate(formatDate(firstDayPrevMonth));
      setToDate(formatDate(lastDayPrevMonth));
    } else if (val === 'Last 30 Days') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      setFromDate(formatDate(thirtyDaysAgo));
      setToDate(formatDate(today));
    } else if (val === 'This Financial Year') {
      // Indian Financial Year: Apr 1 to Mar 31
      const currentYear = today.getFullYear();
      const startYear = today.getMonth() >= 3 ? currentYear : currentYear - 1;
      const startFY = new Date(startYear, 3, 1);
      setFromDate(formatDate(startFY));
      setToDate(formatDate(today));
    }
  };

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setQuickMatrix('Custom / Lifetime History');
  };

  // Filtered jobcards for financial ledger
  const ledgerJobcards = useMemo(() => {
    return jobcards.filter(card => {
      const cardDate = card.createdAt.split('T')[0];
      if (fromDate && cardDate < fromDate) return false;
      if (toDate && cardDate > toDate) return false;
      return true;
    });
  }, [jobcards, fromDate, toDate]);

  // Financial calculations
  const financials = useMemo(() => {
    let grossRevenue = 0;
    let sparePartsCost = 0;

    ledgerJobcards.forEach(card => {
      // If delivered, use finalAmount. If pending/repairing/ready, count paid advance or estimated cost
      if (card.status === 'Delivered') {
        grossRevenue += (card.finalAmount || 0);
      } else {
        grossRevenue += (card.advancePaid || 0);
      }

      // Spare parts cost
      if (card.partsUsed && card.partsUsed.length > 0) {
        card.partsUsed.forEach(part => {
          sparePartsCost += (part.costPrice * part.quantity);
        });
      }
    });

    const netProfit = grossRevenue - sparePartsCost;

    return {
      grossRevenue,
      sparePartsCost,
      netProfit
    };
  }, [ledgerJobcards]);

  const handleStatusCardClick = (status: RepairStatus) => {
    setStatusFilterFromDashboard(status);
    setActiveTab('total_repairing');
  };

  // Low stock parts alert
  const lowStockParts = useMemo(() => {
    return spareParts.filter(p => p.quantity <= p.minStockAlert);
  }, [spareParts]);

  // Recent jobcards for table
  const recentJobcards = useMemo(() => {
    let list = [...jobcards];
    if (dashboardSearch.trim()) {
      const q = dashboardSearch.toLowerCase();
      list = list.filter(c => 
        c.id.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.customerPhone.includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 5);
  }, [jobcards, dashboardSearch]);

  const formatCurrency = (num: number) => {
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      
      {/* Quick Demo Controller for user convenience */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-[#0e1627] border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>FIXIFY System Online · Live Database</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetToMockData}
            className="hover:text-orange-400 text-slate-300 transition-colors underline underline-offset-2"
          >
            Load Realistic Demo Data
          </button>
          <span>·</span>
          <button
            onClick={clearAllToZero}
            className="hover:text-red-400 text-slate-400 transition-colors"
          >
            Reset All Counters to 0 (Blank State)
          </button>
        </div>
      </div>

      {/* TOP STATUS CARDS ROW - Exact replica of screenshot */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Pending */}
        <div
          onClick={() => handleStatusCardClick('Pending')}
          className="group relative bg-[#0e1726] hover:bg-[#131f33] rounded-lg p-4 cursor-pointer transition-all duration-200 border-l-4 border-l-orange-500 border border-slate-800/80 shadow-md hover:shadow-orange-500/10 hover:border-orange-500/50"
        >
          <div className="text-center">
            <span className="text-sm font-semibold text-slate-300 group-hover:text-orange-400 transition-colors">
              Pending
            </span>
            <div className="mt-2 text-3xl font-extrabold text-orange-500 font-mono tracking-tight">
              {statusCounts['Pending']}
            </div>
          </div>
        </div>

        {/* 2. Repairing */}
        <div
          onClick={() => handleStatusCardClick('Repairing')}
          className="group relative bg-[#0e1726] hover:bg-[#131f33] rounded-lg p-4 cursor-pointer transition-all duration-200 border-l-4 border-l-orange-500 border border-slate-800/80 shadow-md hover:shadow-orange-500/10 hover:border-orange-500/50"
        >
          <div className="text-center">
            <span className="text-sm font-semibold text-slate-300 group-hover:text-orange-400 transition-colors">
              Repairing
            </span>
            <div className="mt-2 text-3xl font-extrabold text-orange-500 font-mono tracking-tight">
              {statusCounts['Repairing']}
            </div>
          </div>
        </div>

        {/* 3. Testing */}
        <div
          onClick={() => handleStatusCardClick('Testing')}
          className="group relative bg-[#0e1726] hover:bg-[#131f33] rounded-lg p-4 cursor-pointer transition-all duration-200 border-l-4 border-l-orange-500 border border-slate-800/80 shadow-md hover:shadow-orange-500/10 hover:border-orange-500/50"
        >
          <div className="text-center">
            <span className="text-sm font-semibold text-slate-300 group-hover:text-orange-400 transition-colors">
              Testing
            </span>
            <div className="mt-2 text-3xl font-extrabold text-orange-500 font-mono tracking-tight">
              {statusCounts['Testing']}
            </div>
          </div>
        </div>

        {/* 4. Ready */}
        <div
          onClick={() => handleStatusCardClick('Ready')}
          className="group relative bg-[#0e1726] hover:bg-[#131f33] rounded-lg p-4 cursor-pointer transition-all duration-200 border-l-4 border-l-orange-500 border border-slate-800/80 shadow-md hover:shadow-orange-500/10 hover:border-orange-500/50"
        >
          <div className="text-center">
            <span className="text-sm font-semibold text-slate-300 group-hover:text-orange-400 transition-colors">
              Ready
            </span>
            <div className="mt-2 text-3xl font-extrabold text-orange-500 font-mono tracking-tight">
              {statusCounts['Ready']}
            </div>
          </div>
        </div>

        {/* 5. Not Repaired */}
        <div
          onClick={() => handleStatusCardClick('Not Repaired')}
          className="group relative bg-[#0e1726] hover:bg-[#131f33] rounded-lg p-4 cursor-pointer transition-all duration-200 border-l-4 border-l-red-500 border border-slate-800/80 shadow-md hover:shadow-red-500/10 hover:border-red-500/50"
        >
          <div className="text-center">
            <span className="text-sm font-semibold text-slate-300 group-hover:text-red-400 transition-colors">
              Not Repaired
            </span>
            <div className="mt-2 text-3xl font-extrabold text-red-500 font-mono tracking-tight">
              {statusCounts['Not Repaired']}
            </div>
          </div>
        </div>

        {/* 6. Delivered */}
        <div
          onClick={() => handleStatusCardClick('Delivered')}
          className="group relative bg-[#0e1726] hover:bg-[#131f33] rounded-lg p-4 cursor-pointer transition-all duration-200 border-l-4 border-l-emerald-500 border border-slate-800/80 shadow-md hover:shadow-emerald-500/10 hover:border-emerald-500/50"
        >
          <div className="text-center">
            <span className="text-sm font-semibold text-slate-300 group-hover:text-emerald-400 transition-colors">
              Delivered
            </span>
            <div className="mt-2 text-3xl font-extrabold text-emerald-500 font-mono tracking-tight">
              {statusCounts['Delivered']}
            </div>
          </div>
        </div>
      </div>

      {/* EXPAND / COLLAPSE FINANCIAL STATUS LEDGER BANNER - Exact replica of screenshot */}
      <button
        onClick={() => setIsLedgerExpanded(!isLedgerExpanded)}
        className="w-full py-2.5 px-4 rounded-md border border-dashed border-orange-500/90 bg-[#121927] hover:bg-[#172134] text-orange-500 font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-colors shadow-sm"
      >
        <span className="flex items-center gap-2">
          <span>🗂️</span>
          <span>TAP TO EXPAND / COLLAPSE FINANCIAL STATUS LEDGER</span>
        </span>
        <span className="text-orange-500 text-sm font-bold">
          {isLedgerExpanded ? '▲' : '▼'}
        </span>
      </button>

      {/* FINANCIAL STATUS LEDGER (COLLAPSIBLE SECTION) */}
      {isLedgerExpanded && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Filter Bar: From Date, To Date, Quick Month Matrix, Reset */}
          <div className="bg-[#0f1728] border border-slate-800/80 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* FROM DATE */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span>🗓️</span>
                <span>FROM DATE (START)</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setQuickMatrix('Custom / Lifetime History');
                  }}
                  className="w-full bg-[#141e33] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* TO DATE */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span>🗓️</span>
                <span>TO DATE (END)</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setQuickMatrix('Custom / Lifetime History');
                  }}
                  className="w-full bg-[#141e33] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* QUICK MONTH MATRIX */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span>🗓️</span>
                <span>QUICK MONTH MATRIX</span>
              </label>
              <select
                value={quickMatrix}
                onChange={(e) => handleQuickMatrixChange(e.target.value as QuickDateRange)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="Custom / Lifetime History">Custom / Lifetime History</option>
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Previous Month">Previous Month</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Financial Year">This Financial Year</option>
              </select>
            </div>

            {/* RESET BUTTON */}
            <div>
              <button
                onClick={handleResetFilters}
                className="w-full bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-blue-900/30"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESET</span>
              </button>
            </div>
          </div>

          {/* Financial Status Ledger Box */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span>📈</span>
              <span>Financial Status Ledger</span>
              <span className="text-xs font-normal text-slate-400">({quickMatrix})</span>
            </div>

            {/* 3 Metric Cards: Gross Revenue, Spare Parts Cost, Net Pure Profit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* GROSS REVENUE (Blue) */}
              <div className="bg-[#0b1629] border border-blue-600/40 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                    GROSS REVENUE
                  </div>
                  <div className="mt-3 text-3xl md:text-4xl font-extrabold text-[#38bdf8] font-mono tracking-tight drop-shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                    {formatCurrency(financials.grossRevenue)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Total billing & collected repair revenue
                  </div>
                </div>
              </div>

              {/* SPARE PARTS COST (Red) */}
              <div className="bg-[#1c0f18] border border-red-600/40 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-400"></div>
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                    SPARE PARTS COST
                  </div>
                  <div className="mt-3 text-3xl md:text-4xl font-extrabold text-[#f87171] font-mono tracking-tight drop-shadow-[0_0_12px_rgba(248,113,113,0.25)]">
                    {formatCurrency(financials.sparePartsCost)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Wholesale cost of parts consumed in repairs
                  </div>
                </div>
              </div>

              {/* NET PURE PROFIT (Green) */}
              <div className="bg-[#091b1a] border border-emerald-600/40 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                    NET PURE PROFIT
                  </div>
                  <div className="mt-3 text-3xl md:text-4xl font-extrabold text-[#34d399] font-mono tracking-tight drop-shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                    {formatCurrency(financials.netProfit)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Net margin after deducting part purchase cost
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ACTIONS & NOTIFICATIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick action shortcuts */}
        <div className="lg:col-span-1 bg-[#0f1728] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>⚡</span>
            <span>Quick Shop Operations</span>
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => setActiveTab('create_jobcard')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-400 transition-colors text-sm font-semibold"
            >
              <span className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-orange-400" />
                <span>Create New Jobcard</span>
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setStatusFilterFromDashboard('All');
                setActiveTab('total_repairing');
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#141e33] hover:bg-[#1a2742] border border-slate-700/60 text-slate-200 transition-colors text-sm font-semibold"
            >
              <span className="flex items-center gap-2.5">
                <ArrowUpRight className="w-4 h-4 text-blue-400" />
                <span>View All Repairs ({jobcards.length})</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('spare_parts')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#141e33] hover:bg-[#1a2742] border border-slate-700/60 text-slate-200 transition-colors text-sm font-semibold"
            >
              <span className="flex items-center gap-2.5">
                <Boxes className="w-4 h-4 text-emerald-400" />
                <span>Manage Spare Parts Stock</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Low Stock Warning Box */}
          {lowStockParts.length > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-600/50 text-amber-300 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Low Stock Notice: {lowStockParts.length} item(s)</span>
              </div>
              <p className="text-amber-200/80 leading-relaxed">
                Parts like <span className="font-semibold text-white">{lowStockParts[0]?.name}</span> are below reorder threshold.
              </p>
              <button 
                onClick={() => setActiveTab('spare_parts')}
                className="mt-1 text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                <span>Restock Inventory Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* RECENT JOBCARDS FEED */}
        <div className="lg:col-span-2 bg-[#0f1728] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>📋</span>
              <span>Recent Repair Jobcards</span>
            </h3>

            {/* Quick search input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Job ID, customer, phone..."
                value={dashboardSearch}
                onChange={(e) => setDashboardSearch(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Job ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Device & Issue</th>
                  <th className="py-2.5 px-3">Tech</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Est. / Total</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentJobcards.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No repair jobcards found. Click "+ Create Jobcard" to add a new repair job.
                    </td>
                  </tr>
                ) : (
                  recentJobcards.map(job => (
                    <tr key={job.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-orange-400">
                        {job.id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{job.customerName}</div>
                        <div className="text-[11px] text-slate-400">{job.customerPhone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-300">{job.brand} {job.model}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]" title={job.problemDescription}>
                          {job.problemDescription}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {job.assignedTechnicianName}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          job.status === 'Delivered' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/50' :
                          job.status === 'Ready' ? 'bg-blue-950/60 text-blue-400 border border-blue-700/50' :
                          job.status === 'Not Repaired' ? 'bg-red-950/60 text-red-400 border border-red-700/50' :
                          job.status === 'Testing' ? 'bg-purple-950/60 text-purple-400 border border-purple-700/50' :
                          'bg-orange-950/60 text-orange-400 border border-orange-700/50'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-200">
                        ₹{job.finalAmount || job.estimatedCost}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedJobcardForReceipt(job)}
                          title="Print Jobcard / Receipt"
                          className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                setStatusFilterFromDashboard('All');
                setActiveTab('total_repairing');
              }}
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              <span>Go to Total Repairing Page</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
