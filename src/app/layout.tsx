import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Görsel Üretici | Modern AI Image Generator",
  description: "Gelişmiş AI teknolojisi ile ücretsiz görsel üretin. Modern, responsive ve kullanıcı dostu arayüz.",
  keywords: "ai image generator, yapay zeka, görsel üretme, ücretsiz, turkish",
  authors: [{ name: "AI Image Generator" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
          {children}
        </div>
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          duration={4000}
        />
      </body>
    </html>
  );
}