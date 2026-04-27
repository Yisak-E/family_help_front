import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import "@/styles/index.css"; // Make sure to import your global CSS

export const metadata: Metadata = {
  title: "FamilyHelp UAE",
  description: "Community support platform for families",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}