import React from 'react';
import DosGameWindow, { DosGameWindowProps } from '../dosGame';
import FileSystem from '../../engine/fileSystem';

/**
 * OregonTrailWindow Component
 * 
 * Implementation of the classic Oregon Trail game
 */
interface OregonTrailWindowProps {
    id: string;
    fileSystem?: FileSystem;
    onClose?: () => void;
}

const OregonTrailWindow: React.FC<OregonTrailWindowProps> = ({
    id,
    fileSystem,
    onClose
}) => {
    // Props to pass to the generic DosGame component
    const dosGameProps: DosGameWindowProps = {
        id,
        title: 'Oregon Trail',
        zipFile: '/msdos/oregontrail.zip',
        executablePath: './OREGON.EXE',
        fileSystem,
        onClose
    };

    // Render the generic DosGame component with Oregon Trail-specific props
    return <DosGameWindow {...dosGameProps} />;
};

export default OregonTrailWindow;
