import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { DimensionProvider } from '@/providers/DimensionProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { FiltersProvider } from '@/providers/FiltersProvider';
import { Toaster } from 'react-hot-toast';
import AuthGuard from '@/components/AuthGuard';
import { ThemeProvider } from 'next-themes';
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TodayPay',
  description: '',
  // icons: "/favicon.ico/favicon-16x16.png",
  openGraph: {
    title: 'TodayPay',
    description: 'Refunds as a Service®',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link
          href={`${process.env.NEXT_PUBLIC_STYLES_URL}/styles.min.css`}
          rel="stylesheet"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body
        className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
            <NextIntlClientProvider messages={messages}>
              <DimensionProvider>
                <FiltersProvider>
                  <GoogleOAuthProvider
                    clientId={`${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`}
                  >
                    <AuthGuard>
                      <Toaster
                        position="top-center"
                        reverseOrder={false}
                        toastOptions={{
                          className: 'toast-popup',
                          duration: 1500,
                        }}
                      />

                      {children}
                    </AuthGuard>
                  </GoogleOAuthProvider>
                </FiltersProvider>
              </DimensionProvider>
            </NextIntlClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
