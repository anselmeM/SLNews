import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { auth } from "@/auth";
import AppLayoutWrapper from "@/components/layout/AppLayoutWrapper";
import PageViewTracker from "@/components/PageViewTracker";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#131212" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "SLNews | Sierra Leone News",
  description: "Community journalism and global news aggregation for Sierra Leone.",
  manifest: "/manifest.json",
  openGraph: {
    title: "SLNews | Sierra Leone News",
    description: "Community journalism and global news aggregation for Sierra Leone.",
    type: "website",
    siteName: "SLNews",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SLNews | Sierra Leone News",
    description: "Community journalism and global news aggregation for Sierra Leone.",
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('slnews-app-storage');
                  if (stored) {
                    var parsed = JSON.parse(stored);
                    var theme = parsed.state ? parsed.state.theme : 'system';
                    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SLNews" />
        {process.env.NODE_ENV === "production" && (
          <Script
            id="sw-register"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js');
                  });
                }
              `,
            }}
          />
        )}
      </head>
      <body className="bg-surface text-on-surface font-body-md min-h-screen" id="top">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-full focus:outline-none"
        >
          Skip to content
        </a>
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <AppLayoutWrapper session={session}>
          {children}
        </AppLayoutWrapper>
      </body>
    </html>
  );
}
