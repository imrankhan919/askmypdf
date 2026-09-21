import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AskMyPDF",
  description: "Ask questions from your PDF - a simple RAG app",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
