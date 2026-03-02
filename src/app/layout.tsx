import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Pika — Birth an AI Self",
  description: "Sign in to Pika and create your AI self.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistMono.variable}>
      <body className="font-[var(--font-mono)] antialiased bg-[var(--color-bg)] text-[var(--color-text)]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
