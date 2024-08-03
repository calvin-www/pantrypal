import Image from "next/image";
import { Paper, Button, ActionIcon, Modal } from "@mantine/core";
import { Camera } from "react-camera-pro";
import React, { useRef, useState, useCallback } from "react";
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import {
  IconCamera,
  IconCameraRotate,
  IconArrowRight,
  IconArrowBack,
  IconUpload,
} from "@tabler/icons-react";
import { storage, db } from "../firebase";
import { RecognizedItemsTable } from "./RecognizedItemsTable";
import { getColorForCategory, updateLocalCategoryColors } from "../utils/categoryColorutils";

const CameraComponent = ({
  onImageCapture,
  onClose,
}: {
  onImageCapture: (url: string) => void;
  onClose: () => void;
}) => {
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
  const handleUploadPhoto = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setImage(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };
  const saveImage = async () => {
    console.log("saveImage function called");
    if (image) {
      try {
        console.log("Uploading image to Firebase Storage");
        const storageRef = ref(storage, `itemImages/${Date.now()}.jpg`);
        await uploadString(storageRef, image, "data_url");

        console.log("Getting download URL");
        const downloadURL = await getDownloadURL(storageRef);

        console.log("Saving image URL to Firestore");
        const docRef = await addDoc(collection(db, "itemImages"), {
          url: downloadURL,
          createdAt: new Date().toISOString(),
        });

        console.log("Image saved successfully");
        await handleImageRecognition(downloadURL);

        // Delete the image from Firestore
        await deleteDoc(doc(db, "itemImages", docRef.id));

        // Delete the image from Storage
        await deleteObject(storageRef);

        console.log("Image deleted from database and storage");
      } catch (error) {
        console.error("Error saving or deleting image: ", error);
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
    const response = await fetch("/api/recognizeImage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });

    console.log("API response status:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw recognized items:", data.recognizedItems);

    let localCategories = JSON.parse(localStorage.getItem('categories') || '[]');
    const categoryColorMap: Map<string, string> = new Map(
      localCategories.map((cat: { name: string; color: string }) => [cat.name, cat.color])
    );

    const parsedItems = data.recognizedItems.map((item: any) => {
      let parsedItem;
      try {
        parsedItem = JSON.parse(item.name);
      } catch (e) {
        console.error("Error parsing item:", item);
        return null;
      }

      const categories = (parsedItem.categories || []).map((category: string) => {
        if (!categoryColorMap.has(category)) {
          const color = getColorForCategory(category, categoryColorMap);
          const newCategory = { name: category, color };
          localCategories.push(newCategory);
          categoryColorMap.set(category, color);
        }
        return { name: category, color: categoryColorMap.get(category)! };
      });

      return {
        name: parsedItem.name || '',
        amount: parsedItem.amount || '',
        categories: categories,
        createdAt: new Date().toISOString()
      };
    }).filter(Boolean);

    localStorage.setItem('categories', JSON.stringify(localCategories));

    console.log("Raw AI output:", data);
    console.log("Parsed recognized items:", parsedItems);
    setRecognizedItems(parsedItems);
    setShowConfirmationTable(true);
  } catch (error) {
    console.error("Error recognizing items in image:", error);
  }
};

const handleConfirmAndUpload = async (confirmedItems: any[]) => {
  console.log("Starting confirm and upload with items:", confirmedItems);
  try {
    const validItems = confirmedItems.filter(item => item && item.name !== '');
    console.log("Valid items:", validItems);
    for (const item of validItems) {
      console.log("Processing item:", item);
      const itemRef = collection(db, "items");
      const q = query(itemRef, where("name", "==", item.name));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("Adding new item:", item);
        await addDoc(itemRef, item);
      } else {
        console.log("Updating existing item:", item);
        const existingItem = querySnapshot.docs[0];
        const existingAmount = parseFloat(existingItem.data().amount) || 0;
        const newAmount = parseFloat(item.amount) || 0;
        const updatedAmount = (existingAmount + newAmount).toString();
        console.log("Updated amount:", updatedAmount);
        await updateDoc(existingItem.ref, { amount: updatedAmount });
      }
    }
    if (image) {
      console.log("Calling onImageCapture with image");
      onImageCapture(image);
    }
    console.log("Closing camera component");
    onClose();
  } catch (error) {
    console.error("Error in handleConfirmAndUpload:", error);
  }
};

  const errorMessages = {
    noCameraAccessible: "No camera device accessible",
    permissionDenied:
      "Permission denied. Please refresh and give camera permission.",
    switchCamera:
      "It is not possible to switch camera to different one because there is only one video device accessible.",
    canvas: "Canvas is not supported.",
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
              <ActionIcon
                  size="xl"
                  radius="xl"
                  variant="filled"
                  color="green"
                  onClick={handleUploadPhoto}
              >
                <IconUpload size={24} />
              </ActionIcon>
              <ActionIcon
                  size="3xl"
                  radius="xl"
                  variant="filled"
                  color="blue"
                  onClick={takePhoto}
              >
                <IconCamera size={36} />
              </ActionIcon>
              {numberOfCameras > 1 && (
                  <ActionIcon
                      size="xl"
                      radius="xl"
                      variant="filled"
                      color="blue"
                      onClick={switchCamera}
                  >
                    <IconCameraRotate size={24} />
                  </ActionIcon>
              )}
            </div>
          </div>
      ) : (
        <Paper
          shadow="lg"
          radius="lg"
          className="m-4 p-4 bg-[#242424] border-2 border-[#3b3b3b] relative"
        >
          <Image
            src={image}
            alt="Taken photo"
            layout="responsive"
            width={16}
            height={9}
          />
          <div className="absolute top-4 left-4">
            <ActionIcon
              size="xl"
              radius="xl"
              variant="filled"
              color="red"
              onClick={deleteImage}
            >
              <IconArrowBack size={32} />
            </ActionIcon>
          </div>
          <div className="absolute top-4 right-4">
            <ActionIcon
              size="xl"
              radius="xl"
              variant="filled"
              color="green"
              onClick={saveImage}
            >
              <IconArrowRight size={32} />
            </ActionIcon>
          </div>
        </Paper>
      )}
      <Modal
        opened={showConfirmationTable}
        onClose={() => setShowConfirmationTable(false)}
        size="xl"
        title="Confirm Recognized Items"
      >
        <RecognizedItemsTable
          items={recognizedItems}
          onConfirm={handleConfirmAndUpload}
          onCancel={() => setShowConfirmationTable(false)}
        />
      </Modal>
    </div>
  );
};

export default CameraComponent;
