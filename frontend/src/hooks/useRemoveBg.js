import { useCallback, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Represents one file in the queue.
 * @typedef {{ id: string, file: File, status: 'idle'|'processing'|'done'|'error', previewUrl: string, resultUrl: string|null, outputFilename: string|null, error: string|null }} QueueItem
 */

function makeId() {
  return Math.random().toString(36).slice(2);
}

export function useRemoveBg() {
  /** @type {[QueueItem[], Function]} */
  const [queue, setQueue] = useState([]);
  /** @type {[QueueItem|null, Function]} */
  const [selectedItem, setSelectedItem] = useState(null);

  const updateItem = useCallback((id, patch) => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
    setSelectedItem(prev => prev?.id === id ? { ...prev, ...patch } : prev);
  }, []);

  const addFiles = useCallback((files) => {
    const newItems = files.map(file => ({
      id: makeId(),
      file,
      status: 'idle', // Ready to process
      previewUrl: URL.createObjectURL(file), // Original preview
      resultUrl: null, // Transparent result (Step 1)
      finalUrl: null, // Color applied result (Step 2)
      outputFilename: null,
      error: null,
      bgColor: 'transparent',
    }));
    
    setQueue(prev => {
      const updated = [...prev, ...newItems];
      setSelectedItem(current => current || newItems[0]);
      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeBackground = useCallback(async (id) => {
    const item = queue.find(i => i.id === id);
    if (!item) return;

    updateItem(id, { status: 'removing' });

    const formData = new FormData();
    formData.append('file', item.file);
    formData.append('bg_color', 'transparent');

    try {
      const response = await fetch(`${API_BASE}/api/remove-bg`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Removal failed');

      const blob = await response.blob();
      const resultUrl = URL.createObjectURL(blob);
      updateItem(id, { status: 'transparent', resultUrl });
    } catch (err) {
      updateItem(id, { status: 'error', error: err.message });
    }
  }, [queue, updateItem]);

  const applyColor = useCallback(async (id, color) => {
    const item = queue.find(i => i.id === id);
    if (!item || !item.resultUrl) return;

    updateItem(id, { status: 'applying', bgColor: color });

    try {
      // Get the transparent blob from the URL
      const res = await fetch(item.resultUrl);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append('file', blob, 'transparent.png');
      formData.append('bg_color', color);

      const response = await fetch(`${API_BASE}/api/apply-bg`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Application failed');

      const finalBlob = await response.blob();
      const finalUrl = URL.createObjectURL(finalBlob);
      const outputFilename = item.file.name.replace(/\.[^.]+$/, '') + `_${color.replace('#','')}.png`;

      updateItem(id, { status: 'done', finalUrl, outputFilename });
    } catch (err) {
      updateItem(id, { status: 'error', error: err.message });
    }
  }, [queue, updateItem]);

  const retryItem = useCallback((id) => {
    const item = queue.find(i => i.id === id);
    if (!item) return;
    if (item.status === 'error' && !item.resultUrl) removeBackground(id);
    else if (item.status === 'error' && item.resultUrl) applyColor(id, item.bgColor);
  }, [queue, removeBackground, applyColor]);

  const removeItem = useCallback((id) => {
    setQueue(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item?.resultUrl) URL.revokeObjectURL(item.resultUrl);
      return prev.filter(i => i.id !== id);
    });
    setSelectedItem(prev => prev?.id === id ? null : prev);
  }, []);

  const clearAll = useCallback(() => {
    setQueue(prev => {
      prev.forEach(item => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
      });
      return [];
    });
    setSelectedItem(null);
  }, []);

  const stats = {
    total: queue.length,
    done: queue.filter(i => i.status === 'done').length,
    processing: queue.filter(i => i.status === 'processing').length,
    error: queue.filter(i => i.status === 'error').length,
  };

  return { 
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
  };
}
