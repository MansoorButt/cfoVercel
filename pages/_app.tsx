import '~/styles/globals.css';

import type { AppProps } from 'next/app';
import * as React from 'react';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { WalletProvider } from '~/components/Web3';
import { NextIntlProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import { Inter, Exo_2 } from 'next/font/google';
import dynamic from 'next/dynamic';
// import {  } from 'react-query';

const inter = Inter({ subsets: ['latin'] });
const exo2 = Exo_2({ weight: ['300', '400', '500', '600', '700'], subsets: ['latin'] });

const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily}, sans-serif;
        }

        .font-exo {
          font-family: ${exo2.style.fontFamily}, sans-serif;
        }
      `}</style>

      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" attribute="class">
          <NextIntlProvider messages={pageProps.messages}>
            <WalletProvider>
              <Hydrate state={pageProps.dehydratedState}>
                <Component {...pageProps} />
                <ReactQueryDevtools initialIsOpen={false} />
              </Hydrate>
            </WalletProvider>
          </NextIntlProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}

export default dynamic(() => Promise.resolve(App), {
  ssr: false,
});
