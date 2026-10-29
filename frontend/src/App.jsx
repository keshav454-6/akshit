import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DownloadModal from './components/DownloadModal';
import InstallModal from './components/InstallModal';
import ShareModal from './components/ShareModal';

// Views
import DashboardView from './views/DashboardView';
import ScamDetectorView from './views/ScamDetectorView';
import PaymentDetectorView from './views/PaymentDetectorView';
import ImpersonationView from './views/ImpersonationView';
import UrlAnalyzerView from './views/UrlAnalyzerView';
import LeakLockView from './views/LeakLockView';
import PermissionLensView from './views/PermissionLensView';
import VoiceCloneView from './views/VoiceCloneView';
import SessionLabView from './views/SessionLabView';
import IncidentHubView from './views/IncidentHubView';
import DemoCenterView from './views/DemoCenterView';
import MethodologyView from './views/MethodologyView';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchGlobal, setSearchGlobal] = useState('');
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView setTab={setCurrentTab} setIsDownloadOpen={setIsDownloadOpen} setIsInstallOpen={setIsInstallOpen} setIsShareOpen={setIsShareOpen} />;
      case 'scam':
        return <ScamDetectorView />;
      case 'payment':
        return <PaymentDetectorView />;
      case 'impersonation':
        return <ImpersonationView />;
      case 'url':
        return <UrlAnalyzerView />;
      case 'leak':
        return <LeakLockView />;
      case 'permission':
        return <PermissionLensView />;
      case 'voice':
        return <VoiceCloneView />;
      case 'session':
        return <SessionLabView />;
      case 'incidents':
        return <IncidentHubView />;
      case 'demo':
        return <DemoCenterView setTab={setCurrentTab} />;
      case 'methodology':
        return <MethodologyView />;
      default:
        return <DashboardView setTab={setCurrentTab} setIsDownloadOpen={setIsDownloadOpen} />;
    }
  };

  return (
    <div className="app-container">
      {/* Responsive Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setTab={setCurrentTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        setIsDownloadOpen={setIsDownloadOpen}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          currentTab={currentTab}
          setTab={setCurrentTab}
          setIsOpen={setIsSidebarOpen}
          searchGlobal={searchGlobal}
          setSearchGlobal={setSearchGlobal}
          setIsDownloadOpen={setIsDownloadOpen}
          setIsInstallOpen={setIsInstallOpen}
          setIsShareOpen={setIsShareOpen}
        />

        <main className="content-body">
          {renderActiveView()}
        </main>
      </div>

      {/* Download in System Modal */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />

      {/* Install App Modal */}
      <InstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Share App Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
