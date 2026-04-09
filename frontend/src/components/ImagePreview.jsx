import { useRef, useState, useEffect } from 'react';
import { Download, Fullscreen, RotateCcw, Loader2 } from 'lucide-react';

export default function ImagePreview({ item, activeColor, onClose }) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  // Status checks
  const isRemoving = item.status === 'removing';
  const isApplying = item.status === 'applying';
  const isTransparent = item.status === 'transparent';
  const isDone = item.status === 'done';
  const isIdle = item.status === 'idle';

  // The actual URL we show on the "After" side
  const displayUrl = item.finalUrl || item.resultUrl || item.previewUrl;
  
  // The background we show behind the "After" side
  // If we have a final result, it's already baked in.
  // If we ONLY have a transparent result (Step 1), we show the chosen activeColor behind it.
  const bgColor = (isDone && item.finalUrl) ? 'transparent' : activeColor;

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const onStart = (e) => { dragging.current = true; handleMove(e.clientX || e.touches[0].clientX); };
  const onEnd = () => { dragging.current = false; };
  const onMove = (e) => { if (dragging.current) handleMove(e.clientX || (e.touches && e.touches[0].clientX)); };

  useEffect(() => {
    const handleGlobalMove = (e) => onMove(e);
    const handleGlobalEnd = () => onEnd();
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchmove', handleGlobalMove);
    window.addEventListener('touchend', handleGlobalEnd);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, []);

  const handleDownload = () => {
    const url = item.finalUrl || item.resultUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = item.outputFilename || 'result.png';
    a.click();
  };

  return (
    <div className="saas-card flex flex-col animate-in">
      {/* Top toolbar */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3 text-left">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
            <Fullscreen size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{item.file.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
              {isIdle ? 'Ready to Process' : item.status}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setSliderPos(50)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors" title="Reset view">
            <RotateCcw size={18} />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          {(item.finalUrl || item.resultUrl) && (
            <button onClick={handleDownload} className="btn-primary px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20">
              <Download size={16} /> Download
            </button>
          )}
        </div>
      </div>

      {/* Main viewer */}
      <div className="bg-slate-50 p-6 sm:p-10">
        <div className="relative mx-auto aspect-square w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl shadow-indigo-500/10 transition-shadow hover:shadow-indigo-500/20">
          <div 
            ref={containerRef}
            className="relative h-full w-full cursor-ew-resize select-none"
            onMouseDown={onStart}
            onTouchStart={onStart}
          >
            {/* After layer */}
            <div 
              className={`h-full w-full ${bgColor === 'transparent' ? 'checkerboard-bg' : ''}`} 
              style={{ backgroundColor: bgColor !== 'transparent' ? bgColor : undefined }}
            >
              <img src={displayUrl} alt="Result" className="h-full w-full object-contain" draggable={false} />
              
              {/* Processing Overlay */}
              {(isRemoving || isApplying) && (
                 <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                       <Loader2 size={42} className="animate-spin text-indigo-600" />
                       <span className="text-sm font-bold text-slate-900 bg-white/80 px-4 py-1.5 rounded-full shadow-lg">
                          {isRemoving ? 'Removing Background...' : 'Applying Color...'}
                       </span>
                    </div>
                 </div>
              )}
            </div>

            {/* Before layer */}
            <div 
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="h-full w-[100vw]">
                <img src={item.previewUrl} alt="Original" className="h-full w-full max-w-2xl object-contain opacity-80" draggable={false} />
              </div>
            </div>

            {/* Handle */}
            <div 
              className="absolute top-0 bottom-0 pointer-events-none z-10"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="h-full w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 cursor-ew-resize items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-white shadow-xl transition-transform hover:scale-110 active:scale-90 flex">
                <div className="flex gap-0.5">
                  <div className="h-3 w-0.5 rounded-full bg-white/40" />
                  <div className="h-3 w-0.5 rounded-full bg-white" />
                  <div className="h-3 w-0.5 rounded-full bg-white/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2">
          <span>← Original Image</span>
          <span>Result image →</span>
        </div>
      </div>
    </div>
  );
}
