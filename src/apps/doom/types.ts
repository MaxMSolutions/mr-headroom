import FileSystem from '../../engine/fileSystem';

// For backward compatibility - all of these are now handled by the generic DosGame component
export interface DoomWindowProps {
    id: string;
    title?: string;
    fileSystem?: FileSystem;
    onClose?: () => void;
}

export interface DoomGameState {
    isLoading: boolean;
    isPlayable: boolean;
    isPlaying: boolean;
    error: string | null;
}

// Re-export common interface types from DosGame
export { DosGameWindowProps } from '../dosGame';
