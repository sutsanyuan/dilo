import eveningExample from "./examples/evening.response.json";
import morningExample from "./examples/morning.response.json";
import type { ConvertInput, ConvertResponse } from "./types";

/**
 * 模擬模式：不呼叫 Claude，回傳範例資料。
 * 用途：還沒儲值時開發整個流程，以及作品集的展示模式。
 *
 * 會模擬兩件事，讓流程測起來像真的：
 * 1. 等一下再回傳，像 AI 在思考
 * 2. 「我的人物」：如果已經回答過朋友的性別，就不再詢問
 */

const DELAY_MS = 1200;

export async function mockConvert(input: ConvertInput): Promise<ConvertResponse> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

  // 早上用早上計畫的範例，晚上和視訊後回顧用晚上回顧的範例
  const example = (input.session === "morning" ? morningExample : eveningExample) as ConvertResponse;
  // 複製一份，避免改到原本的範例資料
  const result: ConvertResponse = structuredClone(example);

  // 已經回答過性別的人，把範例裡預設的說法換成使用者選的（例：un amigo → una amiga）
  for (const asked of example.new_people) {
    const known = input.people.find((p) => p.label_zh === asked.label_zh);
    if (!known || known.es === asked.es) continue;
    for (const c of result.chunks) {
      c.simple = c.simple.replaceAll(asked.es, known.es);
      c.natural = c.natural.replaceAll(asked.es, known.es);
    }
  }

  const knownLabels = new Set(input.people.map((p) => p.label_zh));
  result.questions = result.questions.filter((q) => !q.person_label_zh || !knownLabels.has(q.person_label_zh));
  result.new_people = result.new_people.filter((p) => !knownLabels.has(p.label_zh));

  return result;
}
