import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import SessionProvider from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
};

export const metadata: Metadata = {
  title: "ドルスケ - アイドルライブ情報",
  description: "アイドルのライブスケジュールを共有・検索できるサービス",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "ドルスケ - アイドルライブ情報",
    description: "アイドルのライブスケジュールを共有・検索できるサービス",
    url: "https://dorusuke.vercel.app",
    siteName: "ドルスケ",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://dorusuke.vercel.app/logo.png",
        width: 1200,
        height: 630,
        alt: "ドルスケ - アイドルライブ情報",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ドルスケ - アイドルライブ情報",
    description: "アイドルのライブスケジュールを共有・検索できるサービス",
    images: ["https://dorusuke.vercel.app/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased bg-pink-50 overflow-x-hidden`}>
      <body className="min-h-full flex flex-col bg-pink-50 overflow-x-hidden">
        <SessionProvider>
          <Header />
          <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
            {children}
          </main>
          <footer className="text-center text-xs text-gray-400 py-4">
            © 2026 ドルスケ - 推しのライブを見逃さないまとめサイト
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
