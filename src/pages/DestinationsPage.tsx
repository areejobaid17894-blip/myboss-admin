import { useState } from 'react';
import { squadService } from '@/api/squad.service';
import { useAdminData } from '@/hooks/useAdminData';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/useToast';
import { AREAS_BY_GOV, GOVERNORATES } from '@/lib/adminGeo';
import { downloadCsv } from '@/lib/csvExport';
import { loadDestinationOverrides, saveDestinationOverrides } from '@/lib/adminStores';
import { useI18n } from '@/i18n';

export function DestinationsPage() {
  const { t } = useI18n();
  const { loading, error, squads, reload } = useAdminData();
  const { logAction } = useAuditLog();
  const { showToast } = useToast();
  const [overrides, setOverrides] = useState(loadDestinationOverrides);

  const setDest = (squadId: string, value: string, squad: (typeof squads)[0]) => {
    const [destGov, dest] = value.split('|');
    const modified = !(destGov === squad.aiDestGov && dest === squad.aiDest);
    const next = { ...overrides, [squadId]: { destGov, dest, modified } };
    setOverrides(next);
    saveDestinationOverrides(next);
  };

  const applyDest = async () => {
    const modified = Object.entries(overrides).filter(([, o]) => o.modified);
    try {
      await Promise.all(
        modified.map(([squadId, o]) => squadService.updateDestination(squadId, o.destGov, o.dest)),
      );
      logAction(`Saved destination assignments (${modified.length} admin override${modified.length === 1 ? '' : 's'}).`);
      showToast(`${t('destSaved')} (${modified.length})`);
      reload();
    } catch {
      showToast(t('errorGeneric'));
    }
  };

  const resetDest = () => {
    saveDestinationOverrides({});
    setOverrides({});
    logAction('Reset all destinations to AI assignment.');
    showToast(t('destReset'));
    reload();
  };

  const exportDest = () =>
    downloadCsv(
      'squad_destinations.csv',
      [
        ['Squad ID', 'Squad', 'Base', 'AI area', 'AI governorate', 'Assigned area', 'Assigned governorate', 'Source'],
        ...squads.map((s) => {
          const o = overrides[s.id];
          const destGov = o?.destGov ?? s.destGov;
          const dest = o?.dest ?? s.dest;
          const modified = o?.modified ?? s.destModified;
          return [
            s.squadCode,
            s.name,
            s.base,
            s.aiDest,
            s.aiDestGov,
            dest,
            destGov,
            modified ? 'Admin override' : 'AI',
          ];
        }),
      ],
    );

  if (loading) return <p>{t('loadingData')}</p>;
  if (error) {
    return (
      <div>
        <div className="ac-error">{error}</div>
        <button type="button" className="ac-btn ac-btn-orange" onClick={reload}>
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="ac-card">
      <h2>{t('destTitle')}</h2>
      <p className="ac-sub">{t('destSub')}</p>
      <div className="ac-ai-note">
        ✦ <span>{t('destAiNote')}</span>
      </div>
      <div className="ac-toolbar">
        <button type="button" className="ac-btn ac-btn-orange" onClick={applyDest}>
          {t('saveDestChanges')}
        </button>
        <button type="button" className="ac-btn ac-btn-ghost" onClick={resetDest}>
          {t('resetDestAi')}
        </button>
        <button type="button" className="ac-btn ac-btn-ghost" onClick={exportDest}>
          ⇩ {t('exportAssignments')}
        </button>
      </div>
      <div className="ac-tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('squad')}</th>
              <th>{t('baseGov')}</th>
              <th>{t('travelWilling')}</th>
              <th>{t('eligibility')}</th>
              <th>{t('aiSuggested')}</th>
              <th>{t('assignedArea')}</th>
              <th>{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            {squads.map((s) => {
              const o = overrides[s.id];
              const destGov = o?.destGov ?? s.destGov;
              const dest = o?.dest ?? s.dest;
              const modified = o?.modified ?? s.destModified;
              const govOptions = s.travelEligible ? GOVERNORATES : [s.base];
              return (
                <tr key={s.id}>
                  <td>
                    <b>{s.name}</b>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ac-gray-mid)' }}>{s.squadCode}</div>
                  </td>
                  <td>{s.base}</td>
                  <td>
                    {s.travelWilling}/{s.members.length}
                  </td>
                  <td>
                    {s.travelEligible ? (
                      <span className="ac-badge ac-b-green">{t('canTravel')}</span>
                    ) : (
                      <span className="ac-badge ac-b-gray">{t('baseOnly')}</span>
                    )}
                  </td>
                  <td>
                    <span className="ac-badge ac-b-purple">✦ {s.aiDest}</span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--ac-gray-mid)', marginTop: 3 }}>
                      {s.aiDestGov}
                    </div>
                  </td>
                  <td>
                    <select
                      className={`ac-inline-select ${modified ? 'ac-modified' : ''}`}
                      value={`${destGov}|${dest}`}
                      onChange={(e) => setDest(s.id, e.target.value, s)}
                    >
                      {govOptions.map((g) => (
                        <optgroup key={g} label={g}>
                          {(AREAS_BY_GOV[g] ?? []).map((a) => (
                            <option key={`${g}|${a}`} value={`${g}|${a}`}>
                              {a}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </td>
                  <td>
                    {modified ? (
                      <span className="ac-badge ac-b-orange">{t('adminOverride')}</span>
                    ) : (
                      <span className="ac-badge ac-b-purple">AI</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="ac-hint">{t('destHint')}</p>
    </div>
  );
}
