import { useMemo, useState } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/useToast';
import { GOVERNORATES } from '@/lib/adminGeo';
import { downloadCsv } from '@/lib/csvExport';
import { useI18n } from '@/i18n';

const PALETTES = [
  ['#FF7900', '#FFD200'],
  ['#50BE87', '#4BB4E6'],
  ['#A885D8', '#FFB4E6'],
  ['#4BB4E6', '#FF7900'],
];

export function PhotosPage() {
  const { t } = useI18n();
  const { loading, error, gallery, reload } = useAdminData();
  const { logAction } = useAuditLog();
  const { showToast } = useToast();
  const [govFilter, setGovFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () => (govFilter ? gallery.filter((p) => p.governorate === govFilter) : gallery),
    [gallery, govFilter],
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map((p) => p.id)));
  const clearSel = () => setSelected(new Set());

  const extract = (all: boolean) => {
    const items = all ? filtered : filtered.filter((p) => selected.has(p.id));
    if (!items.length) {
      showToast(t('noPhotosSelected'));
      return;
    }
    downloadCsv(
      all ? 'gallery_all.csv' : 'gallery_selected.csv',
      [
        ['Photo ID', 'Type', 'Squad', 'Governorate', 'Caption', 'Uploaded'],
        ...items.map((p) => [p.id, p.type, p.squadId, p.governorate, p.caption ?? '', p.createdAt]),
      ],
    );
    logAction(`Extracted ${items.length} gallery item${items.length === 1 ? '' : 's'} (${all ? 'all' : 'selected'}).`);
    showToast(`${t('extractedPhotos')}: ${items.length}`);
  };

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
      <h2>{t('photosTitle')}</h2>
      <p className="ac-sub">{t('photosSub')} Employee uploads appear here for extraction.</p>
      <div className="ac-toolbar">
        <select
          className="ac-inline-select"
          value={govFilter}
          onChange={(e) => setGovFilter(e.target.value)}
        >
          <option value="">{t('allGovernorates')}</option>
          {GOVERNORATES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <button type="button" className="ac-btn ac-btn-ghost ac-btn-sm" onClick={selectAll}>
          {t('selectAllShown')}
        </button>
        <button type="button" className="ac-btn ac-btn-ghost ac-btn-sm" onClick={clearSel}>
          {t('clearSelection')}
        </button>
        <div className="ac-spacer" />
        <button type="button" className="ac-btn ac-btn-outline" onClick={() => extract(false)}>
          ⇩ {t('extractSelected')} ({selected.size})
        </button>
        <button type="button" className="ac-btn ac-btn-orange" onClick={() => extract(true)}>
          ⇩ {t('extractAll')}
        </button>
      </div>
      {filtered.length === 0 ? (
        <p className="ac-hint">{t('noGalleryItems')}</p>
      ) : (
        <div className="ac-photos">
          {filtered.map((p, i) => {
            const pal = PALETTES[i % PALETTES.length];
            return (
              <div
                key={p.id}
                className={`ac-photo ${selected.has(p.id) ? 'ac-selected' : ''}`}
                onClick={() => toggle(p.id)}
                onKeyDown={(e) => e.key === 'Enter' && toggle(p.id)}
                role="button"
                tabIndex={0}
              >
                <div
                  className="ac-ph-bg"
                  style={{ background: `linear-gradient(135deg, ${pal[0]}, ${pal[1]})` }}
                />
                <div className="ac-ph-check">✓</div>
                <div className="ac-ph-meta">
                  {p.type === 'video' ? '▶ ' : ''}
                  {p.squadId}
                  <br />
                  <span style={{ opacity: 0.8 }}>
                    {p.governorate} · {p.userId}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="ac-hint">{t('photosHint')}</p>
    </div>
  );
}
