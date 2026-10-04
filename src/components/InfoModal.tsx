import React from 'react';
import { X, ShieldAlert, PhoneCall, HeartHandshake, MapPin, CheckCircle2 } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">About ReuniteApp</h3>
              <p className="text-xs text-slate-500">Free Public Community Directory</p>
            </div>
          </div>
          <button
            id="close-info-modal-button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-sm text-slate-600">
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3.5">
            <h4 className="font-semibold text-emerald-950 text-sm flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              100% Free & Open Access
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              No account, sign-in, or app download required. Any citizen, shopkeeper, transit staff, or volunteer can immediately report a sighting or search for a missing family member in seconds.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-2">How It Works</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <p>
                  <strong className="text-slate-800">Spot & Photograph:</strong> Take a clear photo of the person found disoriented, separated, or lost in public transit, temples, or shelters.
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <p>
                  <strong className="text-slate-800">1-Tap GPS Tagging:</strong> The app instantly locks the exact coordinates (latitude & longitude) so searchers get direct turn-by-turn navigation.
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <p>
                  <strong className="text-slate-800">TRK Tracking Code:</strong> A short tracking code (e.g. <span className="font-mono font-bold text-slate-800">TRK-58210</span>) is generated for quick reference, WhatsApp sharing, and police inquiries.
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Helplines */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 mb-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Emergency Helplines (India & International)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a 
                href="tel:112" 
                className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-slate-900">National Emergency</div>
                  <div className="text-[11px] text-slate-500">Police / Ambulance</div>
                </div>
                <span className="font-bold text-rose-600 font-mono text-sm group-hover:scale-105 transition-transform">112</span>
              </a>

              <a 
                href="tel:1098" 
                className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-slate-900">Childline India</div>
                  <div className="text-[11px] text-slate-500">Children in Distress</div>
                </div>
                <span className="font-bold text-blue-600 font-mono text-sm group-hover:scale-105 transition-transform">1098</span>
              </a>

              <a 
                href="tel:14567" 
                className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-slate-900">Elderline (Senior Citizens)</div>
                  <div className="text-[11px] text-slate-500">Dementia & Seniors</div>
                </div>
                <span className="font-bold text-amber-600 font-mono text-sm group-hover:scale-105 transition-transform">14567</span>
              </a>

              <a 
                href="tel:1091" 
                className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-slate-900">Women Helpline</div>
                  <div className="text-[11px] text-slate-500">24x7 Assistance</div>
                </div>
                <span className="font-bold text-purple-600 font-mono text-sm group-hover:scale-105 transition-transform">1091</span>
              </a>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1">
            <p><strong>Citizen Safety Advice:</strong></p>
            <p>• If a person appears injured, dehydrated, or in medical distress, provide safe shelter and notify local emergency services immediately.</p>
            <p>• Look for identification tags, railway tickets, hospital bands, or address slips in pockets or pouches.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            id="dismiss-info-modal-button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
