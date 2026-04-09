import { Check, Grid } from 'lucide-react';

const PRESETS = [
  { name: 'Transparent', color: 'transparent' },
  { name: 'White', color: '#FFFFFF' },
  { name: 'Black', color: '#000000' },
  { name: 'Cloud', color: '#F1F5F9' },
  { name: 'Indigo', color: '#4F46E5' },
];

export default function ColorSelector({ selectedColor, onColorChange }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-100/50 p-2 ring-1 ring-slate-200">
      <div className="flex gap-1.5 border-r border-slate-200 pr-3">
        {PRESETS.map((p) => {
          const isTransparent = p.color === 'transparent';
          const isSelected = selectedColor === p.color;

          return (
            <button
              key={p.color}
              onClick={() => onColorChange(p.color)}
              title={p.name}
              className={`group relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all active:scale-90
                ${isSelected 
                  ? 'border-indigo-600 ring-2 ring-indigo-600/20' 
                  : 'border-white hover:border-indigo-300'
                }
                ${isTransparent ? 'checkerboard-bg' : ''}`}
              style={{ backgroundColor: isTransparent ? undefined : p.color }}
            >
              {isTransparent && <Grid size={12} className="text-slate-400 group-hover:text-indigo-400" />}
              {isSelected && (
                <Check
                  size={14}
                  className={p.color === '#FFFFFF' || p.color === '#F1F5F9' ? 'text-slate-900' : 'text-white'}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 px-1">
        <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-white bg-white shadow-sm ring-1 ring-slate-200 hover:ring-indigo-300 transition-all">
          <input
            type="color"
            value={PRESETS.some(p => p.color === selectedColor) ? '#4F46E5' : selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="absolute -inset-2 h-[150%] w-[150%] cursor-pointer opacity-0"
          />
          <div 
            className="h-full w-full" 
            style={{ 
              backgroundColor: !PRESETS.some(p => p.color === selectedColor) ? selectedColor : '#FFFFFF' 
            }} 
          />
          {!PRESETS.some(p => p.color === selectedColor) && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <Check size={14} className={selectedColor === '#FFFFFF' ? 'text-slate-900' : 'text-white'} />
             </div>
          )}
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Picker</span>
      </div>
    </div>
  );
}
