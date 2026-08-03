import { useCallback, useEffect, useState } from 'react';
import {
  formatAuditTime,
  loadAuditLog,
  saveAuditLog,
  type AuditRecord,
} from '@/lib/adminStores';

export function useAuditLog() {
  const [entries, setEntries] = useState<AuditRecord[]>(() => loadAuditLog());

  useEffect(() => {
    saveAuditLog(entries);
  }, [entries]);

  const logAction = useCallback((action: string) => {
    const record: AuditRecord = { time: formatAuditTime(), action };
    setEntries((prev) => [record, ...prev]);
  }, []);

  return { entries, logAction };
}
