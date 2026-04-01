import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Insurance Policy AI",
  description: "AI-powered RAG system for analyzing insurance policies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-neutral-50 flex flex-col`}>
        <header className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center px-4">
            <div className="flex gap-2 items-center font-bold text-xl tracking-tight text-neutral-900">
              <div className="size-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              Policy AI
            </div>
          </div>
        </header>
        <main className="flex-1 container mx-auto p-4 md:p-8 flex flex-col h-full">
          {children}
        </main>
      </body>
    </html>
  );
}
