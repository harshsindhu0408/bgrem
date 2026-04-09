import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, MousePointer2 } from 'lucide-react';

const ACCEPTED = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] };

export default function DropZone({ onFiles }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) onFiles(acceptedFiles);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    multiple: true,
  });

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div
        {...getRootProps()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 sm:py-20 py-12 px-6
          ${isDragActive 
            ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' 
            : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
          }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
          <Upload size={32} />
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {isDragActive ? 'Drop to start processing' : 'Upload an image'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Drag and drop or click to browse. Supports JPG and PNG.
          </p>
        </div>

        <button className="mt-8 rounded-full bg-indigo-600 px-8 py-3 text-base font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95">
          Choose Image
        </button>

        <div className="mt-10 flex flex-wrap justify-center gap-6 opacity-60">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <ImageIcon size={14} /> High Quality
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <MousePointer2 size={14} /> 1-Click
          </div>
        </div>
      </div>
    </div>
  );
}
