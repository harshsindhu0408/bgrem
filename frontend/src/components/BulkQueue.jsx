import { Download, Trash2, History } from 'lucide-react';
import ProcessingCard from './ProcessingCard';

export default function BulkQueue({ queue, stats, selectedItem, onSelect, onRetry, onRemove, onClear }) {
  if (queue.length === 0) return null;

  const handleDownloadAll = () => {
    const done = queue.filter(i => i.status === 'done' && i.resultUrl);
    done.forEach((item, idx) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = item.resultUrl;
        a.download = item.outputFilename || `result_${idx + 1}.png`;
        a.click();
      }, idx * 250);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <History size={16} className="text-slate-400" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">History</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {queue.length}
          </span>
        </div>
        <div className="flex gap-2">
          {stats.done > 0 && (
            <button
               onClick={handleDownloadAll}
               className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-[0.1em] transition-colors"
            >
              Get All ({stats.done})
            </button>
          )}
          <button
             onClick={onClear}
             className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-[0.1em] transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 hide-scrollbar">
        {queue.map((item) => (
          <ProcessingCard
            key={item.id}
            item={item}
            isSelected={selectedItem?.id === item.id}
            onSelect={onSelect}
            onRetry={onRetry}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
