/**
 * Path utility functions for the text editor
 */

/**
 * Gets the parent directory path from a given path
 * @param path The file path
 * @returns The parent directory path
 */
export const getParentPath = (path: string): string => {
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/');
};

/**
 * Joins a base path with a relative path
 * @param basePath The base directory path
 * @param relativePath The relative path to join
 * @returns The joined path
 */
export const joinPath = (basePath: string, relativePath: string): string => {
  if (relativePath.startsWith('/')) return relativePath;
  return basePath.endsWith('/') ? basePath + relativePath : basePath + '/' + relativePath;
};
