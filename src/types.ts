export interface SightingNote {
  id: string;
  text: string;
  timestamp: string;
  reporter: string;
}

export type ReportStatus = 'UNRESOLVED' | 'REUNITED';

export interface PersonReport {
  id: string;
  trackingCode: string; // e.g. TRK-58210
  nameOrAlias: string;  // e.g. "Unknown Male" or "Ramu"
  approxAge: number;
  gender: 'Male' | 'Female' | 'Other' | 'Unknown';
  documentId?: string;  // Aadhaar, hospital token, etc.
  marksAndClothing: string; // Physical marks, scars, clothing
  languagesSpoken: string;  // e.g. Telugu, broken Hindi
  cityDistrict: string;
  exactSpot: string;        // Landmark / shelter / platform
  latitude: number;
  longitude: number;
  gpsAccuracy?: number;     // e.g. 4 (meters)
  reporterPhone: string;
  reporterName?: string;
  photoUrl: string;
  reportedAt: string;       // ISO string
  status: ReportStatus;
  notes?: SightingNote[];
}

export type ActiveScreen = 
  | { type: 'landing' }
  | { type: 'report' }
  | { type: 'search'; initialQuery?: string }
  | { type: 'profile'; trackingCode: string };
