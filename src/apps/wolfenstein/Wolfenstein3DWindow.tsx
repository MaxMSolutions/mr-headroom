import React from 'react';
import DosGameWindow, { DosGameWindowProps } from '../dosGame';
import FileSystem from '../../engine/fileSystem';

/**
 * Wolfenstein3D Window Component
 * 
 * Implementation of the classic Wolfenstein 3D game
 */
interface Wolfenstein3DWindowProps {
    id: string;
    fileSystem?: FileSystem;
    onClose?: () => void;
}

const Wolfenstein3DWindow: React.FC<Wolfenstein3DWindowProps> = ({
    id,
    fileSystem,
    onClose
}) => {
    // Props to pass to the generic DosGame component
    const dosGameProps: DosGameWindowProps = {
        id,
        title: 'Wolfenstein 3D',
        zipFile: '/msdos/wolf3d.zip',
        executablePath: './WOLF3D.EXE',
        fileSystem,
        onClose
    };

    // Render the generic DosGame component with Wolfenstein-specific props
    return <DosGameWindow {...dosGameProps} />;
};

export default Wolfenstein3DWindow;
