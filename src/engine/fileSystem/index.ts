import FileSystem, {
  useFileSystem,
  FileSystemObject,
  File,
  Directory,
  FileAttributes,
  FileSystemData,
  joinPath,
  getParentPath,
  getFileName,
  getPathParts
} from './FileSystem';

export default FileSystem;

export {
  useFileSystem,
  joinPath,
  getParentPath,
  getFileName,
  getPathParts
};

export type {
  FileSystemObject,
  File,
  Directory,
  FileAttributes,
  FileSystemData
};
