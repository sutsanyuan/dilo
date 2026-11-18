import styles from "./page.module.css";
import { getLocale } from "@/lib/i18n/locale";
import { getT } from "@/lib/i18n/t";
import { connection } from "next/server";

// 和 layout.tsx 一樣：這頁依每個人的語言和當下日期產生，不需要事先做固定版本
export const instant = false;

/**
 * 首頁（第一版骨架）
 * 目前是靜態畫面，用來確認字體和設計變數都正確套用。
 * 之後會接上真實資料：今天的一句是否完成、最近的句子等。
 */
export default async function Home() {
    const locale = await getLocale();
    const t = await getT(locale);
    // 依語言格式化今天的日期，例如：
    // zh-TW → 11月17日 星期二
    // en    → Tuesday, November 17
    // es    → martes, 17 de noviembre

    // 告訴 Next.js：這頁要等使用者打開時才產生，日期才會是當下的日期
    await connection();
    const today = new Intl.DateTimeFormat(locale, {
        weekday: "long", // 星期幾，寫完整（星期二、Tuesday）
        month: "long", // 月份，寫完整（11月、November）
        day: "numeric", // 日期，數字
        timeZone: "Asia/Taipei",
    }).format(new Date());
    return (
        <main className={styles.screen}>
            <header className={styles.header}>
                <p className={styles.date}>{today}</p>
                <h1 className={`spanish ${styles.greeting}`}>Buenos días, Tsan</h1>
            </header>

            <section className={styles.card}>
                <div className={styles.cardTop}>
                    <span className={styles.eyebrow}>{t("home.morning.label")}</span>
                    <span className={`${styles.chip} ${styles.chipAccent}`}>
                        {t("home.status.todo")}
                    </span>
                </div>
                <h2 className={styles.cardTitle}>{t("home.morning.title")}</h2>
                <button className={styles.buttonPrimary} type="button">
                    {t("home.morning.start")}
                </button>
            </section>

            <section className={styles.card}>
                <div className={styles.cardTop}>
                    <span className={styles.eyebrow}>{t("home.evening.label")}</span>
                    <span className={styles.chip}>{t("home.status.bonus")}</span>
                </div>
                <h2 className={styles.cardTitle}>{t("home.evening.title")}</h2>
                <p className={styles.secondary}>{t("home.evening.hint")}</p>
            </section>

            <section className={styles.card}>
                <span className={styles.eyebrow}>{t("home.review.label")}</span>
                <h2 className={styles.cardTitleSmall}>{t("home.review.title")}</h2>
                <button className={styles.buttonSecondary} type="button">
                    {t("home.review.start")}
                </button>
            </section>

            <p className={styles.footnote}>{t("home.goal")}</p>
        </main>
    );
}
