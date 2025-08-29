import React from 'react';
import DosGameWindow, { DosGameWindowProps } from '../dosGame';
import FileSystem from '../../engine/fileSystem';

/**
 * Win95GameWindow Component
 *
 * Implementation of the Windows 95 simulation
 */
interface Win95GameWindowProps {
    id: string;
    fileSystem?: FileSystem;
    onClose?: () => void;
}

const Win95GameWindow: React.FC<Win95GameWindowProps> = ({
    id,
    fileSystem,
    onClose
}) => {
    // Props to pass to the generic DosGame component
    const dosGameProps: DosGameWindowProps = {
        id,
        title: 'Windows 95',
        zipFile: '/msdos/win95.zip',
        executablePath: './AUTOEXEC.BAT',
        fileSystem,
        onClose
    };

    // Render the generic DosGame component with Win95-specific props
    return <DosGameWindow {...dosGameProps} />;
};

export default Win95GameWindow;
