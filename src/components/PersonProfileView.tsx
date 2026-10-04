import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  Maximize2, 
  X,
  ExternalLink,
  HeartHandshake
} from 'lucide-react';
import { PersonReport } from '../types';
import { 
  formatDetailedReportDate, 
  generateWhatsAppShareUrl, 
  updateReportStatus, 
  addSightingNote 
} from '../utils/storage';
import { MapPinpoint } from './MapPinpoint';

interface PersonProfileViewProps {
  report: PersonReport;
  onBack: () => void;
  onReportUpdated: (updatedReport: PersonReport) => void;
}

export const PersonProfileView: React.FC<PersonProfileViewProps> = ({
  report,
  onBack,
  onReportUpdated,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteReporter, setNewNoteReporter] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const whatsAppUrl = generateWhatsAppShareUrl(report);

  const handleShare = async () => {
    const shareData = {
      title: `Lost / Found Person Alert: ${report.trackingCode}`,
      text: `Urgent: Help reconnect ${report.nameOrAlias} (${report.approxAge ? `~${report.approxAge} yrs` : 'Unknown age'}). Spotted at ${report.exactSpot}, ${report.cityDistrict}. Tracking Code: ${report.trackingCode}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to copy
      }
    }

    // Fallback: Copy link
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleToggleStatus = () => {
    setStatusUpdating(true);
    const newStatus = report.status === 'UNRESOLVED' ? 'REUNITED' : 'UNRESOLVED';
    const updated = updateReportStatus(report.trackingCode, newStatus);
    if (updated) {
      onReportUpdated(updated);
    }
    setStatusUpdating(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsSubmittingNote(true);
    const updated = addSightingNote(
      report.trackingCode,
      newNoteText.trim(),
      newNoteReporter.trim() || 'Community Member'
    );
    if (updated) {
      onReportUpdated(updated);
      setNewNoteText('');
      setNewNoteReporter('');
    }
    setIsSubmittingNote(false);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-150">
      {/* Header bar matching wireframe Screen 4: [< Back] File Details: TRK-58210 [Share] */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          id="profile-back-button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-sm sm:text-base font-mono font-bold text-slate-900 tracking-wide">
          File Details: <span className="text-emerald-700">{report.trackingCode}</span>
        </h1>

        <button
          id="profile-share-button"
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors border border-emerald-200"
          title="Share File Link"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* FULL SCREEN PHOTO container matching wireframe */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div 
          onClick={() => setShowPhotoModal(true)}
          className="relative w-full h-72 sm:h-96 bg-slate-950 cursor-pointer group flex items-center justify-center overflow-hidden"
        >
          <img
            src={report.photoUrl}
            alt={report.nameOrAlias}
            className="w-full h-full object-contain sm:object-cover group-hover:scale-102 transition-transform duration-300"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Expand badge */}
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Tap to View Full Photo</span>
          </div>
        </div>

        {/* Name, Status & Age Bar matching wireframe Screen 4 */}
        <div className="p-5 border-b border-slate-100 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {report.nameOrAlias}
            </h2>

            {/* Status Badge with toggle capability */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs ${
                  report.status === 'REUNITED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                [{report.status}]
              </span>

              <button
                onClick={handleToggleStatus}
                disabled={statusUpdating}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2"
                title="Update Resolution Status"
              >
                Mark as {report.status === 'UNRESOLVED' ? 'Reunited' : 'Unresolved'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
            <span>Age: {report.approxAge ? `~${report.approxAge} yrs` : 'Unknown'}</span>
            <span>•</span>
            <span>Gender: {report.gender}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Reported: {formatDetailedReportDate(report.reportedAt)}
            </span>
          </div>
        </div>

        {/* PHYSICAL ATTRIBUTES matching wireframe Screen 4 */}
        <div className="p-5 border-b border-slate-100 space-y-3 bg-slate-50/50">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            PHYSICAL ATTRIBUTES
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-bold">•</span>
              <div>
                <strong className="text-slate-900">Govt / Token ID:</strong>{' '}
                <span className="font-mono">{report.documentId || 'None reported'}</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-bold">•</span>
              <div>
                <strong className="text-slate-900">Visible Marks & Clothing:</strong>{' '}
                <span>{report.marksAndClothing || 'No specific marks reported'}</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-bold">•</span>
              <div>
                <strong className="text-slate-900">Spoken Language / Communication:</strong>{' '}
                <span>{report.languagesSpoken || 'Not specified'}</span>
              </div>
            </li>
          </ul>
        </div>

        {/* REPORTED LOCATION matching wireframe Screen 4 */}
        <div className="p-5 border-b border-slate-100 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            REPORTED LOCATION
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-bold">•</span>
              <div>
                <strong className="text-slate-900">City / District:</strong>{' '}
                <span>{report.cityDistrict}</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-bold">•</span>
              <div>
                <strong className="text-slate-900">Landmark / Spot:</strong>{' '}
                <span className="font-semibold text-slate-900">{report.exactSpot}</span>
              </div>
            </li>
          </ul>
        </div>

        {/* GOOGLE MAP EXACT PINPOINT matching wireframe Screen 4 */}
        <div className="p-5 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              GOOGLE MAP EXACT PINPOINT
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              {report.latitude.toFixed(4)}° N, {report.longitude.toFixed(4)}° E
            </span>
          </div>

          {/* Interactive Leaflet Map with directions button */}
          <MapPinpoint
            latitude={report.latitude}
            longitude={report.longitude}
            landmark={report.exactSpot}
            nameOrAlias={report.nameOrAlias}
            accuracy={report.gpsAccuracy}
          />
        </div>

        {/* REPORTER ACTION matching wireframe Screen 4 */}
        <div className="p-5 space-y-3.5 bg-slate-50">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              REPORTER ACTION
            </h3>
            <p className="text-xs text-slate-600">
              Reporter Phone:{' '}
              <strong className="font-mono text-slate-900 text-sm">{report.reporterPhone}</strong>
              {report.reporterName && ` (${report.reporterName})`}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CALL REPORTER DIRECTLY matching wireframe Screen 4 */}
            <a
              id="call-reporter-button"
              href={`tel:${report.reporterPhone.replace(/\s+/g, '')}`}
              className="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm uppercase tracking-wider transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>CALL REPORTER DIRECTLY</span>
            </a>

            {/* SHARE PROFILE ON WHATSAPP matching wireframe Screen 4 */}
            <a
              id="whatsapp-share-button"
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] active:bg-[#169C4B] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm uppercase tracking-wider transition-all"
            >
              <span className="text-base font-bold">💬</span>
              <span>SHARE PROFILE ON WHATSAPP</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sighting Updates & Community Notes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>Community Sighting Log & Status Notes</span>
          </h3>
          <span className="text-xs text-slate-400">
            {report.notes?.length || 0} updates
          </span>
        </div>

        {/* New Note Form */}
        <form onSubmit={handleAddNote} className="space-y-2.5">
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Add update (e.g. 'Seen resting near Platform 2 tea stall', 'Food provided', 'Spoke to RPF officer on duty')..."
            rows={2}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            <input
              type="text"
              value={newNoteReporter}
              onChange={(e) => setNewNoteReporter(e.target.value)}
              placeholder="Your name or affiliation (e.g., Volunteer Amit)"
              className="w-full sm:w-64 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
            />
            <button
              type="submit"
              disabled={isSubmittingNote || !newNoteText.trim()}
              className="w-full sm:w-auto px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Update</span>
            </button>
          </div>
        </form>

        {/* Existing notes list */}
        {report.notes && report.notes.length > 0 && (
          <div className="space-y-2.5 pt-2">
            {report.notes.map((note) => (
              <div key={note.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{note.reporter}</span>
                  <span>{formatDetailedReportDate(note.timestamp)}</span>
                </div>
                <p className="text-slate-800 leading-relaxed">{note.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Photo Modal */}
      {showPhotoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={report.photoUrl}
              alt={report.nameOrAlias}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/20"
            />
            <p className="text-white text-xs font-medium mt-3 text-center">
              {report.nameOrAlias} • Code: {report.trackingCode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
