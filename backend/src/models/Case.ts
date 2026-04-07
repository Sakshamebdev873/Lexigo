import { Schema, model, Document, Types } from 'mongoose';

export const CASE_STAGES = ['Filing', 'Evidence', 'Arguments', 'Order Reserved'] as const;
export type CaseStage = typeof CASE_STAGES[number];

export interface ICase extends Document {
  _id: Types.ObjectId;
  caseTitle: string;
  clientName: string;
  courtName: string;
  caseType: string;
  nextHearingDate: Date;
  stage: CaseStage;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema = new Schema<ICase>(
  {
    caseTitle: { type: String, required: true, trim: true, minlength: 3 },
    clientName: { type: String, required: true, trim: true },
    courtName: { type: String, required: true, trim: true },
    caseType: { type: String, required: true, trim: true },
    nextHearingDate: { type: Date, required: true },
    stage: { type: String, required: true, enum: CASE_STAGES },
    notes: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

CaseSchema.index({ caseTitle: 'text', clientName: 'text' });

export const CaseModel = model<ICase>('Case', CaseSchema);
