import type { CaseStage, Priority, Status } from '../types';

export function StageBadge({ stage }: { stage: CaseStage }) {
  const cls = {
    'Filing': 'badge-filing',
    'Evidence': 'badge-evidence',
    'Arguments': 'badge-arguments',
    'Order Reserved': 'badge-reserved',
  }[stage];
  return <span className={`badge ${cls}`}>{stage}</span>;
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge ${status === 'Pending' ? 'badge-pending' : 'badge-completed'}`}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const cls = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high' }[priority];
  return <span className={`badge ${cls}`}>{priority}</span>;
}

export function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function toDateInput(iso: string) {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}
