/**
 * AI 句子轉換的資料型別
 *
 * TypeScript 小提示：
 * - `type` 用來描述一筆資料「長什麼樣子」，寫錯欄位名稱時編輯器會直接提醒你。
 * - `"a" | "b"` 代表只能是其中一個值，像是下拉選單。
 * - 欄位後面有 `?` 代表可以不填。
 *
 * 這些型別和 schemas/ 資料夾裡的 JSON Schema 一一對應。
 */

// ---------- app 送給 AI 的資料 ----------

/** 早上計畫、晚上回顧、視訊後回顧 */
export type Session = "morning" | "evening" | "post_call";

export type Gender = "f" | "m" | "unknown";

/** 「我的人物」清單中的一個人 */
export type Person = {
  /** 使用者怎麼稱呼，例：室友 */
  label_zh: string;
  /** 西文說法，例：mi compañera de piso */
  es: string;
  gender: Gender;
};

export type ConvertInput = {
  target_language: "es-ES";
  mode: "breakthrough";
  session: Session;
  /** 寫下的時間（含時區），例：2026-11-04T21:30:00+08:00 */
  written_at: string;
  user_text: string;
  /** 晚上回顧時，附上早上的計畫與使用者選的狀態 */
  morning_plan?: { es: string; status: "done" | "not_done" | "changed" }[];
  people: Person[];
};

// ---------- AI 回傳的資料 ----------

export type ConversationAction = "say_today" | "say_place" | "ask_other" | "react";

export type TenseName =
  | "ir_a_infinitivo" //       ir a + 原形動詞（打算做）
  | "preterito_perfecto" //    現在完成式（今天做了）
  | "preterito_indefinido" //  簡單過去式（昨天做了）
  | "preterito_imperfecto" //  未完成過去式（本來想要）
  | "presente"; //             現在式

export type Note = {
  type: "vocab" | "grammar" | "spain_usage" | "culture";
  es: string;
  zh: string;
};

/** 一個能單獨說出口的句塊 */
export type Chunk = {
  id: string; // c1, c2…
  source: string; // 對應的原文
  natural: string; // 自然版
  simple: string; // 簡單版（練習用）
  meaning_zh: string;
  conversation_action: ConversationAction;
  tense: { name: TenseName; why_zh: string };
  notes: Note[]; // 最多 3 則
  practice_priority: 1 | 2 | 3;
};

export type GenderQuestion = {
  id: string;
  about: "person_gender";
  person_label_zh?: string;
  question_zh: string;
  options: { label_zh: string; es: string; gender: "f" | "m" }[];
};

export type ConvertResponse = {
  input_language: "zh" | "en" | "es" | "mixed";
  time_reference: "plan_today" | "today" | "yesterday_or_before" | "mixed";
  chunks: Chunk[];
  /** 推薦練習的句塊 id，1～2 個 */
  recommended_for_practice: string[];
  corrections: { original: string; corrected: string; why_zh: string }[];
  questions: GenderQuestion[];
  new_people: Person[];
  culture_explanations: {
    term_zh: string;
    es: string;
    explain_es: string;
    explain_zh: string;
  }[];
};
