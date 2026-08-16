import { useCallback, useRef, useState } from 'react';
import {
  EmployeeSettingsCard,
  SURVEY_SETTINGS_FIELDS,
} from '@/components/admin/EmployeeSettingsCard';
import { useAdminData } from '@/hooks/useAdminData';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/useToast';
import { downloadCsv } from '@/lib/csvExport';
import { useI18n } from '@/i18n';
import { SurveySchemaEditor } from '@/pages/SurveySchemaEditor';

interface UploadedFile {
  name: string;
  size: number;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function FileList({ files }: { files: UploadedFile[] }) {
  if (!files.length) return null;
  return (
    <>
      {files.map((f) => (
        <div key={f.name} className="ac-file-row">
          <span className="ac-fn">{f.name}</span>
          <span className="ac-fs">{formatSize(f.size)}</span>
        </div>
      ))}
    </>
  );
}

export function SurveysPage() {
  const { t } = useI18n();
  const { squads, report, reload } = useAdminData();
  const { logAction } = useAuditLog();
  const { showToast } = useToast();
  const [customerFiles, setCustomerFiles] = useState<UploadedFile[]>([]);
  const [employeeFiles, setEmployeeFiles] = useState<UploadedFile[]>([]);
  const [dragCustomer, setDragCustomer] = useState(false);
  const [dragEmployee, setDragEmployee] = useState(false);
  const customerInputRef = useRef<HTMLInputElement>(null);
  const employeeInputRef = useRef<HTMLInputElement>(null);

  const inAppSurveys = report?.totalResponses ?? squads.reduce((a, s) => a + s.surveys, 0);

  const pickFiles = useCallback(
    (list: FileList | null, kind: 'customer' | 'employee') => {
      if (!list?.length) return;
      const mapped = Array.from(list).map((f) => ({ name: f.name, size: f.size }));
      if (kind === 'customer') setCustomerFiles((prev) => [...prev, ...mapped]);
      else setEmployeeFiles((prev) => [...prev, ...mapped]);
      logAction(`Uploaded ${mapped.length} ${kind} survey file(s).`);
      showToast(`${mapped.length} file(s) added`);
    },
    [logAction, showToast],
  );

  const exportCombined = () => {
    downloadCsv(
      'surveys_combined.csv',
      [
        ['Squad ID', 'Squad', 'In-app surveys'],
        ...squads.map((s) => [s.squadCode, s.name, s.surveys]),
      ],
    );
    logAction('Exported combined survey dataset.');
  };

  return (
    <>
      <EmployeeSettingsCard
        titleKey="configSectionSurvey"
        descKey="configSectionSurveyDesc"
        fields={SURVEY_SETTINGS_FIELDS}
        onSaved={() => reload()}
      />
      <div className="ac-grid ac-g2">
        <div className="ac-card">
          <h2>{t('surveysUploadCustomerTitle')}</h2>
          <p className="ac-sub">{t('surveysUploadCustomerSub')}</p>
          <div
            className={`ac-drop ${dragCustomer ? 'ac-drag' : ''}`}
            onClick={() => customerInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragCustomer(true);
            }}
            onDragLeave={() => setDragCustomer(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragCustomer(false);
              pickFiles(e.dataTransfer.files, 'customer');
            }}
          >
            <b>{t('surveysDropTitle')}</b>
            {t('surveysDropSub')}
          </div>
          <input
            ref={customerInputRef}
            type="file"
            multiple
            hidden
            accept=".csv,.xlsx,.xls"
            onChange={(e) => pickFiles(e.target.files, 'customer')}
          />
          <FileList files={customerFiles} />
        </div>
        <div className="ac-card">
          <h2>{t('surveysUploadEmployeeTitle')}</h2>
          <p className="ac-sub">{t('surveysUploadEmployeeSub')}</p>
          <div
            className={`ac-drop ${dragEmployee ? 'ac-drag' : ''}`}
            onClick={() => employeeInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragEmployee(true);
            }}
            onDragLeave={() => setDragEmployee(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragEmployee(false);
              pickFiles(e.dataTransfer.files, 'employee');
            }}
          >
            <b>{t('surveysDropTitle')}</b>
            {t('surveysDropSub')}
          </div>
          <input
            ref={employeeInputRef}
            type="file"
            multiple
            hidden
            accept=".csv,.xlsx,.xls"
            onChange={(e) => pickFiles(e.target.files, 'employee')}
          />
          <FileList files={employeeFiles} />
        </div>
      </div>

      <div className="ac-card">
        <h2>{t('surveysOnRecordTitle')}</h2>
        <p className="ac-sub">{t('surveysOnRecordSub')}</p>
        <div className="ac-grid ac-g3">
          <div className="ac-kpi ac-k-blue">
            <div className="ac-v">{inAppSurveys}</div>
            <div className="ac-l">{t('surveysInApp')}</div>
          </div>
          <div className="ac-kpi ac-k-green">
            <div className="ac-v">{customerFiles.length}</div>
            <div className="ac-l">{t('surveysCustomerFiles')}</div>
          </div>
          <div className="ac-kpi ac-k-purple">
            <div className="ac-v">{employeeFiles.length}</div>
            <div className="ac-l">{t('surveysEmployeeFiles')}</div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <button type="button" className="ac-btn ac-btn-ghost" onClick={exportCombined}>
            ⇩ {t('surveysExportCombined')}
          </button>
          <button type="button" className="ac-btn ac-btn-ghost" style={{ marginInlineStart: 8 }} onClick={reload}>
            {t('retry')}
          </button>
        </div>
      </div>

      <SurveySchemaEditor />
    </>
  );
}
