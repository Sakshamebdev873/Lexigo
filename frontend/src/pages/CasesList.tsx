import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getRole } from '../services/api';
import type { Case } from '../types';
import { CASE_STAGES } from '../types';
import { StageBadge, formatDate } from '../components/ui';

export default function CasesList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const navigate = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    setErr(null);
    api.listCases({ search, stage, fromDate, toDate })
      .then(setCases)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [search, stage, fromDate, toDate]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce
    return () => clearTimeout(t);
  }, [load]);

  const clearFilters = () => {
    setSearch(''); setStage(''); setFromDate(''); setToDate('');
  };

  const onDelete = async (c: Case) => {
    if (getRole() !== 'Admin') {
      alert('Only Admin role can delete cases. Switch role from top-right.');
      return;
    }
    if (!confirm(`Delete case "${c.caseTitle}"? This also removes its tasks.`)) return;
    try {
      await api.deleteCase(c._id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Legal Case Records</h1>
        <Link 
          to="/cases/new" 
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all active:scale-95"
        >
          <span className="mr-2">+</span> New Case
        </Link>
      </div>

      {/* Modern Filter Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
  <div className="lg:col-span-2">
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
      Search
    </label>
    <input
      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none"
      placeholder="Search by title or client…"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
      Stage
    </label>
    <select
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 outline-none cursor-pointer"
      value={stage}
      onChange={(e) => setStage(e.target.value)}
    >
      <option value="">All stages</option>
      {CASE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  </div>

  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
      Hearing From
    </label>
    <input
      type="date"
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
      title="Show cases with next hearing on or after this date"
    />
  </div>

  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
      Hearing To
    </label>
    <input
      type="date"
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
      title="Show cases with next hearing on or before this date"
    />
  </div>
</div>
        <div className="flex justify-end border-t border-slate-100 pt-3">
          <button 
            className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
            onClick={clearFilters}
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          <strong>Error:</strong> {err}
        </div>
      )}

      {/* Table Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
          <p className="text-sm font-medium text-slate-500">Retrieving case files...</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center">
          <div className="text-4xl mb-4">🔎</div>
          <h3 className="text-lg font-bold text-slate-900">No cases matched</h3>
          <p className="text-slate-500 text-sm">Adjust your filters or start fresh with a new entry.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-bottom border-slate-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Case Info</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Court</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Stage</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Next Hearing</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.map((c) => (
                <tr 
                  key={c._id} 
                  onClick={() => navigate(`/cases/${c._id}`)} 
                  className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.caseTitle}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{c.clientName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{c.courtName}</td>
                  <td className="px-6 py-4">
                    <StageBadge stage={c.stage} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-700">{formatDate(c.nextHearingDate)}</div>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <Link to={`/cases/${c._id}`} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                        View
                      </Link>
                      <Link to={`/cases/${c._id}/edit`} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">
                        Edit
                      </Link>
                      <button 
                        className="rounded-md border border-red-100 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => onDelete(c)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}