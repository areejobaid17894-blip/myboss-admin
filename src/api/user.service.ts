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

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

export const userService = {
  getAll: (page = 1, pageSize = 50) =>
    userApi.get<PaginatedUsers>('/users', { params: { page, pageSize } }),
  create: (data: CreateUserPayload) => userApi.post<User>('/users', data),
};
