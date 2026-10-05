import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CreateJobcardView } from './components/CreateJobcardView';
import { TotalRepairingView } from './components/TotalRepairingView';
import { SparePartsView } from './components/SparePartsView';
import { EmployeesView } from './components/EmployeesView';
import { AdminSettingsView } from './components/AdminSettingsView';
import { JobcardPrintModal } from './components/JobcardPrintModal';
import { DeliveryModal } from './components/DeliveryModal';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'create_jobcard':
        return <CreateJobcardView />;
      case 'total_repairing':
        return <TotalRepairingView />;
      case 'spare_parts':
        return <SparePartsView />;
      case 'employees':
        return <EmployeesView />;
      case 'admin_settings':
        return <AdminSettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080d19] text-slate-100">
      {/* Left Sidebar */}
      <div className="no-print h-full">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <div className="no-print">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto bg-[#0a0f1d] pb-12">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <JobcardPrintModal />
      <DeliveryModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
