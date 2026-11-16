import styles from "./page.module.css";

/**
 * 首頁（第一版骨架）
 * 目前是靜態畫面，用來確認字體和設計變數都正確套用。
 * 之後會接上真實資料：今天的一句是否完成、最近的句子等。
 */
export default function Home() {
  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <p className={styles.date}>11月4日 星期三</p>
        <h1 className={`spanish ${styles.greeting}`}>Buenos días, Tsan</h1>
      </header>

      <section className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.eyebrow}>今天的一句</span>
          <span className={`${styles.chip} ${styles.chipAccent}`}>未完成</span>
        </div>
        <h2 className={styles.cardTitle}>早上 · 今天打算做什麼？</h2>
        <button className={styles.buttonPrimary} type="button">
          開始
        </button>
      </section>

      <section className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.eyebrow}>晚上回顧</span>
          <span className={styles.chip}>加分</span>
        </div>
        <h2 className={styles.cardTitle}>晚上 · 今天做了什麼？</h2>
        <p className={styles.secondary}>會用早上的句子幫你回顧，只要確認或修改</p>
      </section>

      <section className={styles.card}>
        <span className={styles.eyebrow}>下次視訊前</span>
        <h2 className={styles.cardTitleSmall}>快速複習最近的句子和反應短句</h2>
        <button className={styles.buttonSecondary} type="button">
          開始複習
        </button>
      </section>

      <p className={styles.footnote}>早上或晚上完成一次，就算達成今天的目標</p>
    </main>
  );
}
