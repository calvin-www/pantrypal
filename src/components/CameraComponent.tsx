import React, { useRef, useState, useCallback } from 'react';
import { Camera } from 'react-camera-pro';
import { Paper, Button, ActionIcon } from '@mantine/core';
import { IconCamera, IconCameraRotate, IconArrowRight, IconArrowBack } from '@tabler/icons-react';
import Image from 'next/image';

const CameraComponent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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

    const saveImage = () => {
        // Implement image saving logic here
        console.log('Image saved');
        onClose(); // Close the modal after saving
    };

    const deleteImage = () => {
        setImage(null);
    };

    const errorMessages = {
        noCameraAccessible: 'No camera device accessible',
        permissionDenied: 'Permission denied. Please refresh and give camera permission.',
        switchCamera: 'It is not possible to switch camera to different one because there is only one video device accessible.',
        canvas: 'Canvas is not supported.',
    };

    return (
        <div className="flex flex-col h-full">
            {!image ? (
                <Paper className="flex-grow overflow-hidden rounded-lg m-4 shadow-md relative" style={{ height: 'calc(100vh - 8rem)' }}>
                    <div style={{ width: '100%', height: '100%' }}>
                        <Camera
                            ref={camera}
                            errorMessages={errorMessages}
                            aspectRatio={16 / 9}
                            numberOfCamerasCallback={setNumberOfCameras}
                        />
                    </div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-center space-x-4">
                        {numberOfCameras > 1 && (
                            <ActionIcon size="xl" radius="xl" variant="filled" color="blue" onClick={switchCamera}>
                                <IconCameraRotate size={24} />
                            </ActionIcon>
                        )}
                        <Button size="xl" radius="xl" onClick={takePhoto}>
                            <IconCamera size={24} />
                        </Button>
                    </div>
                </Paper>
            ) : (
                <Paper
                    shadow="lg"
                    radius="lg"
                    className="m-4 p-4 bg-[#242424] border-2 border-[#3b3b3b] relative">
                    <Image src={image} alt="Taken photo" layout="responsive" width={16} height={9} />
                    <div className="absolute top-4 right-4 space-x-2">
                        <ActionIcon size="lg" radius="xl" variant="filled" color="green" onClick={saveImage}>
                            <IconArrowRight size={24} />
                        </ActionIcon>
                        <ActionIcon size="lg" radius="xl" variant="filled" color="red" onClick={deleteImage}>
                            <IconArrowBack size={24} />
                        </ActionIcon>
                    </div>
                </Paper>
            )}
        </div>
    );
};

export default CameraComponent;