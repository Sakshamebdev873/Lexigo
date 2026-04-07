export type CaseStage = 'Filing' | 'Evidence' | 'Arguments' | 'Order Reserved';
export const CASE_STAGES: CaseStage[] = ['Filing', 'Evidence', 'Arguments', 'Order Reserved'];

export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'Pending' | 'Completed';

export interface Case {
  _id: string;
  caseTitle: string;
  clientName: string;
  courtName: string;
  caseType: string;
  nextHearingDate: string;
  stage: CaseStage;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  caseId: string;
  title: string;
  dueDate: string;
  ownerName: string;
  priority: Priority;
  status: Status;
}

export interface DashboardSummary {
  totalActiveCases: number;
  hearingsNext7Days: number;
  pendingTasks: number;
  completedTasks: number;
}
