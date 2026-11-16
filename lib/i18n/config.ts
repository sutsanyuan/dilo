// 網站支援的語言清單。要加語言（例如 "de"）時，只改這裡，
// 再新增對應的 messages/de.json。
export const locales = ["zh-TW", "en", "es"] as const;

// Locale 型別 = "zh-TW" | "en" | "es"，由上面的陣列自動推導出來。
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh-TW";

// cookie 裡存的語言是任意字串（可能被改過或是舊的值），用這個檢查是不是我們支援的。
// 回傳型別 `value is Locale` 讓 TypeScript 在 if 判斷後把 value 當成 Locale。
export function isLocale(value: string): value is Locale {
    return (locales as readonly string[]).includes(value);
}

// 語言切換按鈕上顯示的名稱。用各語言自己的寫法，不翻譯：
// 看不懂目前語言的人，也找得到自己的語言。
export const localeNames: Record<Locale, string> = {
    "zh-TW": "中文",
    en: "English",
    es: "Español",
};
