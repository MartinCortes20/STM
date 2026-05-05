import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Task, Worker } from '../../domain/types';

type NewTask = Omit<Task, 'id' | 'updates' | 'createdAt' | 'status'>;

interface Props {
  worker: Worker;
  allWorkers: Worker[];
  onSubmit: (task: NewTask) => Promise<void>;
  onClose: () => void;
}

export default function AddTaskForm({ worker, allWorkers, onSubmit, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('Normal');
  const [type, setType] = useState<Task['type']>('Individual');
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const otherWorkers = allWorkers.filter(w => w.id !== worker.id);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, scale: 0.92, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
    );
  }, []);

  const close = () => {
    gsap.to(panelRef.current, { opacity: 0, scale: 0.9, y: 20, duration: 0.25, ease: 'power2.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, onComplete: onClose });
  };

  const toggleCollab = (id: string) => {
    setCollaborators(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const task: NewTask = {
      title: title.trim(),
      description: description.trim() || undefined,
      hasDeadline,
      deadline: hasDeadline ? deadline : undefined,
      priority,
      type,
      collaborators: type === 'Collaborative' ? collaborators : undefined,
      tags: tags.trim() || undefined,
    };
    await onSubmit(task);
    setLoading(false);
    close();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center p-4 opacity-0"
      style={{ zIndex: 60, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) close(); }}
    >
      <div
        ref={panelRef}
        className="w-full max-w-md border border-neon rounded-lg shadow-neon opacity-0 max-h-[90vh] overflow-y-auto"
        style={{ background: '#080f08' }}
      >
        <div className="sticky top-0 border-b border-dark-green px-6 py-4" style={{ background: '#080f08' }}>
          <h2 className="font-pixel text-neon text-[10px] text-center">
            ADD TASK — {worker.name.toUpperCase()}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-gray-500 text-[9px] font-pixel block mb-1">TITLE *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full bg-black border border-dark-green text-neon text-xs p-2.5 rounded focus:border-neon outline-none placeholder-gray-700"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="text-gray-500 text-[9px] font-pixel block mb-1">DESCRIPTION</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-black border border-dark-green text-gray-300 text-xs p-2.5 rounded focus:border-neon outline-none resize-none placeholder-gray-700"
              placeholder="Optional details"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-gray-500 text-[9px] font-pixel block mb-1">PRIORITY</label>
              <div className="flex gap-2">
                {(['Normal', 'Urgent'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 text-[9px] font-pixel py-2 border rounded transition-colors ${
                      priority === p
                        ? p === 'Urgent'
                          ? 'bg-red-900 border-red-500 text-red-300'
                          : 'bg-dark-green border-neon text-neon'
                        : 'border-gray-700 text-gray-500 hover:border-gray-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <label className="text-gray-500 text-[9px] font-pixel block mb-1">TYPE</label>
              <div className="flex gap-2">
                {(['Individual', 'Collaborative'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 text-[9px] font-pixel py-2 border rounded transition-colors ${
                      type === t
                        ? 'bg-dark-green border-neon text-neon'
                        : 'border-gray-700 text-gray-500 hover:border-gray-500'
                    }`}
                  >
                    {t === 'Individual' ? 'Solo' : 'Team'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {type === 'Collaborative' && otherWorkers.length > 0 && (
            <div>
              <label className="text-gray-500 text-[9px] font-pixel block mb-1">COLLABORATORS</label>
              <div className="flex flex-wrap gap-2">
                {otherWorkers.map(w => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => toggleCollab(w.id)}
                    className={`text-[9px] px-2 py-1 border rounded transition-colors ${
                      collaborators.includes(w.id)
                        ? 'border-purple-400 text-purple-300 bg-purple-900/30'
                        : 'border-gray-700 text-gray-500 hover:border-gray-500'
                    }`}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHasDeadline(v => !v)}
              className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                hasDeadline ? 'bg-neon border-neon' : 'border-gray-600'
              }`}
            >
              {hasDeadline && <span className="text-black text-[10px] font-bold">✓</span>}
            </button>
            <label className="text-gray-400 text-[10px] font-pixel cursor-pointer" onClick={() => setHasDeadline(v => !v)}>
              HAS DEADLINE
            </label>
          </div>

          {hasDeadline && (
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full bg-black border border-dark-green text-neon text-xs p-2.5 rounded focus:border-neon outline-none"
            />
          )}

          <div>
            <label className="text-gray-500 text-[9px] font-pixel block mb-1">TAGS / NOTES</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full bg-black border border-dark-green text-gray-300 text-xs p-2.5 rounded focus:border-neon outline-none placeholder-gray-700"
              placeholder="Optional tags or notes"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              className="flex-1 border border-gray-700 text-gray-400 font-pixel text-[9px] py-3 hover:border-gray-500 transition-colors rounded"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-dark-green text-neon font-pixel text-[9px] py-3 hover:bg-neon hover:text-black transition-colors rounded disabled:opacity-50"
            >
              {loading ? 'adding...' : 'add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
