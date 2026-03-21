import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "VedaAI — AI Assessment Creator",
  description: "Generate AI-powered question papers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans bg-[#F8F8FA] text-gray-900 min-h-screen antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#111",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              fontSize: "13px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}