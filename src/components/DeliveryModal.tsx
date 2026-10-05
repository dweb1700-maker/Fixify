import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMode } from '../types';
import { CheckCircle2, X, DollarSign, ShieldCheck } from 'lucide-react';

export const DeliveryModal: React.FC = () => {
  const { 
    selectedJobcardForDelivery, 
    setSelectedJobcardForDelivery, 
    deliverJobcard, 
    setSelectedJobcardForReceipt,
    shopSettings
  } = useApp();

  if (!selectedJobcardForDelivery) return null;
  const job = selectedJobcardForDelivery;

  const [finalCharge, setFinalCharge] = useState<number>(job.finalAmount || job.estimatedCost);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    job.paymentMode === 'Pending' ? 'UPI' : job.paymentMode
  );
  const [warranty, setWarranty] = useState<string>(shopSettings.defaultWarranty);

  const balanceToCollect = Math.max(0, finalCharge - job.advancePaid);

  const handleConfirmDelivery = () => {
    deliverJobcard(job.id, finalCharge, paymentMode, warranty);
    setSelectedJobcardForDelivery(null);
    
    // Automatically open printable invoice for the delivered device
    setSelectedJobcardForReceipt({
      ...job,
      status: 'Delivered',
      finalAmount: finalCharge,
      paymentMode,
      warrantyDuration: warranty,
      deliveredDate: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-[#111928] border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Deliver Device & Settle Bill
              </h3>
              <p className="text-xs text-slate-400">
                Jobcard #{job.id} · {job.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedJobcardForDelivery(null)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400">Device: </span>
              <span className="font-semibold text-white">{job.brand} {job.model}</span>
            </div>
            <div>
              <span className="text-slate-400">Advance Paid: </span>
              <span className="font-mono font-bold text-emerald-400">₹{job.advancePaid}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Final Agreed Repair Amount (₹)
            </label>
            <input
              type="number"
              value={finalCharge}
              onChange={(e) => setFinalCharge(Number(e.target.value) || 0)}
              className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-orange-400 font-medium">Balance to Collect from Customer:</span>
              <div className="text-2xl font-extrabold text-orange-400 font-mono">
                ₹{balanceToCollect}
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              ₹{finalCharge} - ₹{job.advancePaid} advance
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Balance Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
              className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            >
              <option value="UPI">UPI / GPay / PhonePe</option>
              <option value="Cash">Cash</option>
              <option value="Card">Credit / Debit Card</option>
              <option value="Bank Transfer">Bank Transfer / NEFT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Warranty Provided to Customer
            </label>
            <select
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            >
              <option value="90 Days Service Warranty">90 Days Service Warranty</option>
              <option value="30 Days Display Replacement Warranty">30 Days Display Replacement Warranty</option>
              <option value="6 Months Battery Replacement Warranty">6 Months Battery Replacement Warranty</option>
              <option value="6 Months Motherboard Repair Warranty">6 Months Motherboard Repair Warranty</option>
              <option value="1 Year Hardware Warranty">1 Year Hardware Warranty</option>
              <option value="No Warranty (Liquid Damaged Board)">No Warranty (Liquid Damaged Board)</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#0a0f1d] border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={() => setSelectedJobcardForDelivery(null)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelivery}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Delivery & Print Invoice</span>
          </button>
        </div>

      </div>
    </div>
  );
};
