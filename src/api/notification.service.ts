import { surveyApi } from '@/api/client';

export type NotificationAudience =
  | 'All employees'
  | 'Squad leaders'
  | 'Travel-eligible squads'
  | 'Unregistered employees';

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  audience: NotificationAudience;
  galleryItemId: string;
  readBy: string[];
  createdAt: string;
  isRead?: boolean;
}

export interface CreateNotificationPayload {
  title: string;
  body: string;
  audience: NotificationAudience;
  imageUrl?: string;
  governorate?: string;
}

export const notificationService = {
  create: (payload: CreateNotificationPayload) =>
    surveyApi.post<NotificationRecord>('/notifications', payload).then((r) => r.data),

  history: () =>
    surveyApi.get<NotificationRecord[]>('/notifications/history').then((r) => r.data),
};
