import { DEMO_ADMIN_ACCOUNT, DEMO_EMPLOYEE_ACCOUNTS } from '@/lib/demoTestAccounts';
import { useI18n } from '@/i18n';

export function DemoTestAccountsCard() {
  const { t } = useI18n();

  return (
    <div className="ac-card">
      <h2>{t('testAccountsTitle')}</h2>
      <p className="ac-sub">{t('testAccountsSub')}</p>
      <div className="ac-tbl-wrap" style={{ marginTop: 12 }}>
        <table>
          <thead>
            <tr>
              <th>{t('email')}</th>
              <th>{t('employee')}</th>
              <th>{t('testAccountScenario')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>{DEMO_ADMIN_ACCOUNT.email}</code>
              </td>
              <td>{DEMO_ADMIN_ACCOUNT.label}</td>
              <td>{DEMO_ADMIN_ACCOUNT.scenario}</td>
            </tr>
            {DEMO_EMPLOYEE_ACCOUNTS.map((account) => (
              <tr key={account.email}>
                <td>
                  <code>{account.email}</code>
                </td>
                <td>{account.label}</td>
                <td>{account.scenario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ac-hint" style={{ marginTop: 12 }}>
        {t('testAccountsMobileHint')}
      </p>
    </div>
  );
}
