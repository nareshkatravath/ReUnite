import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  FileText, 
  User, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { PersonReport } from '../types';
import { generateTrackingCode } from '../utils/storage';

interface ReportFormViewProps {
  onBack: () => void;
  onSubmitReport: (newReport: PersonReport) => void;
}

export const ReportFormView: React.FC<ReportFormViewProps> = ({
  onBack,
  onSubmitReport,
}) => {
  // Form State
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [documentId, setDocumentId] = useState<string>('');
  const [nameOrAlias, setNameOrAlias] = useState<string>('');
  const [approxAge, setApproxAge] = useState<string>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Unknown'>('Male');
  const [marksAndClothing, setMarksAndClothing] = useState<string>('');
  const [languagesSpoken, setLanguagesSpoken] = useState<string>('');
  
  // Location & GPS State
  const [latitude, setLatitude] = useState<number>(17.4399);
  const [longitude, setLongitude] = useState<number>(78.4983);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(4);
  const [gpsCaptured, setGpsCaptured] = useState<boolean>(true);
  const [isCapturingGps, setIsCapturingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  
  const [cityDistrict, setCityDistrict] = useState<string>('Hyderabad');
  const [exactSpot, setExactSpot] = useState<string>('');
  
  // Reporter Contact
  const [reporterPhone, setReporterPhone] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  
  // UI Validation
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo Upload / Capture
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample quick photos helper for ease of demo/testing
  const setSamplePhoto = (url: string) => {
    setPhotoUrl(url);
  };

  // Capture GPS Location
  const handleCaptureGps = () => {
    setIsCapturingGps(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser. Default coordinates used.');
      setIsCapturingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGpsAccuracy(Math.round(position.coords.accuracy));
        setGpsCaptured(true);
        setIsCapturingGps(false);
      },
      (error) => {
        console.warn('GPS capture error:', error);
        // Retain default or previous coordinates with informative notice
        setGpsError(
          error.code === 1
            ? 'Location permission denied. You can manually adjust coordinates or landmark.'
            : 'Unable to retrieve precise GPS signal. Approximate coordinates recorded.'
        );
        setIsCapturingGps(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!exactSpot.trim()) {
      setErrorMsg('Please specify the Exact Spot / Landmark / Shelter.');
      return;
    }
    if (!cityDistrict.trim()) {
      setErrorMsg('Please enter the City / District.');
      return;
    }
    if (!reporterPhone.trim()) {
      setErrorMsg('Please provide a Reporter Mobile Number for searchers/authorities to contact.');
      return;
    }

    setIsSubmitting(true);

    const generatedCode = generateTrackingCode();
    const finalName = nameOrAlias.trim() || 'Unknown';
    const finalPhoto = photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80';

    const newReport: PersonReport = {
      id: 'rep-' + Date.now(),
      trackingCode: generatedCode,
      nameOrAlias: finalName,
      approxAge: approxAge ? parseInt(approxAge, 10) : 0,
      gender,
      documentId: documentId.trim() || undefined,
      marksAndClothing: marksAndClothing.trim() || 'No specific marks reported',
      languagesSpoken: languagesSpoken.trim() || 'Unknown / Non-verbal',
      cityDistrict: cityDistrict.trim(),
      exactSpot: exactSpot.trim(),
      latitude,
      longitude,
      gpsAccuracy: gpsAccuracy || undefined,
      reporterPhone: reporterPhone.trim(),
      reporterName: reporterName.trim() || 'Concerned Citizen',
      photoUrl: finalPhoto,
      reportedAt: new Date().toISOString(),
      status: 'UNRESOLVED',
      notes: [
        {
          id: 'n-init-' + Date.now(),
          text: `Report created by ${reporterName.trim() || 'Reporter'}. Sighting location logged at ${exactSpot.trim()}.`,
          timestamp: new Date().toISOString(),
          reporter: reporterName.trim() || 'Reporter'
        }
      ]
    };

    setTimeout(() => {
      onSubmitReport(newReport);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-150">
      {/* Header bar matching wireframe */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <button
          id="report-back-button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-base sm:text-lg font-bold text-slate-900">
          Report Lost / Found Person
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload Area matching wireframe Screen 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {photoUrl ? (
            <div className="space-y-3">
              <div className="relative mx-auto w-40 h-48 sm:w-48 sm:h-56 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md">
                <img
                  src={photoUrl}
                  alt="Captured Person"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] px-2 py-0.5 rounded-md backdrop-blur-xs font-semibold"
                >
                  Change
                </button>
              </div>
              <p className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Photo ready for submission
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                id="camera-add-photo-button"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-36 h-36 mx-auto rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-2 group transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-600 group-hover:text-emerald-600 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  [+] Camera
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Add Photo</div>
              </button>

              <p className="text-xs text-slate-500">
                (Clear face/body photo if possible)
              </p>

              {/* Preset quick test photos */}
              <div className="pt-2">
                <p className="text-[11px] text-slate-400 font-medium mb-2">Or select sample portrait photo:</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSamplePhoto('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80')}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                  >
                    Sample Male (Adult)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSamplePhoto('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80')}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                  >
                    Sample Female (Elderly)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSamplePhoto('https://images.unsplash.com/photo-1543332164-6e82f355badc?w=600&auto=format&fit=crop&q=80')}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                  >
                    Sample Child
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* IDENTIFIERS Section matching wireframe */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            IDENTIFIERS
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              ID / Document / Token Number
            </label>
            <input
              id="report-doc-id-input"
              type="text"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder="e.g., Aadhaar, Ration Card, Hospital Token (Opt)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Person's Name / Alias (Leave blank if unknown)
            </label>
            <input
              id="report-name-input"
              type="text"
              value={nameOrAlias}
              onChange={(e) => setNameOrAlias(e.target.value)}
              placeholder='e.g., Unknown / Responds to "Raju"'
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* DEMOGRAPHICS Section matching wireframe */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            DEMOGRAPHICS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Approx Age
              </label>
              <input
                id="report-age-input"
                type="number"
                min="0"
                max="120"
                value={approxAge}
                onChange={(e) => setApproxAge(e.target.value)}
                placeholder="e.g., 45"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Gender
              </label>
              <select
                id="report-gender-select"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Identifying Physical Marks / Clothes
            </label>
            <textarea
              id="report-marks-input"
              rows={2}
              value={marksAndClothing}
              onChange={(e) => setMarksAndClothing(e.target.value)}
              placeholder="Scar on left cheek, wearing torn black hoodie"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Languages or Words Spoken
            </label>
            <input
              id="report-languages-input"
              type="text"
              value={languagesSpoken}
              onChange={(e) => setLanguagesSpoken(e.target.value)}
              placeholder="e.g., Telugu, broken Hindi, Non-verbal"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* LOCATION & GPS Section matching wireframe */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            LOCATION & GPS
          </h2>

          {/* GPS Capture Button */}
          <div className="space-y-2">
            <button
              id="capture-gps-button"
              type="button"
              onClick={handleCaptureGps}
              disabled={isCapturingGps}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm transition-all"
            >
              {isCapturingGps ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Acquiring satellite lock...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <span>CAPTURE CURRENT GPS LOCATION</span>
                </>
              )}
            </button>

            {/* Readout matching wireframe: * Captured: 17.4399° N, 78.4983° E (Accuracy: 4m) */}
            <div className="bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 flex flex-wrap items-center justify-between gap-1">
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                * Captured: {latitude >= 0 ? `${latitude.toFixed(4)}° N` : `${Math.abs(latitude).toFixed(4)}° S`}, {longitude >= 0 ? `${longitude.toFixed(4)}° E` : `${Math.abs(longitude).toFixed(4)}° W`}
              </span>
              {gpsAccuracy && (
                <span className="text-slate-500 text-[11px] font-sans">
                  (Accuracy: {gpsAccuracy}m)
                </span>
              )}
            </div>

            {gpsError && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                {gpsError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              City / District <span className="text-rose-600">*</span>
            </label>
            <input
              id="report-city-input"
              type="text"
              required
              value={cityDistrict}
              onChange={(e) => setCityDistrict(e.target.value)}
              placeholder="Hyderabad"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Exact Spot / Landmark / Shelter <span className="text-rose-600">*</span>
            </label>
            <input
              id="report-spot-input"
              type="text"
              required
              value={exactSpot}
              onChange={(e) => setExactSpot(e.target.value)}
              placeholder="Near platform 1 tea stall, Secunderabad Station"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* REPORTER CONTACT Section matching wireframe */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            REPORTER CONTACT
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Your Mobile Number <span className="text-rose-600">*</span>
            </label>
            <input
              id="report-phone-input"
              type="tel"
              required
              value={reporterPhone}
              onChange={(e) => setReporterPhone(e.target.value)}
              placeholder="98XXXXXXXX (Kept directly visible to searcher)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Family members or police will use this to call you directly for spot verification.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Your Name / Designation (Optional)
            </label>
            <input
              id="report-reporter-name-input"
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="e.g., Sunil Rao (Tea Stall Vendor) / Good Samaritan"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Details Button matching wireframe Screen 2 */}
        <button
          id="submit-report-button"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/25 transition-all text-sm sm:text-base tracking-wider uppercase cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>SAVING & GENERATING TRK CODE...</span>
            </>
          ) : (
            <span>SUBMIT DETAILS</span>
          )}
        </button>
      </form>
    </div>
  );
};
