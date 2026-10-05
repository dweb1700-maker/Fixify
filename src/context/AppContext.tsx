import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Jobcard, 
  SparePart, 
  Employee, 
  ShopSettings, 
  RepairStatus, 
  ActiveTab, 
  PartUsage 
} from '../types';
import { 
  initialEmployees, 
  initialJobcards, 
  initialShopSettings, 
  initialSpareParts 
} from '../data/mockData';

interface AppContextType {
  jobcards: Jobcard[];
  spareParts: SparePart[];
  employees: Employee[];
  shopSettings: ShopSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUserRole: string;
  setCurrentUserRole: (role: string) => void;
  statusFilterFromDashboard: RepairStatus | 'All';
  setStatusFilterFromDashboard: (status: RepairStatus | 'All') => void;
  selectedJobcardForReceipt: Jobcard | null;
  setSelectedJobcardForReceipt: (card: Jobcard | null) => void;
  selectedJobcardForDelivery: Jobcard | null;
  setSelectedJobcardForDelivery: (card: Jobcard | null) => void;
  
  // Jobcard actions
  addJobcard: (data: Omit<Jobcard, 'id' | 'createdAt'>) => Jobcard;
  updateJobcard: (id: string, data: Partial<Jobcard>) => void;
  deleteJobcard: (id: string) => void;
  updateJobcardStatus: (id: string, status: RepairStatus) => void;
  addPartToJobcard: (jobcardId: string, partUsage: PartUsage) => void;
  deliverJobcard: (jobcardId: string, finalAmount: number, paymentMode: Jobcard['paymentMode'], warranty: string) => void;

  // Spare parts actions
  addSparePart: (data: Omit<SparePart, 'id' | 'updatedAt'>) => void;
  updateSparePart: (id: string, data: Partial<SparePart>) => void;
  deleteSparePart: (id: string) => void;
  adjustStock: (id: string, quantityChange: number) => void;

