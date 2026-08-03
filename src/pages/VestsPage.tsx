import { useMemo, useState } from 'react';
import { VestSizeEditWindowCard } from '@/components/admin/VestSizeEditWindowCard';
import { useAdminData } from '@/hooks/useAdminData';
import { VEST_SIZES } from '@/lib/adminGeo';
import { downloadCsv } from '@/lib/csvExport';
import { useI18n } from '@/i18n';

const VEST_COLORS: Record<string, string> = {
  XS: 'var(--ac-pink)',
  S: 'var(--ac-yellow)',
  M: 'var(--ac-orange)',
  L: 'var(--ac-green)',
  XL: 'var(--ac-blue)',
  XXL: 'var(--ac-purple)',
};

export function VestsPage() {
  const { t } = useI18n();
  const { loading, error, members, reload } = useAdminData();
  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    const c = Object.fromEntries(VEST_SIZES.map((v) => [v, 0])) as Record<string, number>;
    members.forEach((m) => {
      if (c[m.vest] !== undefined) c[m.vest]++;
    });
    return c;
  }, [members]);

  const max = Math.max(...Object.values(counts), 1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return members;
    return members.filter((m) => `${m.name}${m.userId}`.toLowerCase().includes(q));
  }, [members, search]);

  return (
    <div className="ac-vests-page">
      <VestSizeEditWindowCard />

      {loading ? (
        <p>{t('loadingData')}</p>
      ) : error ? (
        <div className="ac-card">
          <div className="ac-error">{error}</div>
          <button type="button" className="ac-btn ac-btn-orange" onClick={reload}>
            {t('retry')}
          </button>
        </div>
      ) : (
        <div className="ac-grid ac-g2">
          <div className="ac-card">
            <h2>{t('vestOverallTitle')}</h2>
            <p className="ac-sub">{t('vestOverallSub')}</p>
            {VEST_SIZES.map((v) => (
              <div key={v} className="ac-vest-row">
                <span className="ac-vs">{v}</span>
                <div className="ac-vb">
                  <i style={{ width: `${(counts[v] / max) * 100}%`, background: VEST_COLORS[v] }} />
                </div>
                <span className="ac-vn">{counts[v]}</span>
              </div>
            ))}
            <button
              type="button"
              className="ac-btn ac-btn-orange"
              style={{ marginTop: 8 }}
              onClick={() =>
                downloadCsv('vest_sizes_totals.csv', [['Size', 'Count'], ...VEST_SIZES.map((v) => [v, counts[v]])])
              }
            >
              ⇩ {t('exportSizeTotals')}
            </button>
          </div>
          <div className="ac-card">
            <h2>{t('vestPerEmployeeTitle')}</h2>
            <p className="ac-sub">{t('vestPerEmployeeSub')}</p>
            <div className="ac-toolbar ac-toolbar-fields">
              <div className="ac-field ac-field-grow">
                <label htmlFor="vest-search">{t('searchVests')}</label>
                <input
                  id="vest-search"
                  type="search"
                  className="ac-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('searchVests')}
                />
              </div>
              <div className="ac-field ac-field-action">
                <label>&nbsp;</label>
                <button
                  type="button"
                  className="ac-btn ac-btn-ghost ac-btn-block"
                  onClick={() =>
                    downloadCsv(
                      'vest_sizes_per_employee.csv',
                      [['User ID', 'Name', 'Squad', 'Vest size'], ...members.map((m) => [m.userId, m.name, m.squadName, m.vest])],
                    )
                  }
                >
                  ⇩ {t('exportPerEmployee')}
                </button>
              </div>
            </div>
            <div className="ac-tbl-wrap" style={{ maxHeight: 420, overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t('employee')}</th>
                    <th>{t('userId')}</th>
                    <th>{t('squad')}</th>
                    <th>{t('vest')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.userId}>
                      <td>{m.name}</td>
                      <td>{m.userId}</td>
                      <td>{m.squadName}</td>
                      <td>
                        <span className="ac-badge ac-b-blue">{m.vest}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
