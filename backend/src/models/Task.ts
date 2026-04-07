import { Schema, model, Document, Types } from 'mongoose';

export const PRIORITIES = ['Low', 'Medium', 'High'] as const;
export const STATUSES = ['Pending', 'Completed'] as const;
export type Priority = typeof PRIORITIES[number];
export type Status = typeof STATUSES[number];

export interface ITask extends Document {
  _id: Types.ObjectId;
  caseId: Types.ObjectId;
  title: string;
  dueDate: Date;
  ownerName: string;
  priority: Priority;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    ownerName: { type: String, required: true, trim: true },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    status: { type: String, enum: STATUSES, default: 'Pending' },
  },
  { timestamps: true }
);

export const TaskModel = model<ITask>('Task', TaskSchema);
