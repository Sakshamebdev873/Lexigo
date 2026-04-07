import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getRole, gqlUpdateCaseStage } from '../services/api';
import type { Case, Task, Priority, CaseStage } from '../types';
import { CASE_STAGES } from '../types';
import { StageBadge, StatusBadge, PriorityBadge, formatDate } from '../components/ui';

const emptyTask = { title: '', dueDate: '', ownerName: '', priority: 'Medium' as Priority };

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [c, setCase] = useState<Case | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [taskForm, setTaskForm] = useState(emptyTask);
  const [taskErr, setTaskErr] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [cs, ts] = await Promise.all([api.getCase(id), api.listTasks(id)]);
      setCase(cs);
      setTasks(ts);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const onDelete = async () => {
    if (!c) return;
    if (getRole() !== 'Admin') { alert('Only Admin can delete cases.'); return; }
    if (!confirm(`Delete case "${c.caseTitle}" and all its tasks? This action cannot be undone.`)) return;
    try { await api.deleteCase(c._id); navigate('/cases'); }
    catch (e: any) { alert(e.message); }
  };

  const onStageChange = async (stage: CaseStage) => {
    if (!c) return;
    try {
      await gqlUpdateCaseStage(c._id, stage);
      setCase({ ...c, stage });
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const submitTask = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setTaskErr(null);
    if (!taskForm.title.trim() || !taskForm.dueDate || !taskForm.ownerName.trim()) {
      setTaskErr('Title, due date, and owner are required.');
      return;
    }
    try {
      if (editingTaskId) {
        await api.updateTask(editingTaskId, taskForm);
      } else if (id) {
        await api.createTask(id, taskForm);
      }
      setTaskForm(emptyTask);
      setEditingTaskId(null);
      load();
    } catch (e: any) {
      setTaskErr(e.message);
    }
  };

  const startEdit = (t: Task) => {
    setEditingTaskId(t._id);
    setTaskForm({
      title: t.title,
      dueDate: new Date(t.dueDate).toISOString().slice(0, 10),
      ownerName: t.ownerName,
      priority: t.priority,
    });
  };

  const toggleStatus = async (t: Task) => {
    try {
      await api.setTaskStatus(t._id, t.status === 'Pending' ? 'Completed' : 'Pending');
      load();
    } catch (e: any) { alert(e.message); }
  };

  const removeTask = async (t: Task) => {
    if (getRole() !== 'Admin') { alert('Only Admin can delete tasks.'); return; }
    if (!confirm(`Delete task "${t.title}"?`)) return;
    try { await api.deleteTask(t._id); load(); }
    catch (e: any) { alert(e.message); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
        <p className="text-sm font-medium text-slate-500">Loading case file...</p>
      </div>
    );
  }

  if (err) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">{err}</div>;
  if (!c) return <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center text-slate-500 font-medium">Case not found.</div>;

  const pending = tasks.filter((t) => t.status === 'Pending');
  const completed = tasks.filter((t) => t.status === 'Completed');

  const inputClass = "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/cases" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-2 inline-block transition-colors">&larr; All Cases</Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{c.caseTitle}</h1>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link to={`/cases/${c._id}/edit`} className="flex-1 sm:flex-none inline-flex justify-center items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            Edit Case
          </Link>
          <button onClick={onDelete} className="flex-1 sm:flex-none rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 shadow-sm hover:bg-red-100 transition-colors">
            Delete
          </button>
        </div>
      </div>

      {/* Case Details Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <DetailItem label="Client" value={c.clientName} />
          <DetailItem label="Court" value={c.courtName} />
          <DetailItem label="Case Type" value={c.caseType} />
          <DetailItem label="Next Hearing" value={formatDate(c.nextHearingDate)} />
          
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Stage</p>
            <div className="flex items-center gap-2">
              <StageBadge stage={c.stage} />
              <select
                value={c.stage}
                onChange={(e) => onStageChange(e.target.value as CaseStage)}
                className="cursor-pointer appearance-none rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 outline-none hover:bg-slate-100 focus:border-indigo-500"
                title="Quickly update stage"
              >
                {CASE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        
        {c.notes && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Case Notes</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{c.notes}</p>
          </div>
        )}
      </div>

      {/* Tasks Section Header */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Hearing Preparation Tasks</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {tasks.length} Total
        </span>
      </div>

      {/* Task Creation Form */}
      <form className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={submitTask}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4 space-y-1">
            <label className="text-xs font-bold text-slate-500">Task Title <span className="text-red-500">*</span></label>
            <input className={inputClass} placeholder="e.g. Draft Affidavit" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
          </div>
          <div className="lg:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-500">Due Date <span className="text-red-500">*</span></label>
            <input type="date" className={inputClass} value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
          </div>
          <div className="lg:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-500">Owner <span className="text-red-500">*</span></label>
            <input className={inputClass} placeholder="Assignee name" value={taskForm.ownerName} onChange={(e) => setTaskForm({ ...taskForm, ownerName: e.target.value })} />
          </div>
          <div className="lg:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-500">Priority</label>
            <select className={`${inputClass} cursor-pointer`} value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as Priority })}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <div className="lg:col-span-1 flex justify-end">
            <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 transition-colors">
              {editingTaskId ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
        
        {taskErr && <p className="mt-3 text-sm font-bold text-red-500">{taskErr}</p>}
        
        {editingTaskId && (
          <div className="mt-3 flex justify-end">
             <button type="button" className="text-xs font-bold text-slate-500 hover:text-slate-900" onClick={() => { setEditingTaskId(null); setTaskForm(emptyTask); }}>
              Cancel Edit
            </button>
          </div>
        )}
      </form>

      {/* Task Columns (Kanban Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
            <h3 className="font-bold text-slate-800">Pending Actions ({pending.length})</h3>
          </div>
          {pending.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">No pending tasks.</div>
          ) : (
            pending.map((t) => (
              <div key={t._id} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <strong className="text-slate-900 text-sm">{t.title}</strong>
                  <PriorityBadge priority={t.priority} />
                </div>
                <div className="text-xs font-medium text-slate-500 mb-4">
                  Due {formatDate(t.dueDate)} &bull; Assigned to {t.ownerName}
                </div>
                <div className="flex items-center justify-between border-t border-slate-50 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded" onClick={() => toggleStatus(t)}>
                    ✓ Mark Done
                  </button>
                  <div className="flex gap-2">
                    <button className="text-xs font-bold text-slate-500 hover:text-indigo-600" onClick={() => startEdit(t)}>Edit</button>
                    <button className="text-xs font-bold text-slate-500 hover:text-red-600" onClick={() => removeTask(t)}>Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Completed Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            <h3 className="font-bold text-slate-800">Completed ({completed.length})</h3>
          </div>
          {completed.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">No completed tasks yet.</div>
          ) : (
            completed.map((t) => (
              <div key={t._id} className="group rounded-xl border border-slate-200 bg-slate-50/50 p-5 opacity-80 hover:opacity-100 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <strong className="text-slate-600 text-sm line-through decoration-slate-300">{t.title}</strong>
                  <StatusBadge status={t.status} />
                </div>
                <div className="text-xs font-medium text-slate-400 mb-4">
                  Done &bull; {t.ownerName}
                </div>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-xs font-bold text-slate-500 hover:text-amber-600" onClick={() => toggleStatus(t)}>
                    ⟲ Reopen
                  </button>
                  <button className="text-xs font-bold text-slate-500 hover:text-red-600 ml-auto" onClick={() => removeTask(t)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Micro-component for clean case details grid
function DetailItem({ label, value }: { label: string, value: string | undefined | null }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value || '—'}</p>
    </div>
  );
}