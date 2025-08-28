import React from 'react';
import DosGameWindow, { DosGameWindowProps } from '../dosGame';
import FileSystem from '../../engine/fileSystem';

/**
 * CommanderKeenWindow Component
 * 
 * Implementation of the classic Commander Keen game
 */
interface CommanderKeenWindowProps {
    id: string;
    fileSystem?: FileSystem;
    onClose?: () => void;
}

const CommanderKeenWindow: React.FC<CommanderKeenWindowProps> = ({
    id,
    fileSystem,
    onClose
}) => {
    // Props to pass to the generic DosGame component
    const dosGameProps: DosGameWindowProps = {
        id,
        title: 'Commander Keen',
        zipFile: '/msdos/keen4.zip',
        executablePath: './KEEN4E.EXE',
        fileSystem,
        onClose
    };

    // Render the generic DosGame component with Keen-specific props
    return <DosGameWindow {...dosGameProps} />;
};

export default CommanderKeenWindow;
