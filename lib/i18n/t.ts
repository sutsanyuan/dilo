import type { Locale } from "./config";
import type zhTW from "@/messages/zh-TW.json";

// 以中文翻譯檔為「標準」：所有語言都必須有同樣的結構。
type Messages = typeof zhTW;

// 把巢狀的 JSON 結構轉成所有可用的 key，例如 "home.goal" | "home.morning.title" | ...
// 寫錯 key（例如 "home.morning.titel"）時，編輯器會直接標紅。
type Paths<T> = {
    [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`;
}[keyof T & string];

export type MessageKey = Paths<Messages>;

// 每種語言一個載入函式。用 import() 動態載入，只會讀取需要的那一個語言。
// 型別寫成 Promise<Messages>：如果 en.json 少了某個 key，這裡就會出現型別錯誤。
const loaders: Record<Locale, () => Promise<Messages>> = {
    "zh-TW": () => import("@/messages/zh-TW.json").then((m) => m.default),
    en: () => import("@/messages/en.json").then((m) => m.default),
    es: () => import("@/messages/es.json").then((m) => m.default),
};

// 用法：
//   const t = await getT("en");
//   t("home.morning.start") // → "Start"
export async function getT(locale: Locale) {
    const messages = await loaders[locale]();

    return function t(key: MessageKey): string {
        // "home.morning.start" → ["home", "morning", "start"]，在 JSON 裡一層一層往下找
        let value: unknown = messages;
        for (const part of key.split(".")) {
            if (typeof value !== "object" || value === null) break;
            value = (value as Record<string, unknown>)[part];
        }

        // 找不到（或找到的不是文字）就把 key 顯示出來，漏翻的地方一眼就看得到
        return typeof value === "string" ? value : key;
    };
}

// t() 函式本身的型別，要把 t 傳給其他元件時用
export type TFunction = Awaited<ReturnType<typeof getT>>;
