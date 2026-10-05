import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SparePart } from '../types';
import { 
  Boxes, 
  Search, 
  Plus, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  TrendingUp,
  Tag
} from 'lucide-react';

export const SparePartsView: React.FC = () => {
  const { 
    spareParts, 
    addSparePart, 
    updateSparePart, 
    deleteSparePart, 
    adjustStock 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Display / Touch Screen');
  const [compatibleModels, setCompatibleModels] = useState('');
  const [quantity, setQuantity] = useState('5');
  const [minStockAlert, setMinStockAlert] = useState('2');
  const [costPrice, setCostPrice] = useState('1500');
  const [sellingPrice, setSellingPrice] = useState('2800');
  const [supplier, setSupplier] = useState('');
  const [locationBin, setLocationBin] = useState('');

  // Quick Restock modal state
  const [restockPart, setRestockPart] = useState<SparePart | null>(null);
  const [restockAmount, setRestockAmount] = useState('5');

  const categories = [
    'All',
    'Display / Touch Screen',
    'Battery',
    'Charging Port / Flex',
    'Motherboard & IC',
    'RAM & Storage',
    'Keyboard & Trackpad',
    'Consumables & Tools',
    'Other'
  ];

  // Metrics
  const metrics = useMemo(() => {
    let totalItems = spareParts.length;
    let totalUnits = 0;
    let totalValuation = 0;
    let lowStockCount = 0;

    spareParts.forEach(p => {
      totalUnits += p.quantity;
      totalValuation += (p.costPrice * p.quantity);
      if (p.quantity <= p.minStockAlert) lowStockCount++;
    });

    return { totalItems, totalUnits, totalValuation, lowStockCount };
  }, [spareParts]);

  // Filtered parts
  const filteredParts = useMemo(() => {
    return spareParts.filter(p => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (showLowStockOnly && p.quantity > p.minStockAlert) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.compatibleModels.toLowerCase().includes(q) ||
          p.locationBin.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [spareParts, selectedCategory, showLowStockOnly, searchQuery]);

  const handleOpenAdd = () => {
    setEditingPart(null);
    setName('');
    setCode(`PRT-${Date.now().toString().slice(-4)}`);
    setCategory('Display / Touch Screen');
    setCompatibleModels('');
    setQuantity('5');
    setMinStockAlert('2');
    setCostPrice('1500');
    setSellingPrice('2800');
    setSupplier('');
    setLocationBin('Rack A-01');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: SparePart) => {
    setEditingPart(p);
    setName(p.name);
    setCode(p.code);
    setCategory(p.category);
    setCompatibleModels(p.compatibleModels);
    setQuantity(p.quantity.toString());
    setMinStockAlert(p.minStockAlert.toString());
    setCostPrice(p.costPrice.toString());
    setSellingPrice(p.sellingPrice.toString());
    setSupplier(p.supplier);
    setLocationBin(p.locationBin);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPart) {
      updateSparePart(editingPart.id, {
        name: name.trim(),
        code: code.trim(),
        category,
        compatibleModels: compatibleModels.trim(),
        quantity: Number(quantity) || 0,
        minStockAlert: Number(minStockAlert) || 1,
        costPrice: Number(costPrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        supplier: supplier.trim(),
        locationBin: locationBin.trim()
      });
    } else {
      addSparePart({
        name: name.trim(),
        code: code.trim(),
        category,
        compatibleModels: compatibleModels.trim(),
        quantity: Number(quantity) || 0,
        minStockAlert: Number(minStockAlert) || 1,
        costPrice: Number(costPrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        supplier: supplier.trim(),
        locationBin: locationBin.trim()
      });
    }

    setIsModalOpen(false);
  };

  const handleExecuteRestock = () => {
    if (!restockPart) return;
    adjustStock(restockPart.id, Number(restockAmount) || 0);
    setRestockPart(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <span>📦</span>
            <span>Spare Parts & Inventory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage replacement screens, batteries, keyboards, ICs, wholesale cost and inventory stock levels
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Spare Part</span>
        </button>
      </div>

      {/* Top Inventory Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0f1728] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold uppercase">Catalog Types</span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {metrics.totalItems} items
          </div>
        </div>

        <div className="bg-[#0f1728] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Stock Units</span>
          <div className="text-2xl font-extrabold text-blue-400 font-mono mt-1">
            {metrics.totalUnits} units
          </div>
        </div>

        <div className="bg-[#0f1728] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold uppercase">Wholesale Value</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            ₹{metrics.totalValuation.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-[#0f1728] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold uppercase">Low Stock Alerts</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1 flex items-center justify-between">
            <span>{metrics.lowStockCount} items</span>
            {metrics.lowStockCount > 0 && (
              <button
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className="text-xs px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 font-sans"
              >
                {showLowStockOnly ? 'Show All' : 'Filter'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f1728] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search part name, SKU code, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141e33] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-[#141e33] text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#0f1728] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#121c30] border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Part Name & Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Compatible Model</th>
                <th className="py-3 px-4 text-center">In Stock</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4">Bin Location</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No spare parts found. Click "+ Add Spare Part" to add new inventory.
                  </td>
                </tr>
              ) : (
                filteredParts.map(part => {
                  const isLow = part.quantity <= part.minStockAlert;
                  const margin = Math.round(((part.sellingPrice - part.costPrice) / (part.sellingPrice || 1)) * 100);
                  return (
                    <tr key={part.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{part.name}</div>
                        <div className="font-mono text-[11px] text-orange-400 mt-0.5">{part.code}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {part.category}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-[200px] truncate" title={part.compatibleModels}>
                        {part.compatibleModels || 'Universal'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            part.quantity === 0 ? 'bg-red-950 text-red-400 border border-red-800' :
                            isLow ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                            'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}>
                            {part.quantity}
                          </span>
                          <button
                            onClick={() => setRestockPart(part)}
                            title="Restock units"
                            className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold underline"
                          >
                            + Restock
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        ₹{part.costPrice}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-slate-200">₹{part.sellingPrice}</div>
                        <div className="text-[10px] text-emerald-400 font-mono">+{margin}% margin</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {part.locationBin || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(part)}
                            title="Edit Spare Part"
                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${part.name}?`)) {
                                deleteSparePart(part.id);
                              }
                            }}
                            title="Delete Spare Part"
                            className="p-1.5 rounded hover:bg-red-950/60 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Spare Part Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#111928] border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📦</span>
                <span>{editingPart ? 'Edit Spare Part' : 'Add New Spare Part'}</span>
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
                  Part Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 14 Pro OLED Display"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Part SKU / Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Compatible Models
                </label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 14 Pro, iPhone 14 Pro Max"
                  value={compatibleModels}
                  onChange={(e) => setCompatibleModels(e.target.value)}
                  className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Initial Stock Qty
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Low Stock Alert Qty
                  </label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Wholesale Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Customer Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Supplier / Vendor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Mobile Distro"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rack / Bin Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rack A-04"
                    value={locationBin}
                    onChange={(e) => setLocationBin(e.target.value)}
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
                  className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/20"
                >
                  {editingPart ? 'Update Part' : 'Save New Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Restock Modal */}
      {restockPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#111928] border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-white">
              Restock {restockPart.name}
            </h3>
            <p className="text-xs text-slate-400">
              Current in stock: <span className="font-mono text-white font-bold">{restockPart.quantity} units</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Quantity to Add (+)
              </label>
              <input
                type="number"
                min={1}
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                className="w-full bg-[#141e33] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRestockPart(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRestock}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
