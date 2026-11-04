"use client";

import { useEffect, useState } from "react";
import type { ConvertResponse, GenderQuestion, Person, Session } from "@/lib/ai/types";
import styles from "./try.module.css";

/**
 * AI 轉換測試頁（/try）
 * 用來實際測試 AI 指令的品質，不是正式畫面。
 * 「我的人物」先存在瀏覽器的 localStorage，之後再換成正式的資料庫。
 */

const SESSION_LABELS: Record<Session, string> = {
  morning: "早上・今天打算做什麼？",
  evening: "晚上・今天做了什麼？",
  post_call: "視訊後回顧",
};

const TENSE_LABELS: Record<string, string> = {
  ir_a_infinitivo: "ir a + 原形動詞",
  preterito_perfecto: "現在完成式",
  preterito_indefinido: "簡單過去式",
  preterito_imperfecto: "未完成過去式",
  presente: "現在式",
};

const PEOPLE_KEY = "dilo.people";

/** 產生含時區的時間字串，例：2026-11-04T21:30:00+08:00 */
function nowWithOffset() {
  const d = new Date();
  const pad = (n: number) => String(Math.abs(n)).padStart(2, "0");
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(offset / 60))}:${pad(offset % 60)}`
  );
}

function loadPeople(): Person[] {
  try {
    return JSON.parse(localStorage.getItem(PEOPLE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function savePeople(people: Person[]) {
  try {
    localStorage.setItem(PEOPLE_KEY, JSON.stringify(people));
  } catch {
    // 無痕模式等情況存不了，不影響測試
  }
}

export default function TryPage() {
  const [session, setSession] = useState<Session>("morning");
  const [text, setText] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"live" | "mock" | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 只在載入時讀一次瀏覽器儲存
    setPeople(loadPeople());
  }, []);

  async function convert(peopleToUse: Person[] = people) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session, user_text: text, written_at: nowWithOffset(), people: peopleToUse }),
      });
      const data = await res.json();
      const m = res.headers.get("x-dilo-ai-mode");
      if (m === "live" || m === "mock") setMode(m);
      if (!res.ok) throw new Error(data.error ?? "發生錯誤");
      setResult(data as ConvertResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "發生錯誤");
    } finally {
      setLoading(false);
    }
  }

  /** 回答「這個人是男生還是女生？」後，存進我的人物並重新轉換 */
  function answer(question: GenderQuestion, option: GenderQuestion["options"][number]) {
    const label = question.person_label_zh ?? option.es;
    const next = [...people.filter((p) => p.label_zh !== label), { label_zh: label, es: option.es, gender: option.gender }];
    setPeople(next);
    savePeople(next);
    convert(next);
  }

  function removePerson(label: string) {
    const next = people.filter((p) => p.label_zh !== label);
    setPeople(next);
    savePeople(next);
  }

  const recommended = new Set(result?.recommended_for_practice ?? []);

  return (
    <main className={styles.screen}>
      <header>
        <p className={styles.eyebrow}>AI 轉換測試</p>
        <h1 className={styles.title}>{SESSION_LABELS[session]}</h1>
      </header>

      <div className={styles.segment}>
        {(Object.keys(SESSION_LABELS) as Session[]).map((s) => (
          <button
            key={s}
            type="button"
            className={s === session ? styles.segmentActive : styles.segmentItem}
            onClick={() => setSession(s)}
          >
            {s === "morning" ? "早上" : s === "evening" ? "晚上" : "視訊後"}
          </button>
        ))}
      </div>

      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="用中文、英文或你會的西文都可以，寫錯也沒關係"
        rows={5}
      />

      <button className={styles.primary} type="button" disabled={loading || !text.trim()} onClick={() => convert()}>
        {loading ? "轉換中…" : "轉成西文"}
      </button>

      {error && <p className={styles.error}>{error}</p>}

      {mode === "mock" && (
        <p className={styles.mock}>
          模擬模式：還沒設定 API 金鑰，顯示的是範例結果，不會花費額度。早上和晚上各有一組範例。
        </p>
      )}

      {people.length > 0 && (
        <section className={styles.people}>
          <p className={styles.eyebrow}>我的人物</p>
          <div className={styles.chips}>
            {people.map((p) => (
              <button key={p.label_zh} type="button" className={styles.chip} onClick={() => removePerson(p.label_zh)} title="點一下刪除">
                {p.label_zh}：{p.es} ×
              </button>
            ))}
          </div>
        </section>
      )}

      {result && (
        <>
          {result.questions.map((q) => (
            <section key={q.id} className={styles.question}>
              <p className={styles.questionText}>{q.question_zh}</p>
              <div className={styles.row}>
                {q.options.map((o) => (
                  <button key={o.es} type="button" className={styles.secondary} onClick={() => answer(q, o)} disabled={loading}>
                    {o.label_zh}（{o.es}）
                  </button>
                ))}
              </div>
            </section>
          ))}

          {result.corrections.length > 0 && (
            <section className={styles.card}>
              <p className={styles.eyebrow}>這樣說會更自然</p>
              {result.corrections.map((c, i) => (
                <p key={i} className={styles.small}>
                  <s>{c.original}</s> → <strong>{c.corrected}</strong>　{c.why_zh}
                </p>
              ))}
            </section>
          )}

          {result.chunks.map((c) => (
            <section key={c.id} className={recommended.has(c.id) ? styles.cardRecommended : styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.eyebrow}>{c.source}</span>
                {recommended.has(c.id) && <span className={styles.badge}>推薦練習</span>}
              </div>
              <p className={`spanish ${styles.simple}`}>{c.simple}</p>
              <p className={styles.small}>自然版：<span className="spanish">{c.natural}</span></p>
              <p className={styles.small}>{c.meaning_zh}</p>
              <p className={styles.tense}>
                {TENSE_LABELS[c.tense.name] ?? c.tense.name}・{c.tense.why_zh}
              </p>
              {c.notes.length > 0 && (
                <div className={styles.chips}>
                  {c.notes.map((n, i) => (
                    <span key={i} className={styles.chipMuted}>
                      {n.es}　{n.zh}
                    </span>
                  ))}
                </div>
              )}
            </section>
          ))}

          {result.culture_explanations.map((x) => (
            <section key={x.term_zh} className={styles.card}>
              <p className={styles.eyebrow}>怎麼跟西班牙人解釋「{x.term_zh}」</p>
              <p className="spanish">{x.explain_es}</p>
              <p className={styles.small}>{x.explain_zh}</p>
            </section>
          ))}

          <details className={styles.raw}>
            <summary>查看原始回傳資料</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </>
      )}
    </main>
  );
}
