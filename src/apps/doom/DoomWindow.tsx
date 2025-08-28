import React from 'react';
import DosGameWindow, { DosGameWindowProps } from '../dosGame';
import FileSystem from '../../engine/fileSystem';

/**
 * DoomWindow Component
 * 
 * Implementation of the classic DOOM game using the generic DosGame component
 */
interface DoomWindowProps {
    id: string;
    fileSystem?: FileSystem;
    onClose?: () => void;
}

const DoomWindow: React.FC<DoomWindowProps> = ({
    id,
    fileSystem,
    onClose
}) => {
    // Props to pass to the generic DosGame component
    const dosGameProps: DosGameWindowProps = {
        id,
        title: 'DOOM',
        zipFile: '/msdos/doom.zip',
        executablePath: './DOOM/DOOM.EXE',
        fileSystem,
        onClose
    };

    // Render the generic DosGame component with DOOM-specific props
    return <DosGameWindow {...dosGameProps} />;
};

export default DoomWindow;
