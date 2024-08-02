import React, { useRef, useState } from 'react';
import { Camera } from 'react-camera-pro';
import { Paper, Button, ActionIcon } from '@mantine/core';
import { IconCamera, IconCameraRotate } from '@tabler/icons-react';

interface CameraComponentProps {
    onClose: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onClose }) => {
    const camera = useRef<any>(null);
    const [image, setImage] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

    const takePhoto = () => {
        if (camera.current) {
            const photo = camera.current.takePhoto();
            setImage(photo);
        }
    };

    const switchCamera = () => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    };

    const errorMessages = {
        noCameraAccessible: 'No camera device accessible',
        permissionDenied: 'Permission denied. Please refresh and give camera permission.',
        switchCamera: 'It is not possible to switch camera to different one because there is only one video device accessible.',
        canvas: 'Canvas is not supported.',
    };

    return (
        <div className="flex flex-col h-full">
            <Paper className="flex-grow overflow-hidden rounded-lg m-4">
                <Camera
                    ref={camera}
                    errorMessages={errorMessages}
                    facingMode={facingMode}
                    aspectRatio={16/9}
                />
            </Paper>
            <Paper className="p-4 m-4 flex justify-center items-center space-x-4">
                <ActionIcon size="xl" radius="xl" variant="filled" color="blue" onClick={switchCamera}>
                    <IconCameraRotate size={24} />
                </ActionIcon>
                <Button size="xl" radius="xl" onClick={takePhoto}>
                    <IconCamera size={24} />
                </Button>
            </Paper>
            {image && (
                <Paper className="m-4 p-4">
                    <img src={image} alt="Taken photo" className="w-full" />
                </Paper>
            )}
        </div>
    );
};

export default CameraComponent;