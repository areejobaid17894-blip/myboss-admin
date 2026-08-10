import { surveyApi } from '@/api/client';

export const analyticsService = {
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
