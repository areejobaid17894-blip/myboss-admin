import { useCallback, useEffect, useState } from 'react';
import { userService, type User } from '@/api/user.service';
import { getApiErrorMessage } from '@/api/errors';
import { AddEmployeeCard } from '@/components/admin/AddEmployeeCard';
import { useI18n } from '@/i18n';
import styles from './UsersPage.module.css';

export function UsersPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await userService.getAll();
      setUsers(data.items);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{t('usersTitle')}</h1>
          <p>{t('usersSubtitle')}</p>
        </div>
        <button type="button" onClick={loadUsers} disabled={loading}>
          {t('retry')}
        </button>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.layout}>
        <section className={styles.formSection}>
          <AddEmployeeCard onCreated={loadUsers} />
        </section>

        <section className={styles.tableCard}>
          <h2>{t('usersListTitle')}</h2>
          {loading ? (
            <p className={styles.empty}>{t('loadingUsers')}</p>
          ) : users.length === 0 ? (
            <p className={styles.empty}>{t('usersEmpty')}</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('firstName')}</th>
                    <th>{t('lastName')}</th>
                    <th>{t('email')}</th>
                    <th>{t('role')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.firstName}</td>
                      <td>{user.lastName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={styles.roleBadge}>{user.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
