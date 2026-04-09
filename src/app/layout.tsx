import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import SessionProvider from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ドルスケ - 地下アイドルライブ情報",
  description: "地下アイドルのライブスケジュールを共有・検索できるサービス",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-pink-50">
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
