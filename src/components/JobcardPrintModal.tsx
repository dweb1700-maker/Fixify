import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, X, Download, Share2, Check } from 'lucide-react';

export const JobcardPrintModal: React.FC = () => {
  const { 
    selectedJobcardForReceipt, 
    setSelectedJobcardForReceipt, 
    shopSettings 
  } = useApp();

  const [printFormat, setPrintFormat] = useState<'A4' | 'Thermal'>('A4');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!selectedJobcardForReceipt) return null;
  const job = selectedJobcardForReceipt;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ${job.customerName},\nYour repair jobcard #${job.id} for ${job.brand} ${job.model} is created at ${shopSettings.shopName}.\nStatus: ${job.status}\nEstimated Cost: ₹${job.finalAmount || job.estimatedCost}\nAdvance Paid: ₹${job.advancePaid}\nBalance Due: ₹${(job.finalAmount || job.estimatedCost) - job.advancePaid}\nTrack support: ${shopSettings.phone}`
    );
    const cleanPhone = job.customerPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const balanceDue = (job.finalAmount || job.estimatedCost) - job.advancePaid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-[#111928] border border-slate-700 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-6">
        
        {/* Modal Controls Header */}
        <div className="px-6 py-4 bg-[#0a0f1d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Jobcard Receipt #{job.id}
              </h3>
              <p className="text-xs text-slate-400">
                Customer: {job.customerName} ({job.brand} {job.model})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle */}
            <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setPrintFormat('A4')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  printFormat === 'A4' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Standard A4
              </button>
              <button
                onClick={() => setPrintFormat('Thermal')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  printFormat === 'Thermal' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Thermal (80mm)
              </button>
            </div>

            <button
              onClick={handleShareWhatsApp}
              title="Send to WhatsApp"
              className="px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={() => setSelectedJobcardForReceipt(null)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-6 bg-slate-900/60 max-h-[75vh] overflow-y-auto flex justify-center">
          
          {/* Printable container */}
          <div 
            id="printable-jobcard"
            className={`bg-white text-black p-8 rounded-lg shadow-xl print-only ${
              printFormat === 'Thermal' ? 'w-[320px] text-[11px] p-4' : 'w-full max-w-[720px] text-xs'
            }`}
          >
            {/* Header */}
            <div className="text-center border-b border-black pb-4 mb-4">
              <h1 className="text-2xl font-black tracking-wider uppercase text-black">
                {shopSettings.shopName}
              </h1>
              <p className="text-xs font-bold text-gray-700 mt-0.5">
                {shopSettings.tagline}
              </p>
              <p className="text-[11px] text-gray-600 mt-1">
                {shopSettings.address}
              </p>
              <p className="text-[11px] text-gray-600">
                Phone: {shopSettings.phone} | GSTIN: {shopSettings.gstin}
              </p>
              <div className="mt-2 inline-block px-3 py-1 bg-black text-white text-xs font-bold tracking-widest uppercase">
                {job.status === 'Delivered' ? 'REPAIR TAX INVOICE' : 'DEVICE REPAIR JOBCARD'}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex justify-between items-start border-b border-gray-300 pb-3 mb-3">
              <div>
                <p><strong>Jobcard ID:</strong> <span className="font-mono font-bold text-sm">{job.id}</span></p>
                <p><strong>Intake Date:</strong> {new Date(job.createdAt).toLocaleString('en-IN')}</p>
                <p><strong>Assigned Tech:</strong> {job.assignedTechnicianName}</p>
              </div>
              <div className="text-right">
                <p><strong>Status:</strong> <span className="uppercase font-bold">{job.status}</span></p>
                <p><strong>Priority:</strong> {job.priority}</p>
                <p><strong>Expected Delivery:</strong> {job.expectedDeliveryDate}</p>
              </div>
            </div>

            {/* Customer & Device Grid */}
            <div className="grid grid-cols-2 gap-4 border-b border-gray-300 pb-3 mb-3">
              <div>
                <p className="font-bold border-b border-gray-200 pb-1 mb-1 text-[11px] uppercase text-gray-700">
                  Customer Details
                </p>
                <p className="font-bold text-sm">{job.customerName}</p>
                <p>Phone: {job.customerPhone}</p>
                {job.customerAltPhone && <p>Alt: {job.customerAltPhone}</p>}
                {job.customerAddress && <p>Locality: {job.customerAddress}</p>}
              </div>

              <div>
                <p className="font-bold border-b border-gray-200 pb-1 mb-1 text-[11px] uppercase text-gray-700">
                  Device Details
                </p>
                <p className="font-bold text-sm">{job.brand} {job.model} ({job.deviceType})</p>
                <p>IMEI / Serial: <span className="font-mono">{job.imeiSerial}</span></p>
                <p>Passcode: {job.passcode}</p>
              </div>
            </div>

            {/* Inspection & Accessories */}
            <div className="border-b border-gray-300 pb-3 mb-3">
              <p><strong>Inspection Checklist:</strong> {job.physicalCondition.length > 0 ? job.physicalCondition.join(', ') : 'No physical damage noted'}</p>
              <p className="mt-1"><strong>Accessories Received:</strong> {job.accessories.join(', ')}</p>
            </div>

            {/* Problem & Diagnosis */}
            <div className="border-b border-gray-300 pb-3 mb-3 bg-gray-50 p-2.5 rounded">
              <p><strong>Reported Problem:</strong></p>
              <p className="text-gray-900 mt-0.5">{job.problemDescription}</p>
              {job.technicianNotes && (
                <p className="mt-2 text-gray-700">
                  <strong>Technician Diagnosis:</strong> {job.technicianNotes}
                </p>
              )}
            </div>

            {/* Parts Used table (if any) */}
            {job.partsUsed && job.partsUsed.length > 0 && (
              <div className="border-b border-gray-300 pb-3 mb-3">
                <p className="font-bold mb-1.5 uppercase text-[11px] text-gray-700">Parts & Replacement Items</p>
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-1">Item</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.partsUsed.map((p, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-1">{p.partName}</td>
                        <td className="py-1 text-center font-mono">{p.quantity}</td>
                        <td className="py-1 text-right font-mono">₹{p.sellingPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Financial Summary */}
            <div className="border-b-2 border-black pb-3 mb-4">
              <div className="flex justify-between py-1">
                <span>Total Estimated Charge:</span>
                <span className="font-mono font-bold">₹{job.finalAmount || job.estimatedCost}</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-800">
                <span>Advance Paid Received:</span>
                <span className="font-mono font-bold">(-) ₹{job.advancePaid}</span>
              </div>
              <div className="flex justify-between py-1 text-sm font-bold border-t border-gray-400 mt-1 pt-1">
                <span>Balance Due at Delivery:</span>
                <span className="font-mono text-red-600">₹{balanceDue}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Payment Method: {job.paymentMode}</p>
              {job.warrantyDuration && (
                <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                  Warranty Provided: {job.warrantyDuration}
                </p>
              )}
            </div>

            {/* Terms and conditions */}
            <div className="text-[9px] text-gray-600 leading-tight mb-6">
              <p className="font-bold text-gray-800 mb-1">Terms & Conditions:</p>
              <ol className="list-decimal pl-3 space-y-0.5">
                {shopSettings.terms.slice(0, 4).map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ol>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end pt-6 border-t border-gray-300 text-[11px]">
              <div className="text-center">
                <div className="border-b border-black w-36 mb-1"></div>
                <span>Customer Signature</span>
              </div>
              <div className="text-center">
                <div className="border-b border-black w-36 mb-1"></div>
                <span>For FIXIFY Tech Repair</span>
              </div>
            </div>

            {/* Simulated barcode */}
            <div className="text-center mt-6">
              <div className="font-mono tracking-widest text-lg font-bold">
                * {job.id} *
              </div>
              <p className="text-[9px] text-gray-400">Original Service Copy</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
