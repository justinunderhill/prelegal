import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PreLegal - Legal Agreement Builder",
  description:
    "Create professional legal agreements in minutes. Fill in your details and download ready-to-sign documents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
