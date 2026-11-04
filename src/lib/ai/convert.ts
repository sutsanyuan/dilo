import Anthropic from "@anthropic-ai/sdk";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import { CONVERT_SYSTEM_PROMPT } from "./convert-prompt";
import { mockConvert } from "./mock";
import { getAiMode } from "./mode";
import responseSchemaFile from "./schemas/response.schema.json";
import type { ConvertInput, ConvertResponse } from "./types";

/**
 * 把使用者的一段話轉成西文句塊。
 * 只在伺服器端執行（API 金鑰不能出現在瀏覽器）。
 * 模擬模式下改用 mock.ts 的範例資料（見 mode.ts）。
 */

// 預設用 Sonnet 5.5：速度和品質的平衡最好。想換模型時在 .env.local 設定 CLAUDE_MODEL。
const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-5-5";

// JSON Schema 檔案頂端的 $schema、title、description 是給人看的，送給 API 前拿掉。
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { $schema, title, description, ...responseSchema } = responseSchemaFile;

// 第一次真的要呼叫時才建立，模擬模式完全不會碰到 API
let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic()); // 自動讀取環境變數 ANTHROPIC_API_KEY

/** 可以直接顯示給使用者看的錯誤 */
export class ConvertError extends Error {
  constructor(
    message: string,
    public status = 422,
  ) {
    super(message);
  }
}

export async function convertSentence(input: ConvertInput): Promise<ConvertResponse> {
  if (getAiMode() === "mock") return mockConvert(input);

  let message;
  try {
    message = await getClient().messages.parse({
      model: MODEL,
      max_tokens: 4096,
      system: CONVERT_SYSTEM_PROMPT,
      messages: [{ role: "user", content: JSON.stringify(input) }],
      output_config: {
        // 強制 AI 回傳符合 response.schema.json 的格式
        format: jsonSchemaOutputFormat(responseSchema as { type: "object" }),
      },
    });
  } catch (error) {
    throw toConvertError(error);
  }

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
 * 把 API 的錯誤翻成看得懂的中文。
 * 額度用完、超過花費上限、金鑰錯誤是上線後最可能遇到的三種狀況。
 */
function toConvertError(error: unknown): ConvertError | unknown {
  if (!(error instanceof Anthropic.APIError)) return error;
  const text = String(error.message).toLowerCase();

  if (error.status === 401) {
    return new ConvertError("API 金鑰不正確，請檢查 .env.local 的 ANTHROPIC_API_KEY。", 500);
  }
  if (text.includes("credit balance")) {
    return new ConvertError("AI 額度用完了，請到 Claude Console 儲值後再試。", 503);
  }
  if (text.includes("usage limit") || text.includes("spend_limit") || text.includes("spend limit")) {
    return new ConvertError("已經達到這個月設定的 AI 花費上限，可以到 Claude Console 調整上限。", 503);
  }
  if (error.status === 429) {
    return new ConvertError("AI 暫時太忙了，等一下再試。", 429);
  }
  if (error.status === 529 || (error.status ?? 0) >= 500) {
    return new ConvertError("AI 服務暫時有問題，等一下再試。", 503);
  }
  return error;
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
