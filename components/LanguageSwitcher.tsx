"use client";

import { setLocale } from "@/lib/i18n/actions";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import styles from "./LanguageSwitcher.module.css";

// 畫面上的語言按鈕：中文／English／Español
export function LanguageSwitcher({ current }: { current: Locale }) {
    return (
        <div className={styles.switcher}>
            {locales.map((locale) => (
                <button
                    key={locale}
                    className={styles.option}
                    type="button"
                    aria-pressed={locale === current}
                    onClick={() => setLocale(locale)}>
                    {localeNames[locale]}
                </button>
            ))}
        </div>
    );
}
