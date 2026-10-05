import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  ShieldAlert, 
  Trash2,
  FileText
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { 
    shopSettings, 
    updateShopSettings, 
    jobcards, 
    spareParts, 
    employees, 
    resetToMockData, 
    clearAllToZero 
  } = useApp();

  const [shopName, setShopName] = useState(shopSettings.shopName);
  const [tagline, setTagline] = useState(shopSettings.tagline);
  const [phone, setPhone] = useState(shopSettings.phone);
  const [whatsapp, setWhatsapp] = useState(shopSettings.whatsapp);
  const [email, setEmail] = useState(shopSettings.email);
  const [address, setAddress] = useState(shopSettings.address);
  const [gstin, setGstin] = useState(shopSettings.gstin);
  const [currency, setCurrency] = useState(shopSettings.currency);
  const [defaultWarranty, setDefaultWarranty] = useState(shopSettings.defaultWarranty);
  const [termsText, setTermsText] = useState(shopSettings.terms.join('\n'));

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateShopSettings({
      shopName,
      tagline,
      phone,
      whatsapp,
      email,
      address,
      gstin,
      currency,
      defaultWarranty,
      terms: termsText.split('\n').filter(t => t.trim().length > 0)
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const backupData = {
      app: 'FIXIFY Tech Repair',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      shopSettings,
      jobcards,
      spareParts,
      employees
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fixify_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.jobcards && parsed.spareParts) {
          localStorage.setItem('fixify_jobcards_v1', JSON.stringify(parsed.jobcards));
          localStorage.setItem('fixify_spare_parts_v1', JSON.stringify(parsed.spareParts));
          if (parsed.employees) localStorage.setItem('fixify_employees_v1', JSON.stringify(parsed.employees));
          if (parsed.shopSettings) localStorage.setItem('fixify_settings_v1', JSON.stringify(parsed.shopSettings));
          window.location.reload();
        } else {
          alert('Invalid FIXIFY backup file format.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <span>⚙️</span>
            <span>Admin & Shop Settings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure repair shop identity, thermal receipt layouts, warranty rules and system backups
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-600/50 px-3 py-1.5 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Shop Details */}
        <div className="bg-[#0f1728] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <span>🏢</span>
            <span>Shop Profile & Branding</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Shop Brand Name
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Support Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp Alerts Number
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Physical Shop Address (Prints on Jobcards)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Printable Policy & Warranty */}
        <div className="bg-[#0f1728] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <span>📜</span>
            <span>Jobcard Terms & Warranty Policy</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Default Repair Warranty Text
            </label>
            <input
              type="text"
              value={defaultWarranty}
              onChange={(e) => setDefaultWarranty(e.target.value)}
              className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Customer Agreement Terms (One rule per line)
            </label>
            <textarea
              rows={4}
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-600/20 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Backup and Data Maintenance */}
      <div className="bg-[#0f1728] border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <span>💾</span>
          <span>Database & Backup Management</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export JSON */}
          <div className="bg-[#141e33] p-4 rounded-xl space-y-2 border border-slate-700/60">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" />
              <span>Export Full System Backup</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Download all {jobcards.length} jobcards, {spareParts.length} inventory parts, and staff records as an offline JSON backup.
            </p>
            <button
              onClick={handleExportData}
              className="mt-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="bg-[#141e33] p-4 rounded-xl space-y-2 border border-slate-700/60">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Restore from Backup</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Restore previously exported JSON backup data to overwrite the current database.
            </p>
            <label className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold cursor-pointer transition-colors">
              <span>Select Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Demo Data & Factory Reset */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-300">Quick Testing Helpers</h4>
            <p className="text-[11px] text-slate-500">Easily toggle between populated shop demo data or a blank initial system.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (confirm('Load demo repair jobs, spare parts, and technician records?')) {
                  resetToMockData();
                }
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
              <span>Load Demo Data</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all jobcards and reset status counts to 0 (matches initial blank screenshot)?')) {
                  clearAllToZero();
                }
              }}
              className="px-3.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Counters to 0</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
