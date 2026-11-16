import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Share2,
  Phone,
  Clock,
  MessageSquare,
  Send,
  Check,
  Maximize2,
  X,
  Pencil,
  Save,
  Navigation,
  Loader2,
  Camera,
  AlertCircle,
} from 'lucide-react';
import { PersonReport, ReportStatus, SightingNote } from '../types';
import {
  formatDetailedReportDate,
  generateWhatsAppShareUrl,
} from '../utils/storage';
import {
  addSightingNoteInDb,
  subscribeToReportNotes,
  updateReportDetailsInDb,
  updateReportStatusInDb,
} from '../services/reportsDb';
import { compressImageToDataUrl } from '../utils/image';
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
  const [notes, setNotes] = useState<SightingNote[]>(report.notes || []);
  const [actionError, setActionError] = useState<string | null>(null);

  // Edit Details Mode State
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [editNameOrAlias, setEditNameOrAlias] = useState(report.nameOrAlias);
  const [editApproxAge, setEditApproxAge] = useState(report.approxAge ? String(report.approxAge) : '');
  const [editGender, setEditGender] = useState<PersonReport['gender']>(report.gender);
  const [editDocumentId, setEditDocumentId] = useState(report.documentId || '');
  const [editMarksAndClothing, setEditMarksAndClothing] = useState(report.marksAndClothing);
  const [editLanguagesSpoken, setEditLanguagesSpoken] = useState(report.languagesSpoken);
  const [editCityDistrict, setEditCityDistrict] = useState(report.cityDistrict);
  const [editExactSpot, setEditExactSpot] = useState(report.exactSpot);
  const [editLatitude, setEditLatitude] = useState(report.latitude);
  const [editLongitude, setEditLongitude] = useState(report.longitude);
  const [editGpsAccuracy, setEditGpsAccuracy] = useState<number | undefined>(report.gpsAccuracy);
  const [editReporterPhone, setEditReporterPhone] = useState(report.reporterPhone);
  const [editReporterName, setEditReporterName] = useState(report.reporterName || '');
  const [editPhotoUrl, setEditPhotoUrl] = useState(report.photoUrl);
  const [editStatus, setEditStatus] = useState<ReportStatus>(report.status);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Sync edit fields when switching to another report
  useEffect(() => {
    setEditNameOrAlias(report.nameOrAlias);
    setEditApproxAge(report.approxAge ? String(report.approxAge) : '');
    setEditGender(report.gender);
    setEditDocumentId(report.documentId || '');
    setEditMarksAndClothing(report.marksAndClothing);
    setEditLanguagesSpoken(report.languagesSpoken);
    setEditCityDistrict(report.cityDistrict);
    setEditExactSpot(report.exactSpot);
    setEditLatitude(report.latitude);
    setEditLongitude(report.longitude);
    setEditGpsAccuracy(report.gpsAccuracy);
    setEditReporterPhone(report.reporterPhone);
    setEditReporterName(report.reporterName || '');
    setEditPhotoUrl(report.photoUrl);
    setEditStatus(report.status);
  }, [report]);

  // Subscribe to real-time Firestore sighting notes subcollection
  useEffect(() => {
    const unsubscribe = subscribeToReportNotes(
      report.id,
      (liveNotes) => {
        setNotes(liveNotes);
      },
      (err) => {
        console.warn('Unable to stream sighting notes:', err);
      }
    );
    return () => unsubscribe();
  }, [report.id]);

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
      } catch {
        // Fallback to copy
      }
    }

    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleToggleStatus = async () => {
    setStatusUpdating(true);
    setActionError(null);
    const newStatus: ReportStatus = report.status === 'UNRESOLVED' ? 'REUNITED' : 'UNRESOLVED';
    try {
      await updateReportStatusInDb(report.id, newStatus);
      onReportUpdated({ ...report, status: newStatus });
    } catch (err) {
      console.error('Failed to update status in database:', err);
      setActionError('Failed to update status in the database. Please try again.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsSubmittingNote(true);
    setActionError(null);
    try {
      const currentCount = Math.max(report.notesCount ?? 0, notes.length);
      await addSightingNoteInDb(
        report.id,
        currentCount,
        newNoteText.trim(),
        newNoteReporter.trim() || 'Community Member'
      );
      setNewNoteText('');
      setNewNoteReporter('');
    } catch (err) {
      console.error('Failed to post sighting note:', err);
      setActionError('Failed to save sighting update to the database. Please try again.');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleEditPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActionError(null);
    try {
      const compressed = await compressImageToDataUrl(file);
      setEditPhotoUrl(compressed);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to process selected photo.');
    }
  };

  const handleRecaptureGps = () => {
    if (!navigator.geolocation) {
      setActionError('Geolocation is not supported on this device.');
      return;
    }
    setIsCapturingGps(true);
    setActionError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setEditLatitude(position.coords.latitude);
        setEditLongitude(position.coords.longitude);
        setEditGpsAccuracy(Math.round(position.coords.accuracy));
        setIsCapturingGps(false);
      },
      () => {
        setActionError('Unable to retrieve GPS signal. You can still edit the landmark or coordinates manually.');
        setIsCapturingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    if (!editCityDistrict.trim() || !editExactSpot.trim() || editReporterPhone.trim().length < 5) {
      setActionError('City/District, Exact Spot, and a valid Reporter Phone (5+ characters) are required.');
      return;
    }

    setIsSavingDetails(true);
    const parsedAge = editApproxAge.trim() ? parseInt(editApproxAge.trim(), 10) : 0;
    const safeAge = Number.isFinite(parsedAge) ? Math.min(120, Math.max(0, parsedAge)) : 0;

    const updates = {
      nameOrAlias: editNameOrAlias.trim() || 'Unknown',
      approxAge: safeAge,
      gender: editGender,
      documentId: editDocumentId.trim(),
      marksAndClothing: editMarksAndClothing.trim() || 'No specific marks reported',
      languagesSpoken: editLanguagesSpoken.trim() || 'Unknown / Non-verbal',
      cityDistrict: editCityDistrict.trim(),
      exactSpot: editExactSpot.trim(),
      latitude: Number.isFinite(editLatitude) ? editLatitude : report.latitude,
      longitude: Number.isFinite(editLongitude) ? editLongitude : report.longitude,
      gpsAccuracy: editGpsAccuracy,
      reporterPhone: editReporterPhone.trim(),
      reporterName: editReporterName.trim() || 'Concerned Citizen',
      photoUrl: editPhotoUrl || report.photoUrl,
      status: editStatus,
    };

    try {
      await updateReportDetailsInDb(report.id, updates);
      onReportUpdated({
        ...report,
        ...updates,
        documentId: updates.documentId || undefined,
      });
      setIsEditingDetails(false);
    } catch (err) {
      console.error('Failed to update reported details:', err);
      setActionError('Could not update reported details in the database. Please check your connection and try again.');
    } finally {
      setIsSavingDetails(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <button
          id="profile-back-button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-sm sm:text-base font-mono font-bold text-slate-900 tracking-wide truncate">
          File Details: <span className="text-emerald-700">{report.trackingCode}</span>
        </h1>

        <div className="flex items-center gap-1.5">
          <button
            id="edit-report-details-button"
            type="button"
            onClick={() => {
              setActionError(null);
              setIsEditingDetails((prev) => !prev);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors border border-slate-200"
            title="Edit Reported Details"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEditingDetails ? 'Cancel' : 'Edit'}</span>
          </button>

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
      </div>

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Inline Edit Reported Details Form */}
      {isEditingDetails && (
        <form
          onSubmit={handleSaveDetails}
          className="bg-white rounded-2xl border-2 border-emerald-500 shadow-sm p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Pencil className="w-3.5 h-3.5" />
              Update All Reported Details in Database
            </h2>
            <button
              type="button"
              onClick={() => setIsEditingDetails(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Close
            </button>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={editPhotoUrl}
              alt={editNameOrAlias}
              className="w-20 h-24 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
            />
            <div className="space-y-2">
              <input
                type="file"
                ref={editFileInputRef}
                onChange={handleEditPhotoSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => editFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Update Photo</span>
              </button>
              <p className="text-[11px] text-slate-500">
                Photos are automatically compressed for cloud sync.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Name / Alias</label>
              <input
                type="text"
                value={editNameOrAlias}
                onChange={(e) => setEditNameOrAlias(e.target.value)}
                maxLength={120}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">ID / Document / Token</label>
              <input
                type="text"
                value={editDocumentId}
                onChange={(e) => setEditDocumentId(e.target.value)}
                maxLength={80}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Approx Age</label>
              <input
                type="number"
                min={0}
                max={120}
                value={editApproxAge}
                onChange={(e) => setEditApproxAge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Gender</label>
              <select
                value={editGender}
                onChange={(e) => setEditGender(e.target.value as PersonReport['gender'])}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as ReportStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              >
                <option value="UNRESOLVED">UNRESOLVED</option>
                <option value="REUNITED">REUNITED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Languages Spoken</label>
              <input
                type="text"
                value={editLanguagesSpoken}
                onChange={(e) => setEditLanguagesSpoken(e.target.value)}
                maxLength={200}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Visible Marks & Clothing</label>
            <textarea
              rows={2}
              value={editMarksAndClothing}
              onChange={(e) => setEditMarksAndClothing(e.target.value)}
              maxLength={1000}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">City / District *</label>
              <input
                type="text"
                required
                value={editCityDistrict}
                onChange={(e) => setEditCityDistrict(e.target.value)}
                maxLength={120}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Exact Spot / Landmark *</label>
              <input
                type="text"
                required
                value={editExactSpot}
                onChange={(e) => setEditExactSpot(e.target.value)}
                maxLength={300}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-700">
                GPS: {editLatitude.toFixed(4)}°, {editLongitude.toFixed(4)}°
                {editGpsAccuracy ? ` (±${editGpsAccuracy}m)` : ''}
              </span>
              <button
                type="button"
                onClick={handleRecaptureGps}
                disabled={isCapturingGps}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
              >
                {isCapturingGps ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Update GPS to Current Location</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Reporter Mobile *</label>
              <input
                type="tel"
                required
                value={editReporterPhone}
                onChange={(e) => setEditReporterPhone(e.target.value)}
                maxLength={30}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Reporter Name</label>
              <input
                type="text"
                value={editReporterName}
                onChange={(e) => setEditReporterName(e.target.value)}
                maxLength={120}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingDetails(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              id="save-updated-details-button"
              type="submit"
              disabled={isSavingDetails}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
            >
              {isSavingDetails ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Updated Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* FULL SCREEN PHOTO container */}
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

        {/* Name, Status & Age Bar */}
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
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2 disabled:opacity-50"
                title="Update Resolution Status"
              >
                {statusUpdating
                  ? 'Updating...'
                  : `Mark as ${report.status === 'UNRESOLVED' ? 'Reunited' : 'Unresolved'}`}
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

        {/* PHYSICAL ATTRIBUTES */}
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

        {/* REPORTED LOCATION */}
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

        {/* GOOGLE MAP EXACT PINPOINT */}
        <div className="p-5 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              GOOGLE MAP EXACT PINPOINT
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              {report.latitude.toFixed(4)}° N, {report.longitude.toFixed(4)}° E
            </span>
          </div>

          <MapPinpoint
            latitude={report.latitude}
            longitude={report.longitude}
            landmark={report.exactSpot}
            nameOrAlias={report.nameOrAlias}
            accuracy={report.gpsAccuracy}
          />
        </div>

        {/* REPORTER ACTION */}
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
            <a
              id="call-reporter-button"
              href={`tel:${report.reporterPhone.replace(/\s+/g, '')}`}
              className="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm uppercase tracking-wider transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>CALL REPORTER DIRECTLY</span>
            </a>

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
            {notes.length} updates
          </span>
        </div>

        {/* New Note Form */}
        <form onSubmit={handleAddNote} className="space-y-2.5">
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Add update (e.g. 'Seen resting near Platform 2 tea stall', 'Food provided', 'Spoke to RPF officer on duty')..."
            rows={2}
            maxLength={1000}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            <input
              type="text"
              value={newNoteReporter}
              onChange={(e) => setNewNoteReporter(e.target.value)}
              placeholder="Your name or affiliation (e.g., Volunteer Amit)"
              maxLength={120}
              className="w-full sm:w-64 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
            />
            <button
              type="submit"
              disabled={isSubmittingNote || !newNoteText.trim()}
              className="w-full sm:w-auto px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingNote ? 'Saving...' : 'Post Update'}</span>
            </button>
          </div>
        </form>

        {/* Existing notes list */}
        {notes.length > 0 && (
          <div className="space-y-2.5 pt-2">
            {notes.map((note) => (
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
