import { userApi } from '@/api/client';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  onboardingCompleted?: boolean;
  vestSize?: string;
  buildingId?: string;
  buildingName?: string;
  governorate?: string;
  openToTravel?: boolean;
  squadId?: string;
}

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserListFilters {
  id?: string;
  search?: string;
  email?: string;
  role?: string;
  onboardingCompleted?: boolean;
  governorate?: string;
  hasSquad?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

function buildListParams(filters: UserListFilters = {}) {
  const params: Record<string, string | number | boolean> = {};
  if (filters.page) params.page = filters.page;
  if (filters.pageSize) params.pageSize = filters.pageSize;
  if (filters.id?.trim()) params.id = filters.id.trim();
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.email?.trim()) params.email = filters.email.trim();
  if (filters.role) params.role = filters.role;
  if (filters.governorate) params.governorate = filters.governorate;
  if (filters.onboardingCompleted !== undefined) params.onboardingCompleted = filters.onboardingCompleted;
  if (filters.hasSquad !== undefined) params.hasSquad = filters.hasSquad;
  return params;
}

export const userService = {
  list: (filters: UserListFilters = {}) =>
    userApi.get<PaginatedUsers>('/users', { params: buildListParams(filters) }),
  getAll: (page = 1, pageSize = 100, filters: Omit<UserListFilters, 'page' | 'pageSize'> = {}) =>
    userApi.get<PaginatedUsers>('/users', {
      params: buildListParams({ ...filters, page, pageSize: Math.min(pageSize, 100), role: filters.role ?? 'employee' }),
    }),
  create: (data: CreateUserPayload) => userApi.post<User>('/users', data),
};

/** User-service rejects pageSize > 100. Walk pages so admin tabs get the full directory. */
export async function fetchAllUsers(
  filters: Omit<UserListFilters, 'page' | 'pageSize'> = {},
): Promise<User[]> {
  const pageSize = 100;
  const first = await userService.getAll(1, pageSize, filters);
  const items = [...(first.data?.items ?? [])];
  const totalPages = Math.max(1, first.data?.totalPages ?? 1);
  for (let page = 2; page <= totalPages; page++) {
    const next = await userService.getAll(page, pageSize, filters);
    items.push(...(next.data?.items ?? []));
  }
  return items;
}
