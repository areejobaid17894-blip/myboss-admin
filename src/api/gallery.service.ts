import { surveyApi } from '@/api/client';

export interface GalleryItem {
  id: string;
  userId: string;
  squadId: string;
  governorate: string;
  type: 'image' | 'video' | 'announcement';
  source: 'employee' | 'admin';
  url: string;
  caption?: string;
  title?: string;
  audience?: string;
  notificationId?: string;
  createdAt: string;
}

export interface GalleryListResponse {
  items: GalleryItem[];
  grouped: Record<string, GalleryItem[]>;
}

export const galleryService = {
  list: (governorate?: string, source?: 'employee' | 'admin') =>
    surveyApi
      .get<GalleryListResponse>('/gallery', {
        params: {
          ...(governorate ? { governorate } : {}),
          ...(source ? { source } : {}),
        },
      })
      .then((r) => r.data.items ?? []),
};
