import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraType } from 'react-camera-pro';

const App = () => {
    const [numberOfCameras, setNumberOfCameras] = useState(0);
    const [image, setImage] = useState<string | null>(null);
    const [showImage, setShowImage] = useState<boolean>(false);
    const camera = useRef<CameraType>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
    const [torchToggled, setTorchToggled] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((i) => i.kind == 'videoinput');
            setDevices(videoDevices);
        })();
    });

    return (
        <div>
            {showImage ? (
                <div
                    onClick={() => {
                        setShowImage(!showImage);
                    }}
                >
                    {image && <img src={image} alt="Full screen preview" />}
                </div>
            ) : (
                <Camera
                    ref={camera}
                    aspectRatio="cover"
                    facingMode="environment"
                    numberOfCamerasCallback={(i) => setNumberOfCameras(i)}
                    videoSourceDeviceId={activeDeviceId}
                    errorMessages={{
                        noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
                        permissionDenied: 'Permission denied. Please refresh and give camera permission.',
                        switchCamera:
                            'It is not possible to switch camera to different one because there is only one video device accessible.',
                        canvas: 'Canvas is not supported.',
                    }}
                    videoReadyCallback={() => {
                        console.log('Video feed ready.');
                    }}
                />
            )}
            <div>
                <select
                    onChange={(event) => {
                        setActiveDeviceId(event.target.value);
                    }}
                >
                    {devices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                            {d.label}
                        </option>
                    ))}
                </select>
                <div
                    onClick={() => {
                        setShowImage(!showImage);
                    }}
                >
                    {image && <img src={image} alt="Image preview" />}
                </div>
                <button
                    onClick={() => {
                        if (camera.current) {
                            const photo = camera.current.takePhoto();
                            console.log(photo);
                            setImage(photo as string);
                        }
                    }}
                >
                    Take Photo
                </button>
                {camera.current?.torchSupported && (
                    <button
                        onClick={() => {
                            if (camera.current) {
                                setTorchToggled(camera.current.toggleTorch());
                            }
                        }}
                    >
                        Toggle Torch
                    </button>
                )}
                <button
                    disabled={numberOfCameras <= 1}
                    onClick={() => {
                        if (camera.current) {
                            const result = camera.current.switchCamera();
                            console.log(result);
                        }
                    }}
                >
                    Change Camera
                </button>
            </div>
        </div>
    );
};

export default App;