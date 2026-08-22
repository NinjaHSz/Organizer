import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { MobileNav } from './components/layout/MobileNav';
import { Header } from './components/layout/Header';
import { QuickActionFAB } from './components/layout/QuickActionFAB';
import { ToastContainer } from './components/common/ToastContainer';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { SchedulePage } from './pages/SchedulePage';
import { SubjectsPage } from './pages/SubjectsPage';
import { SettingsPage } from './pages/SettingsPage';

// Modals
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { AIScannerModal } from './components/scanner/AIScannerModal';
import { SubjectFormModal } from './components/subjects/SubjectFormModal';

export const App: React.FC = () => {
  const { activePage } = useApp();

  useEffect(() => {
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('✅ Service Worker registrado:', reg.scope))
        .catch((err) => console.warn('⚠️ Service Worker registro:', err));
    }
  }, []);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'schedule':
        return <SchedulePage />;
      case 'subjects':
        return <SubjectsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[var(--surface-page)] text-[var(--text-primary)]">
      {/* Lateral Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Surface */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">{renderActivePage()}</main>
      </div>

      {/* Floating Speed-Dial FAB */}
      <QuickActionFAB />

      {/* Mobile Navigation Dock */}
      <MobileNav />

      {/* Modals & Dialogs */}
      <TaskFormModal />
      <AIScannerModal />
      <SubjectFormModal />

      {/* Global Toasts */}
      <ToastContainer />
    </div>
  );
};
