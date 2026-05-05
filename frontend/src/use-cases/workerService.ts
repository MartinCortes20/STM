import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../infrastructure/firebaseClient';
import { Worker, Task, TaskUpdate } from '../domain/types';

const col = collection(db, 'workers');

function docToWorker(id: string, data: Record<string, any>): Worker {
  return { ...(data as Omit<Worker, 'id'>), id };
}

export const workerService = {
  async getAll(): Promise<Worker[]> {
    const snap = await getDocs(col);
    return snap.docs.map(d => docToWorker(d.id, d.data()));
  },

  async create(name: string, role: string, photo?: string): Promise<Worker> {
    const payload = {
      name,
      role,
      photo: photo ?? null,
      tasks: [],
      createdAt: new Date().toISOString(),
    };
    const ref = await addDoc(col, payload);
    return { ...payload, id: ref.id, photo };
  },

  async remove(id: string): Promise<{ success: boolean }> {
    await deleteDoc(doc(db, 'workers', id));
    return { success: true };
  },

  async addTask(
    workerId: string,
    task: Omit<Task, 'id' | 'updates' | 'createdAt' | 'status'>
  ): Promise<Task> {
    const ref = doc(db, 'workers', workerId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Worker not found');

    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      status: 'Pending',
      updates: [],
      createdAt: new Date().toISOString(),
    };

    const tasks = ((snap.data().tasks ?? []) as Task[]).concat(newTask);
    await updateDoc(ref, { tasks });
    return newTask;
  },

  async updateTask(
    workerId: string,
    taskId: string,
    update: { status?: Task['status']; comment?: string }
  ): Promise<Task> {
    const ref = doc(db, 'workers', workerId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Worker not found');

    const tasks = (snap.data().tasks ?? []) as Task[];
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) throw new Error('Task not found');

    const task = { ...tasks[idx] };
    if (update.status) task.status = update.status;
    if (update.comment) {
      const entry: TaskUpdate = {
        comment: update.comment,
        timestamp: new Date().toISOString(),
        status: task.status,
      };
      task.updates = [...task.updates, entry];
    }
    tasks[idx] = task;

    await updateDoc(ref, { tasks });
    return task;
  },

  async deleteTask(workerId: string, taskId: string): Promise<{ success: boolean }> {
    const ref = doc(db, 'workers', workerId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Worker not found');

    const tasks = ((snap.data().tasks ?? []) as Task[]).filter(t => t.id !== taskId);
    await updateDoc(ref, { tasks });
    return { success: true };
  },
};
