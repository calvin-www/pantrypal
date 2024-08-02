import {
  createTheme,
  MantineProvider,
  rem,
  MantineTheme,
  rgba,
} from "@mantine/core";
import { AppProps } from "next/app";
import "@mantine/core/styles.css";
import "../globals.css";
import "regenerator-runtime/runtime";

const theme = createTheme({
  fontFamily: "JetBrains Mono, monospace",
  headings: {
    fontFamily: "JetBrains Mono, monospace",
    sizes: {
      h1: { fontSize: rem(36) },
    },
  },
  colors: {
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#bebebe",
      "#373A40",
      "#2C2E33",
      "#25262B",
      "#1A1B1E",
      "#141517",
      "#101113",
    ],
  },
  components: {
    InputBase: {
      styles: (theme: MantineTheme) => ({
        input: {
          "&::placeholder": {
            color: rgba(theme.white, 0.5), // Use a semi-transparent white color for dark mode
          },
        },
      }),
      classNames: {
        input: "bg-[#242424] text-white",
      },
    },
    Combobox: {
      classNames: {
        dropdown: "bg-[#1a1a1a] border border-[#3b3b3b]",
        option: "data-[selected]:bg-[#2c2c2c] data-[hovered]:bg-[#1f1f1f]",
      },
    },
    Menu: {
      classNames: {
        dropdown: "bg-[#2E2E2E] border border-[#3b3b3b] rounded-xl shadow-lg",
        item: "hover:bg-[#2c2c2c]",
      },
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Component {...pageProps} />
    </MantineProvider>
  );
}

export default MyApp;
