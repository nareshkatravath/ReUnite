import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InfoModal } from './components/InfoModal';
import { LandingView } from './components/LandingView';
import { ReportFormView } from './components/ReportFormView';
import { SearchView } from './components/SearchView';
import { PersonProfileView } from './components/PersonProfileView';
import { ActiveScreen, PersonReport } from './types';
import { getStoredReports, addReport, updateReportStatus } from './utils/storage';
import { HeartHandshake, PhoneCall, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [reports, setReports] = useState<PersonReport[]>(() => getStoredReports());
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>({ type: 'landing' });
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (!hash) {
        setActiveScreen({ type: 'landing' });
      } else if (hash === 'report') {
        setActiveScreen({ type: 'report' });
      } else if (hash.startsWith('search')) {
        const query = new URLSearchParams(hash.split('?')[1] || '').get('q') || '';
        setActiveScreen({ type: 'search', initialQuery: query });
      } else if (hash.startsWith('TRK-') || hash.startsWith('trk-')) {
        setActiveScreen({ type: 'profile', trackingCode: hash.toUpperCase() });
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (screen: ActiveScreen) => {
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (screen.type === 'landing') {
      window.location.hash = '';
    } else if (screen.type === 'report') {
      window.location.hash = 'report';
    } else if (screen.type === 'search') {
      window.location.hash = screen.initialQuery ? `search?q=${encodeURIComponent(screen.initialQuery)}` : 'search';
    } else if (screen.type === 'profile') {
      window.location.hash = screen.trackingCode;
    }
  };

  const handleCreateReport = (newReport: PersonReport) => {
    addReport(newReport);
    setReports(getStoredReports());
    
    // Show celebratory toast
    setToastMessage({
      title: `Report Logged: ${newReport.trackingCode}`,
      desc: 'GPS pinpoint and details saved to community directory. Forward profile to WhatsApp groups.'
    });
    setTimeout(() => setToastMessage(null), 6000);

    // Navigate to profile
    navigateTo({ type: 'profile', trackingCode: newReport.trackingCode });
  };

  const handleReportUpdated = (updatedReport: PersonReport) => {
    setReports(getStoredReports());
  };

  // Find active profile if on profile screen
  const activeReport = 
    activeScreen.type === 'profile'
      ? reports.find(r => r.trackingCode.toUpperCase() === activeScreen.trackingCode.toUpperCase())
      : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navigation */}
      <Navbar
        onGoHome={() => navigateTo({ type: 'landing' })}
        onOpenInfo={() => setIsInfoOpen(true)}
        activeScreen={activeScreen.type}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="max-w-3xl mx-auto w-full px-4 pt-3">
          <div className="bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-start gap-3 border border-emerald-600 animate-in slide-in-from-top-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="font-bold text-emerald-100 text-sm">{toastMessage.title}</div>
              <div className="text-emerald-200 mt-0.5">{toastMessage.desc}</div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-300 hover:text-white font-bold text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-5">
        {/* Screen 1: Landing */}
        {activeScreen.type === 'landing' && (
          <LandingView
            reports={reports}
            onOpenReport={() => navigateTo({ type: 'report' })}
            onOpenSearch={(query) => navigateTo({ type: 'search', initialQuery: query })}
            onSelectReport={(code) => navigateTo({ type: 'profile', trackingCode: code })}
          />
        )}

        {/* Screen 2: Report Form */}
        {activeScreen.type === 'report' && (
          <ReportFormView
            onBack={() => navigateTo({ type: 'landing' })}
            onSubmitReport={handleCreateReport}
          />
        )}

        {/* Screen 3: Search Directory */}
        {activeScreen.type === 'search' && (
          <SearchView
            reports={reports}
            initialQuery={activeScreen.initialQuery}
            onBack={() => navigateTo({ type: 'landing' })}
            onSelectReport={(code) => navigateTo({ type: 'profile', trackingCode: code })}
          />
        )}

        {/* Screen 4: Person Profile */}
        {activeScreen.type === 'profile' && (
          activeReport ? (
            <PersonProfileView
              report={activeReport}
              onBack={() => navigateTo({ type: 'landing' })}
              onReportUpdated={handleReportUpdated}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Report Not Found</h2>
              <p className="text-xs text-slate-500">
                Could not find report matching code <span className="font-mono font-bold text-slate-800">{activeScreen.trackingCode}</span>.
              </p>
              <button
                onClick={() => navigateTo({ type: 'landing' })}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Return to Directory
              </button>
            </div>
          )
        )}
      </main>

      {/* Community Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-6 px-4 mt-auto">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white tracking-wide">ReuniteApp</span>
              <span>•</span>
              <span>Open Public Community Directory</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <button
                onClick={() => setIsInfoOpen(true)}
                className="hover:text-white transition-colors"
              >
                Emergency Helplines
              </button>
              <button
                onClick={() => navigateTo({ type: 'report' })}
                className="hover:text-white transition-colors"
              >
                Report Sighting
              </button>
              <button
                onClick={() => navigateTo({ type: 'search' })}
                className="hover:text-white transition-colors"
              >
                Search Directory
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 text-center sm:text-left leading-relaxed">
            Free community tool to assist families, transit staff, and good Samaritans in finding lost children, elderly seniors with memory loss, and disoriented individuals. For life-threatening emergencies, dial national helpline 112 immediately.
          </p>
        </div>
      </footer>

      {/* Info & Helpline Modal */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </div>
  );
}
