import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { CASE_STAGES } from '../types';
import type { CaseStage } from '../types';
import { toDateInput } from '../components/ui';

interface Props { mode: 'create' | 'edit'; }

interface FormState {
  caseTitle: string;
  clientName: string;
  courtName: string;
  caseType: string;
  nextHearingDate: string;
  stage: CaseStage;
  notes: string;
}

const initial: FormState = {
  caseTitle: '', clientName: '', courtName: '', caseType: '',
  nextHearingDate: '', stage: 'Filing', notes: '',
};

export default function CaseForm({ mode }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && id) {
      api.getCase(id)
        .then((c) => setForm({
          caseTitle: c.caseTitle,
          clientName: c.clientName,
          courtName: c.courtName,
          caseType: c.caseType,
          nextHearingDate: toDateInput(c.nextHearingDate),
          stage: c.stage,
          notes: c.notes || '',
        }))
        .catch((e) => setServerErr(e.message))
        .finally(() => setLoading(false));
    }
  }, [mode, id]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (form.caseTitle.trim().length < 3) e.caseTitle = 'Must be at least 3 characters';
    if (!form.clientName.trim()) e.clientName = 'Client name is required';
    if (!form.courtName.trim()) e.courtName = 'Court name is required';
    if (!form.caseType.trim()) e.caseType = 'Case type is required';
    if (!form.nextHearingDate) e.nextHearingDate = 'Next hearing date is required';
    if (form.notes.length > 1000) e.notes = 'Maximum 1000 characters allowed';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerErr(null);
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, notes: form.notes || undefined };
      if (mode === 'create') {
        const created = await api.createCase(payload);
        navigate(`/cases/${created._id}`);
      } else if (id) {
        await api.updateCase(id, payload);
        navigate(`/cases/${id}`);
      }
    } catch (e: any) {
      setServerErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Reusable input class to keep JSX clean
  const inputBaseClass = "block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none";
  const inputErrorClass = "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-50/50";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
        <p className="text-sm font-medium text-slate-500">Loading case details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {mode === 'create' ? 'Open New Case' : 'Edit Case Details'}
        </h1>
        <Link 
          to="/cases" 
          className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          &larr; Back to Cases
        </Link>
      </div>

      {serverErr && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm">
          {serverErr}
        </div>
      )}

      {/* Form Card */}
      <form className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6" onSubmit={onSubmit} noValidate>
        
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-700">Case Title <span className="text-red-500">*</span></label>
          <input 
            className={`${inputBaseClass} ${errors.caseTitle ? inputErrorClass : ''}`}
            placeholder="e.g., Smith vs. Johnson Corp"
            value={form.caseTitle} 
            onChange={(e) => set('caseTitle', e.target.value)} 
          />
          {errors.caseTitle && <p className="text-xs font-bold text-red-500">{errors.caseTitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">Client Name <span className="text-red-500">*</span></label>
            <input 
              className={`${inputBaseClass} ${errors.clientName ? inputErrorClass : ''}`}
              placeholder="Full name or company"
              value={form.clientName} 
              onChange={(e) => set('clientName', e.target.value)} 
            />
            {errors.clientName && <p className="text-xs font-bold text-red-500">{errors.clientName}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">Court Name <span className="text-red-500">*</span></label>
            <input 
              className={`${inputBaseClass} ${errors.courtName ? inputErrorClass : ''}`}
              placeholder="e.g., District Court, NY"
              value={form.courtName} 
              onChange={(e) => set('courtName', e.target.value)} 
            />
            {errors.courtName && <p className="text-xs font-bold text-red-500">{errors.courtName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">Case Type <span className="text-red-500">*</span></label>
            <input 
              className={`${inputBaseClass} ${errors.caseType ? inputErrorClass : ''}`}
              placeholder="e.g., Civil, Criminal, Corporate"
              value={form.caseType} 
              onChange={(e) => set('caseType', e.target.value)} 
            />
            {errors.caseType && <p className="text-xs font-bold text-red-500">{errors.caseType}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">Next Hearing Date <span className="text-red-500">*</span></label>
            <input 
              type="date" 
              className={`${inputBaseClass} ${errors.nextHearingDate ? inputErrorClass : ''}`}
              value={form.nextHearingDate} 
              onChange={(e) => set('nextHearingDate', e.target.value)} 
            />
            {errors.nextHearingDate && <p className="text-xs font-bold text-red-500">{errors.nextHearingDate}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-700">Current Stage <span className="text-red-500">*</span></label>
          <select 
            className={`${inputBaseClass} cursor-pointer appearance-none`}
            value={form.stage} 
            onChange={(e) => set('stage', e.target.value as CaseStage)}
          >
            {CASE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-bold text-slate-700">Case Notes</label>
            <span className={`text-xs font-medium ${form.notes.length > 900 ? 'text-amber-500' : 'text-slate-400'}`}>
              {form.notes.length}/1000
            </span>
          </div>
          <textarea 
            rows={5} 
            className={`${inputBaseClass} resize-y min-h-[120px] ${errors.notes ? inputErrorClass : ''}`}
            placeholder="Add any internal notes, strategy, or context here..."
            value={form.notes} 
            onChange={(e) => set('notes', e.target.value)} 
          />
          {errors.notes && <p className="text-xs font-bold text-red-500">{errors.notes}</p>}
        </div>

        <div className="pt-4 flex flex-col-reverse sm:flex-row items-center gap-3 border-t border-slate-100">
          <Link 
            to="/cases" 
            className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors text-center"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={saving}
            className="w-full sm:w-auto ml-auto inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              mode === 'create' ? 'Create Case' : 'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}