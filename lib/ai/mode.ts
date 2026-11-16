/**
 * AI 模式
 * - live：真的呼叫 Claude API（需要 ANTHROPIC_API_KEY）
 * - mock：模擬模式，回傳 examples/ 裡的範例資料，不花任何費用
 *
 * 預設：有金鑰就用 live，沒有就用 mock。
 * 想強制指定時，在 .env.local 設定 AI_MODE=mock 或 AI_MODE=live。
 */
export type AiMode = "live" | "mock";

export function getAiMode(): AiMode {
  const forced = process.env.AI_MODE;
  if (forced === "mock" || forced === "live") return forced;
  return process.env.ANTHROPIC_API_KEY ? "live" : "mock";
}
