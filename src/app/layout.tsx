import type { Metadata, Viewport } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// 介面、英數字體
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

// 西文主角字體（含斜體，用在 Buenos días 這類問候）
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Dilo",
  description: "Dilo：每天一句，把生活說出口",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf7f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${jakarta.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
