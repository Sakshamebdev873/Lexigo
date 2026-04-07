import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { DashboardSummary } from '../types';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.dashboard()
      .then(setData)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-lg">Loading your overview...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
        <h3 className="font-bold text-lg mb-1">Connection Error</h3>
        <p>{err}</p>
      </div>
    );
  }

  if (!data) return null;

  const totalTasks = data.pendingTasks + data.completedTasks;
  const completionRate = totalTasks === 0 ? 0 : Math.round((data.completedTasks / totalTasks) * 100);
  const isEmpty = data.totalActiveCases === 0 && totalTasks === 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Hearing Readiness</h1>
          <p className="text-slate-500 mt-1">Real-time overview of active legal proceedings and preparation status.</p>
        </div>
        <Link 
          to="/cases/new" 
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-95"
        >
          <span className="mr-2 text-lg">+</span> New Case
        </Link>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="text-6xl mb-6 grayscale opacity-50">📂</div>
          <h3 className="text-xl font-bold text-slate-900">No active data found</h3>
          <p className="text-slate-500 max-w-sm mt-2 mb-8 text-lg">
            Your dashboard is empty. Get started by creating your first case intake record to track readiness.
          </p>
          <Link to="/cases/new" className="rounded-xl bg-slate-900 px-8 py-3 text-white font-semibold hover:bg-slate-800 transition-colors">
            Create your first case
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Active Cases" value={data.totalActiveCases} />
            <MetricCard 
              label="Upcoming Hearings" 
              value={data.hearingsNext7Days} 
              sub="Next 7 days" 
              accent="indigo" 
            />
            <MetricCard label="Pending Tasks" value={data.pendingTasks} accent="amber" />
            <MetricCard label="Task Completion" value={`${completionRate}%`} accent="emerald" />
          </div>

          {/* Readiness Score Detail Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Readiness Score</h3>
                <p className="text-sm text-slate-500">Preparation status across all active legal matters.</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                completionRate > 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {completionRate}% Complete
              </span>
            </div>
            
            {/* Tailwind Progress Bar */}
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden mb-6">
              <div 
                className="h-full bg-indigo-600 transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                style={{ width: `${completionRate}%` }}
              />
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              {totalTasks === 0
                ? 'No tasks tracked yet. Add tasks to cases to monitor readiness.'
                : `You have successfully finalized ${data.completedTasks} out of ${totalTasks} key tasks. Consistent documentation is the key to legal success.`}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// Reusable Metric Card Sub-component
function MetricCard({ label, value, sub, accent = 'slate' }: { label: string, value: number | string, sub?: string, accent?: 'indigo' | 'emerald' | 'amber' | 'slate' }) {
  const colors = {
    indigo: 'text-indigo-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    slate: 'text-slate-900'
  };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{label}</p>
      <div className={`text-4xl font-extrabold tracking-tight ${colors[accent]}`}>
        {value}
      </div>
      {sub && <p className="mt-2 text-xs text-slate-400 font-medium">{sub}</p>}
    </div>
  );
}