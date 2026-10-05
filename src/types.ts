export type RepairStatus = 'Pending' | 'Repairing' | 'Testing' | 'Ready' | 'Not Repaired' | 'Delivered';

export type DeviceType = 'Mobile' | 'Laptop' | 'Tablet' | 'Desktop' | 'Smartwatch' | 'Other';

export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Pending';

export interface PartUsage {
  partId: string;
  partName: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
}

export interface Jobcard {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAltPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  deviceType: DeviceType;
  brand: string;
  model: string;
  imeiSerial: string;
  passcode: string;
  physicalCondition: string[];
  accessories: string[];
  problemDescription: string;
  technicianNotes?: string;
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  status: RepairStatus;
  priority: 'Normal' | 'Express' | 'Urgent';
  estimatedCost: number;
  advancePaid: number;
  finalAmount: number;
  paymentMode: PaymentMode;
  partsUsed: PartUsage[];
  expectedDeliveryDate: string;
  deliveredDate?: string;
  warrantyDuration?: string;
}

export interface SparePart {
  id: string;
  name: string;
  code: string;
  category: string;
  compatibleModels: string;
  quantity: number;
  minStockAlert: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  locationBin: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'Chairman' | 'Store Manager' | 'Senior Laptop Tech' | 'Mobile Hardware Tech' | 'Service Advisor';
  phone: string;
  email: string;
  status: 'Active' | 'On Leave';
  commissionRate: number; // e.g. 10%
  monthlySalary?: number;
  joinedDate: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  gstin: string;
  currency: string;
  terms: string[];
  defaultWarranty: string;
  invoiceNote: string;
}

export type QuickDateRange = 
  | 'Custom / Lifetime History'
  | 'Today'
  | 'Yesterday'
  | 'This Week'
  | 'This Month'
  | 'Previous Month'
  | 'Last 30 Days'
  | 'This Financial Year';

export type ActiveTab = 'dashboard' | 'create_jobcard' | 'total_repairing' | 'spare_parts' | 'employees' | 'admin_settings';
