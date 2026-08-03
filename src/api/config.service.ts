import { configApi } from '@/api/client';

export interface EmployeeSettings {
  maxUsersPerSquad: number;
  maxSquads: number;
  surveyTargetPerSquad: number;
  eventDurationHours: number;
  profileEditLimit: number;
  galleryUploadLimit: number;
  vestSizeEditWindowStart: string;
  vestSizeEditWindowEnd: string;
}

export interface SquadLimits {
  maxUsersPerSquad: number;
  maxSquads: number;
}

export const configService = {
  getAll: () => configApi.get('/config'),
  getByKey: (key: string) => configApi.get(`/config/${key}`),
  update: (key: string, value: unknown) => configApi.put(`/config/${key}`, { value }),
  getSquadLimits: () => configApi.get<SquadLimits>('/config/squad-limits'),
  updateSquadLimits: (payload: Partial<SquadLimits>) =>
    configApi.put<SquadLimits>('/config/squad-limits', payload),
  getEmployeeSettings: () => configApi.get<EmployeeSettings>('/config/employee-settings'),
  updateEmployeeSettings: (payload: Partial<EmployeeSettings>) =>
    configApi.put<EmployeeSettings>('/config/employee-settings', payload),
};
