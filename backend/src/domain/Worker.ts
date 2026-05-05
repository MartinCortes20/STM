export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Has Doubts';
export type TaskPriority = 'Normal' | 'Urgent';
export type TaskType = 'Individual' | 'Collaborative';

export interface TaskUpdate {
  comment: string;
  timestamp: string;
  status: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  hasDeadline: boolean;
  deadline?: string;
  priority: TaskPriority;
  type: TaskType;
  collaborators?: string[];
  tags?: string;
  status: TaskStatus;
  updates: TaskUpdate[];
  createdAt: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  photo?: string;
  tasks: Task[];
  createdAt: string;
}