  // Employee actions
  addEmployee: (data: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Settings actions
  updateShopSettings: (data: Partial<ShopSettings>) => void;
  resetToMockData: () => void;
  clearAllToZero: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  JOBCARDS: 'fixify_jobcards_v1',
  PARTS: 'fixify_spare_parts_v1',
  EMPLOYEES: 'fixify_employees_v1',
  SETTINGS: 'fixify_settings_v1',
  ROLE: 'fixify_active_role_v1'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobcards, setJobcards] = useState<Jobcard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOBCARDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialJobcards;
  });

  const [spareParts, setSpareParts] = useState<SparePart[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialSpareParts;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialEmployees;
  });

  const [shopSettings, setShopSettings] = useState<ShopSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialShopSettings;
  });

  const [currentUserRole, setCurrentUserRole] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return 'Chairman';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [statusFilterFromDashboard, setStatusFilterFromDashboard] = useState<RepairStatus | 'All'>('All');
  const [selectedJobcardForReceipt, setSelectedJobcardForReceipt] = useState<Jobcard | null>(null);
  const [selectedJobcardForDelivery, setSelectedJobcardForDelivery] = useState<Jobcard | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOBCARDS, JSON.stringify(jobcards));
  }, [jobcards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(spareParts));
  }, [spareParts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(shopSettings));
  }, [shopSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentUserRole);
  }, [currentUserRole]);

  // Jobcard Helpers
  const addJobcard = (data: Omit<Jobcard, 'id' | 'createdAt'>): Jobcard => {
    const nextSeq = jobcards.length + 1001;
    const newCard: Jobcard = {
      ...data,
      id: `FIX-${nextSeq}`,
      createdAt: new Date().toISOString()
    };
    setJobcards(prev => [newCard, ...prev]);
    return newCard;
  };

  const updateJobcard = (id: string, data: Partial<Jobcard>) => {
    setJobcards(prev => prev.map(card => card.id === id ? { ...card, ...data } : card));
  };

  const deleteJobcard = (id: string) => {
    setJobcards(prev => prev.filter(card => card.id !== id));
  };

  const updateJobcardStatus = (id: string, status: RepairStatus) => {
    setJobcards(prev => prev.map(card => {
      if (card.id === id) {
        const updates: Partial<Jobcard> = { status };
        if (status === 'Delivered' && !card.deliveredDate) {
          updates.deliveredDate = new Date().toISOString();
        }
        return { ...card, ...updates };
      }
      return card;
    }));
  };

  const addPartToJobcard = (jobcardId: string, partUsage: PartUsage) => {
    // 1. Deduct stock from spare parts
    adjustStock(partUsage.partId, -partUsage.quantity);

    // 2. Add part to jobcard partsUsed and adjust finalAmount if needed
    setJobcards(prev => prev.map(card => {
      if (card.id === jobcardId) {
        const existingParts = [...card.partsUsed, partUsage];
        const newTotalEstimate = Math.max(card.estimatedCost, card.estimatedCost + partUsage.sellingPrice);
        return {
          ...card,
          partsUsed: existingParts,
          finalAmount: newTotalEstimate
        };
      }
      return card;
    }));
  };

  const deliverJobcard = (
    jobcardId: string, 
    finalAmount: number, 
    paymentMode: Jobcard['paymentMode'], 
    warranty: string
  ) => {
    setJobcards(prev => prev.map(card => {
      if (card.id === jobcardId) {
        return {
          ...card,
          status: 'Delivered',
          finalAmount,
          paymentMode,
          warrantyDuration: warranty,
          deliveredDate: new Date().toISOString()
        };
      }
      return card;
    }));
  };

  // Spare Parts Helpers
  const addSparePart = (data: Omit<SparePart, 'id' | 'updatedAt'>) => {
    const nextSeq = spareParts.length + 101;
    const newPart: SparePart = {
      ...data,
      id: `PRT-${nextSeq}`,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setSpareParts(prev => [newPart, ...prev]);
  };

  const updateSparePart = (id: string, data: Partial<SparePart>) => {
    setSpareParts(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString().split('T')[0] } : p));
  };

  const deleteSparePart = (id: string) => {
    setSpareParts(prev => prev.filter(p => p.id !== id));
  };

  const adjustStock = (id: string, quantityChange: number) => {
    setSpareParts(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = Math.max(0, p.quantity + quantityChange);
        return { ...p, quantity: newQty, updatedAt: new Date().toISOString().split('T')[0] };
      }
      return p;
    }));
  };

  // Employee Helpers
  const addEmployee = (data: Omit<Employee, 'id'>) => {
    const nextSeq = employees.length + 1;
    const newEmp: Employee = {
      ...data,
      id: `EMP-0${nextSeq}`
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  // Settings & Reset
  const updateShopSettings = (data: Partial<ShopSettings>) => {
    setShopSettings(prev => ({ ...prev, ...data }));
  };

  const resetToMockData = () => {
    setJobcards(initialJobcards);
    setSpareParts(initialSpareParts);
    setEmployees(initialEmployees);
    setShopSettings(initialShopSettings);
    setCurrentUserRole('Chairman');
  };

  const clearAllToZero = () => {
    setJobcards([]);
    setSpareParts(initialSpareParts.map(p => ({ ...p, quantity: 0 })));
  };

  return (
    <AppContext.Provider
      value={{
        jobcards,
        spareParts,
        employees,
        shopSettings,
        activeTab,
        setActiveTab,
        currentUserRole,
        setCurrentUserRole,
        statusFilterFromDashboard,
        setStatusFilterFromDashboard,
        selectedJobcardForReceipt,
        setSelectedJobcardForReceipt,
        selectedJobcardForDelivery,
        setSelectedJobcardForDelivery,
        addJobcard,
        updateJobcard,
        deleteJobcard,
        updateJobcardStatus,
        addPartToJobcard,
        deliverJobcard,
        addSparePart,
        updateSparePart,
        deleteSparePart,
        adjustStock,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        updateShopSettings,
        resetToMockData,
        clearAllToZero
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
