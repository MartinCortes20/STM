import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Worker } from '../../domain/types';

interface Props {
  worker: Worker;
  onClick: () => void;
  index: number;
}

export default function WorkerCircle({ worker, onClick, index }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, scale: 0.5, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, delay: index * 0.08, ease: 'back.out(1.7)' }
    );
  }, [index]);

  const initials = worker.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const pendingCount = worker.tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const hasUrgent = worker.tasks.some(t => t.priority === 'Urgent' && t.status !== 'Completed');

  return (
    <button
      ref={ref}
      onClick={onClick}
      className="flex flex-col items-center gap-2 group opacity-0"
      style={{ outline: 'none' }}
    >
      <div className="relative">
        <div
          className={`w-16 h-16 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-110 ${
            hasUrgent
              ? 'border-red-500 shadow-[0_0_12px_#ff000066]'
              : 'border-neon shadow-neon-sm'
          }`}
          style={{ background: '#0d1a0d' }}
        >
          {worker.photo ? (
            <img
              src={worker.photo}
              alt={worker.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-neon font-pixel text-xs">{initials}</span>
          )}
        </div>

        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon text-black text-[9px] font-bold flex items-center justify-center font-pixel">
            {pendingCount}
          </span>
        )}
      </div>

      <div className="text-center">
        <p className="text-neon text-[8px] font-pixel leading-tight max-w-[80px] truncate">
          {worker.name.split(' ')[0]}
        </p>
        <p className="text-gray-500 text-[7px] mt-0.5 max-w-[80px] truncate">{worker.role}</p>
      </div>
    </button>
  );
}
