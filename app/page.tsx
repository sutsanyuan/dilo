import styles from "./page.module.css";
import { getLocale } from "@/lib/i18n/locale";
import { getT } from "@/lib/i18n/t";

/**
 * 首頁（第一版骨架）
 * 目前是靜態畫面，用來確認字體和設計變數都正確套用。
 * 之後會接上真實資料：今天的一句是否完成、最近的句子等。
 */
export default async function Home() {
    const locale = await getLocale();
    const t = await getT(locale);
    return (
        <main className={styles.screen}>
            <header className={styles.header}>
                <p className={styles.date}>11月4日 星期三</p>
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
