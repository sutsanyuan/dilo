import Anthropic from "@anthropic-ai/sdk";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import { CONVERT_SYSTEM_PROMPT } from "./convert-prompt";
import responseSchemaFile from "./schemas/response.schema.json";
import type { ConvertInput, ConvertResponse } from "./types";

/**
 * 呼叫 Claude，把使用者的一段話轉成西文句塊。
 * 只在伺服器端執行（API 金鑰不能出現在瀏覽器）。
 */

// 預設用 Sonnet 5.5：速度和品質的平衡最好。想換模型時在 .env.local 設定 CLAUDE_MODEL。
const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-5-5";

// JSON Schema 檔案頂端的 $schema、title、description 是給人看的，送給 API 前拿掉。
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { $schema, title, description, ...responseSchema } = responseSchemaFile;

const client = new Anthropic(); // 自動讀取環境變數 ANTHROPIC_API_KEY

export class ConvertError extends Error {}

export async function convertSentence(input: ConvertInput): Promise<ConvertResponse> {
  const message = await client.messages.parse({
    model: MODEL,
    max_tokens: 4096,
    system: CONVERT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: JSON.stringify(input) }],
    output_config: {
      // 強制 AI 回傳符合 response.schema.json 的格式
      format: jsonSchemaOutputFormat(responseSchema as { type: "object" }),
    },
  });

  if (message.stop_reason === "refusal") {
    throw new ConvertError("AI 沒有處理這段內容，請換個說法再試一次。");
  }
  if (message.stop_reason === "max_tokens") {
    throw new ConvertError("內容太長了，請分成幾段輸入。");
  }
  if (!message.parsed_output) {
    throw new ConvertError("AI 回傳的格式不正確，請再試一次。");
  }

  return normalize(message.parsed_output as unknown as ConvertResponse);
}

/**
 * API 不支援「最多幾個」這類限制，只會當成提示給 AI 參考，
 * 所以在這裡再整理一次，確保畫面拿到的資料一定符合上限。
 */
function normalize(result: ConvertResponse): ConvertResponse {
  const chunks = result.chunks.slice(0, 6).map((c) => ({ ...c, notes: c.notes.slice(0, 3) }));
  const ids = new Set(chunks.map((c) => c.id));
  let recommended = result.recommended_for_practice.filter((id) => ids.has(id)).slice(0, 2);
  if (recommended.length === 0 && chunks.length > 0) {
    // 沒推薦時，挑優先度最高的一句
    recommended = [[...chunks].sort((a, b) => a.practice_priority - b.practice_priority)[0].id];
  }
  return { ...result, chunks, recommended_for_practice: recommended };
}
