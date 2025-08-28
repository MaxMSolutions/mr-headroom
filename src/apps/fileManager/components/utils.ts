import { FileSystemObject } from '../../../engine/fileSystem';

// Helper functions for file management
export const formatFileSize = (size?: number): string => {
  if (size === undefined) return '0 bytes';
  
  if (size < 1024) return `${size} bytes`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

export const getFileIcon = (file: FileSystemObject): string => {
  if (file.type === 'directory') {
    return '⊞';
  }
  
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'txt':
    case 'log':
      return '◰';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return '◨';
    case 'exe':
    case 'com':
      return '⚙';
    case 'bat':
      return '≡';
    case 'ini':
      return '⌆';
    case 'dat':
      return '⧈';
    default:
      return '◎';
  }
};
