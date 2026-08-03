import { useState } from 'react';
import { analyticsService } from '@/api/analytics.service';
import { useAdminData } from '@/hooks/useAdminData';
import { useAuditLog } from '@/hooks/useAuditLog';
import { downloadCsv } from '@/lib/csvExport';
import { loadNotificationHistory } from '@/lib/adminStores';
import { useI18n } from '@/i18n';

type Tab = 'raw' | 'classified';

export function ExtractionPage() {
  const { t } = useI18n();
  const { squads, members, unregistered, gallery } = useAdminData();
  const { logAction } = useAuditLog();
  const [tab, setTab] = useState<Tab>('raw');
  const [exporting, setExporting] = useState('');

  const logExport = (name: string, rows: number) => {
    logAction(`Exported ${name} (${rows} rows).`);
  };

  const exportMembers = () => {
    downloadCsv(
      'employees_raw.csv',
      [
        ['User ID', 'Name', 'Email', 'Vest', 'Travel', 'Squad'],
        ...members.map((m) => [m.userId, m.name, m.email, m.vest, m.travel ? 'Yes' : 'No', m.squadName]),
      ],
    );
    logExport('employees_raw.csv', members.length);
  };

  const exportSquads = () => {
    downloadCsv(
      'squads_raw.csv',
      [
        ['Squad ID', 'Name', 'Leader', 'Members', 'Base', 'Destination'],
        ...squads.map((s) => [s.squadCode, s.name, s.leaderName, s.members.length, s.base, s.dest]),
      ],
    );
    logExport('squads_raw.csv', squads.length);
  };

  const exportUnreg = () => {
    downloadCsv(
      'unregistered_raw.csv',
      [
        ['User ID', 'Name', 'Email'],
        ...unregistered.map((u) => [u.id, `${u.firstName} ${u.lastName}`, u.email]),
      ],
    );
    logExport('unregistered_raw.csv', unregistered.length);
  };

  const exportPhotos = () => {
    downloadCsv(
      'photo_manifest.csv',
      [
        ['Photo ID', 'Type', 'Squad', 'Governorate', 'Uploaded'],
        ...gallery.map((p) => [p.id, p.type, p.squadId, p.governorate, p.createdAt]),
      ],
    );
    logExport('photo_manifest.csv', gallery.length);
  };

  const exportNotifs = () => {
    const history = loadNotificationHistory();
    downloadCsv(
      'notifications_raw.csv',
      [['Title', 'Message', 'Audience', 'Sent'], ...history.map((n) => [n.title, n.body, n.audience, n.time])],
    );
    logExport('notifications_raw.csv', history.length);
  };

  const downloadAnalytics = async (datasetId: string) => {
    setExporting(datasetId);
    try {
      await analyticsService.downloadExport(datasetId, 'csv');
      logAction(`Exported analytics dataset ${datasetId}.`);
    } finally {
      setExporting('');
    }
  };

  const rawCards = [
    { title: t('exEmployeesRaw'), desc: t('exEmployeesRawDesc'), action: exportMembers },
    { title: t('exSquadsRaw'), desc: t('exSquadsRawDesc'), action: exportSquads },
    {
      title: t('exSurveysRaw'),
      desc: t('exSurveysRawDesc'),
      action: () => downloadAnalytics('survey_responses_flat'),
      id: 'survey_responses_flat',
    },
    { title: t('exUnregRaw'), desc: t('exUnregRawDesc'), action: exportUnreg },
    { title: t('exPhotosRaw'), desc: t('exPhotosRawDesc'), action: exportPhotos },
    { title: t('exNotifsRaw'), desc: t('exNotifsRawDesc'), action: exportNotifs },
  ];

  const classifiedCards = [
    { title: t('exVestAgg'), desc: t('exVestAggDesc'), action: () => downloadAnalytics('survey_responses_summary') },
    { title: t('exGovCoverage'), desc: t('exGovCoverageDesc'), action: exportSquads },
    { title: t('exPace'), desc: t('exPaceDesc'), action: () => downloadAnalytics('survey_time_series') },
    { title: t('exTravel'), desc: t('exTravelDesc'), action: exportSquads },
    { title: t('exTarget'), desc: t('exTargetDesc'), action: () => downloadAnalytics('survey_responses_summary') },
    { title: t('exRegistration'), desc: t('exRegistrationDesc'), action: exportUnreg },
  ];

  const cards = tab === 'raw' ? rawCards : classifiedCards;

  return (
    <div className="ac-card">
      <h2>{t('extractionTitle')}</h2>
      <p className="ac-sub">{t('extractionSub')}</p>
      <div className="ac-subtabs">
        <button type="button" className={tab === 'raw' ? 'ac-on' : ''} onClick={() => setTab('raw')}>
          {t('rawData')}
        </button>
        <button type="button" className={tab === 'classified' ? 'ac-on' : ''} onClick={() => setTab('classified')}>
          {t('classifiedData')}
        </button>
      </div>
      <div className="ac-grid ac-g3">
        {cards.map((c) => (
          <div key={c.title} className="ac-ex-card">
            <b>{c.title}</b>
            <div className="ac-ex-desc">{c.desc}</div>
            <button
              type="button"
              className="ac-btn ac-btn-sm ac-btn-orange"
              disabled={Boolean('id' in c && exporting === c.id)}
              onClick={c.action}
            >
              {'id' in c && exporting === c.id ? t('pleaseWait') : '⇩ CSV'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
