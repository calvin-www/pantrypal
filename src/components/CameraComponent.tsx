import React, { useRef, useState, useCallback } from 'react';
import { Camera } from 'react-camera-pro';
import { Paper, Button, ActionIcon } from '@mantine/core';
import { IconCamera, IconCameraRotate } from '@tabler/icons-react';
import Image from 'next/image';

const CameraComponent: React.FC = () => {
    const camera = useRef<any>(null);
    const [image, setImage] = useState<string | null>(null);
    const [numberOfCameras, setNumberOfCameras] = useState(0);

    const takePhoto = useCallback(() => {
        if (camera.current) {
            const photo = camera.current.takePhoto();
            setImage(photo);
        }
    }, []);

    const switchCamera = useCallback(() => {
        if (camera.current) {
            camera.current.switchCamera();
        }
    }, []);

    const errorMessages = {
        noCameraAccessible: 'No camera device accessible',
        permissionDenied: 'Permission denied. Please refresh and give camera permission.',
        switchCamera: 'It is not possible to switch camera to different one because there is only one video device accessible.',
        canvas: 'Canvas is not supported.',
    };

    return (
        <div className="flex flex-col h-full">
            <Paper className="flex-grow overflow-hidden rounded-lg m-4 shadow-md" style={{ height: 'calc(100vh - 200px)' }}>
                <Camera
                    ref={camera}
                    errorMessages={errorMessages}
                    aspectRatio="cover"
                    numberOfCamerasCallback={setNumberOfCameras}
                />
            </Paper>
            <Paper className="p-4 m-4 flex justify-center items-center space-x-4 rounded-lg shadow-md">
                {numberOfCameras > 1 && (
                    <ActionIcon size="xl" radius="xl" variant="filled" color="blue" onClick={switchCamera}>
                        <IconCameraRotate size={24} />
                    </ActionIcon>
                )}
                <Button size="xl" radius="xl" onClick={takePhoto}>
                    <IconCamera size={24} />
                </Button>
            </Paper>
            {image && (
                <Paper className="m-4 p-4 rounded-lg shadow-md">
                    <Image src={image} alt="Taken photo" layout="responsive" width={16} height={9} />
                </Paper>
            )}
        </div>
    );
};

export default CameraComponent;