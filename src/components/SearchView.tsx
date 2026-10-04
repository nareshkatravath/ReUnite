import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  RotateCcw, 
  MapPin, 
  ChevronRight, 
  FileText, 
  Clock, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { PersonReport } from '../types';
import { formatTimeAgo } from '../utils/storage';

interface SearchViewProps {
  reports: PersonReport[];
  initialQuery?: string;
  onBack: () => void;
  onSelectReport: (trackingCode: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  reports,
  initialQuery = '',
  onBack,
  onSelectReport,
}) => {
  // Direct ID / Tracking code query
  const [directCodeQuery, setDirectCodeQuery] = useState(initialQuery);
  const [appliedDirectQuery, setAppliedDirectQuery] = useState(initialQuery);

  // Multi-attribute filter criteria
  const [filterCity, setFilterCity] = useState('');
  const [filterGender, setFilterGender] = useState('Any');
  const [filterAgeGroup, setFilterAgeGroup] = useState('Any');
  const [filterKeywords, setFilterKeywords] = useState('');

  // Track whether user is looking up by direct code or using filters
  const [activeSearchMode, setActiveSearchMode] = useState<'DIRECT' | 'FILTER'>(
    initialQuery ? 'DIRECT' : 'FILTER'
  );

  useEffect(() => {
    if (initialQuery) {
      setDirectCodeQuery(initialQuery);
      setAppliedDirectQuery(initialQuery);
      setActiveSearchMode('DIRECT');
    }
  }, [initialQuery]);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedDirectQuery(directCodeQuery.trim());
    setActiveSearchMode('DIRECT');
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearchMode('FILTER');
  };

  const handleResetFilters = () => {
    setFilterCity('');
    setFilterGender('Any');
    setFilterAgeGroup('Any');
    setFilterKeywords('');
    setDirectCodeQuery('');
    setAppliedDirectQuery('');
    setActiveSearchMode('FILTER');
  };

  // Filtered results calculation
  const searchResults = useMemo(() => {
    if (activeSearchMode === 'DIRECT' && appliedDirectQuery.trim()) {
      const q = appliedDirectQuery.trim().toLowerCase();
      return reports.filter((r) => {
        const codeMatch = r.trackingCode.toLowerCase().includes(q);
        const docMatch = r.documentId ? r.documentId.toLowerCase().includes(q) : false;
        const nameMatch = r.nameOrAlias.toLowerCase().includes(q);
        return codeMatch || docMatch || nameMatch;
      });
    }

    // Filter mode
    return reports.filter((r) => {
      // City filter
      if (filterCity.trim()) {
        const c = filterCity.trim().toLowerCase();
        const cityMatch = r.cityDistrict.toLowerCase().includes(c) || r.exactSpot.toLowerCase().includes(c);
        if (!cityMatch) return false;
      }

      // Gender filter
      if (filterGender !== 'Any') {
        if (r.gender.toLowerCase() !== filterGender.toLowerCase()) return false;
      }

      // Age Group filter
      if (filterAgeGroup !== 'Any') {
        const age = r.approxAge;
        if (filterAgeGroup === '0-12' && (age < 0 || age > 12)) return false;
        if (filterAgeGroup === '13-19' && (age < 13 || age > 19)) return false;
        if (filterAgeGroup === '20-39' && (age < 20 || age > 39)) return false;
        if (filterAgeGroup === '40-60' && (age < 40 || age > 60)) return false;
        if (filterAgeGroup === '60+' && age < 60) return false;
      }

      // Keywords filter (marks, clothes, language, alias)
      if (filterKeywords.trim()) {
        const kw = filterKeywords.trim().toLowerCase();
        const words = kw.split(/[\s,]+/).filter(Boolean);
        const combinedText = `${r.marksAndClothing} ${r.languagesSpoken} ${r.nameOrAlias} ${r.exactSpot}`.toLowerCase();
        const hasAnyWord = words.some((w) => combinedText.includes(w));
        if (!hasAnyWord) return false;
      }

      return true;
    });
  }, [
    reports, 
    activeSearchMode, 
    appliedDirectQuery, 
    filterCity, 
    filterGender, 
    filterAgeGroup, 
    filterKeywords
  ]);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-150">
      {/* Header bar matching wireframe */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            id="search-back-button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">
            Search Directory
          </h1>
        </div>

        <button
          onClick={handleResetFilters}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-100"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* SECTION 1: SEARCH BY ID OR TRACKING CODE matching wireframe */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
          SEARCH BY ID OR TRACKING CODE
        </label>
        
        <form onSubmit={handleLookupSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="search-direct-code-input"
              type="text"
              value={directCodeQuery}
              onChange={(e) => setDirectCodeQuery(e.target.value)}
              placeholder="Enter ID no. or Code (e.g. TRK-58210)"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
          <button
            id="search-lookup-button"
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs sm:text-sm rounded-xl tracking-wider transition-colors shrink-0 shadow-sm uppercase"
          >
            LOOKUP
          </button>
        </form>

        {activeSearchMode === 'DIRECT' && appliedDirectQuery && (
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span>
              Searching for: <strong className="text-slate-900 font-mono">{appliedDirectQuery}</strong>
            </span>
            <button
              onClick={() => {
                setDirectCodeQuery('');
                setAppliedDirectQuery('');
                setActiveSearchMode('FILTER');
              }}
              className="text-rose-600 font-semibold hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: OR FILTER divider matching wireframe */}
      <div className="relative flex items-center justify-center my-1">
        <div className="border-t-2 border-dashed border-slate-200 w-full" />
        <span className="bg-slate-50 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase shrink-0">
          OR FILTER
        </span>
      </div>

      {/* Filter Form matching wireframe Screen 3 */}
      <form onSubmit={handleApplyFilters} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* City / District */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            City / District
          </label>
          <input
            id="filter-city-input"
            type="text"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            placeholder="Hyderabad"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {/* Gender and Age Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Gender
            </label>
            <select
              id="filter-gender-select"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="Any">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Age Group
            </label>
            <select
              id="filter-age-group-select"
              value={filterAgeGroup}
              onChange={(e) => setFilterAgeGroup(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="Any">Any</option>
              <option value="0-12">Child (0 to 12 yrs)</option>
              <option value="13-19">Teenager (13 to 19 yrs)</option>
              <option value="20-39">Adult (20 to 39 yrs)</option>
              <option value="40-60">40 to 60 yrs</option>
              <option value="60+">Senior / Elderly (60+ yrs)</option>
            </select>
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Keywords (Marks, Clothes, Language)
          </label>
          <input
            id="filter-keywords-input"
            type="text"
            value={filterKeywords}
            onChange={(e) => setFilterKeywords(e.target.value)}
            placeholder="e.g., scar, black jacket, Telugu"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {/* Apply Filters Button matching wireframe Screen 3 */}
        <button
          id="apply-filters-button"
          type="submit"
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
        >
          <Filter className="w-4 h-4" />
          <span>APPLY FILTERS</span>
        </button>
      </form>

      {/* SECTION 3: SEARCH RESULTS matching wireframe Screen 3 */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-900">
            SEARCH RESULTS ({searchResults.length} {searchResults.length === 1 ? 'Match' : 'Matches'} Found)
          </h2>
          {(filterCity || filterGender !== 'Any' || filterAgeGroup !== 'Any' || filterKeywords || appliedDirectQuery) && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Filtered
            </span>
          )}
        </div>

        {/* Search Results Cards matching wireframe */}
        <div className="space-y-3">
          {searchResults.map((report) => (
            <div
              key={report.id}
              id={`search-result-${report.trackingCode}`}
              onClick={() => onSelectReport(report.trackingCode)}
              className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 sm:items-center cursor-pointer group"
            >
              {/* Photo Thumbnail */}
              <div className="w-full sm:w-28 h-40 sm:h-28 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                <img
                  src={report.photoUrl}
                  alt={report.nameOrAlias}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider ${
                    report.status === 'REUNITED' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {report.status}
                </span>
              </div>

              {/* Attributes matching wireframe Screen 3 */}
              <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                  {report.nameOrAlias} {report.approxAge ? `(~${report.approxAge} yrs)` : ''}
                </h3>

                <div className="text-slate-600 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{report.exactSpot}</span>
                </div>

                <div className="text-slate-500 font-mono text-[11px] flex flex-wrap items-center gap-2">
                  <span>ID: {report.documentId || 'None'}</span>
                  <span>|</span>
                  <span className="font-bold text-slate-800">Code: {report.trackingCode}</span>
                </div>

                <div className="text-slate-600 line-clamp-1">
                  <strong className="text-slate-700">Marks:</strong> {report.marksAndClothing}
                </div>
              </div>

              {/* Action matching wireframe: [Open Full File & Map ->] */}
              <div className="sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs group-hover:bg-emerald-700 transition-colors"
                >
                  <span>Open Full File & Map</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {searchResults.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-800">No matching persons found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your search filters, checking spelling, or clearing the tracking code lookup.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
