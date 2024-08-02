import React, { useRef, useState, useCallback } from 'react';
import { Camera } from 'react-camera-pro';
import { Paper, Button, ActionIcon } from '@mantine/core';
import { IconCamera, IconCameraRotate, IconArrowRight, IconArrowBack } from '@tabler/icons-react';
import Image from 'next/image';
import fs from 'fs/promises';
import path from 'path';

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

    const saveImage = async () => {
        if (image) {
            const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            const imagesDir = path.join(process.cwd(), 'public', 'images');
            const fileName = `image_${Date.now()}.jpg`;
            const filePath = path.join(imagesDir, fileName);

            try {
                await fs.mkdir(imagesDir, { recursive: true });
                await fs.writeFile(filePath, buffer);
                console.log('Image saved:', filePath);
            } catch (error) {
                console.error('Error saving image:', error);
            }
        }
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
                <>
                    <Paper className="flex-grow overflow-hidden rounded-lg m-4 shadow-md" style={{ height: 'calc(100vh - 250px)' }}>
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-4/5 h-4/5">
                                <Camera
                                    ref={camera}
                                    errorMessages={errorMessages}
                                    aspectRatio="cover"
                                    numberOfCamerasCallback={setNumberOfCameras}
                                />
                            </div>
                        </div>
                    </Paper>
                    <Paper
                        shadow="lg"
                        radius="lg"
                        className="p-4 m-4 flex justify-center items-center space-x-4 bg-[#242424] border-2 border-[#3b3b3b]">
                        {numberOfCameras > 1 && (
                            <ActionIcon size="xl" radius="xl" variant="filled" color="blue" onClick={switchCamera}>
                                <IconCameraRotate size={24} />
                            </ActionIcon>
                        )}
                        <Button size="xl" radius="xl" onClick={takePhoto}>
                            <IconCamera size={24} />
                        </Button>
                    </Paper>
                </>
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