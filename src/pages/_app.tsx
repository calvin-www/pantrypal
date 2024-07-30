import { AppProps } from 'next/app';
import '@mantine/core/styles.css';
import '../globals.css'



import {createTheme, MantineProvider, rem} from '@mantine/core';
const theme = createTheme({
    colors: {
        // Add your color
        deepBlue: [
            '#1E1C87',
            '#1C1C78',
            '#1D1E6D',
            '#1C1D5E',
            '#1C1E54',
            '#1A1C47',
            '#191B3E',
            '#161832',
            '#141629',
            '#10111E',
        ],
    },

    shadows: {
        md: '1px 1px 3px rgba(0, 0, 0, .25)',
        xl: '5px 5px 3px rgba(0, 0, 0, .25)',
    },

    fontFamily: 'JetBrains Mono, monospace',

    headings: {
        fontFamily: 'JetBrains Mono, monospace',
        sizes: {
            h1: { fontSize: rem(36) },
        },
    },
});
function MyApp({ Component, pageProps }: AppProps) {
    return (
        <MantineProvider theme={theme}>
            <Component {...pageProps} />
        </MantineProvider>
    );
}

export default MyApp;