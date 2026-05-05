import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../infrastructure/firebaseClient';
import { Worker, Task } from '../../domain/types';
import { workerService } from '../../use-cases/workerService';
import ParticleBackground from '../components/ParticleBackground';
import WorkerCircle from '../components/WorkerCircle';
import WorkerModal from '../components/WorkerModal';
import AddWorkerForm from '../components/AddWorkerForm';

export default function HomePage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selected, setSelected] = useState<Worker | null>(null);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time subscription — fires from local cache instantly on repeat visits
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'workers'),
      snap => {
        const data = snap.docs.map(d => ({ ...(d.data() as Omit<Worker, 'id'>), id: d.id }));
        setWorkers(data);
        setLoading(false);
      },
      err => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  // Keep selected worker in sync when workers update
  useEffect(() => {
    if (selected) {
      const updated = workers.find(w => w.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [workers]);

  useEffect(() => {
    if (!loading && !animatedRef.current) {
      animatedRef.current = true;
      gsap.fromTo(headerRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
      gsap.fromTo(gridRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.4 });
    }
  }, [loading]);

  const handleAddWorker = async (name: string, role: string, photo?: string) => {
    const w = await workerService.create(name, role, photo);
    setWorkers(prev => [...prev, w]);
  };

  const handleDeleteWorker = async () => {
    if (!selected) return;
    await workerService.remove(selected.id);
    setWorkers(prev => prev.filter(w => w.id !== selected.id));
    setSelected(null);
  };

  const handleAddTask = async (task: Omit<Task, 'id' | 'updates' | 'createdAt' | 'status'>) => {
    if (!selected) return;
    await workerService.addTask(selected.id, task);
    // onSnapshot updates workers automatically
  };

  const handleUpdateTask = async (taskId: string, status: Task['status'], comment: string) => {
    if (!selected) return;
    await workerService.updateTask(selected.id, taskId, { status, comment: comment || undefined });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selected) return;
    await workerService.deleteTask(selected.id, taskId);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <ParticleBackground />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <div ref={headerRef} className="flex flex-col items-center pt-10 pb-6 px-4 opacity-0">
          <LogoSlot />

          <h1 className="font-pixel text-neon text-center leading-relaxed" style={{ fontSize: 'clamp(10px, 2.5vw, 18px)' }}>
            STAFF TASK MANAGER
          </h1>
          <p className="text-gray-600 text-xs mt-2 tracking-widest uppercase">
            delegation &amp; workflow
          </p>

          <div className="w-48 h-px bg-gradient-to-r from-transparent via-neon to-transparent mt-4 opacity-40" />
        </div>

        {/* Grid */}
        <div ref={gridRef} className="px-4 pb-10 opacity-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="font-pixel text-neon text-[9px] animate-pulse">LOADING...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 font-pixel text-[9px]">CONNECTION ERROR</p>
              <p className="text-gray-600 text-xs mt-2">{error}</p>
              <p className="text-gray-700 text-xs mt-1">Make sure the backend is running on port 3001</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
              {workers.map((w, i) => (
                <WorkerCircle
                  key={w.id}
                  worker={w}
                  index={i}
                  onClick={() => setSelected(w)}
                />
              ))}

              {/* Add Worker Button */}
              <button
                onClick={() => setShowAddWorker(true)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center transition-all duration-300 group-hover:border-neon group-hover:shadow-neon-sm">
                  <span className="text-gray-600 text-2xl group-hover:text-neon transition-colors">+</span>
                </div>
                <p className="text-gray-700 text-[7px] font-pixel group-hover:text-gray-500">add worker</p>
              </button>
            </div>
          )}
        </div>

        {/* Stats bar */}
        {!loading && !error && workers.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-dark-green py-2 px-4 flex justify-center gap-8" style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', zIndex: 2 }}>
            <Stat label="workers" value={workers.length} />
            <Stat label="active tasks" value={workers.reduce((acc, w) => acc + w.tasks.filter(t => t.status !== 'Completed').length, 0)} />
            <Stat label="urgent" value={workers.reduce((acc, w) => acc + w.tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed').length, 0)} color="text-red-400" />
            <Stat label="done" value={workers.reduce((acc, w) => acc + w.tasks.filter(t => t.status === 'Completed').length, 0)} color="text-neon" />
          </div>
        )}
      </div>

      {selected && (
        <WorkerModal
          worker={selected}
          allWorkers={workers}
          onClose={() => setSelected(null)}
          onDelete={handleDeleteWorker}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {showAddWorker && (
        <AddWorkerForm
          onSubmit={handleAddWorker}
          onClose={() => setShowAddWorker(false)}
        />
      )}
    </div>
  );
}

function LogoSlot() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="mb-6 flex justify-center">
      {!failed ? (
        <img
          id="company-logo"
          src="/logo.png"
          alt="Company Logo"
          className="w-64 h-auto max-h-40 object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="w-64 h-24 border border-dark-green flex items-center justify-center">
          <span className="font-pixel text-neon-dim text-[8px]">YOUR LOGO</span>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color = 'text-gray-300' }: { label: string; value: number; color?: string }) {
  return (
    <div className="text-center">
      <div className={`font-pixel text-xs ${color}`}>{value}</div>
      <div className="text-gray-700 text-[8px] mt-0.5">{label}</div>
    </div>
  );
}
