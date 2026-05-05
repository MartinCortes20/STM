import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Worker, Task } from '../../domain/types';
import TaskCard from './TaskCard';
import AddTaskForm from './AddTaskForm';

interface Props {
  worker: Worker;
  allWorkers: Worker[];
  onClose: () => void;
  onDelete: () => Promise<void>;
  onAddTask: (task: Omit<Task, 'id' | 'updates' | 'createdAt' | 'status'>) => Promise<void>;
  onUpdateTask: (taskId: string, status: Task['status'], comment: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export default function WorkerModal({
  worker,
  allWorkers,
  onClose,
  onDelete,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(
      panelRef.current,
      { x: '100%', opacity: 0 },
      { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
    );
  }, []);

  const close = () => {
    gsap.to(panelRef.current, { x: '100%', opacity: 0, duration: 0.3, ease: 'power2.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, onComplete: onClose });
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await onDelete();
    close();
  };

  const initials = worker.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const tasksByStatus = {
    active: worker.tasks.filter(t => t.status !== 'Completed'),
    done: worker.tasks.filter(t => t.status === 'Completed'),
  };

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 opacity-0"
        style={{ zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
        onClick={close}
      />

      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full max-w-md border-l border-neon flex flex-col opacity-0"
        style={{ zIndex: 41, background: '#050f05' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-dark-green p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-2 border-neon flex items-center justify-center overflow-hidden shrink-0 shadow-neon-sm">
            {worker.photo ? (
              <img src={worker.photo} alt={worker.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-neon font-pixel text-sm">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-pixel text-neon text-[11px] truncate">{worker.name}</h2>
            <p className="text-gray-500 text-xs mt-1">{worker.role}</p>
            <div className="flex gap-2 mt-1 text-[9px] font-pixel">
              <span className="text-yellow-400">{tasksByStatus.active.length} active</span>
              <span className="text-gray-600">·</span>
              <span className="text-neon-dim">{tasksByStatus.done.length} done</span>
            </div>
          </div>
          <button onClick={close} className="text-gray-600 hover:text-neon text-xl transition-colors ml-auto shrink-0">✕</button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-b border-dark-green">
          <button
            onClick={() => setShowAddTask(true)}
            className="flex-1 bg-dark-green text-neon font-pixel text-[9px] py-2.5 hover:bg-neon hover:text-black transition-colors rounded border border-neon"
          >
            + add task
          </button>
          <button
            onClick={handleDelete}
            className={`font-pixel text-[9px] py-2.5 px-3 border rounded transition-colors ${
              confirmDelete
                ? 'bg-red-900 border-red-500 text-red-300'
                : 'border-red-900 text-red-700 hover:border-red-500 hover:text-red-400'
            }`}
          >
            {confirmDelete ? 'confirm delete?' : 'del worker'}
          </button>
          {confirmDelete && (
            <button
              onClick={() => setConfirmDelete(false)}
              className="font-pixel text-[9px] py-2.5 px-3 border border-gray-700 text-gray-500 hover:border-gray-500 transition-colors rounded"
            >
              cancel
            </button>
          )}
        </div>

        {/* Tasks */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {worker.tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-700 font-pixel text-[9px]">NO TASKS YET</p>
              <p className="text-gray-800 text-xs mt-2">Click "add task" to assign work</p>
            </div>
          ) : (
            <>
              {tasksByStatus.active.map((task, i) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  workerId={worker.id}
                  allWorkers={allWorkers}
                  index={i}
                  onUpdate={(status, comment) => onUpdateTask(task.id, status, comment)}
                  onDelete={() => onDeleteTask(task.id)}
                />
              ))}

              {tasksByStatus.done.length > 0 && (
                <>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex-1 border-t border-dark-green" />
                    <span className="text-gray-700 text-[9px] font-pixel">COMPLETED</span>
                    <div className="flex-1 border-t border-dark-green" />
                  </div>
                  {tasksByStatus.done.map((task, i) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      workerId={worker.id}
                      allWorkers={allWorkers}
                      index={i}
                      onUpdate={(status, comment) => onUpdateTask(task.id, status, comment)}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {showAddTask && (
        <AddTaskForm
          worker={worker}
          allWorkers={allWorkers}
          onSubmit={onAddTask}
          onClose={() => setShowAddTask(false)}
        />
      )}
    </>
  );
}
