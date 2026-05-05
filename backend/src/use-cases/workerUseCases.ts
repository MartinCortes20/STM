import { v4 as uuidv4 } from 'uuid';
import { Worker, Task, TaskUpdate } from '../domain/Worker';
import { JsonRepository } from '../infrastructure/JsonRepository';

export const getWorkers = (): Worker[] => JsonRepository.getWorkers();

export const createWorker = (name: string, role: string, photo?: string): Worker => {
  const worker: Worker = {
    id: uuidv4(),
    name,
    role,
    photo,
    tasks: [],
    createdAt: new Date().toISOString(),
  };
  return JsonRepository.saveWorker(worker);
};

export const deleteWorker = (id: string): void => JsonRepository.deleteWorker(id);

export const addTask = (
  workerId: string,
  taskData: Omit<Task, 'id' | 'updates' | 'createdAt' | 'status'>
): Task => {
  const worker = JsonRepository.getWorkerById(workerId);
  if (!worker) throw new Error('Worker not found');

  const task: Task = {
    ...taskData,
    id: uuidv4(),
    status: 'Pending',
    updates: [],
    createdAt: new Date().toISOString(),
  };

  worker.tasks.push(task);
  JsonRepository.updateWorker(worker);
  return task;
};

export const updateTask = (
  workerId: string,
  taskId: string,
  update: { status?: Task['status']; comment?: string }
): Task => {
  const worker = JsonRepository.getWorkerById(workerId);
  if (!worker) throw new Error('Worker not found');

  const task = worker.tasks.find(t => t.id === taskId);
  if (!task) throw new Error('Task not found');

  if (update.status) task.status = update.status;
  if (update.comment) {
    const entry: TaskUpdate = {
      comment: update.comment,
      timestamp: new Date().toISOString(),
      status: task.status,
    };
    task.updates.push(entry);
  }

  JsonRepository.updateWorker(worker);
  return task;
};

export const deleteTask = (workerId: string, taskId: string): void => {
  const worker = JsonRepository.getWorkerById(workerId);
  if (!worker) throw new Error('Worker not found');
  worker.tasks = worker.tasks.filter(t => t.id !== taskId);
  JsonRepository.updateWorker(worker);
};
