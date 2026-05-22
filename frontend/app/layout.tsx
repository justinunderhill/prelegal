import type { Metadata } from "next";
import { Archivo, Source_Serif_4 } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

// Strong, squared grotesque for the UI — gives the product an authoritative, legal feel.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

// Refined serif used for the rendered legal documents themselves.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

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
    <html
      lang="en"
      className={`h-full antialiased ${archivo.variable} ${sourceSerif.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
