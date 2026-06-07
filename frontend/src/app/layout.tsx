import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AfriLabs AI – Africa's Knowledge Assistant",
  description:
    "Ask AfriLabs AI anything about Africa's innovation hubs, programmes, reports, and ecosystem initiatives. Powered by RAG over AfriLabs' knowledge base.",
  keywords: ["AfriLabs", "Africa", "innovation hubs", "AI", "chatbot"],
  openGraph: {
    title: "AfriLabs AI",
    description: "Africa's Wisdom Assistant — Powered by RAG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}