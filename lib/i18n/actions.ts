"use server";

import { cookies } from "next/headers";
import { isLocale, localeCookie } from "./config";

// 使用者按下語言按鈕時呼叫：把選的語言存進 cookie
export async function setLocale(locale: string) {
    // 只接受我們支援的語言，其他值直接忽略
    if (!isLocale(locale)) return;

    const cookieStore = await cookies();
    cookieStore.set(localeCookie, locale, {
        path: "/", // 整個網站都會帶上這個 cookie
        maxAge: 60 * 60 * 24 * 365, // 記住一年（單位是秒）
        sameSite: "lax", // 基本的安全設定
    });
}
