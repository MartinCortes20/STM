import { api } from '../infrastructure/apiClient';
import { Worker, Task } from '../domain/types';

type NewTask = Omit<Task, 'id' | 'updates' | 'createdAt' | 'status'>;

export const workerService = {
  getAll: () => api.get<Worker[]>('/workers'),

  create: (name: string, role: string, photo?: string) =>
    api.post<Worker>('/workers', { name, role, photo }),

  remove: (id: string) => api.delete<{ success: boolean }>(`/workers/${id}`),

  addTask: (workerId: string, task: NewTask) =>
    api.post<Task>(`/workers/${workerId}/tasks`, task),

  updateTask: (
    workerId: string,
    taskId: string,
    update: { status?: Task['status']; comment?: string }
  ) => api.patch<Task>(`/workers/${workerId}/tasks/${taskId}`, update),

  deleteTask: (workerId: string, taskId: string) =>
    api.delete<{ success: boolean }>(`/workers/${workerId}/tasks/${taskId}`),
};
