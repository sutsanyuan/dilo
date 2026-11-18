"use client";

import { setLocale } from "@/lib/i18n/actions";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";

// 畫面上的語言按鈕：中文／English／Español
export function LanguageSwitcher({ current }: { current: Locale }) {
    return (
        <div>
            {locales.map((locale) => (
                <button
                    key={locale}
                    type="button"
                    aria-pressed={locale === current}
                    onClick={() => setLocale(locale)}>
                    {localeNames[locale]}
                </button>
            ))}
        </div>
    );
}
