import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { PersonReport, ReportStatus, SightingNote } from '../types';

const REPORTS_COLLECTION = 'reports';
const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const TRACKING_CODE_REGEX = /^TRK-[0-9]{5}$/;

function sanitizeId(raw: string, prefix: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  if (cleaned && SAFE_ID_REGEX.test(cleaned)) {
    return cleaned;
  }
  return `${prefix}-${Date.now()}`;
}

function clampNumber(val: number | undefined, min: number, max: number, fallback: number): number {
  if (typeof val !== 'number' || !Number.isFinite(val)) return fallback;
  return Math.min(max, Math.max(min, val));
}

function sanitizeString(val: string | undefined, maxLen: number, fallback = ''): string {
  const trimmed = (val ?? '').trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLen);
}

function buildReportPayload(report: PersonReport) {
  const id = sanitizeId(report.id || `rep-${Date.now()}`, 'rep');
  const trackingCode = TRACKING_CODE_REGEX.test(report.trackingCode)
    ? report.trackingCode
    : `TRK-${Math.floor(10000 + Math.random() * 90000)}`;

  const payload: Record<string, unknown> = {
    id,
    trackingCode,
    nameOrAlias: sanitizeString(report.nameOrAlias, 120, 'Unknown'),
    approxAge: Math.round(clampNumber(report.approxAge, 0, 120, 0)),
    gender: ['Male', 'Female', 'Other', 'Unknown'].includes(report.gender)
      ? report.gender
      : 'Unknown',
    marksAndClothing: sanitizeString(report.marksAndClothing, 1000, 'No specific marks reported'),
    languagesSpoken: sanitizeString(report.languagesSpoken, 200, 'Unknown / Non-verbal'),
    cityDistrict: sanitizeString(report.cityDistrict, 120, 'Unknown'),
    exactSpot: sanitizeString(report.exactSpot, 300, 'Not specified'),
    latitude: clampNumber(report.latitude, -90, 90, 17.4399),
    longitude: clampNumber(report.longitude, -180, 180, 78.4983),
    reporterPhone: sanitizeString(report.reporterPhone, 30, '00000'),
    photoUrl: sanitizeString(
      report.photoUrl,
      600000,
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80'
    ),
    reportedAt: sanitizeString(report.reportedAt, 40, new Date().toISOString()),
    status: report.status === 'REUNITED' ? 'REUNITED' : 'UNRESOLVED',
    notesCount: Math.max(0, Math.min(10000, Math.round(report.notesCount ?? (report.notes?.length ? 1 : 0)))),
  };

  if (report.documentId && report.documentId.trim()) {
    payload.documentId = sanitizeString(report.documentId, 80);
  }
  if (typeof report.gpsAccuracy === 'number' && Number.isFinite(report.gpsAccuracy) && report.gpsAccuracy >= 0) {
    payload.gpsAccuracy = clampNumber(report.gpsAccuracy, 0, 100000, 10);
  }
  if (report.reporterName && report.reporterName.trim()) {
    payload.reporterName = sanitizeString(report.reporterName, 120);
  }

  return { id, payload };
}

function docToPersonReport(data: Record<string, unknown>, fallbackId: string): PersonReport {
  return {
    id: String(data.id || fallbackId),
    trackingCode: String(data.trackingCode || ''),
    nameOrAlias: String(data.nameOrAlias || 'Unknown'),
    approxAge: typeof data.approxAge === 'number' ? data.approxAge : 0,
    gender: (['Male', 'Female', 'Other', 'Unknown'].includes(String(data.gender))
      ? data.gender
      : 'Unknown') as PersonReport['gender'],
    documentId: typeof data.documentId === 'string' && data.documentId ? data.documentId : undefined,
    marksAndClothing: String(data.marksAndClothing || 'No specific marks reported'),
    languagesSpoken: String(data.languagesSpoken || 'Unknown / Non-verbal'),
    cityDistrict: String(data.cityDistrict || ''),
    exactSpot: String(data.exactSpot || ''),
    latitude: typeof data.latitude === 'number' ? data.latitude : 17.4399,
    longitude: typeof data.longitude === 'number' ? data.longitude : 78.4983,
    gpsAccuracy: typeof data.gpsAccuracy === 'number' ? data.gpsAccuracy : undefined,
    reporterPhone: String(data.reporterPhone || ''),
    reporterName: typeof data.reporterName === 'string' && data.reporterName ? data.reporterName : undefined,
    photoUrl: String(data.photoUrl || ''),
    reportedAt: String(data.reportedAt || new Date().toISOString()),
    status: data.status === 'REUNITED' ? 'REUNITED' : 'UNRESOLVED',
    notesCount: typeof data.notesCount === 'number' ? data.notesCount : 0,
  };
}

