import { surveyApi } from '@/api/client';

export type QuestionType =
  | 'rating'
  | 'single_choice'
  | 'multi_choice'
  | 'nps'
  | 'text'
  | 'consent_name'
  | 'consent_national_id'
  | 'consent_phone'
  | 'consent_checkbox'
  | 'signature';

export interface SurveyQuestion {
  id: string;
  order: number;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: { id: string; label: string }[];
  validation?: Record<string, unknown>;
  section?: 'feedback' | 'consent';
}

export interface DynamicSurvey {
  id: string;
  segment: string;
  title: string;
  description?: string;
  isActive: boolean;
  questions: SurveyQuestion[];
}

export interface CompanyReport {
  scope: string;
  totalResponses: number;
  avgSatisfaction: number;
  surveysPerHour: number;
  topPriorities: { label: string; count: number; percentage: number }[];
}

export const surveyService = {
  getAll: () => surveyApi.get<DynamicSurvey[]>('/surveys').then((r) => r.data),
  create: (data: Partial<DynamicSurvey>) => surveyApi.post('/surveys', data).then((r) => r.data),
  update: (id: string, data: Partial<DynamicSurvey>) => surveyApi.put(`/surveys/${id}`, data).then((r) => r.data),
  remove: (id: string) => surveyApi.delete(`/surveys/${id}`).then((r) => r.data),
  getCompanyReport: () =>
    surveyApi.get<CompanyReport>('/responses/reports/company').then((r) => r.data),
};
