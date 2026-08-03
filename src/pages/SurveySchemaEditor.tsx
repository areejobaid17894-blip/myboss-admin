import { useEffect, useState } from 'react';
import {
  surveyService,
  type DynamicSurvey,
  type QuestionType,
  type SurveyQuestion,
} from '@/api/survey.service';
import { getApiErrorMessage } from '@/api/errors';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n/en';

const QUESTION_TYPES: QuestionType[] = [
  'rating',
  'single_choice',
  'multi_choice',
  'nps',
  'text',
  'consent_name',
  'consent_national_id',
  'consent_phone',
  'consent_checkbox',
  'signature',
];

const QUESTION_TYPE_LABEL_KEYS: Record<QuestionType, TranslationKey> = {
  rating: 'questionTypeRating',
  single_choice: 'questionTypeSingleChoice',
  multi_choice: 'questionTypeMultiChoice',
  nps: 'questionTypeNps',
  text: 'questionTypeText',
  consent_name: 'questionTypeConsentName',
  consent_national_id: 'questionTypeConsentNationalId',
  consent_phone: 'questionTypeConsentPhone',
  consent_checkbox: 'questionTypeConsentCheckbox',
  signature: 'questionTypeSignature',
};

const SEGMENTS = ['consumer', 'business', 'employee'] as const;

const SEGMENT_LABEL_KEYS: Record<(typeof SEGMENTS)[number], TranslationKey> = {
  consumer: 'segmentConsumer',
  business: 'segmentBusiness',
  employee: 'segmentEmployee',
};

function emptyQuestion(order: number): SurveyQuestion {
  return {
    id: `q${Date.now()}_${order}`,
    order,
    type: 'rating',
    title: '',
    required: true,
    section: 'feedback',
  };
}

export function SurveySchemaEditor() {
  const { t } = useI18n();
  const [surveys, setSurveys] = useState<DynamicSurvey[]>([]);
  const [selected, setSelected] = useState<DynamicSurvey | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setSurveys(await surveyService.getAll());
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setSelected({
      id: '',
      segment: 'consumer',
      title: t('newSurveyDefaultTitle'),
      description: '',
      isActive: true,
      questions: [emptyQuestion(1)],
    });
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...selected,
        questions: selected.questions.map((q, i) => ({ ...q, order: i + 1 })),
      };
      if (selected.id) await surveyService.update(selected.id, payload);
      else await surveyService.create(payload);
      await load();
      setSelected(null);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t('surveyDeleteConfirm'))) return;
    await surveyService.remove(id);
    await load();
    if (selected?.id === id) setSelected(null);
  };

  const updateQuestion = (index: number, patch: Partial<SurveyQuestion>) => {
    if (!selected) return;
    setSelected({
      ...selected,
      questions: selected.questions.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    });
  };

  if (loading) return <p>{t('loadingSurveys')}</p>;

  return (
    <div className="ac-card" style={{ marginTop: 20 }}>
      <h2>{t('surveysSchemaTitle')}</h2>
      <p className="ac-sub">{t('surveysSubtitle')}</p>
      {error && <div className="ac-error">{error}</div>}
      <div className="ac-toolbar">
        <button type="button" className="ac-btn ac-btn-orange ac-btn-sm" onClick={startNew}>
          {t('newSurvey')}
        </button>
      </div>
      <div className="ac-grid ac-g2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {surveys.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`ac-btn ac-btn-ghost ${selected?.id === s.id ? 'ac-modified' : ''}`}
              style={{ justifyContent: 'flex-start', textAlign: 'start' }}
              onClick={() => setSelected(s)}
            >
              <strong>{s.title}</strong>
              <span style={{ marginInlineStart: 8, fontSize: '0.75rem', color: 'var(--ac-gray-mid)' }}>
                {t(SEGMENT_LABEL_KEYS[s.segment as (typeof SEGMENTS)[number]])} · {s.questions.length}{' '}
                {t('surveyQuestionsUnit')}
              </span>
            </button>
          ))}
        </div>
        {selected && (
          <div>
            <div className="ac-field">
              <label>{t('surveyTitleLabel')}</label>
              <input
                type="text"
                value={selected.title}
                onChange={(e) => setSelected({ ...selected, title: e.target.value })}
              />
            </div>
            <div className="ac-field">
              <label>{t('surveySegmentLabel')}</label>
              <select
                value={selected.segment}
                onChange={(e) => setSelected({ ...selected, segment: e.target.value })}
              >
                {SEGMENTS.map((s) => (
                  <option key={s} value={s}>
                    {t(SEGMENT_LABEL_KEYS[s])}
                  </option>
                ))}
              </select>
            </div>
            <div className="ac-field">
              <label>{t('surveyDescriptionLabel')}</label>
              <textarea
                rows={2}
                value={selected.description ?? ''}
                onChange={(e) => setSelected({ ...selected, description: e.target.value })}
              />
            </div>
            <h3 style={{ fontSize: '0.9rem', margin: '12px 0 8px' }}>{t('surveyQuestionsHeading')}</h3>
            {selected.questions.map((q, index) => (
              <div key={q.id} className="ac-card" style={{ padding: 14, marginBottom: 10 }}>
                <div className="ac-field">
                  <label>
                    Q{index + 1} — {t('surveyQuestionType')}
                  </label>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(index, { type: e.target.value as QuestionType })}
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {t(QUESTION_TYPE_LABEL_KEYS[type])}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ac-field">
                  <label>{t('surveyQuestionTitle')}</label>
                  <input
                    type="text"
                    value={q.title}
                    onChange={(e) => updateQuestion(index, { title: e.target.value })}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="ac-btn ac-btn-ghost ac-btn-sm"
              onClick={() =>
                setSelected({
                  ...selected,
                  questions: [...selected.questions, emptyQuestion(selected.questions.length + 1)],
                })
              }
            >
              + {t('surveyAddQuestion')}
            </button>
            <div className="ac-toolbar" style={{ marginTop: 14 }}>
              <button type="button" className="ac-btn ac-btn-orange" onClick={save} disabled={saving}>
                {saving ? t('pleaseWait') : t('saveSurvey')}
              </button>
              <button type="button" className="ac-btn ac-btn-ghost" onClick={() => setSelected(null)}>
                {t('cancel')}
              </button>
              {selected.id && (
                <button type="button" className="ac-btn ac-btn-outline" onClick={() => remove(selected.id)}>
                  {t('delete')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