export function subscribeToReports(
  onData: (reports: PersonReport[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, REPORTS_COLLECTION),
    where('status', 'in', ['UNRESOLVED', 'REUNITED'])
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) =>
        docToPersonReport(d.data() as Record<string, unknown>, d.id)
      );
      list.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, REPORTS_COLLECTION);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export function subscribeToReportNotes(
  reportId: string,
  onData: (notes: SightingNote[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const safeReportId = sanitizeId(reportId, 'rep');
  const notesPath = `${REPORTS_COLLECTION}/${safeReportId}/notes`;
  const q = query(collection(db, REPORTS_COLLECTION, safeReportId, 'notes'), where('reportId', '==', safeReportId));

  return onSnapshot(
    q,
    (snapshot) => {
      const notes: SightingNote[] = snapshot.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: String(data.id || d.id),
          text: String(data.text || ''),
          reporter: String(data.reporter || 'Community Member'),
          timestamp: String(data.timestamp || new Date().toISOString()),
        };
      });
      notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onData(notes);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, notesPath);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export async function createReportInDb(report: PersonReport): Promise<PersonReport> {
  const initialNote = report.notes?.[0];
  const prepared: PersonReport = {
    ...report,
    notesCount: initialNote ? 1 : 0,
  };
  const { id, payload } = buildReportPayload(prepared);
  const path = `${REPORTS_COLLECTION}/${id}`;

  try {
    const batch = writeBatch(db);
    const reportRef = doc(db, REPORTS_COLLECTION, id);
    batch.set(reportRef, {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (initialNote) {
      const noteId = sanitizeId(initialNote.id || `note-${Date.now()}`, 'note');
      const noteRef = doc(db, REPORTS_COLLECTION, id, 'notes', noteId);
      batch.set(noteRef, {
        id: noteId,
        reportId: id,
        text: sanitizeString(initialNote.text, 1000, 'Report created.'),
        reporter: sanitizeString(initialNote.reporter, 120, 'Reporter'),
        timestamp: sanitizeString(initialNote.timestamp, 40, new Date().toISOString()),
        createdAt: serverTimestamp(),
      });
    }

    await batch.commit();
    return {
      ...prepared,
      id,
      trackingCode: String(payload.trackingCode),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateReportStatusInDb(
  reportId: string,
  status: ReportStatus
): Promise<void> {
  const safeId = sanitizeId(reportId, 'rep');
  const path = `${REPORTS_COLLECTION}/${safeId}`;
  try {
    await updateDoc(doc(db, REPORTS_COLLECTION, safeId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export interface ReportDetailsUpdate {
  nameOrAlias: string;
  approxAge: number;
  gender: PersonReport['gender'];
  documentId: string;
  marksAndClothing: string;
  languagesSpoken: string;
  cityDistrict: string;
  exactSpot: string;
  latitude: number;
  longitude: number;
  gpsAccuracy?: number;
  reporterPhone: string;
  reporterName: string;
  photoUrl: string;
  status: ReportStatus;
}

export async function updateReportDetailsInDb(
  reportId: string,
  updates: ReportDetailsUpdate
): Promise<void> {
  const safeId = sanitizeId(reportId, 'rep');
  const path = `${REPORTS_COLLECTION}/${safeId}`;

  const payload: Record<string, unknown> = {
    nameOrAlias: sanitizeString(updates.nameOrAlias, 120, 'Unknown'),
    approxAge: Math.round(clampNumber(updates.approxAge, 0, 120, 0)),
    gender: ['Male', 'Female', 'Other', 'Unknown'].includes(updates.gender)
      ? updates.gender
      : 'Unknown',
    documentId: sanitizeString(updates.documentId, 80, ''),
    marksAndClothing: sanitizeString(updates.marksAndClothing, 1000, 'No specific marks reported'),
    languagesSpoken: sanitizeString(updates.languagesSpoken, 200, 'Unknown / Non-verbal'),
    cityDistrict: sanitizeString(updates.cityDistrict, 120, 'Unknown'),
    exactSpot: sanitizeString(updates.exactSpot, 300, 'Not specified'),
    latitude: clampNumber(updates.latitude, -90, 90, 17.4399),
    longitude: clampNumber(updates.longitude, -180, 180, 78.4983),
    reporterPhone: sanitizeString(updates.reporterPhone, 30, '00000'),
    reporterName: sanitizeString(updates.reporterName, 120, ''),
    photoUrl: sanitizeString(
      updates.photoUrl,
      600000,
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80'
    ),
    status: updates.status === 'REUNITED' ? 'REUNITED' : 'UNRESOLVED',
    updatedAt: serverTimestamp(),
  };

  if (typeof updates.gpsAccuracy === 'number' && Number.isFinite(updates.gpsAccuracy) && updates.gpsAccuracy >= 0) {
    payload.gpsAccuracy = clampNumber(updates.gpsAccuracy, 0, 100000, 10);
  }

  try {
    await updateDoc(doc(db, REPORTS_COLLECTION, safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function addSightingNoteInDb(
  reportId: string,
  currentNotesCount: number,
  text: string,
  reporter: string
): Promise<void> {
  const safeReportId = sanitizeId(reportId, 'rep');
  const noteId = sanitizeId(`note-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 'note');
  const path = `${REPORTS_COLLECTION}/${safeReportId}/notes/${noteId}`;

  try {
    const batch = writeBatch(db);
    const noteRef = doc(db, REPORTS_COLLECTION, safeReportId, 'notes', noteId);
    const reportRef = doc(db, REPORTS_COLLECTION, safeReportId);

    batch.set(noteRef, {
      id: noteId,
      reportId: safeReportId,
      text: sanitizeString(text, 1000, 'Sighting update logged.'),
      reporter: sanitizeString(reporter, 120, 'Community Member'),
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });

    batch.update(reportRef, {
      notesCount: Math.max(0, Math.round(currentNotesCount)) + 1,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
