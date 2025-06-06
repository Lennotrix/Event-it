import { Geist } from "next/font/google";
import "./globals.css";
import {Toaster} from "@/components/ui/sonner";
import ToastFromQuery from "@/components/toast/toastFromQuery";
import {Suspense} from "react";
import {PopupProvider} from "@/components/provider/popupProvider";
import {NotificationListener} from "@/components/notifications/notificationListener";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Event-it",
  description: "To easily create, find and manage events.",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="w-screen">
      <PopupProvider>
        {children}
      </PopupProvider>
      <Suspense fallback={null} >
        <ToastFromQuery/>
      </Suspense>
      <NotificationListener/>
      <Toaster/>
      </body>
    </html>
  );
}
