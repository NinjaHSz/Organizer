import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { DesktopDock } from './components/layout/DesktopDock';
import { MobileNav } from './components/layout/MobileNav';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { SchedulePage } from './pages/SchedulePage';
import { SubjectsPage } from './pages/SubjectsPage';
import { SettingsPage } from './pages/SettingsPage';

import { initPwaManager } from './services/pwaManager';

// Modals
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { AIScannerModal } from './components/scanner/AIScannerModal';
import { SubjectFormModal } from './components/subjects/SubjectFormModal';

export const App: React.FC = () => {
  const { activePage } = useApp();

  useEffect(() => {
    // Initialize PWA auto-update manager & service worker
    initPwaManager();
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
      {/* Main Content Surface */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">{renderActivePage()}</main>
      </div>

      {/* Desktop Floating Glassmorphic Dock */}
      <DesktopDock />

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
