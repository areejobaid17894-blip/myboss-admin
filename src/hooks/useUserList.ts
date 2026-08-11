import { useCallback, useEffect, useMemo, useState } from 'react';
import { userService, type PaginatedUsers, type UserListFilters } from '@/api/user.service';

const DEFAULT_PAGE_SIZE = 20;

export function useUserList(initialFilters: Omit<UserListFilters, 'page' | 'pageSize'> = {}) {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [debouncedText, setDebouncedText] = useState({
    search: initialFilters.search ?? '',
    id: initialFilters.id ?? '',
    email: initialFilters.email ?? '',
  });
  const [data, setData] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedText({
        search: filters.search ?? '',
        id: filters.id ?? '',
        email: filters.email ?? '',
      });
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [filters.search, filters.id, filters.email]);

  const queryFilters = useMemo<UserListFilters>(
    () => ({
      ...filters,
      search: debouncedText.search || undefined,
      id: debouncedText.id || undefined,
      email: debouncedText.email || undefined,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [filters, debouncedText, page],
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.list(queryFilters);
      setData(response.data);
    } catch (err) {
      console.error('User list load failed', err);
      setError('Failed to load users.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [queryFilters]);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateFilters = useCallback((patch: Partial<UserListFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    if ('role' in patch || 'onboardingCompleted' in patch || 'governorate' in patch || 'hasSquad' in patch) {
      setPage(1);
    }
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setPage(1);
  }, [initialFilters]);

  return {
    users: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? DEFAULT_PAGE_SIZE,
    totalPages: data?.totalPages ?? 0,
    filters,
    loading,
    error,
    setPage,
    updateFilters,
    clearFilters,
    reload,
  };
}
