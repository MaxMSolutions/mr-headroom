import React from 'react';
import DosGameWindow, { DosGameWindowProps } from '../dosGame';
import FileSystem from '../../engine/fileSystem';

/**
 * PaintGameWindow Component
 *
 * Implementation of the classic MS Paint application
 */
interface PaintGameWindowProps {
    id: string;
    fileSystem?: FileSystem;
    onClose?: () => void;
}

const PaintGameWindow: React.FC<PaintGameWindowProps> = ({
    id,
    fileSystem,
    onClose
}) => {
    // Props to pass to the generic DosGame component
    const dosGameProps: DosGameWindowProps = {
        id,
        title: 'MS Paint',
        zipFile: '/msdos/paint.zip',
        executablePath: './PAINT.BAT',
        fileSystem,
        onClose
    };

    // Render the generic DosGame component with Paint-specific props
    return <DosGameWindow {...dosGameProps} />;
};

export default PaintGameWindow;
