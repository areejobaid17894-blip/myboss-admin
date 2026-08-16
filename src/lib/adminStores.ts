export interface DestinationOverride {
  destGov: string;
  dest: string;
  modified: boolean;
}

export interface NotificationRecord {
  title: string;
  body: string;
  audience: string;
  time: string;
}

export interface AuditRecord {
  time: string;
  action: string;
}

const DEST_KEY = 'boss_admin_destinations';
const NOTIF_KEY = 'boss_admin_notifications';
const AUDIT_KEY = 'boss_admin_audit';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadDestinationOverrides(): Record<string, DestinationOverride> {
  return readJson(DEST_KEY, {});
}

export function saveDestinationOverrides(map: Record<string, DestinationOverride>) {
  writeJson(DEST_KEY, map);
}

export function loadNotificationHistory(): NotificationRecord[] {
  return readJson(NOTIF_KEY, [
    {
      title: 'Kick-off reminder',
      body: 'Visit day starts 9:00 AM — collect your kits at your building lobby.',
      audience: 'All employees',
      time: 'Yesterday 4:12 PM',
    },
    {
      title: 'Survey target update',
      body: '186 squads have reached their survey target. Keep going!',
      audience: 'Squad leaders',
      time: 'Yesterday 11:05 AM',
    },
  ]);
}

export function loadAuditLog(): AuditRecord[] {
  return readJson(AUDIT_KEY, [
    {
      time: 'Today 9:14 AM',
      action: 'Initial destination suggestions generated for demo squads.',
    },
  ]);
}

export function saveAuditLog(items: AuditRecord[]) {
  writeJson(AUDIT_KEY, items);
}

export function formatAuditTime(): string {
  return `Today ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}
