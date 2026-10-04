import { PersonReport, SightingNote } from '../types';
import { INITIAL_REPORTS } from '../data/initialReports';

const STORAGE_KEY = 'reunite_app_reports_v1';

export function getStoredReports(): PersonReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load reports from storage:', e);
    return INITIAL_REPORTS;
  }
}

export function saveReports(reports: PersonReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to save reports:', e);
  }
}

export function addReport(report: PersonReport): void {
  const current = getStoredReports();
  const updated = [report, ...current];
  saveReports(updated);
}

export function updateReportStatus(trackingCode: string, status: 'UNRESOLVED' | 'REUNITED'): PersonReport | null {
  const current = getStoredReports();
  const index = current.findIndex(r => r.trackingCode.toUpperCase() === trackingCode.toUpperCase());
  if (index === -1) return null;
  current[index].status = status;
  saveReports(current);
  return current[index];
}

export function addSightingNote(trackingCode: string, text: string, reporter: string): PersonReport | null {
  const current = getStoredReports();
  const index = current.findIndex(r => r.trackingCode.toUpperCase() === trackingCode.toUpperCase());
  if (index === -1) return null;
  
  const newNote: SightingNote = {
    id: 'note-' + Date.now(),
    text,
    reporter: reporter || 'Community Volunteer',
    timestamp: new Date().toISOString()
  };
  
  const notes = current[index].notes || [];
  current[index].notes = [newNote, ...notes];
  saveReports(current);
  return current[index];
}

export function generateTrackingCode(): string {
  // Generate random 5 digit tracking code: TRK-XXXXX
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `TRK-${randomNum}`;
}

export function formatTimeAgo(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 5) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} mins ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export function formatDetailedReportDate(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const timeStr = date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    if (isToday) {
      return `Today, ${timeStr}`;
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timeStr}`;
    }
    
    return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${timeStr}`;
  } catch {
    return 'Recently';
  }
}

export function generateWhatsAppShareUrl(report: PersonReport): string {
  const message = `🚨 *LOST / FOUND PERSON ALERT - ${report.trackingCode}* 🚨
Name/Alias: ${report.nameOrAlias} (${report.approxAge ? `~${report.approxAge} yrs` : 'Age unknown'}, ${report.gender})
Last Spot: ${report.exactSpot}, ${report.cityDistrict}
GPS: ${report.latitude.toFixed(4)}° N, ${report.longitude.toFixed(4)}° E
Physical Marks: ${report.marksAndClothing || 'None stated'}
Spoken: ${report.languagesSpoken || 'Not specified'}
Reporter Contact: ${report.reporterPhone}

View full profile & map directions:
${window.location.origin}/#${report.trackingCode}
Direct Google Maps: https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}

Please forward to community groups to help reconnect!`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
