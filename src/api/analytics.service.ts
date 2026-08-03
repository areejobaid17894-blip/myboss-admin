import { surveyApi } from '@/api/client';
import { env } from '@/config/env';

export interface AnalyticsColumn {
  name: string;
  type: string;
  description: string;
}

export interface AnalyticsDataset {
  id: string;
  name: string;
  description: string;
  powerBiHint: string;
  columns: AnalyticsColumn[];
  rowCount: number;
}

export interface AnalyticsSeriesPoint {
  period: string;
  segment: string;
  governorate: string;
  responseCount: number;
  avgSatisfaction: number;
  avgNps: number;
}

export const analyticsService = {
  listDatasets: () =>
    surveyApi.get<{ datasets: AnalyticsDataset[]; updatedAt: string }>('/analytics/datasets'),

  getSeries: () =>
    surveyApi.get<{ series: AnalyticsSeriesPoint[]; updatedAt: string }>('/analytics/series'),

  exportUrl: (datasetId: string, format: 'csv' | 'json' = 'csv') =>
    `${env.surveyApiUrl}/analytics/export/${datasetId}?format=${format}`,

  downloadExport: async (datasetId: string, format: 'csv' | 'json' = 'csv') => {
    const response = await surveyApi.get(`/analytics/export/${datasetId}`, {
      params: { format },
      responseType: 'blob',
    });
    const blob = new Blob([response.data], {
      type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${datasetId}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  },
};
