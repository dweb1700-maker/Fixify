import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Jobcard } from '../types';
import { Wrench, X, Plus, AlertCircle } from 'lucide-react';

interface Props {
  jobcard: Jobcard;
  onClose: () => void;
}

export const AddPartToJobModal: React.FC<Props> = ({ jobcard, onClose }) => {
  const { spareParts, addPartToJobcard } = useApp();

  const [selectedPartId, setSelectedPartId] = useState<string>(spareParts[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [customSellingPrice, setCustomSellingPrice] = useState<string>('');

  const selectedPart = spareParts.find(p => p.id === selectedPartId);

  const priceToUse = customSellingPrice !== '' 
    ? Number(customSellingPrice) 
    : (selectedPart ? selectedPart.sellingPrice : 0);

  const handleAdd = () => {
    if (!selectedPart) return;
    if (selectedPart.quantity < quantity) {
      alert(`Insufficient stock! Only ${selectedPart.quantity} units available.`);
      return;
    }

    addPartToJobcard(jobcard.id, {
      partId: selectedPart.id,
      partName: selectedPart.name,
      quantity,
      costPrice: selectedPart.costPrice,
      sellingPrice: priceToUse
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-[#111928] border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Add Replacement Part
              </h3>
              <p className="text-xs text-slate-400">
                Jobcard #{jobcard.id} · {jobcard.brand} {jobcard.model}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Spare Part from Inventory
            </label>
            <select
              value={selectedPartId}
              onChange={(e) => {
                setSelectedPartId(e.target.value);
                setCustomSellingPrice('');
              }}
              className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            >
              {spareParts.map(part => (
                <option key={part.id} value={part.id}>
                  {part.name} (Stock: {part.quantity} | ₹{part.sellingPrice})
                </option>
              ))}
            </select>
          </div>

          {selectedPart && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Compatible:</span>
                <span className="text-slate-200 font-medium">{selectedPart.compatibleModels}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stock Available:</span>
                <span className={`font-mono font-bold ${selectedPart.quantity <= selectedPart.minStockAlert ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {selectedPart.quantity} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Wholesale Cost:</span>
                <span className="font-mono text-slate-300">₹{selectedPart.costPrice}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Quantity Used
              </label>
              <input
                type="number"
                min={1}
                max={selectedPart?.quantity || 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Selling Price (₹)
              </label>
              <input
                type="number"
                placeholder={selectedPart ? `${selectedPart.sellingPrice}` : 'Price'}
                value={customSellingPrice !== '' ? customSellingPrice : (selectedPart?.sellingPrice || '')}
                onChange={(e) => setCustomSellingPrice(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-600/30 text-xs text-blue-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Adding this part will automatically deduct {quantity} unit(s) from inventory and include it in the financial ledger.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0a0f1d] border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Attach Part to Repair</span>
          </button>
        </div>

      </div>
    </div>
  );
};
