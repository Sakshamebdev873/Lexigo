import { Request, Response, NextFunction } from 'express';
import { CaseModel } from '../models/Case';
import { TaskModel } from '../models/Task';

export const getDashboardSummary = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const in7 = new Date();
    in7.setDate(now.getDate() + 7);

    const [totalActiveCases, hearingsNext7Days, pendingTasks, completedTasks] = await Promise.all([
      CaseModel.countDocuments({ stage: { $ne: 'Order Reserved' } }),
      CaseModel.countDocuments({ nextHearingDate: { $gte: now, $lte: in7 } }),
      TaskModel.countDocuments({ status: 'Pending' }),
      TaskModel.countDocuments({ status: 'Completed' }),
    ]);

    res.json({ totalActiveCases, hearingsNext7Days, pendingTasks, completedTasks });
  } catch (e) { next(e); }
};
