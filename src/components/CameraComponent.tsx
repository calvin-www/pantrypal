import Image from 'next/image';
import { Paper, Button, ActionIcon } from '@mantine/core';
import { Camera } from 'react-camera-pro';
import React, { useRef, useState, useCallback } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { IconCamera, IconCameraRotate, IconArrowRight, IconArrowBack } from '@tabler/icons-react';
import { storage, db } from "../firebase";
import { RecognizedItemsTable } from "./RecognizedItemsTable";
import vision from '@google-cloud/vision';
const client = new vision.ImageAnnotatorClient();
const CameraComponent = ({ onImageCapture, onClose }: { onImageCapture: (url: string) => void, onClose: () => void }) => {
    const camera = useRef<any>(null);
    const [image, setImage] = useState<string | null>(null);
    const [numberOfCameras, setNumberOfCameras] = useState(0);
    const [recognizedItems, setRecognizedItems] = useState<any[]>([]);
    const [showConfirmationTable, setShowConfirmationTable] = useState(false);

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
        console.log("saveImage function called");
        if (image) {
            try {
                console.log("Uploading image to Firebase Storage");
                const storageRef = ref(storage, `itemImages/${Date.now()}.jpg`);
                await uploadString(storageRef, image, 'data_url');

                console.log("Getting download URL");
                const downloadURL = await getDownloadURL(storageRef);

                console.log("Saving image URL to Firestore");
                await addDoc(collection(db, "itemImages"), {
                    url: downloadURL,
                    createdAt: new Date().toISOString()
                });

                console.log("Image saved successfully");
                handleImageRecognition(downloadURL);
            } catch (error) {
                console.error("Error saving image: ", error);
            }
        } else {
            console.log("No image to save");
        }
    };

    const deleteImage = () => {
        setImage(null);
    };

const handleImageRecognition = async (imageUrl: string) => {
    console.log("Starting image recognition for URL:", imageUrl);
    try {
        // Convert image URL to base64
        console.log("Fetching image and converting to base64");
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const base64Image = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });

        // Remove the data:image/jpeg;base64, part from the base64 string
        const base64WithoutPrefix = base64Image.split(',')[1];
        console.log("Base64 image prepared for API call");

        // Call Google Cloud Vision API
        console.log("Calling Google Cloud Vision API");
        const [result] = await client.labelDetection({
            image: { content: base64WithoutPrefix }
        });

        console.log("API response received:", result);

        const labels = result.labelAnnotations;
        console.log("Extracted labels:", labels);

        // Process the labels into your desired format
        const recognizedItems = labels?.map(label => ({
            name: label.description,
            amount: '1',
            categories: []
        })) || [];

        console.log("Processed recognized items:", recognizedItems);

        // Show results in a table for user confirmation
        setRecognizedItems(recognizedItems);
        setShowConfirmationTable(true);
        console.log("Recognition complete, showing confirmation table");
    } catch (error) {
        console.error("Error recognizing items in image:", error);
    }
};

    const handleConfirmAndUpload = async (confirmedItems: any[]) => {
        // Upload confirmed items to the database
        for (const item of confirmedItems) {
            await addDoc(collection(db, "pantryItems"), item);
        }
        onImageCapture(image!);
        onClose();
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
                    <div className="absolute top-4 left-4">
                        <ActionIcon size="xl" radius="xl" variant="filled" color="red" onClick={deleteImage}>
                            <IconArrowBack size={32} />
                        </ActionIcon>
                    </div>
                    <div className="absolute top-4 right-4">
                        <ActionIcon size="xl" radius="xl" variant="filled" color="green" onClick={saveImage}>
                            <IconArrowRight size={32} />
                        </ActionIcon>
                    </div>
                </Paper>
            )}
            {showConfirmationTable && (
                <RecognizedItemsTable
                    items={recognizedItems}
                    onConfirm={handleConfirmAndUpload}
                    onCancel={() => setShowConfirmationTable(false)}
                />
            )}
        </div>
    );
};

export default CameraComponent;