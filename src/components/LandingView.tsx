import React, { useState } from 'react';
import { PlusCircle, Search, Clock, MapPin, ChevronRight, UserPlus, FileSearch, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PersonReport } from '../types';
import { formatTimeAgo } from '../utils/storage';

interface LandingViewProps {
  reports: PersonReport[];
  onOpenReport: () => void;
  onOpenSearch: (initialQuery?: string) => void;
  onSelectReport: (trackingCode: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  reports,
  onOpenReport,
  onOpenSearch,
  onSelectReport,
}) => {
  const [quickCode, setQuickCode] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNRESOLVED' | 'REUNITED'>('ALL');

  const handleQuickLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickCode.trim()) {
      onOpenSearch(quickCode.trim());
    }
  };

  const filteredReports = reports.filter(r => {
    if (filterTab === 'UNRESOLVED') return r.status === 'UNRESOLVED';
    if (filterTab === 'REUNITED') return r.status === 'REUNITED';
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Hero Banner matching wireframe */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-lg border border-slate-800 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -top-8 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Community Aid Network</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
            HELP RECONNECT LOST PERSONS
          </h1>
          <p className="text-slate-300 text-sm mt-1.5 leading-relaxed font-normal">
            Free public community directory. No account required.
          </p>

          {/* Quick inline code lookup for urgent cases */}
          <form onSubmit={handleQuickLookup} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="quick-tracking-code-input"
                type="text"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value)}
                placeholder="Enter Code (e.g., TRK-58210) or Aadhaar..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800/90 text-white placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
              />
            </div>
            <button
              id="quick-lookup-button"
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shrink-0 shadow-sm"
            >
              Lookup
            </button>
          </form>
        </div>
      </div>

      {/* Primary Action Buttons matching wireframe Screen 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Button 1: Report */}
        <button
          id="hero-report-button"
          onClick={onOpenReport}
          className="p-5 rounded-2xl bg-white border-2 border-emerald-500/80 hover:border-emerald-600 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4 group active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-emerald-100 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
              <span>REPORT A LOST / FOUND PERSON</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-normal">
              Takes ~1 minute. Upload photo, spot, and GPS.
            </p>
          </div>
        </button>

        {/* Button 2: Search */}
        <button
          id="hero-search-button"
          onClick={() => onOpenSearch()}
          className="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-400 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4 group active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-slate-200 transition-transform">
            <Search className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-slate-950 transition-colors flex items-center gap-1.5">
              <span>SEARCH DIRECTORY</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-normal">
              Search by ID card, tracking code, or city.
            </p>
          </div>
        </button>
      </div>

      {/* Section: Recent Sightings & Reports matching wireframe */}
      <div className="space-y-3.5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
              RECENT SIGHTINGS & REPORTS
            </h2>
            <p className="text-xs text-slate-500">
              Showing active reports from transit hubs, hospitals, and public shelters
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setFilterTab('UNRESOLVED')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filterTab === 'UNRESOLVED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
              Unresolved ({reports.filter(r => r.status === 'UNRESOLVED').length})
            </button>
            <button
              onClick={() => setFilterTab('REUNITED')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filterTab === 'REUNITED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Reunited ({reports.filter(r => r.status === 'REUNITED').length})
            </button>
          </div>
        </div>

        {/* List of Report Cards matching ASCII Screen 1 */}
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              id={`report-card-${report.trackingCode}`}
              onClick={() => onSelectReport(report.trackingCode)}
              className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-3.5 sm:items-center cursor-pointer group"
            >
              {/* Photo Thumbnail */}
              <div className="relative w-full sm:w-24 h-40 sm:h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <img
                  src={report.photoUrl}
                  alt={report.nameOrAlias}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback if image load fails
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=60';
                  }}
                />
                <span
                  className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider ${
                    report.status === 'REUNITED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {report.status}
                </span>
              </div>

              {/* Details Matching Wireframe Screen 1 */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                    {report.nameOrAlias} {report.approxAge ? `(Approx ${report.approxAge} yrs)` : ''}
                    {report.languagesSpoken && (
                      <span className="font-normal text-slate-600 text-xs ml-1.5">
                        • Speaks {report.languagesSpoken.split(',')[0]}
                      </span>
                    )}
                  </h3>
                </div>

                {/* Spot */}
                <div className="flex items-center gap-1 text-slate-600 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{report.exactSpot}</span>
                </div>

                {/* Code & Timestamp */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                  <span className="font-mono font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                    Code: {report.trackingCode}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatTimeAgo(report.reportedAt)}
                  </span>
                </div>
              </div>

              {/* View Details Action Button */}
              <div className="sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex items-center justify-end">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800 bg-emerald-50 group-hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors">
                  View Details
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="text-center py-10 bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-sm font-medium text-slate-600">No reports found in this category.</p>
              <button
                onClick={() => setFilterTab('ALL')}
                className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
              >
                Show all reports
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
