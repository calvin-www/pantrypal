import React, { useRef, useState } from 'react';
import { Camera } from 'react-camera-pro';

interface CameraComponentProps {
    onClose: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onClose }) => {
    const camera = useRef<any>(null);
    const [image, setImage] = useState<string | null>(null);

    const takePhoto = () => {
        if (camera.current) {
            const photo = camera.current.takePhoto();
            setImage(photo);
        }
    };

    const errorMessages = {
        noCameraAccessible: 'No camera device accessible',
        permissionDenied: 'Permission denied. Please refresh and give camera permission.',
        switchCamera: 'It is not possible to switch camera to different one because there is only one video device accessible.',
        canvas: 'Canvas is not supported.',
    };

    return (
        <div>
            <Camera ref={camera} errorMessages={errorMessages} />
            <button onClick={takePhoto}>Take photo</button>
            {image && <img src={image} alt="Taken photo" />}
            <button onClick={onClose}>Close Camera</button>
        </div>
    );
};

export default CameraComponent;