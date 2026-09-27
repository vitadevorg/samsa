import { useCallback, useState } from 'react';
import { createId } from '../utils/ids';

const toAttachment = (file) => ({
  id: createId(),
  file,
  name: file.name,
  size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
  type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
});

// Archivos adjuntos de un formulario (input file o drag & drop), cada uno con id estable.
export const useFileAttachments = () => {
  const [files, setFiles] = useState([]);

  const addFiles = useCallback((fileList) => {
    if (!fileList?.length) return;
    setFiles((prev) => [...prev, ...Array.from(fileList, toAttachment)]);
  }, []);

  const removeFile = useCallback((id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => setFiles([]), []);

  return { files, addFiles, removeFile, clearFiles };
};
