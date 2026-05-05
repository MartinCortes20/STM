import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

interface Props {
  onSubmit: (name: string, role: string, photo?: string) => Promise<void>;
  onClose: () => void;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 120;
      let { width, height } = img;
      if (width > height) {
        if (width > MAX) { height = (height * MAX) / width; width = MAX; }
      } else {
        if (height > MAX) { width = (width * MAX) / height; height = MAX; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      let quality = 0.8;
      let result = canvas.toDataURL('image/jpeg', quality);
      while (result.length > 65000 && quality > 0.2) {
        quality -= 0.1;
        result = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(result);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function AddWorkerForm({ onSubmit, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [preview, setPreview] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
    );
  }, []);

  const close = () => {
    gsap.to(panelRef.current, { opacity: 0, scale: 0.9, y: 20, duration: 0.25, ease: 'power2.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, onComplete: onClose });
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setPhoto(compressed);
    setPreview(compressed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    setLoading(true);
    await onSubmit(name.trim(), role.trim(), photo);
    setLoading(false);
    close();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center p-4 opacity-0"
      style={{ zIndex: 50, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) close(); }}
    >
      <div
        ref={panelRef}
        className="w-full max-w-sm border border-neon rounded-lg p-6 shadow-neon opacity-0"
        style={{ background: '#080f08' }}
      >
        <h2 className="font-pixel text-neon text-[11px] mb-6 text-center">ADD WORKER</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-500 text-[10px] font-pixel block mb-1">NAME</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-black border border-dark-green text-neon text-xs p-3 rounded focus:border-neon outline-none placeholder-gray-700"
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="text-gray-500 text-[10px] font-pixel block mb-1">ROLE / POSITION</label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
              className="w-full bg-black border border-dark-green text-neon text-xs p-3 rounded focus:border-neon outline-none placeholder-gray-700"
              placeholder="e.g. Developer"
            />
          </div>

          <div>
            <label className="text-gray-500 text-[10px] font-pixel block mb-1">PHOTO (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="w-full text-gray-400 text-[10px] file:mr-3 file:py-1 file:px-2 file:bg-dark-green file:text-neon file:border-0 file:text-[9px] file:font-pixel file:cursor-pointer"
            />
            {preview && (
              <img src={preview} alt="preview" className="w-16 h-16 rounded-full object-cover mt-2 border border-neon" />
            )}
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
              {loading ? 'creating...' : 'create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
