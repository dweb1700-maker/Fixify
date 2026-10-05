import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DeviceType, PaymentMode } from '../types';
import { 
  Save, 
  Printer, 
  RotateCcw, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Monitor, 
  Watch, 
  HelpCircle,
  CheckCircle2,
  Lock,
  Tag,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const CreateJobcardView: React.FC = () => {
  const { 
    employees, 
    addJobcard, 
    setSelectedJobcardForReceipt, 
    setActiveTab 
  } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAltPhone, setCustomerAltPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [deviceType, setDeviceType] = useState<DeviceType>('Mobile');
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [imeiSerial, setImeiSerial] = useState('');
  const [passcode, setPasscode] = useState('');
  const [hasNoPasscode, setHasNoPasscode] = useState(false);

  // Physical condition checks
  const conditionOptions = [
    'Screen Cracked / Broken',
    'Touch Not Working',
    'Body Dents / Scratches',
    'Back Glass Cracked',
    'Water / Liquid Damage',
    'Loose / Damaged Port',
    'Camera Lens Cracked',
    'Power / Volume Key Stuck',
    'No Power / Motherboard Dead',
    'Fan Noisy / Overheating'
  ];
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  // Accessories received
  const accessoryOptions = [
    'Charger / Power Adapter',
    'Protective Case / Cover',
    'SIM Card / SIM Tray',
    'Laptop Bag / Sleeve',
    'None'
  ];
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(['None']);

  const [problemDescription, setProblemDescription] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'Express' | 'Urgent'>('Normal');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState(employees[1]?.id || employees[0]?.id || '');
  const [estimatedCost, setEstimatedCost] = useState<string>('1500');
  const [advancePaid, setAdvancePaid] = useState<string>('500');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Quick chips for problem description
  const quickProblems = [
    'Screen Replacement (OLED)',
    'Battery Draining Fast',
    'No Display / Green Lines',
    'Not Turning On (Dead)',
    'Charging Slow / Disconnecting',
    'Liquid Damage Ultrasonic Cleaning',
    'Keyboard Keys Not Registering',
    'OS Boot Loop / Corrupted',
    'Mic / Earpiece Low Sound'
  ];

  const toggleCondition = (cond: string) => {
    setSelectedConditions(prev => 
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  const toggleAccessory = (acc: string) => {
    if (acc === 'None') {
      setSelectedAccessories(['None']);
      return;
    }
    setSelectedAccessories(prev => {
      const withoutNone = prev.filter(a => a !== 'None');
      return withoutNone.includes(acc) ? withoutNone.filter(a => a !== acc) : [...withoutNone, acc];
    });
  };

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!customerName.trim()) errors.customerName = 'Customer Name is required';
    if (!customerPhone.trim()) errors.customerPhone = 'Mobile Phone Number is required';
    if (!brand.trim()) errors.brand = 'Brand is required';
    if (!model.trim()) errors.model = 'Model is required';
    if (!problemDescription.trim()) errors.problemDescription = 'Please specify the device issue';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (printReceipt: boolean) => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const assignedEmp = employees.find(e => e.id === assignedTechnicianId);

    const newJob = addJobcard({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAltPhone: customerAltPhone.trim() || undefined,
      customerEmail: customerEmail.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
      deviceType,
      brand: brand.trim(),
      model: model.trim(),
      imeiSerial: imeiSerial.trim() || 'NOT_PROVIDED',
      passcode: hasNoPasscode ? 'NO_PASSCODE' : (passcode.trim() || 'NOT_PROVIDED'),
      physicalCondition: selectedConditions,
      accessories: selectedAccessories,
      problemDescription: problemDescription.trim(),
      technicianNotes: technicianNotes.trim() || undefined,
      assignedTechnicianId,
      assignedTechnicianName: assignedEmp ? assignedEmp.name : 'Unassigned',
      status: 'Pending',
      priority,
      estimatedCost: Number(estimatedCost) || 0,
      advancePaid: Number(advancePaid) || 0,
      finalAmount: Number(estimatedCost) || 0,
      paymentMode,
      partsUsed: [],
      expectedDeliveryDate
    });

    setSuccessBanner(`Jobcard #${newJob.id} generated successfully!`);

    if (printReceipt) {
      setSelectedJobcardForReceipt(newJob);
    } else {
      setTimeout(() => {
        setActiveTab('total_repairing');
      }, 1000);
    }
  };

  const handleReset = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAltPhone('');
    setCustomerEmail('');
    setCustomerAddress('');
    setBrand('Apple');
    setModel('');
    setImeiSerial('');
    setPasscode('');
    setHasNoPasscode(false);
    setSelectedConditions([]);
    setSelectedAccessories(['None']);
    setProblemDescription('');
    setTechnicianNotes('');
    setEstimatedCost('1500');
    setAdvancePaid('500');
    setFormErrors({});
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <span>🛠️</span>
            <span>Create New Repair Jobcard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Intake form for incoming mobile, laptop, and electronic device repairs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Form</span>
          </button>
        </div>
      </div>

      {successBanner && (
        <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500 text-emerald-300 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button
            onClick={() => setActiveTab('total_repairing')}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded transition-colors"
          >
            View in Total Repairing
          </button>
        </div>
      )}

      {/* Main Intake Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: Customer Details */}
        <div className="bg-[#0f1728] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <span>👤</span>
            <span>Customer Information</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Customer Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kunal Singhania"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={`w-full bg-[#141e33] border rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors ${
                formErrors.customerName ? 'border-red-500' : 'border-slate-700'
              }`}
            />
            {formErrors.customerName && (
              <p className="text-[11px] text-red-400 mt-1">{formErrors.customerName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mobile Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className={`w-full bg-[#141e33] border rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors ${
                  formErrors.customerPhone ? 'border-red-500' : 'border-slate-700'
                }`}
              />
              {formErrors.customerPhone && (
                <p className="text-[11px] text-red-400 mt-1">{formErrors.customerPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alternate Phone (Optional)
              </label>
              <input
                type="tel"
                placeholder="e.g. 9822211100"
                value={customerAltPhone}
                onChange={(e) => setCustomerAltPhone(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="customer@domain.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                City / Locality
              </label>
              <input
                type="text"
                placeholder="e.g. Cyber City, Sector 4"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Device Details */}
        <div className="bg-[#0f1728] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <span>📱</span>
            <span>Device Information</span>
          </h3>

          {/* Device Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Device Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { type: 'Mobile', icon: Smartphone, label: 'Mobile' },
                { type: 'Laptop', icon: Laptop, label: 'Laptop' },
                { type: 'Tablet', icon: Tablet, label: 'Tablet' },
                { type: 'Desktop', icon: Monitor, label: 'Desktop' },
                { type: 'Smartwatch', icon: Watch, label: 'Watch' },
                { type: 'Other', icon: HelpCircle, label: 'Other' }
              ].map(item => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setDeviceType(item.type as DeviceType)}
                  className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    deviceType === item.type
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                      : 'bg-[#141e33] border-slate-700/80 text-slate-400 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Brand / Make <span className="text-red-400">*</span>
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Dell">Dell</option>
                <option value="HP">HP</option>
                <option value="Lenovo">Lenovo</option>
                <option value="Xiaomi / Redmi">Xiaomi / Redmi</option>
                <option value="OnePlus">OnePlus</option>
                <option value="Asus">Asus</option>
                <option value="Acer">Acer</option>
                <option value="Vivo">Vivo</option>
                <option value="Oppo">Oppo</option>
                <option value="Realme">Realme</option>
                <option value="Google Pixel">Google Pixel</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Model Name / No. <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. iPhone 14 Pro / XPS 15"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={`w-full bg-[#141e33] border rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors ${
                  formErrors.model ? 'border-red-500' : 'border-slate-700'
                }`}
              />
              {formErrors.model && (
                <p className="text-[11px] text-red-400 mt-1">{formErrors.model}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Serial No. / IMEI
              </label>
              <input
                type="text"
                placeholder="15-digit IMEI or Serial"
                value={imeiSerial}
                onChange={(e) => setImeiSerial(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Screen Passcode / Pattern
                </label>
                <label className="text-[11px] text-slate-400 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasNoPasscode}
                    onChange={(e) => setHasNoPasscode(e.target.checked)}
                    className="accent-orange-500 rounded"
                  />
                  <span>No Passcode</span>
                </label>
              </div>
              <input
                type="text"
                disabled={hasNoPasscode}
                placeholder={hasNoPasscode ? 'Disabled' : 'e.g. 1234 or Pattern note'}
                value={hasNoPasscode ? '' : passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 disabled:opacity-40 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Physical Condition & Accessories */}
        <div className="bg-[#0f1728] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <span>🔍</span>
            <span>Intake Inspection & Accessories</span>
          </h3>

          {/* Condition Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Physical Inspection Checklist
            </label>
            <div className="flex flex-wrap gap-2">
              {conditionOptions.map(cond => {
                const selected = selectedConditions.includes(cond);
                return (
                  <button
                    type="button"
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                        : 'bg-[#141e33] border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '} {cond}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accessories */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Accessories Received with Device
            </label>
            <div className="flex flex-wrap gap-2">
              {accessoryOptions.map(acc => {
                const selected = selectedAccessories.includes(acc);
                return (
                  <button
                    type="button"
                    key={acc}
                    onClick={() => toggleAccessory(acc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-[#141e33] border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '} {acc}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Problem, Priority & Costing */}
        <div className="bg-[#0f1728] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <span>💰</span>
            <span>Issue, Assignment & Billing</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Customer Reported Problem <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Describe the complaint in detail..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className={`w-full bg-[#141e33] border rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors ${
                formErrors.problemDescription ? 'border-red-500' : 'border-slate-700'
              }`}
            />
            {formErrors.problemDescription && (
              <p className="text-[11px] text-red-400 mt-0.5">{formErrors.problemDescription}</p>
            )}

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickProblems.map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setProblemDescription(p)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] border border-slate-700"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assign Technician
              </label>
              <select
                value={assignedTechnicianId}
                onChange={(e) => setAssignedTechnicianId(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Repair Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="Normal">Normal (Standard Queue)</option>
                <option value="Express">Express (Same Day)</option>
                <option value="Urgent">Urgent (Express 2 Hours)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Cost (₹)
              </label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Advance Paid (₹)
              </label>
              <input
                type="number"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Cash">Cash</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Pending">Pending / Unpaid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-[#0f1728] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Jobcard receipt will be generated with barcode, shop warranty clauses & customer copy.
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4 text-orange-400" />
            <span>Save Jobcard Only</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Generate & Print Jobcard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
