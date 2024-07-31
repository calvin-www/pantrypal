import React, { useState } from "react";
import {
  Container,
  Title,
  Paper,
  Grid,
  SimpleGrid,
  Skeleton,
  rem,
  Stack,
  Button,
    ScrollArea
} from "@mantine/core";
import InputForm from "../components/InputForm";
import ItemList from "../components/ItemList";
import { SearchBar } from "../components/SearchBar";
import { Item } from "../types/item";

function Home() {
  const [refresh, setRefresh] = useState(false);

  const handleAddItem = () => {
    setRefresh(!refresh); // Toggle refresh to re-render ItemList
  };

  return (
      <div className="bg-[#1f1f1f] min-h-screen flex flex-col">
        <div className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
          <Container size="xl">
            <h1 className="text-2xl font-bold text-white">Item Tracker!!</h1>
          </Container>
        </div>
        <div className="flex-grow flex justify-center items-center">
          <Container size="xl" my="md" className="w-full">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <Paper
                  shadow="lg"
                  radius="lg"
                  p="xl"
                  className="bg-[#242424] border-2 border-[#3b3b3b] col-span-2"
                  style={{ height: 'calc(100vh - 8rem)' }}
              >
                <ScrollArea h='100%' type="scroll" scrollbarSize={10} scrollHideDelay={1500}>
                  <Stack>
                    <ItemList key={refresh.toString()} />
                  </Stack>
                </ScrollArea>
              </Paper>

              <Grid gutter="md">
                <Grid.Col>

                  <Paper
                      shadow="lg"
                      radius="lg"
                      p="xl"
                      className="bg-[#242424] border-2 border-[#3b3b3b]"
                  >
                    <InputForm onAdd={handleAddItem} />
                  </Paper>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Paper
                      shadow="lg"
                      radius="lg"
                      p="xl"
                      className="bg-[#242424] border-2 border-[#3b3b3b]"
                  >
                  </Paper>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Paper
                      shadow="lg"
                      radius="lg"
                      p="xl"
                      className="bg-[#242424] border-2 border-[#3b3b3b]"
                  >
                  </Paper>
                </Grid.Col>
              </Grid>
            </SimpleGrid>
          </Container>
        </div>
      </div>
  );
}

export default Home;