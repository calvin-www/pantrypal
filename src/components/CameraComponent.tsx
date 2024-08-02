import React, { useRef, useState, useCallback } from 'react';
import { Camera } from 'react-camera-pro';
import { Paper, Button, ActionIcon } from '@mantine/core';
import { IconCamera, IconCameraRotate, IconArrowRight, IconArrowBack } from '@tabler/icons-react';
import Image from 'next/image';
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage  } from "../firebase";


const CameraComponent = ({ onImageCapture, onClose }: { onImageCapture: (url: string) => void, onClose: () => void }) => {
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
            try {
                const storageRef = ref(storage, `item-images/${Date.now()}.jpg`);
                await uploadString(storageRef, image, 'data_url');
                const downloadURL = await getDownloadURL(storageRef);
                onImageCapture(downloadURL);
                onClose(); // Now this should work correctly
            } catch (error) {
                console.error("Error uploading image: ", error);
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
                <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 2rem)' }}>
                    <Camera
                        ref={camera}
                        errorMessages={errorMessages}
                        aspectRatio="cover"
                        numberOfCamerasCallback={setNumberOfCameras}
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-center space-x-4 z-10">
                        {numberOfCameras > 1 && (
                            <ActionIcon size="xl" radius="xl" variant="filled" color="blue" onClick={switchCamera}>
                                <IconCameraRotate size={24} />
                            </ActionIcon>
                        )}
                        <Button size="xl" radius="xl" onClick={takePhoto}>
                            <IconCamera size={24} />
                        </Button>
                    </div>
                </div>
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