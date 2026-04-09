import { Download, RefreshCw, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProcessingCard({ item, onSelect, onRetry, onRemove, isSelected }) {
  const isDone = item.status === 'done';
  const isTransparent = item.status === 'transparent';
  const isRemoving = item.status === 'removing';
  const isApplying = item.status === 'applying';
  const isProcessing = isRemoving || isApplying;
  const isError = item.status === 'error';
  const isIdle = item.status === 'idle';

  // Show result thumbnail if available, else original
  const thumbUrl = item.finalUrl || item.resultUrl || item.previewUrl;

  return (
    <div
      onClick={() => (isDone || isTransparent || isIdle) && onSelect(item)}
      className={`group relative flex items-center justify-between rounded-2xl border p-3 transition-all
        ${isSelected 
          ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
          : (isDone || isTransparent || isIdle)
            ? 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md cursor-pointer' 
            : 'border-slate-100 bg-slate-50 opacity-80 cursor-default'
        }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white ${isTransparent ? 'checkerboard-bg' : ''}`}>
           <img 
             src={thumbUrl} 
             alt="Thumbnail" 
             className={`h-full w-full object-cover transition-opacity ${isProcessing ? 'opacity-40' : 'opacity-100'}`} 
           />
           {isProcessing && (
             <div className="absolute inset-0 flex items-center justify-center">
               <Loader2 size={16} className="animate-spin text-indigo-600" />
             </div>
           )}
           {(isDone || isTransparent) && (
             <div className="absolute top-0.5 right-0.5 rounded-full bg-white text-emerald-500 shadow-sm">
               <CheckCircle2 size={14} fill="white" />
             </div>
           )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{item.file.name}</p>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest
              ${isDone ? 'text-emerald-600' : isTransparent ? 'text-indigo-600' : isError ? 'text-rose-500' : 'text-slate-400'}`}>
              {isIdle ? 'Ready' : item.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {isDone && (
          <button
            onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = item.finalUrl || item.resultUrl; a.download = item.outputFilename; a.click(); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-indigo-600 transition-all"
            title="Download"
          >
            <Download size={18} />
          </button>
        )}
        {isError && (
          <button
            onClick={(e) => { e.stopPropagation(); onRetry(item.id); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-50 transition-all"
            title="Retry"
          >
            <RefreshCw size={18} />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all"
          title="Remove"
        >
          <X size={18} />
        </button>
      </div>

      {isProcessing && (
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-slate-200">
          <div className="h-full bg-indigo-500 animate-shimmer" />
        </div>
      )}
    </div>
  );
}
