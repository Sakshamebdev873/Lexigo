import { z } from 'zod';
import { CASE_STAGES } from '../models/Case';
import { PRIORITIES, STATUSES } from '../models/Task';

export const caseSchema = z.object({
  caseTitle: z.string().min(3, 'caseTitle must be at least 3 characters'),
  clientName: z.string().min(1, 'clientName is required'),
  courtName: z.string().min(1, 'courtName is required'),
  caseType: z.string().min(1, 'caseType is required'),
  nextHearingDate: z.coerce.date({ errorMap: () => ({ message: 'nextHearingDate must be a valid date' }) }),
  stage: z.enum(CASE_STAGES),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export const taskSchema = z.object({
  title: z.string().min(1, 'title is required'),
  dueDate: z.coerce.date({ errorMap: () => ({ message: 'dueDate must be a valid date' }) }),
  ownerName: z.string().min(1, 'ownerName is required'),
  priority: z.enum(PRIORITIES).default('Medium'),
  status: z.enum(STATUSES).default('Pending'),
});

export const taskStatusSchema = z.object({
  status: z.enum(STATUSES),
});
