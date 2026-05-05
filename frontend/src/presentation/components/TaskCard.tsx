import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Task, Worker } from '../../domain/types';

interface Props {
  task: Task;
  workerId: string;
  allWorkers: Worker[];
  onUpdate: (status: Task['status'], comment: string) => Promise<void>;
  onDelete: () => Promise<void>;
  index: number;
}

const STATUS_COLORS: Record<Task['status'], string> = {
  Pending: 'text-yellow-400 border-yellow-400',
  'In Progress': 'text-blue-400 border-blue-400',
  Completed: 'text-neon border-neon',
  'Has Doubts': 'text-orange-400 border-orange-400',
};

const STATUS_OPTIONS: Task['status'][] = ['Pending', 'In Progress', 'Completed', 'Has Doubts'];

export default function TaskCard({ task, allWorkers, onUpdate, onDelete, index }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [newStatus, setNewStatus] = useState<Task['status']>(task.status);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, delay: index * 0.06, ease: 'power2.out' }
    );
  }, [index]);

  const collaboratorNames = (task.collaborators || [])
    .map(id => allWorkers.find(w => w.id === id)?.name || id)
    .join(', ');

  const handleSave = async () => {
    if (!comment.trim() && newStatus === task.status) return;
    setSaving(true);
    await onUpdate(newStatus, comment.trim());
    setComment('');
    setSaving(false);
    setExpanded(false);
  };

  return (
    <div
      ref={ref}
      className="opacity-0 border border-dark-green rounded p-3 bg-panel hover:border-neon-dim transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white text-xs font-medium truncate">{task.title}</span>
            <span
              className={`text-[9px] font-pixel border px-1 py-0.5 rounded ${
                task.priority === 'Urgent'
                  ? 'text-red-400 border-red-500'
                  : 'text-gray-400 border-gray-600'
              }`}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="text-gray-400 text-[11px] mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px]">
            <span className={`border rounded px-1 font-pixel text-[8px] ${STATUS_COLORS[task.status]}`}>
              {task.status}
            </span>
            {task.hasDeadline && task.deadline && (
              <span className="text-gray-500">
                Due: {new Date(task.deadline).toLocaleDateString()}
              </span>
            )}
            {task.type === 'Collaborative' && collaboratorNames && (
              <span className="text-purple-400">+ {collaboratorNames}</span>
            )}
            {task.tags && <span className="text-gray-600 italic">{task.tags}</span>}
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-neon-dim text-[10px] font-pixel border border-dark-green px-2 py-1 hover:border-neon hover:text-neon transition-colors"
          >
            {expanded ? 'close' : 'upd'}
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 text-[10px] font-pixel border border-red-900 px-2 py-1 hover:border-red-500 hover:text-red-400 transition-colors"
          >
            del
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 border-t border-dark-green pt-3 space-y-2">
          <select
            value={newStatus}
            onChange={e => setNewStatus(e.target.value as Task['status'])}
            className="w-full bg-black border border-dark-green text-neon text-xs p-2 rounded focus:border-neon outline-none font-pixel text-[9px]"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add update comment..."
            rows={2}
            className="w-full bg-black border border-dark-green text-gray-300 text-xs p-2 rounded focus:border-neon outline-none resize-none placeholder-gray-700"
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-dark-green text-neon font-pixel text-[9px] py-2 hover:bg-neon hover:text-black transition-colors rounded disabled:opacity-50"
          >
            {saving ? 'saving...' : 'save update'}
          </button>

          {task.updates.length > 0 && (
            <div className="space-y-1 mt-2">
              <p className="text-gray-600 text-[9px] font-pixel">LOG</p>
              {task.updates.slice().reverse().map((u, i) => (
                <div key={i} className="text-[10px] border-l-2 border-dark-green pl-2">
                  <span className="text-gray-500">{new Date(u.timestamp).toLocaleString()}</span>
                  <span className="text-gray-400 ml-2">{u.comment}</span>
                  <span className="text-neon-dim ml-2">[{u.status}]</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
