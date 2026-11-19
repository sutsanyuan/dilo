import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, localeCookie, type Locale } from "./config";

// 決定這次要用哪個語言顯示介面，回傳 "zh-TW"、"en" 或 "es"。
// 只能在伺服器端使用（例如 page.tsx、layout.tsx），
// 因為 cookies() 和 headers() 讀的是瀏覽器送來的請求。
export async function getLocale(): Promise<Locale> {
    // 1. 使用者選過語言嗎？讀 cookie 這張「小紙條」。
    const cookieStore = await cookies();
    const saved = cookieStore.get(localeCookie)?.value; // 例如 "en"；沒選過就是 undefined

    // 有值，而且是我們支援的語言，就直接用它。
    if (saved && isLocale(saved)) {
        return saved;
    }

    // 2. 沒選過：看瀏覽器的語言設定。
    const headerList = await headers();
    const accepted = (headerList.get("accept-language") ?? "").toLowerCase(); // 例如 "es-es,es;q=0.9,en;q=0.8"
    const fromBrowser = pickFromAcceptLanguage(accepted);

    if (fromBrowser) {
        return fromBrowser;
    }

    // 3. 都不知道：用預設語言。
    return defaultLocale;
}

// 從 accept-language 裡找出第一個我們支援的語言，找不到就回傳 null。
// accept-language 是用逗號分隔的清單，越前面越優先：
//   "es-es,es;q=0.9,en;q=0.8" → 依序是 es-es、es、en → 回傳 "es"
function pickFromAcceptLanguage(accepted: string): Locale | null {
    for (const part of accepted.split(",")) {
        const code = part.trim().split(";")[0]; // "es;q=0.9" → "es"

        if (code.startsWith("zh")) return "zh-TW"; // zh-tw、zh-hk、zh-cn 都先用繁體中文
        if (code.startsWith("es")) return "es";
        if (code.startsWith("en")) return "en";
    }
    return null;
}
