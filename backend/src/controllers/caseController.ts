import { Request, Response, NextFunction } from 'express';
import { CaseModel } from '../models/Case';
import { TaskModel } from '../models/Task';
import { caseSchema } from '../middleware/validation';
import { HttpError } from '../middleware/error';
import { isValidObjectId } from 'mongoose';

const ensureId = (id: string) => {
  if (!isValidObjectId(id)) throw new HttpError(400, 'Invalid id');
};

export const createCase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = caseSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Validation failed', parsed.error.flatten());
    const created = await CaseModel.create(parsed.data);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const listCases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, stage, fromDate, toDate } = req.query as Record<string, string | undefined>;
    const q: any = {};
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      q.$or = [{ caseTitle: re }, { clientName: re }];
    }
    if (stage) q.stage = stage;
    if (fromDate || toDate) {
      q.nextHearingDate = {};
      if (fromDate) q.nextHearingDate.$gte = new Date(fromDate);
      if (toDate) q.nextHearingDate.$lte = new Date(toDate);
    }
    const cases = await CaseModel.find(q).sort({ nextHearingDate: 1 });
    res.json(cases);
  } catch (e) { next(e); }
};

export const getCase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    ensureId(req.params.id);
    const c = await CaseModel.findById(req.params.id);
    if (!c) throw new HttpError(404, 'Case not found');
    res.json(c);
  } catch (e) { next(e); }
};

export const updateCase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    ensureId(req.params.id);
    const parsed = caseSchema.partial().safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Validation failed', parsed.error.flatten());
    const updated = await CaseModel.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
    if (!updated) throw new HttpError(404, 'Case not found');
    res.json(updated);
  } catch (e) { next(e); }
};

export const deleteCase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    ensureId(req.params.id);
    const c = await CaseModel.findById(req.params.id);
    if (!c) throw new HttpError(404, 'Case not found');
    // Cascade delete dependent tasks
    await TaskModel.deleteMany({ caseId: c._id });
    await c.deleteOne();
    res.json({ ok: true });
  } catch (e) { next(e); }
};
