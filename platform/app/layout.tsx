import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dead Code Platform",
  description: "Monitor and remove dead code from your applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

