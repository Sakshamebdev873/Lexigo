import { Request, Response, NextFunction } from 'express';
import { TaskModel } from '../models/Task';
import { CaseModel } from '../models/Case';
import { taskSchema, taskStatusSchema } from '../middleware/validation';
import { HttpError } from '../middleware/error';
import { isValidObjectId } from 'mongoose';

const ensureId = (id: unknown): string => {
  if (typeof id !== 'string' || !isValidObjectId(id)) throw new HttpError(400, 'Invalid id');
  return id;
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseId = ensureId(req.params.id);
    const parent = await CaseModel.findById(caseId);
    if (!parent) throw new HttpError(404, 'Parent case not found');
    const parsed = taskSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Validation failed', parsed.error.flatten());
    const task = await TaskModel.create({ ...parsed.data, caseId: parent._id });
    res.status(201).json(task);
  } catch (e) { next(e); }
};

export const listTasksForCase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseId = ensureId(req.params.id);
    const tasks = await TaskModel.find({ caseId }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (e) { next(e); }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = ensureId(req.params.id);
    const parsed = taskSchema.partial().safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Validation failed', parsed.error.flatten());
    const updated = await TaskModel.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true });
    if (!updated) throw new HttpError(404, 'Task not found');
    res.json(updated);
  } catch (e) { next(e); }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = ensureId(req.params.id);
    const r = await TaskModel.findByIdAndDelete(id);
    if (!r) throw new HttpError(404, 'Task not found');
    res.json({ ok: true });
  } catch (e) { next(e); }
};

export const patchTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = ensureId(req.params.id);
    const parsed = taskStatusSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Validation failed', parsed.error.flatten());
    const updated = await TaskModel.findByIdAndUpdate(id, { status: parsed.data.status }, { new: true });
    if (!updated) throw new HttpError(404, 'Task not found');
    res.json(updated);
  } catch (e) { next(e); }
};
