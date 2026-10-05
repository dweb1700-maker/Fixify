import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Employee } from '../types';
import { 
  Users, 
  Plus, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  Wrench, 
  Edit3, 
  Trash2, 
  X,
  ExternalLink
} from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const { 
    employees, 
    jobcards, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee, 
    setStatusFilterFromDashboard, 
    setActiveTab 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState<Employee['role']>('Senior Laptop Tech');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'Active' | 'On Leave'>('Active');
  const [commissionRate, setCommissionRate] = useState('10');
  const [monthlySalary, setMonthlySalary] = useState('35000');

  // Calculate technician performance stats
  const techStats = useMemo(() => {
    const stats: Record<string, { activeJobs: number; completedJobs: number; totalRevenue: number }> = {};

    employees.forEach(emp => {
      stats[emp.id] = { activeJobs: 0, completedJobs: 0, totalRevenue: 0 };
    });

    jobcards.forEach(card => {
      const techId = card.assignedTechnicianId;
      if (stats[techId]) {
        if (card.status === 'Delivered') {
          stats[techId].completedJobs++;
          stats[techId].totalRevenue += (card.finalAmount || 0);
        } else if (card.status !== 'Not Repaired') {
          stats[techId].activeJobs++;
        }
      }
    });

    return stats;
  }, [employees, jobcards]);

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setName('');
    setRole('Mobile Hardware Tech');
    setPhone('+91 ');
    setEmail('');
    setStatus('Active');
    setCommissionRate('10');
    setMonthlySalary('35000');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setName(emp.name);
    setRole(emp.role);
    setPhone(emp.phone);
    setEmail(emp.email);
    setStatus(emp.status);
    setCommissionRate(emp.commissionRate.toString());
    setMonthlySalary((emp.monthlySalary || 30000).toString());
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingEmp) {
      updateEmployee(editingEmp.id, {
        name: name.trim(),
        role,
        phone: phone.trim(),
        email: email.trim(),
        status,
        commissionRate: Number(commissionRate) || 0,
        monthlySalary: Number(monthlySalary) || 0
      });
    } else {
      addEmployee({
        name: name.trim(),
        role,
        phone: phone.trim(),
        email: email.trim(),
        status,
        commissionRate: Number(commissionRate) || 0,
        monthlySalary: Number(monthlySalary) || 0,
        joinedDate: new Date().toISOString().split('T')[0]
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <span>👤</span>
            <span>Employees & Technicians</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage repair technicians, service advisors, assignments and commission rates
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Employee</span>
        </button>
      </div>

      {/* Technicians Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {employees.map(emp => {
          const stats = techStats[emp.id] || { activeJobs: 0, completedJobs: 0, totalRevenue: 0 };
          const isChairman = emp.role === 'Chairman';

          return (
            <div
              key={emp.id}
              className="bg-[#0f1728] border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-4 shadow-lg relative group transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">{emp.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      emp.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {emp.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-orange-400 mt-1">
                    {emp.role}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    title="Edit Employee"
                    className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {!isChairman && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove employee ${emp.name}?`)) {
                          deleteEmployee(emp.id);
                        }
                      }}
                      title="Delete Employee"
                      className="p-1.5 rounded hover:bg-red-950 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-1.5 text-xs text-slate-400 border-t border-b border-slate-800/80 py-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{emp.phone}</span>
                </div>
                {emp.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{emp.email}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-[11px]">
                  <span>Commission: <strong className="text-slate-200">{emp.commissionRate}%</strong></span>
                  {emp.monthlySalary && (
                    <span>Base Salary: <strong className="text-slate-200">₹{emp.monthlySalary.toLocaleString('en-IN')}/mo</strong></span>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#141e33] p-2 rounded-lg">
                  <div className="text-xs text-slate-400">In Queue</div>
                  <div className="text-lg font-bold font-mono text-orange-400 mt-0.5">
                    {stats.activeJobs}
                  </div>
                </div>

                <div className="bg-[#141e33] p-2 rounded-lg">
                  <div className="text-xs text-slate-400">Delivered</div>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                    {stats.completedJobs}
                  </div>
                </div>

                <div className="bg-[#141e33] p-2 rounded-lg">
                  <div className="text-xs text-slate-400">Revenue</div>
                  <div className="text-xs font-bold font-mono text-blue-400 mt-1">
                    ₹{stats.totalRevenue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    setStatusFilterFromDashboard('All');
                    setActiveTab('total_repairing');
                  }}
                  className="w-full py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-[#141e33] hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5 text-orange-400" />
                  <span>View Technician's Repair Queue</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#111928] border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingEmp ? 'Edit Employee Details' : 'Add New Staff Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Staff Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                >
                  <option value="Chairman">Chairman / Owner</option>
                  <option value="Store Manager">Store Manager</option>
                  <option value="Senior Laptop Tech">Senior Laptop Tech</option>
                  <option value="Mobile Hardware Tech">Mobile Hardware Tech</option>
                  <option value="Service Advisor">Service Advisor / Receptionist</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="tech@fixify.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Monthly Salary (₹)
                  </label>
                  <input
                    type="number"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold"
                >
                  {editingEmp ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
