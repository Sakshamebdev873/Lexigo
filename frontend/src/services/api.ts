/// <reference types="vite/client" />

import type { Case, Task, DashboardSummary, CaseStage } from '../types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Simple role switcher stored in localStorage (Bonus 2)
export const getRole = () => localStorage.getItem('role') || 'Intern';
export const setRole = (r: string) => localStorage.setItem('role', r);

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-role': getRole(),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
      if (body?.details?.fieldErrors) {
        const fe = body.details.fieldErrors as Record<string, string[]>;
        const first = Object.entries(fe).find(([, v]) => v?.length);
        if (first) msg = `${first[0]}: ${first[1][0]}`;
      }
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // cases
  listCases: (params: { search?: string; stage?: string; fromDate?: string; toDate?: string } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
    const s = qs.toString();
    return http<Case[]>(`/cases${s ? `?${s}` : ''}`);
  },
  getCase: (id: string) => http<Case>(`/cases/${id}`),
  createCase: (data: Partial<Case>) => http<Case>('/cases', { method: 'POST', body: JSON.stringify(data) }),
  updateCase: (id: string, data: Partial<Case>) => http<Case>(`/cases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCase: (id: string) => http<{ ok: true }>(`/cases/${id}`, { method: 'DELETE' }),

  // tasks
  listTasks: (caseId: string) => http<Task[]>(`/cases/${caseId}/tasks`),
  createTask: (caseId: string, data: Partial<Task>) => http<Task>(`/cases/${caseId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: Partial<Task>) => http<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: string) => http<{ ok: true }>(`/tasks/${id}`, { method: 'DELETE' }),
  setTaskStatus: (id: string, status: 'Pending' | 'Completed') =>
    http<Task>(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // dashboard
  dashboard: () => http<DashboardSummary>('/dashboard/summary'),
};

// GraphQL helper (Bonus 1) — used by the dashboard "Quick stage update" widget
const GQL_URL = (import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000') + '/graphql';

export async function gqlUpdateCaseStage(id: string, stage: CaseStage): Promise<Case | null> {
  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation($id: ID!, $stage: String!) {
        updateCaseStage(id: $id, stage: $stage) { id caseTitle stage }
      }`,
      variables: { id, stage },
    }),
  });
  const body = await res.json();
  if (body.errors) throw new Error(body.errors[0].message);
  return body.data.updateCaseStage;
}

export async function gqlListCases(search?: string) {
  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query($search: String) { cases(search: $search) { id caseTitle clientName stage } }`,
      variables: { search },
    }),
  });
  const body = await res.json();
  if (body.errors) throw new Error(body.errors[0].message);
  return body.data.cases;
}
