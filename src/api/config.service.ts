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

export const configService = {
  getEmployeeSettings: () => configApi.get<EmployeeSettings>('/config/employee-settings'),
  updateEmployeeSettings: (payload: Partial<EmployeeSettings>) =>
    configApi.put<EmployeeSettings>('/config/employee-settings', payload),
};
