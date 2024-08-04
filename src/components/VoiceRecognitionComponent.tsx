import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Select,
  Badge,
  ActionIcon,
  Loader,
} from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import EditModal from "./EditModal";
import { db } from "../firebase";
import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  Firestore,
} from "firebase/firestore";
import { Item } from "../types/item";

interface Operation {
  type: "add" | "delete" | "edit";
  item: {
    id?: string;
    name: string;
    amount: string;
    categories: { name: string; color: string }[];
  };
}

interface InterpretedOperation {
  operation: "add" | "delete" | "edit";
  item: string;
  quantity: number;
}

interface VoiceRecognitionComponentProps {
  onClose: () => void;
}

const VoiceRecognitionComponent: React.FC<VoiceRecognitionComponentProps> = ({
  onClose,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Operation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const [itemsToDelete, setItemsToDelete] = useState<any[]>([]);
  const [itemsToEdit, setItemsToEdit] = useState<any[]>([]);
  const [showInputSection, setShowInputSection] = useState(true);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.error("Browser doesn't support speech recognition.");
      return;
    }

    SpeechRecognition.startListening({ continuous: true })
      .then(() => {
        console.log("Listening started");
        setIsListening(true);
      })
      .catch((error) => console.error("Error starting to listen:", error));

    return () => {
      SpeechRecognition.stopListening()
        .then(() => console.log("Listening stopped"))
        .catch((error) => console.error("Error stopping listening:", error));
    };
  }, [browserSupportsSpeechRecognition]);

  const handleInterpretTranscript = async () => {
    if (transcript) {
      try {
        setIsInterpreting(true);
        console.log("Sending transcript for interpretation...");
        const response = await fetch("/api/interpretTranscript", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transcript }),
        });

        if (!response.ok) {
          console.error("Failed to interpret transcript");
          return;
        }

        const data = await response.json();
        console.log("Interpreted data:", data);

        const transformedOperations = data.interpretedOperations.map(
          (op: InterpretedOperation) => ({
            type: op.operation,
            item: {
              name: op.item,
              amount: op.quantity ? op.quantity.toString() : "0",
              categories: [],
            },
          }),
        );

        setOperations(transformedOperations);
        SpeechRecognition.stopListening();
        setIsListening(false);
        setShowInputSection(false);
        resetTranscript();
      } catch (error) {
        console.error("Error interpreting transcript:", error);
      } finally {
        setIsInterpreting(false);
      }
    } else {
      console.log("No transcript to interpret");
    }
  };

  const handleOperationTypeChange = (
    index: number,
    value: "add" | "delete" | "edit",
  ) => {
    const updatedOperations = [...operations];
    updatedOperations[index].type = value;
    setOperations(updatedOperations);
  };

  const handleEdit = async (index: number) => {
    setIsLoading(true);
    try {
      const itemName = operations[index].item.name;
      const itemsRef = collection(db, "items");
      const q = query(itemsRef, where("name", "==", itemName));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("No matching items found");
        return;
      }

      if (querySnapshot.size === 1) {
        const docToEdit = querySnapshot.docs[0];
        setEditingItem({
          ...operations[index],
          item: { ...(docToEdit.data() as Item), id: docToEdit.id },
        });
        setEditModalOpen(true);
      } else {
        const matchingItems = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItemsToEdit(matchingItems);
        setEditModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching documents for edit: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (updatedItem: Operation["item"]): Promise<void> => {
    setOperations((currentOperations) =>
      currentOperations.map((operation, idx) =>
        idx === operations.indexOf(editingItem!)
          ? { ...operation, item: updatedItem }
          : operation,
      ),
    );
    setEditModalOpen(false);
  };

  const handleDelete = async (index: number) => {
    setIsLoading(true);
    try {
      const itemName = operations[index].item.name;
      const itemsRef = collection(db, "items");
      const q = query(itemsRef, where("name", "==", itemName));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("No matching items found");
        return;
      }

      if (querySnapshot.size === 1) {
        const docToDelete = querySnapshot.docs[0];
        await deleteDoc(doc(db, "items", docToDelete.id));
        console.log("Item deleted successfully");

        const updatedOperations = operations.filter((_, i) => i !== index);
        setOperations(updatedOperations);
      } else {
        const matchingItems = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItemsToDelete(matchingItems);
        setEditModalOpen(true);
      }
    } catch (error) {
      console.error("Error deleting document: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      for (const operation of operations) {
        const { type, item } = operation;
        switch (type) {
          case "add":
            const querySnapshot = await getDocs(
              query(collection(db, "items"), where("name", "==", item.name)),
            );
            if (!querySnapshot.empty) {
              const existingDoc = querySnapshot.docs[0];
              const existingItem = existingDoc.data();
              const newAmount =
                parseFloat(existingItem.amount) + parseFloat(item.amount);
              await updateDoc(existingDoc.ref, {
                amount: newAmount.toString(),
              });
            } else {
              await addDoc(collection(db, "items"), item);
            }
            break;
          case "edit":
            if ("id" in item && typeof item.id === "string") {
              const docRef = doc(db as Firestore, "items", item.id);
              await updateDoc(docRef, item);
            } else {
              console.error("Cannot edit item without a valid ID");
            }
            break;
          case "delete":
            if ("id" in item && typeof item.id === "string") {
              const docRef = doc(db as Firestore, "items", item.id);
              await deleteDoc(docRef);
            } else {
              console.error("Cannot delete item without a valid ID");
            }
            break;
          default:
            console.error("Unknown operation type:", type);
        }
      }
      console.log("Operations confirmed and database updated");
      setOperations([]);
      resetTranscript();
      onClose();
    } catch (error) {
      console.error("Error updating database:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const updatedOperations = [...operations];
    updatedOperations[index].item.id = itemId;
    setOperations(updatedOperations);
  };

  return (
    <div>
      {showInputSection && (
        <div className="flex flex-col items-center space-y-4">
          {!browserSupportsSpeechRecognition ? (
            <p className="text-center text-red-500">
              Sorry, your browser is not supported. Please try using Chrome or
              Safari!
            </p>
          ) : (
            <>
              <Button onClick={() => setIsListening(!isListening)}>
                {isListening ? "Stop Listening" : "Start Listening"}
              </Button>
              {isListening && (
                <div className="flex items-center space-x-2">
                  <Loader size="sm" />
                  <span>Listening...</span>
                </div>
              )}
              <p className="text-center">{transcript}</p>
              <Button
                onClick={handleInterpretTranscript}
                disabled={!transcript || isInterpreting}
              >
                {isInterpreting ? "Interpreting..." : "Interpret Transcript"}
              </Button>
            </>
          )}
        </div>
      )}

      {operations.length > 0 && (
        <>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Operation</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Categories</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {operations.map((operation, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Select
                      value={operation.type}
                      onChange={(value) =>
                        handleOperationTypeChange(
                          index,
                          value as "add" | "delete" | "edit",
                        )
                      }
                      data={[
                        { value: "add", label: "Add" },
                        { value: "delete", label: "Delete" },
                        { value: "edit", label: "Edit" },
                      ]}
                    />
                  </Table.Td>
                  <Table.Td>{operation.item.name}</Table.Td>
                  <Table.Td>{operation.item.amount}</Table.Td>
                  <Table.Td>
                    {operation.item.categories.map((category, catIndex) => (
                      <Badge
                        key={catIndex}
                        color={category.color}
                        style={{ marginRight: "5px" }}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon onClick={() => handleEdit(index)} color="blue">
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon onClick={() => handleDelete(index)} color="red">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Button onClick={handleConfirm} className="mt-4" loading={isLoading}>
            Confirm Operations
          </Button>
        </>
      )}

      <EditModal
        item={editingItem?.item as Item}
        isModalOpen={editModalOpen}
        setIsModalOpen={setEditModalOpen}
        onSave={handleSave}
      />
    </div>
  );
};

export default VoiceRecognitionComponent;
