import { getLocale } from "@/lib/i18n/locale";
import { getT } from "@/lib/i18n/t";
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

export const instant = false;
// 每次打開頁面時執行，依使用者的語言產生標題和說明
export async function generateMetadata(): Promise<Metadata> {
    const t = await getT(await getLocale());
    return {
        title: t("meta.title"),
        description: t("meta.description"),
    };
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#faf7f2",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
    const locale = await getLocale();
    return (
        <html lang={locale} className={`${jakarta.variable} ${newsreader.variable}`}>
            <body>{children}</body>
        </html>
    );
}
