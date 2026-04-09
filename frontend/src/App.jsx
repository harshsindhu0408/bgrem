import { useState } from 'react';
import './index.css';
import { useRemoveBg } from './hooks/useRemoveBg';
import Header from './components/Header';
import Hero from './components/Hero';
import DropZone from './components/DropZone';
import BulkQueue from './components/BulkQueue';
import ImagePreview from './components/ImagePreview';
import ColorSelector from './components/ColorSelector';

export default function App() {
  const [selectedColor, setSelectedColor] = useState('transparent');
  const { 
    queue, 
    selectedItem, 
    setSelectedItem, 
    addFiles, 
    removeBackground, 
    applyColor, 
    retryItem, 
    removeItem, 
    clearAll, 
    stats 
  } = useRemoveBg();

  const handleFiles = (files) => {
    addFiles(files);
  };

  const hasFiles = queue.length > 0;
  
  // Status check for button logic
  const isIdle = selectedItem?.status === 'idle';
  const isTransparent = selectedItem?.status === 'transparent' || (selectedItem?.resultUrl && selectedItem?.status === 'done');
  const isFinal = selectedItem?.status === 'done' && selectedItem?.finalUrl;
  const isProcessing = ['removing', 'applying'].includes(selectedItem?.status);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-700">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pt-8 pb-24 sm:px-6 lg:px-8">
        {!hasFiles ? (
          <div className="animate-in">
            <Hero />
            <DropZone onFiles={handleFiles} />
            
            <div className="mt-20 flex flex-col items-center gap-6">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trusted by 2,000+ creators</p>
               <div className="flex gap-8 grayscale opacity-30">
                 <div className="h-6 w-24 bg-slate-400 rounded-md" />
                 <div className="h-6 w-24 bg-slate-400 rounded-md" />
                 <div className="h-6 w-24 bg-slate-400 rounded-md" />
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 animate-in">
            <aside className="lg:col-span-4 order-2 lg:order-1">
              <div className="sticky top-24 flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                   <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest px-2">1. Choose Background</h3>
                   <ColorSelector 
                     selectedColor={selectedColor} 
                     onColorChange={setSelectedColor} 
                   />
                   <p className="px-2 text-[10px] text-slate-400 leading-relaxed font-medium">
                     Select color first (Left), then Remove Background (Right).
                   </p>
                </div>
                
                <BulkQueue 
                  queue={queue}
                  stats={stats}
                  selectedItem={selectedItem}
                  onSelect={setSelectedItem}
                  onRetry={retryItem}
                  onRemove={removeItem}
                  onClear={clearAll}
                />
              </div>
            </aside>

            {/* Main Canvas Area */}
            <div className="lg:col-span-8 order-1 lg:order-2">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between px-2">
                   <h2 className="text-xl font-extrabold text-slate-900">Workspace</h2>
                   <div className="flex gap-3">
                     {selectedItem && (
                       <>
                         {isIdle && (
                           <button 
                             onClick={() => removeBackground(selectedItem.id)}
                             disabled={isProcessing}
                             className="btn-primary"
                           >
                             Remove Background
                           </button>
                         )}
                         {(isTransparent || isFinal) && (
                           <button 
                             onClick={() => applyColor(selectedItem.id, selectedColor)}
                             disabled={isProcessing || selectedColor === 'transparent'}
                             className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                           >
                             Apply {selectedColor === 'transparent' ? 'Color' : selectedColor}
                           </button>
                         )}
                       </>
                     )}
                   </div>
                </div>
                
                {selectedItem ? (
                  <ImagePreview
                    item={selectedItem}
                    activeColor={selectedColor}
                    onClose={() => setSelectedItem(null)}
                  />
                ) : (
                  <div className="saas-card flex flex-col items-center justify-center p-20 text-center animate-in">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                      <ImageIcon size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Select an image</h3>
                    <p className="mt-2 text-sm text-slate-500 max-w-xs">Pick an image from the history to preview and compare the results.</p>
                  </div>
                )}
                
                {/* Secondary Dropzone when files already exist */}
                <div className="mt-4">
                   <button 
                     onClick={() => document.getElementById('file-input')?.click()}
                     className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-sm font-bold text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white transition-all group"
                   >
                      <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />
                      Add more images
                      <input id="file-input" type="file" multiple className="hidden" onChange={(e) => handleFiles(Array.from(e.target.files))} />
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <p className="text-sm font-semibold text-slate-500">© 2026 Remover.ai. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
            <a href="#" className="hover:text-indigo-600">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Simple Icon component for the placeholder
function ImageIcon({ size }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function Upload({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
