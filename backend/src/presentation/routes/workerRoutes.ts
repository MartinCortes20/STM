import { Router, Request, Response } from 'express';
import * as uc from '../../use-cases/workerUseCases';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    res.json(uc.getWorkers());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { name, role, photo } = req.body;
    if (!name || !role) return res.status(400).json({ error: 'name and role required' }) as any;
    res.status(201).json(uc.createWorker(name, role, photo));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    uc.deleteWorker(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id/tasks', (req: Request, res: Response) => {
  try {
    const worker = uc.getWorkers().find(w => w.id === req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' }) as any;
    res.json(worker.tasks);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/tasks', (req: Request, res: Response) => {
  try {
    const task = uc.addTask(req.params.id, req.body);
    res.status(201).json(task);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id/tasks/:taskId', (req: Request, res: Response) => {
  try {
    const task = uc.updateTask(req.params.id, req.params.taskId, req.body);
    res.json(task);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id/tasks/:taskId', (req: Request, res: Response) => {
  try {
    uc.deleteTask(req.params.id, req.params.taskId);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
