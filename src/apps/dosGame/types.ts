import FileSystem from '../../engine/fileSystem';

// Global type declarations
declare global {
    interface Window {
        Dosbox: any;
        dosbox_Game: any;
    }
}

// Base props for DosGame components
export interface DosGameBaseProps {
    id: string;
}

// Props for the main window component
export interface DosGameWindowProps extends DosGameBaseProps {
    title: string;
    zipFile: string;
    executablePath: string;
    fileSystem?: FileSystem;
    onClose?: () => void;
}

// Props for the header component
export interface DosGameHeaderProps {
    title: string;
    onClose?: () => void;
}

// Props for the loading screen component
export interface DosGameLoadingScreenProps {
    isPlaying: boolean;
    gameTitle: string;
}

// Props for the ready screen component
export interface DosGameReadyScreenProps {
    gameTitle: string;
    onPlay: () => void;
}

// Props for the error screen component
export interface DosGameErrorScreenProps {
    error: string;
    onRetry: () => void;
}

// Props for the controls component
export interface DosGameControlsProps {
    isPlaying: boolean;
    onReset: () => void;
    onFullscreen: () => void;
    controlsInfo?: string;
}

// Props for the engine component
export interface DosGameEngineProps extends DosGameBaseProps {
    containerId: string;
    zipFile: string;
    executablePath: string;
    gameTitle: string;
    onLoaded: () => void;
    onError: (error: string) => void;
}

// Game state interface
export interface DosGameState {
    isLoading: boolean;
    isPlayable: boolean;
    isPlaying: boolean;
    error: string | null;
}
