import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/lib/sessionStore";
import { GazeProvider } from "@/lib/gazeStore";
import { NavOverrideProvider } from "@/lib/navOverride";
import { NavControls } from "@/components/NavControls";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HVF Trainer — Fixation & Visual Field Training",
  description:
    "A Humphrey Visual Field simulation and fixation training tool that helps glaucoma patients practice steady central gaze at home.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <GazeProvider>
            <NavOverrideProvider>
              <NavControls />
              {children}
            </NavOverrideProvider>
          </GazeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
