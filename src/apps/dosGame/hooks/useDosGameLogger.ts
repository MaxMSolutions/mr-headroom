import { useEffect } from 'react';
import FileSystem from '../../../engine/fileSystem';

/**
 * Custom hook to log game usage to the filesystem
 * 
 * @param id - The unique session ID
 * @param gameTitle - The title of the game
 * @param fileSystem - The FileSystem instance
 */
export const useDosGameLogger = (id: string, gameTitle: string, fileSystem?: FileSystem) => {
    useEffect(() => {
        if (fileSystem) {
            try {
                const logPath = '/var/log/gameplay.log';
                const logContent = `[${new Date().toISOString()}] ${gameTitle} launched - Session ID: ${id}\n`;
                
                try {
                    const existingContent = fileSystem.readFile(logPath);
                    fileSystem.writeFile(logPath, existingContent + logContent);
                } catch (err) {
                    // File doesn't exist yet, create it
                    fileSystem.writeFile(logPath, logContent);
                }
                
                console.log('Game session logged to filesystem');
            } catch (err) {
                console.warn('Could not log game session to filesystem:', err);
            }
        }
    }, [fileSystem, id, gameTitle]);
};
