import { Router } from 'express';
import * as cases from '../controllers/caseController';
import * as tasks from '../controllers/taskController';
import { getDashboardSummary } from '../controllers/dashboardController';
import { requireAdmin } from '../middleware/error';

const router = Router();

// Cases
router.post('/cases', cases.createCase);
router.get('/cases', cases.listCases);
router.get('/cases/:id', cases.getCase);
router.put('/cases/:id', cases.updateCase);
router.delete('/cases/:id', requireAdmin, cases.deleteCase);

// Tasks under a case
router.post('/cases/:id/tasks', tasks.createTask);
router.get('/cases/:id/tasks', tasks.listTasksForCase);

// Tasks direct
router.put('/tasks/:id', tasks.updateTask);
router.delete('/tasks/:id', requireAdmin, tasks.deleteTask);
router.patch('/tasks/:id/status', tasks.patchTaskStatus);

// Dashboard
router.get('/dashboard/summary', getDashboardSummary);

export default router;
